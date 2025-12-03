# Production Environment Variables for Vercel

Copy these environment variables to your Vercel project settings.

## Required Environment Variables

```env
# Server Configuration
NODE_ENV=production

# MongoDB Configuration (MongoDB Atlas)
# Get this from: https://cloud.mongodb.com
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/ondc_buyer_app?retryWrites=true&w=majority

# JWT Configuration
# Generate using: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=your_production_jwt_secret_minimum_32_characters_random_string
JWT_EXPIRE=7d

# ONDC Configuration
# Update with your actual Vercel URL after first deployment
ONDC_GATEWAY_URL=https://staging.gateway.proteantech.in
ONDC_SUBSCRIBER_ID=your-vercel-app.vercel.app/ondc
ONDC_SUBSCRIBER_URI=https://your-vercel-app.vercel.app
ONDC_REGISTRY_URL=https://staging.registry.ondc.org/ondc
ONDC_SIGNING_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nYourPrivateKeyHere\n-----END PRIVATE KEY-----\n
ONDC_SIGNING_PUBLIC_KEY=-----BEGIN PUBLIC KEY-----\nYourPublicKeyHere\n-----END PUBLIC KEY-----\n
ONDC_SUBSCRIBER_TYPE=BAP
ONDC_UNIQUE_KEY_ID=your_production_unique_key_id

# Payment Gateway Configuration
PAYMENT_GATEWAY_KEY=your_production_payment_gateway_key
PAYMENT_GATEWAY_SECRET=your_production_payment_gateway_secret

# Frontend URL
CLIENT_URL=https://your-vercel-app.vercel.app
```

## How to Add in Vercel

1. Go to your project in Vercel Dashboard
2. Navigate to Settings → Environment Variables
3. Add each variable one by one
4. Select environments: Production, Preview, Development
5. Click Save
6. Redeploy your project

## Notes

- Replace all `your-vercel-app` with your actual Vercel app name
- After first deployment, update ONDC URLs with your actual Vercel URL
- Keep your private key secure and never commit it to git
- Generate a new JWT_SECRET for production (don't use the development one)

