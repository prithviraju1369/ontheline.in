# Environment Variables Setup Guide

## 🎯 **Critical Understanding**

**`.env` files are ONLY for local development!**

```
┌─────────────────────────────────────────────────────────────┐
│                     LOCAL DEVELOPMENT                        │
├─────────────────────────────────────────────────────────────┤
│  .env file  →  dotenv loads  →  process.env  →  Your app   │
│     ✅ Works perfectly!                                      │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                   VERCEL DEPLOYMENT                          │
├─────────────────────────────────────────────────────────────┤
│  .env file  →  ❌ NOT DEPLOYED (in .gitignore)              │
│  Vercel Dashboard  →  Build Environment  →  Your app        │
│     ✅ This is the correct way!                             │
└─────────────────────────────────────────────────────────────┘
```

## 📋 **Setup Instructions**

### Step 1: Local Development Setup

```bash
# 1. Copy the example file
cp .env.example .env

# 2. Edit .env with your local values
nano .env  # or use your favorite editor

# 3. Update these critical values:
#    - MONGODB_URI (your local MongoDB)
#    - JWT_SECRET (any random string for dev)
#    - CLIENT_URL (http://localhost:5173)

# 4. Verify it works
npm run dev
```

Your `.env` file should look like:
```env
NODE_ENV=development
PORT=5001
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb://localhost:27017/ondc_buyer_app
JWT_SECRET=dev_secret_12345
JWT_EXPIRE=7d
# ... other variables
```

---

### Step 2: Vercel Deployment Setup

**Important**: Vercel does NOT use your `.env` file!

#### Option A: Vercel Dashboard (Easiest) ✅

1. **Go to Vercel Dashboard**
   - Navigate to: https://vercel.com/dashboard
   - Select your project

2. **Open Environment Variables**
   - Click: Settings → Environment Variables
   - Or direct link: `https://vercel.com/[your-account]/[your-project]/settings/environment-variables`

3. **Add Each Variable**

   Click "Add New" and enter:

   **Essential Variables (Required for app to work):**

   ```
   Name: NODE_ENV
   Value: production
   Environment: Production, Preview, Development (check all)
   ```

   ```
   Name: MONGODB_URI
   Value: mongodb+srv://username:password@cluster.mongodb.net/ondc_buyer_app
   Environment: Production
   ```

   ```
   Name: JWT_SECRET
   Value: [Generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"]
   Environment: Production
   ```

   ```
   Name: CLIENT_URL
   Value: https://your-app.vercel.app
   Environment: Production
   ```

   **ONDC Variables (Required if using ONDC):**

   ```
   Name: ONDC_GATEWAY_URL
   Value: https://staging.gateway.proteantech.in
   Environment: Production
   ```

   ```
   Name: ONDC_SUBSCRIBER_ID
   Value: your-app.vercel.app/ondc
   Environment: Production
   ```

   ```
   Name: ONDC_SUBSCRIBER_URI
   Value: https://your-app.vercel.app
   Environment: Production
   ```

   ```
   Name: ONDC_SIGNING_PRIVATE_KEY
   Value: -----BEGIN PRIVATE KEY-----\nYourKeyHere\n-----END PRIVATE KEY-----
   Environment: Production
   (⚠️ SENSITIVE - Keep private!)
   ```

   ```
   Name: ONDC_SIGNING_PUBLIC_KEY
   Value: -----BEGIN PUBLIC KEY-----\nYourKeyHere\n-----END PUBLIC KEY-----
   Environment: Production
   ```

   **Payment Gateway:**

   ```
   Name: PAYMENT_GATEWAY_KEY
   Value: your_production_key
   Environment: Production
   ```

   ```
   Name: PAYMENT_GATEWAY_SECRET
   Value: your_production_secret
   Environment: Production
   (⚠️ SENSITIVE - Keep private!)
   ```

4. **Redeploy**
   - After adding variables, go to Deployments tab
   - Click on the latest deployment
   - Click "Redeploy" (or push a new commit)

---

#### Option B: Vercel CLI (For Advanced Users)

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Login
vercel login

# 3. Link to your project
vercel link

# 4. Add environment variables
vercel env add NODE_ENV
# Enter value: production
# Select environment: Production

vercel env add MONGODB_URI
# Enter value: mongodb+srv://...
# Select environment: Production

vercel env add JWT_SECRET
# Enter value: [your generated secret]
# Select environment: Production

# ... repeat for all variables

# 5. Pull environment variables for local testing
vercel env pull .env.local

# 6. Deploy
vercel --prod
```

---

#### Option C: Vercel Environment File (Import)

1. **Create a temporary file** (don't commit!):
   ```bash
   nano .env.production
   ```

2. **Add your production variables**:
   ```env
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://...
   JWT_SECRET=...
   # ... all other variables
   ```

3. **Import via CLI**:
   ```bash
   vercel env add < .env.production
   ```

4. **Delete the file immediately**:
   ```bash
   rm .env.production
   ```

---

## 🔍 **How to Verify Environment Variables**

### During Build

Vercel logs will show if variables are missing:

```bash
# In Vercel deployment logs, look for:
✅ "MongoDB connected successfully"  # MONGODB_URI is set
✅ "Server initialized"               # All variables loaded

❌ "Missing required env variable"    # Variable not set
❌ "MongoDB connection error"         # MONGODB_URI incorrect
```

### In Production

Add a debug endpoint (temporary):

```javascript
// server/index.js - Add temporarily for debugging
app.get('/api/debug/env', (req, res) => {
  // SECURITY: Remove after verification!
  res.json({
    nodeEnv: process.env.NODE_ENV,
    hasMongoUri: !!process.env.MONGODB_URI,
    hasJwtSecret: !!process.env.JWT_SECRET,
    hasClientUrl: !!process.env.CLIENT_URL,
    hasOndcConfig: !!process.env.ONDC_GATEWAY_URL,
    // Show actual values ONLY for non-sensitive data
    clientUrl: process.env.CLIENT_URL,
    ondcGateway: process.env.ONDC_GATEWAY_URL
  });
});
```

Visit: `https://your-app.vercel.app/api/debug/env`

**⚠️ IMPORTANT: Remove this endpoint after verification!**

---

## 🚨 **Common Mistakes & Solutions**

### ❌ Mistake 1: Committing .env to Git

```bash
# If you accidentally committed .env:
git rm --cached .env
git commit -m "Remove .env from git"
git push

# Then rotate ALL secrets immediately!
```

### ❌ Mistake 2: Using .env in Production

```javascript
// ❌ BAD: This won't work in Vercel
require('dotenv').config({ path: '.env.production' });

// ✅ GOOD: This works everywhere
require('dotenv').config();  // Uses .env locally, ignores in production
```

### ❌ Mistake 3: Not Redeploying After Adding Variables

**Environment variables are set at BUILD time!**

```
Add variable → Must redeploy → Variable available
```

### ❌ Mistake 4: Using Different Variable Names

```javascript
// .env.example has:
MONGODB_URI=...

// But code uses:
mongoose.connect(process.env.MONGO_URI)  // ❌ Wrong name!

// Solution: Use exact same names everywhere
```

---

## 🎯 **Best Practices**

### 1. **Use .env.example as Documentation**

```bash
# Always keep .env.example updated
# When adding a new variable:
echo "NEW_VARIABLE=example_value" >> .env.example
git add .env.example
git commit -m "Add NEW_VARIABLE to env example"
```

### 2. **Use Different Values for Different Environments**

```
Development:
  MONGODB_URI=mongodb://localhost:27017/mydb
  JWT_SECRET=dev_secret
  CLIENT_URL=http://localhost:5173

Production:
  MONGODB_URI=mongodb+srv://cluster.mongodb.net/mydb
  JWT_SECRET=[64-char random string]
  CLIENT_URL=https://myapp.vercel.app
```

### 3. **Validate Environment Variables on Startup**

```javascript
// server/config/validateEnv.js
const requiredEnvVars = [
  'MONGODB_URI',
  'JWT_SECRET',
  'CLIENT_URL'
];

function validateEnv() {
  const missing = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(varName => console.error(`   - ${varName}`));
    process.exit(1);
  }
  
  console.log('✅ All required environment variables are set');
}

module.exports = validateEnv;
```

```javascript
// server/index.js
require('dotenv').config();
const validateEnv = require('./config/validateEnv');

validateEnv();  // Check early, fail fast!

const express = require('express');
// ... rest of your app
```

### 4. **Use Vercel Environment Groups**

In Vercel Dashboard:

- **Production**: Live site variables
- **Preview**: Testing branch variables (can differ)
- **Development**: Local development (pulled with `vercel env pull`)

### 5. **Rotate Secrets Regularly**

```bash
# Every 3-6 months or after team changes:
# 1. Generate new JWT_SECRET
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# 2. Update in Vercel Dashboard

# 3. Redeploy

# 4. Old tokens will be invalid (users must re-login)
```

---

## 📊 **Environment Variable Checklist**

Before deploying to production:

- [ ] All variables from `.env.example` are set in Vercel
- [ ] Sensitive values (JWT_SECRET, MONGODB_URI, etc.) use production values
- [ ] CLIENT_URL matches your Vercel deployment URL
- [ ] ONDC_SUBSCRIBER_ID and ONDC_SUBSCRIBER_URI match your Vercel URL
- [ ] MongoDB Atlas IP whitelist allows Vercel (0.0.0.0/0)
- [ ] Test deployment works with a simple API call
- [ ] Remove any debug endpoints that expose env vars
- [ ] `.env` is in `.gitignore` (never committed)
- [ ] Team members have access to environment variable documentation

---

## 🔗 **Quick Reference**

| Task | Command/Link |
|------|--------------|
| Add variable in Vercel | Dashboard → Settings → Environment Variables |
| Generate JWT secret | `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` |
| Pull Vercel env to local | `vercel env pull` |
| Check what's set | `vercel env ls` |
| Vercel env docs | https://vercel.com/docs/concepts/projects/environment-variables |

---

## 🆘 **Troubleshooting**

### Issue: "MongoDB connection error" in Vercel logs

**Solution:**
```bash
# 1. Check MONGODB_URI is set in Vercel
vercel env ls

# 2. Verify MongoDB Atlas allows connections from 0.0.0.0/0
# 3. Check connection string format:
#    mongodb+srv://username:password@cluster.mongodb.net/dbname

# 4. Redeploy after fixing
```

### Issue: "JWT_SECRET is not defined"

**Solution:**
```bash
# 1. Add JWT_SECRET in Vercel Dashboard
# 2. Must redeploy for changes to take effect
vercel --prod
```

### Issue: Changes to .env locally don't reflect

**Solution:**
```bash
# 1. Restart your dev server
# 2. dotenv only loads .env on app startup
npm run dev  # Restart
```

---

**Remember**: `.env` files are for local development. Vercel uses its own environment variable system. Never commit `.env` to git!

