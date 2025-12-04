# ONDC Network Registration Guide

## Understanding the Error

**"You have not yet subscribed the subscriber id for the domains in Network Registry"**

This means your application needs to be officially registered with the ONDC Network before it can make real API calls.

## What You Need to Register

### 1. **Subscriber ID** (`ONDC_SUBSCRIBER_ID`)
- Your unique identifier in the ONDC network
- Format: `your-domain.com/buyer-app` or `your-domain.vercel.app/ondc`
- Must be publicly accessible
- Example: `ontheline-app.vercel.app/ondc`

### 2. **Subscriber URL** (`ONDC_SUBSCRIBER_URI`)
- Your public base URL where ONDC will send callbacks
- Must be HTTPS
- Example: `https://ontheline-app.vercel.app`

### 3. **Public Key** (`ONDC_SIGNING_PUBLIC_KEY`)
- Used to verify your requests
- Generated with `node generate-keys.js`
- You already have this from earlier!

### 4. **Unique Key ID** (`ONDC_UNIQUE_KEY_ID`)
- A unique identifier for your signing key
- Can be any unique string (e.g., `ontheline-prod-key-1`)

## Registration Process

### Step 1: Deploy Your App to Production

You MUST have a public URL before registering:

1. **Deploy to Vercel** (follow `QUICK_DEPLOY.md`)
2. Get your public URL (e.g., `https://ontheline-app.vercel.app`)
3. Ensure `/health` endpoint is accessible
4. Ensure `/api/webhooks/*` endpoints are accessible

### Step 2: Register on ONDC Staging Portal

#### For Staging/Testing Environment:

1. **Go to ONDC Staging Registry Portal**
   - URL: https://staging.registry.ondc.org/ (or contact ONDC for access)
   - You may need to request access first

2. **Create Account / Login**
   - Register as a Buyer App Participant (BAP)
   - Fill in company/developer details

3. **Submit Registration Form**
   
   You'll need to provide:
   
   ```
   Participant Type: Buyer App (BAP)
   Subscriber ID: your-app.vercel.app/ondc
   Subscriber URL: https://your-app.vercel.app
   Domain: Retail (ONDC:RET10)
   City: * (for all cities) or specific city codes
   Country: IND
   
   Signing Public Key: [Your public key from generate-keys.js]
   Encryption Public Key: [Same as signing key for now]
   Key ID: ontheline-prod-key-1
   
   Valid From: [Current date]
   Valid Until: [1 year from now]
   
   Callback URLs:
   - /api/webhooks/on_search
   - /api/webhooks/on_select
   - /api/webhooks/on_init
   - /api/webhooks/on_confirm
   - /api/webhooks/on_track
   - /api/webhooks/on_status
   - /api/webhooks/on_cancel
   - /api/webhooks/on_update
   - /api/webhooks/on_support
   ```

4. **Wait for Approval**
   - ONDC team will review your registration
   - May take 2-7 business days
   - They may test your endpoints

### Step 3: Update Your Environment Variables

After approval, update your Vercel environment variables:

```env
# Use your actual deployed URL
ONDC_SUBSCRIBER_ID=ontheline-app.vercel.app/ondc
ONDC_SUBSCRIBER_URI=https://ontheline-app.vercel.app

# Use staging or production gateway
ONDC_GATEWAY_URL=https://staging.gateway.proteantech.in  # Staging
# ONDC_GATEWAY_URL=https://prod.gateway.ondc.org  # Production (after testing)

# Your keys from generate-keys.js
ONDC_SIGNING_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----
ONDC_SIGNING_PUBLIC_KEY=-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----

# Your unique key ID
ONDC_UNIQUE_KEY_ID=ontheline-prod-key-1

# Registry URL
ONDC_REGISTRY_URL=https://staging.registry.ondc.org/ondc  # Staging
# ONDC_REGISTRY_URL=https://prod.registry.ondc.org/ondc  # Production
```

### Step 4: Test Your Integration

After registration and approval:

1. **Test Search**
   ```bash
   curl -X POST https://your-app.vercel.app/api/ondc/search \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -d '{
       "query": "rice",
       "deliveryLocation": {
         "gps": "12.9716,77.5946",
         "areaCode": "560001"
       }
     }'
   ```

2. **Check Logs**
   - Should see successful ONDC responses
   - No more 401 errors
   - Results should appear in your app

## For Production Registration

For production ONDC network:

1. **Complete Compliance Requirements**
   - Legal entity registration
   - GSTIN number
   - Business verification
   - Compliance documentation

2. **Production Registry**
   - URL: https://prod.registry.ondc.org/
   - Stricter requirements
   - More thorough review process

3. **Testing Phase**
   - Must pass all test scenarios
   - Transaction limits initially
   - Gradual scale-up

## Contact ONDC

For registration help:

- **Email**: tech-support@ondc.org
- **Docs**: https://github.com/ONDC-Official/developer-docs
- **Slack/Discord**: Join ONDC developer community
- **Portal**: https://ondc.org

## Development Without Registration

### Option 1: Mock Mode

You can develop and test without ONDC registration:

1. Create mock data for search results
2. Test all UI flows
3. Test cart, checkout, orders
4. Register with ONDC only when ready to go live

### Option 2: Use Test Credentials

ONDC may provide test credentials for development:
- Limited functionality
- Test environment only
- No real transactions

## Checklist Before Registration

- [ ] App deployed to production (Vercel)
- [ ] Public HTTPS URL working
- [ ] Health check endpoint accessible
- [ ] Webhook endpoints implemented
- [ ] Signing keys generated
- [ ] MongoDB Atlas configured
- [ ] All environment variables set
- [ ] Error handling implemented
- [ ] Logging configured

## What Happens After Registration

Once registered and approved:

1. ✅ Your subscriber_id is in the registry
2. ✅ ONDC gateway accepts your requests
3. ✅ Seller apps can respond to your searches
4. ✅ Real products appear in search results
5. ✅ Full order flow works end-to-end
6. ✅ Payments can be processed
7. ✅ Order tracking works

## Troubleshooting

### Error: "Subscriber ID not found"
- Ensure registration is approved
- Check subscriber_id matches exactly
- Verify domain is correct

### Error: "Invalid signature"
- Check private key is correct
- Verify key ID matches registration
- Ensure signing algorithm is ED25519

### Error: "Webhook failed"
- Ensure endpoints are publicly accessible
- Check HTTPS certificate is valid
- Verify response format is correct

---

**Note**: For local development, you can skip ONDC registration and use mock data. Register only when ready to deploy and test with real ONDC network.


