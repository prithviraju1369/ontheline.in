# Generate ONDC Keys - Quick Guide

## 🔑 **The Issue**

Your error shows:
```
error:1E08010C:DECODER routines::unsupported
```

This means the `ONDC_SIGNING_PRIVATE_KEY` is either:
- ❌ Not set in Vercel
- ❌ In wrong format
- ❌ Malformed (missing newlines, incorrect escaping)

---

## ✅ **Quick Fix - Generate RSA Key Pair**

### Step 1: Generate Keys Locally

Run this command in your terminal:

```bash
# Generate RSA private key (2048-bit)
openssl genrsa -out ondc_private.pem 2048

# Extract public key
openssl rsa -in ondc_private.pem -pubout -out ondc_public.pem

# Display keys
echo "=== PRIVATE KEY (keep secret!) ==="
cat ondc_private.pem

echo ""
echo "=== PUBLIC KEY (share with ONDC) ==="
cat ondc_public.pem
```

**You'll see output like:**

```
-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC7VJTUt9Us8cKj
MzEfYyjiWA4R4/M2bS1+fWIcPm15j7ApT+VfK64XkX0TvZxd7fHxXLmNXs7pqF...
(many more lines)
...
-----END PRIVATE KEY-----
```

---

### Step 2: Format for Vercel

Vercel environment variables must be **single-line**. Convert newlines to `\n`:

**Option A: Using Command Line**

```bash
# For Private Key
cat ondc_private.pem | tr '\n' '@' | sed 's/@/\\n/g'

# For Public Key  
cat ondc_public.pem | tr '\n' '@' | sed 's/@/\\n/g'
```

**Option B: Manually**

Replace every line break with `\n`:

**From:**
```
-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEF
AASCBKgwggSkAgEAAoIBAQC7
-----END PRIVATE KEY-----
```

**To:**
```
-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEF\nAASCBKgwggSkAgEAAoIBAQC7\n-----END PRIVATE KEY-----
```

---

### Step 3: Add to Vercel

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Select your project

2. **Settings → Environment Variables**

3. **Add Private Key:**
   ```
   Name: ONDC_SIGNING_PRIVATE_KEY
   
   Value: -----BEGIN PRIVATE KEY-----\nMIIEvgIB...(rest of key)...\n-----END PRIVATE KEY-----
   
   Environment: ☑ Production  ☑ Preview
   ```

4. **Add Public Key:**
   ```
   Name: ONDC_SIGNING_PUBLIC_KEY
   
   Value: -----BEGIN PUBLIC KEY-----\nMIIBIjANBg...(rest of key)...\n-----END PUBLIC KEY-----
   
   Environment: ☑ Production  ☑ Preview
   ```

5. **Add Key ID:**
   ```
   Name: ONDC_UNIQUE_KEY_ID
   Value: 1
   Environment: ☑ Production  ☑ Preview
   ```

6. **Click "Save"**

---

### Step 4: Redeploy

**Option A: Via Git**
```bash
git commit --allow-empty -m "Trigger redeploy for ONDC keys"
git push origin main
```

**Option B: Via Dashboard**
- Go to Deployments tab
- Click "..." on latest deployment
- Click "Redeploy"

---

## 🧪 **Verify It Works**

After redeployment, test:

```bash
curl https://your-app.vercel.app/api/ondc/search \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"query":"laptop","gps":"12.9716,77.5946","pincode":"560001"}'
```

**Check Vercel Logs:**
- ✅ Should see: "Private key parsed successfully"
- ✅ Should see: "Signing successful"
- ❌ Should NOT see: "DECODER routines::unsupported"

---

## 🎯 **Alternative: Use Node.js Script**

Create `generate-keys.js`:

```javascript
const crypto = require('crypto');

// Generate RSA key pair
const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: {
    type: 'spki',
    format: 'pem'
  },
  privateKeyEncoding: {
    type: 'pkcs8',
    format: 'pem'
  }
});

console.log('=== PRIVATE KEY ===');
console.log(privateKey);

console.log('\n=== PUBLIC KEY ===');
console.log(publicKey);

console.log('\n=== FOR VERCEL (single-line format) ===\n');

console.log('ONDC_SIGNING_PRIVATE_KEY:');
console.log(privateKey.replace(/\n/g, '\\n'));

console.log('\nONDC_SIGNING_PUBLIC_KEY:');
console.log(publicKey.replace(/\n/g, '\\n'));
```

Run it:
```bash
node generate-keys.js
```

Copy the single-line versions to Vercel.

---

## ⚠️ **Important Notes**

### Security:
- ✅ Never commit private keys to git
- ✅ Add `*.pem` to `.gitignore`
- ✅ Use different keys for dev/staging/production
- ✅ Rotate keys every 6-12 months

### Format:
- ✅ Must start with `-----BEGIN PRIVATE KEY-----`
- ✅ Must end with `-----END PRIVATE KEY-----`
- ✅ Use `\n` for newlines (not actual line breaks in Vercel)
- ✅ No extra spaces or characters

### Testing:
```bash
# Verify key format locally
node -e "const crypto=require('crypto');const key='YOUR_KEY_HERE'.replace(/\\\\n/g,'\\n');crypto.createPrivateKey({key,format:'pem'});console.log('✅ Key format valid!')"
```

---

## 🔍 **Troubleshooting**

### Error: "DECODER routines::unsupported"
**Solution**: Key format is wrong. Ensure:
1. Using `\n` not actual newlines
2. Complete PEM format (BEGIN and END lines)
3. No extra whitespace

### Error: "asn1 encoding routines"
**Solution**: Key data is corrupted. Regenerate keys.

### Error: "Key object missing"  
**Solution**: Environment variable not set. Check Vercel Dashboard.

### Error: "Invalid key type"
**Solution**: Using ed25519 instead of RSA. Regenerate with RSA.

---

## 🎉 **Success Indicators**

When working correctly, Vercel logs will show:

```json
{
  "message": "Private key parsed successfully"
}
{
  "message": "Signing successful",
  "algorithm": "RSA-SHA256",
  "signatureLength": 344
}
```

---

## 📝 **Quick Checklist**

- [ ] Generated RSA key pair (2048-bit)
- [ ] Converted to single-line format (`\n` for newlines)
- [ ] Added `ONDC_SIGNING_PRIVATE_KEY` to Vercel
- [ ] Added `ONDC_SIGNING_PUBLIC_KEY` to Vercel  
- [ ] Added `ONDC_UNIQUE_KEY_ID` to Vercel
- [ ] Redeployed application
- [ ] Tested search endpoint
- [ ] Verified logs show "Signing successful"
- [ ] Saved keys securely (not in git!)

---

Once complete, your ONDC integration will be fully functional! 🚀

