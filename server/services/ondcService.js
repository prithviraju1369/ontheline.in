const axios = require('axios');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

class ONDCService {
  constructor() {
    this.gatewayUrl = process.env.ONDC_GATEWAY_URL;
    this.subscriberId = process.env.ONDC_SUBSCRIBER_ID;
    this.subscriberUri = process.env.ONDC_SUBSCRIBER_URI;
    this.privateKey = process.env.ONDC_SIGNING_PRIVATE_KEY;
    this.publicKey = process.env.ONDC_SIGNING_PUBLIC_KEY;
    this.uniqueKeyId = process.env.ONDC_UNIQUE_KEY_ID;
  }

  // Create ONDC context object
  createContext(action, transactionId = null, messageId = null, bppId = null, bppUri = null) {
    const context = {
      domain: 'ONDC:RET10', // Retail domain
      country: 'IND',
      city: '*',
      action: action,
      core_version: '1.2.0',
      bap_id: this.subscriberId,
      bap_uri: this.subscriberUri,
      transaction_id: transactionId || uuidv4(),
      message_id: messageId || uuidv4(),
      timestamp: new Date().toISOString(),
      ttl: 'PT30S'
    };

    if (bppId && bppUri) {
      context.bpp_id = bppId;
      context.bpp_uri = bppUri;
    }

    return context;
  }

  // Generate authentication signature
  generateAuthSignature(requestBody) {
    try {
      const signingString = this.createSigningString(requestBody);
      const sign = crypto.createSign('SHA256');
      sign.update(signingString);
      sign.end();
      
      const signature = sign.sign(this.privateKey, 'base64');
      
      return {
        signature: signature,
        created: Math.floor(Date.now() / 1000).toString(),
        expires: Math.floor(Date.now() / 1000 + 3600).toString(),
        keyId: `${this.subscriberId}|${this.uniqueKeyId}|ed25519`,
        algorithm: 'ed25519'
      };
    } catch (error) {
      logger.error('Error generating auth signature:', error);
      throw error;
    }
  }

  createSigningString(requestBody) {
    const digest = crypto.createHash('sha256').update(JSON.stringify(requestBody)).digest('base64');
    return `(created): ${Math.floor(Date.now() / 1000)}\n(expires): ${Math.floor(Date.now() / 1000 + 3600)}\ndigest: BLAKE-512=${digest}`;
  }

  // Create Authorization header for ONDC requests
  createAuthorizationHeader(requestBody) {
    try {
      const authData = this.generateAuthSignature(requestBody);
      
      // Format: Signature keyId="...",algorithm="...",created="...",expires="...",headers="(created) (expires) digest",signature="..."
      const authHeader = `Signature keyId="${authData.keyId}",algorithm="${authData.algorithm}",created="${authData.created}",expires="${authData.expires}",headers="(created) (expires) digest",signature="${authData.signature}"`;
      
      return authHeader;
    } catch (error) {
      logger.error('Error creating authorization header:', error);
      throw new Error('Failed to create authentication header for ONDC request');
    }
  }

  // Search for products
  async search(searchParams) {
    try {
      const transactionId = uuidv4();
      const messageId = uuidv4();
      
      const context = this.createContext('search', transactionId, messageId);
      
      const requestBody = {
        context: context,
        message: {
          intent: {
            fulfillment: {
              type: 'Delivery',
              end: {
                location: {
                  gps: searchParams.gps || '12.9716,77.5946', // Default to Bangalore
                  address: {
                    area_code: searchParams.pincode || '560001'
                  }
                }
              }
            },
            payment: {
              '@ondc/org/buyer_app_finder_fee_type': 'percent',
              '@ondc/org/buyer_app_finder_fee_amount': '3'
            }
          }
        }
      };

      // Add search query if provided
      if (searchParams.query) {
        requestBody.message.intent.item = {
          descriptor: {
            name: searchParams.query
          }
        };
      }

      // Add category if provided
      if (searchParams.category) {
        requestBody.message.intent.category = {
          id: searchParams.category
        };
      }

      logger.info('Sending search request to ONDC gateway', { transactionId, messageId });
      
      // Generate authentication signature
      const authHeader = this.createAuthorizationHeader(requestBody);
      
      const response = await axios.post(`${this.gatewayUrl}/search`, requestBody, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader
        }
      });

      return {
        transactionId,
        messageId,
        response: response.data
      };
    } catch (error) {
      logger.error('Error in ONDC search:', error);
      throw error;
    }
  }

  // Select items (get quote)
  async select(selectParams) {
    try {
      const context = this.createContext(
        'select',
        selectParams.transactionId,
        uuidv4(),
        selectParams.bppId,
        selectParams.bppUri
      );

      const requestBody = {
        context: context,
        message: {
          order: {
            provider: {
              id: selectParams.providerId
            },
            items: selectParams.items.map(item => ({
              id: item.id,
              quantity: {
                count: item.quantity
              }
            })),
            fulfillments: [{
              end: {
                location: {
                  gps: selectParams.gps,
                  address: {
                    area_code: selectParams.pincode
                  }
                }
              }
            }]
          }
        }
      };

      logger.info('Sending select request', { transactionId: selectParams.transactionId });

      const authHeader = this.createAuthorizationHeader(requestBody);

      const response = await axios.post(selectParams.bppUri + '/select', requestBody, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader
        }
      });

      return response.data;
    } catch (error) {
      logger.error('Error in ONDC select:', error);
      throw error;
    }
  }

  // Initialize order
  async init(initParams) {
    try {
      const context = this.createContext(
        'init',
        initParams.transactionId,
        uuidv4(),
        initParams.bppId,
        initParams.bppUri
      );

      const requestBody = {
        context: context,
        message: {
          order: {
            provider: {
              id: initParams.providerId
            },
            items: initParams.items.map(item => ({
              id: item.id,
              quantity: {
                count: item.quantity
              }
            })),
            billing: initParams.billing,
            fulfillments: [{
              end: {
                contact: {
                  email: initParams.email,
                  phone: initParams.phone
                },
                location: initParams.deliveryLocation
              }
            }]
          }
        }
      };

      logger.info('Sending init request', { transactionId: initParams.transactionId });

      const authHeader = this.createAuthorizationHeader(requestBody);

      const response = await axios.post(initParams.bppUri + '/init', requestBody, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader
        }
      });

      return response.data;
    } catch (error) {
      logger.error('Error in ONDC init:', error);
      throw error;
    }
  }

  // Confirm order
  async confirm(confirmParams) {
    try {
      const context = this.createContext(
        'confirm',
        confirmParams.transactionId,
        uuidv4(),
        confirmParams.bppId,
        confirmParams.bppUri
      );

      const requestBody = {
        context: context,
        message: {
          order: {
            id: confirmParams.orderId,
            provider: {
              id: confirmParams.providerId
            },
            items: confirmParams.items.map(item => ({
              id: item.id,
              quantity: {
                count: item.quantity
              }
            })),
            billing: confirmParams.billing,
            fulfillments: confirmParams.fulfillments,
            payment: confirmParams.payment,
            quote: confirmParams.quote
          }
        }
      };

      logger.info('Sending confirm request', { 
        transactionId: confirmParams.transactionId,
        orderId: confirmParams.orderId 
      });

      const authHeader = this.createAuthorizationHeader(requestBody);

      const response = await axios.post(confirmParams.bppUri + '/confirm', requestBody, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader
        }
      });

      return response.data;
    } catch (error) {
      logger.error('Error in ONDC confirm:', error);
      throw error;
    }
  }

  // Get order status
  async status(statusParams) {
    try {
      const context = this.createContext(
        'status',
        statusParams.transactionId,
        uuidv4(),
        statusParams.bppId,
        statusParams.bppUri
      );

      const requestBody = {
        context: context,
        message: {
          order_id: statusParams.orderId
        }
      };

      logger.info('Sending status request', { orderId: statusParams.orderId });

      const authHeader = this.createAuthorizationHeader(requestBody);

      const response = await axios.post(statusParams.bppUri + '/status', requestBody, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader
        }
      });

      return response.data;
    } catch (error) {
      logger.error('Error in ONDC status:', error);
      throw error;
    }
  }

  // Track order
  async track(trackParams) {
    try {
      const context = this.createContext(
        'track',
        trackParams.transactionId,
        uuidv4(),
        trackParams.bppId,
        trackParams.bppUri
      );

      const requestBody = {
        context: context,
        message: {
          order_id: trackParams.orderId
        }
      };

      logger.info('Sending track request', { orderId: trackParams.orderId });

      const authHeader = this.createAuthorizationHeader(requestBody);

      const response = await axios.post(trackParams.bppUri + '/track', requestBody, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader
        }
      });

      return response.data;
    } catch (error) {
      logger.error('Error in ONDC track:', error);
      throw error;
    }
  }

  // Cancel order
  async cancel(cancelParams) {
    try {
      const context = this.createContext(
        'cancel',
        cancelParams.transactionId,
        uuidv4(),
        cancelParams.bppId,
        cancelParams.bppUri
      );

      const requestBody = {
        context: context,
        message: {
          order_id: cancelParams.orderId,
          cancellation_reason_id: cancelParams.reasonId,
          descriptor: {
            short_desc: cancelParams.reason
          }
        }
      };

      logger.info('Sending cancel request', { orderId: cancelParams.orderId });

      const authHeader = this.createAuthorizationHeader(requestBody);

      const response = await axios.post(cancelParams.bppUri + '/cancel', requestBody, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader
        }
      });

      return response.data;
    } catch (error) {
      logger.error('Error in ONDC cancel:', error);
      throw error;
    }
  }

  // Support request
  async support(supportParams) {
    try {
      const context = this.createContext(
        'support',
        supportParams.transactionId,
        uuidv4(),
        supportParams.bppId,
        supportParams.bppUri
      );

      const requestBody = {
        context: context,
        message: {
          ref_id: supportParams.orderId
        }
      };

      logger.info('Sending support request', { orderId: supportParams.orderId });

      const authHeader = this.createAuthorizationHeader(requestBody);

      const response = await axios.post(supportParams.bppUri + '/support', requestBody, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader
        }
      });

      return response.data;
    } catch (error) {
      logger.error('Error in ONDC support:', error);
      throw error;
    }
  }
}

module.exports = new ONDCService();

