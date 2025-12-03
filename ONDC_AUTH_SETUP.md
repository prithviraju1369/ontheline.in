# ONDC Authentication Setup Guide

## 🎉 **What We Fixed**

Your ONDC integration was missing the **Authorization header** with cryptographic signatures. This is now fixed!

### Changes Made:

1. ✅ Created `createAuthorizationHeader()` method
2. ✅ Added Authorization header to all ONDC API calls:
   - `search` - Find products
   - `select` - Get quote
   - `init` - Initialize order
   - `confirm` - Confirm order
   - `status` - Get order status
   - `track` - Track delivery
   - `cancel` - Cancel order
   - `support` - Get support

---

## 🔧 **Required Environment Variables**

To use ONDC, you need these environment variables set in **Vercel Dashboard**:

### 1. ONDC Gateway Configuration

```env
ONDC_GATEWAY_URL=https://staging.gateway.proteantech.in
ONDC_REGISTRY_URL=https://staging.registry.ondc.org/ondc
ONDC_SUBSCRIBER_TYPE=BAP
```

### 2. Your Subscriber Details

```env
# Your domain/identifier
ONDC_SUBSCRIBER_ID=ontheline.in/buyer-app

# Your public-facing URL
ONDC_SUBSCRIBER_URI=https://your-app.vercel.app
```

### 3. Cryptographic Keys (CRITICAL!)

You need to **generate a key pair** for signing requests:

```env
ONDC_SIGNING_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nYourPrivateKeyHere\n-----END PRIVATE KEY-----

ONDC_SIGNING_PUBLIC_KEY=-----BEGIN PUBLIC KEY-----\nYourPublicKeyHere\n-----END PUBLIC KEY-----

# Unique identifier for your key
ONDC_UNIQUE_KEY_ID=your_unique_key_id_001
```

---

## 🔑 **How to Generate Keys**

### Method 1: Using Node.js (Recommended)

Create a file `generate-ondc-keys.js`:

```javascript
const crypto = require('crypto');
const fs = require('fs');

// Generate ED25519 key pair (ONDC standard)
crypto.generateKeyPair('ed25519', {
  publicKeyEncoding: {
    type: 'spki',
    format: 'pem'
  },
  privateKeyEncoding: {
    type: 'pkcs8',
    format: 'pem'
  }
}, (err, publicKey, privateKey) => {
  if (err) {
    console.error('Error generating keys:', err);
    return;
  }

  console.log('\n=== ONDC Key Pair Generated ===\n');
  
  console.log('Private Key (keep SECRET!):');
  console.log(privateKey);
  
  console.log('\nPublic Key (share with ONDC):');
  console.log(publicKey);
  
  console.log('\n=== For Vercel Environment Variables ===\n');
  
  // Convert to single-line format for environment variables
  const privateKeyOneLine = privateKey.replace(/\n/g, '\\n');
  const publicKeyOneLine = publicKey.replace(/\n/g, '\\n');
  
  console.log('ONDC_SIGNING_PRIVATE_KEY=');
  console.log(privateKeyOneLine);
  
  console.log('\nONDC_SIGNING_PUBLIC_KEY=');
  console.log(publicKeyOneLine);
  
  // Save to files
  fs.writeFileSync('ondc_private_key.pem', privateKey);
  fs.writeFileSync('ondc_public_key.pem', publicKey);
  
  console.log('\n✅ Keys saved to ondc_private_key.pem and ondc_public_key.pem');
  console.log('⚠️  NEVER commit these files to git!');
});
```

Run it:
```bash
node generate-ondc-keys.js
```

---

### Method 2: Using OpenSSL

```bash
# Generate private key
openssl genpkey -algorithm ED25519 -out ondc_private_key.pem

# Extract public key
openssl pkey -in ondc_private_key.pem -pubout -out ondc_public_key.pem

# View keys
cat ondc_private_key.pem
cat ondc_public_key.pem
```

---

## 📝 **Setting Up in Vercel**

### Step 1: Add Environment Variables

1. Go to: **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**

2. Add each variable:

```
Name: ONDC_GATEWAY_URL
Value: https://staging.gateway.proteantech.in
Environment: Production

Name: ONDC_SUBSCRIBER_ID
Value: ontheline.in/buyer-app
Environment: Production

Name: ONDC_SUBSCRIBER_URI
Value: https://your-actual-vercel-url.vercel.app
Environment: Production

Name: ONDC_SIGNING_PRIVATE_KEY
Value: -----BEGIN PRIVATE KEY-----\nMFMCAQEwBQYDK2VwBCIEI...\n-----END PRIVATE KEY-----
Environment: Production
(⚠️ Use the single-line format with \n)

Name: ONDC_SIGNING_PUBLIC_KEY
Value: -----BEGIN PUBLIC KEY-----\nMCowBQYDK2VwAyEA...\n-----END PUBLIC KEY-----
Environment: Production

Name: ONDC_UNIQUE_KEY_ID
Value: 001
Environment: Production
```

3. **Click "Save"**

### Step 2: Redeploy

```bash
# Trigger a redeploy
git commit --allow-empty -m "Add ONDC authentication"
git push origin main
```

---

##  **ONDC Registration**

Before you can use ONDC in production, you need to **register** with ONDC:

### 1. Register as Buyer App (BAP)

- Go to: https://ondc.org/network-participants/
- Fill out registration form
- Provide your:
  - Company details
  - **Subscriber ID**: `ontheline.in/buyer-app`
  - **Subscriber URI**: `https://your-app.vercel.app`
  - **Public Key**: (from above)
  - **Webhook endpoints**:
    - `https://your-app.vercel.app/api/webhooks/on_search`
    - `https://your-app.vercel.app/api/webhooks/on_select`
    - `https://your-app.vercel.app/api/webhooks/on_init`
    - `https://your-app.vercel.app/api/webhooks/on_confirm`
    - `https://your-app.vercel.app/api/webhooks/on_status`
    - `https://your-app.vercel.app/api/webhooks/on_track`
    - `https://your-app.vercel.app/api/webhooks/on_cancel`

### 2. Testing Environment

For development, ONDC provides a **staging environment**:
- Gateway: `https://staging.gateway.proteantech.in`
- Registry: `https://staging.registry.ondc.org/ondc`

You can test without full registration in staging.

---

## 🧪 **Testing Your Setup**

### Test 1: Search Request

```bash
curl https://your-app.vercel.app/api/ondc/search \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "query": "laptop",
    "gps": "12.9716,77.5946",
    "pincode": "560001"
  }'
```

**Expected**: Should return `200 OK` (not 401)

**Possible responses**:
- ✅ `200 OK` - Auth working!
- ❌ `401 Unauthorized` - Keys not set or incorrect
- ❌ `403 Forbidden` - Not registered with ONDC
- ❌ `500 Internal Server Error` - Check Vercel logs

---

### Test 2: Check Vercel Logs

After making a request, check logs:

```
Vercel Dashboard → Your Project → Logs → Functions
```

**Look for**:
- ✅ "Sending search request to ONDC gateway"
- ✅ Response from ONDC
- ❌ "The auth header not found" - Keys missing
- ❌ "Invalid signature" - Wrong keys or signing issue

---

## 🔍 **Troubleshooting**

### Error: "The auth header not found"

**Cause**: Authorization header not being sent

**Solution**:
1. Verify environment variables are set in Vercel
2. Redeploy after adding variables
3. Check that `ONDC_SIGNING_PRIVATE_KEY` is set

---

### Error: "Invalid signature"

**Cause**: Signature doesn't match public key

**Solutions**:
1. Ensure private and public keys are a matching pair
2. Check key format (should be PEM format with `\n` line breaks)
3. Verify `ONDC_UNIQUE_KEY_ID` matches what you registered with ONDC
4. Check that `ONDC_SUBSCRIBER_ID` is correct

---

### Error: "Subscriber not found"

**Cause**: Not registered with ONDC

**Solution**:
1. Register with ONDC network
2. Use staging environment for testing (no registration needed)
3. Verify `ONDC_SUBSCRIBER_ID` matches registration

---

### Error: "Request timeout"

**Cause**: ONDC gateway slow or unreachable

**Solution**:
1. Check ONDC gateway status
2. Try staging gateway: `https://staging.gateway.proteantech.in`
3. Increase timeout in axios config

---

## 📚 **Understanding ONDC Authentication**

### How It Works:

```
1. Your App creates request body
   ↓
2. Generates signature using private key
   signature = sign(SHA256(requestBody), privateKey)
   ↓
3. Creates Authorization header
   Authorization: Signature keyId="...",algorithm="ed25519",
                  created="...",expires="...",
                  headers="(created) (expires) digest",
                  signature="..."
   ↓
4. Sends request to ONDC Gateway
   ↓
5. Gateway verifies with your public key
   verify(signature, requestBody, publicKey)
   ↓
6. If valid → Processes request ✅
   If invalid → Returns 401 ❌
```

### Why This Is Needed:

- **Authentication**: Proves you are who you claim to be
- **Integrity**: Ensures request wasn't tampered with
- **Non-repudiation**: You can't deny sending the request
- **Security**: Prevents unauthorized access to ONDC network

---

## 🎯 **Quick Checklist**

Before deploying to production:

- [ ] Keys generated (private + public)
- [ ] `ONDC_SIGNING_PRIVATE_KEY` set in Vercel
- [ ] `ONDC_SIGNING_PUBLIC_KEY` set in Vercel
- [ ] `ONDC_SUBSCRIBER_ID` set and matches your domain
- [ ] `ONDC_SUBSCRIBER_URI` set to your Vercel URL
- [ ] `ONDC_UNIQUE_KEY_ID` set (e.g., "001")
- [ ] `ONDC_GATEWAY_URL` set (staging or production)
- [ ] Redeployed after adding variables
- [ ] Tested search request (gets 200, not 401)
- [ ] Registered with ONDC (for production)
- [ ] Webhook endpoints configured

---

## 📖 **Additional Resources**

- [ONDC Developer Documentation](https://ondc.org/developers/)
- [Beckn Protocol Spec](https://developers.becknprotocol.io/)
- [ONDC GitHub](https://github.com/ONDC-Official)
- [Node.js Crypto Documentation](https://nodejs.org/api/crypto.html)

---

**Your ONDC integration is now ready!** 🎉

Once you set up the environment variables and redeploy, your 401 errors should be resolved.

