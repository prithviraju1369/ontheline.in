# Quick Deploy to Vercel - 5 Minutes ⚡

Follow these steps to deploy your ONDC app to Vercel quickly.

## Step 1: MongoDB Atlas (2 minutes)

1. Go to https://www.mongodb.com/cloud/atlas/register
2. Sign up / Login
3. Create a FREE cluster (click "Build a Database" → "Free" → "Create")
4. Create database user:
   - Click "Database Access" (left sidebar)
   - Add New Database User
   - Username: `ondcuser`
   - Password: Auto-generate (copy it!)
   - User Privileges: Read and write to any database
   - Add User
5. Whitelist all IPs:
   - Click "Network Access" (left sidebar)
   - Add IP Address
   - Access List Entry: `0.0.0.0/0`
   - Comment: "Vercel access"
   - Confirm
6. Get connection string:
   - Click "Database" (left sidebar)
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - It looks like: `mongodb+srv://ondcuser:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`
   - Replace `<password>` with your actual password
   - Add database name: `mongodb+srv://ondcuser:yourpassword@cluster0.xxxxx.mongodb.net/ondc_buyer_app?retryWrites=true&w=majority`

## Step 2: Push to GitHub (1 minute)

```bash
# Initialize git
git init
git add .
git commit -m "Initial commit - ONDC Buyer App"

# Create repo on GitHub (https://github.com/new)
# Then:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

## Step 3: Deploy to Vercel (2 minutes)

1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Configure:
   - **Framework Preset**: Other
   - **Build Command**: `npm run vercel-build`
   - **Output Directory**: `client/dist`
   - Click "Environment Variables"

4. Add these variables (one by one):

**Essential Variables (minimum to get started):**
```
NODE_ENV=production
MONGODB_URI=<paste your MongoDB Atlas connection string>
JWT_SECRET=<paste the JWT secret from your current .env>
CLIENT_URL=https://YOUR-APP-NAME.vercel.app
```

**ONDC Variables (can add later):**
```
ONDC_GATEWAY_URL=https://staging.gateway.proteantech.in
ONDC_SUBSCRIBER_ID=YOUR-APP-NAME.vercel.app/ondc
ONDC_SUBSCRIBER_URI=https://YOUR-APP-NAME.vercel.app
ONDC_REGISTRY_URL=https://staging.registry.ondc.org/ondc
ONDC_SIGNING_PRIVATE_KEY=<your private key from generate-keys.js>
ONDC_SIGNING_PUBLIC_KEY=<your public key from generate-keys.js>
ONDC_SUBSCRIBER_TYPE=BAP
ONDC_UNIQUE_KEY_ID=test_key_id
PAYMENT_GATEWAY_KEY=test_key
PAYMENT_GATEWAY_SECRET=test_secret
JWT_EXPIRE=7d
```

5. Click **Deploy**
6. Wait 2-3 minutes for deployment
7. Click "Visit" to see your live app!

## Step 4: Test Your App

1. Visit: `https://YOUR-APP-NAME.vercel.app`
2. Click "Register" and create an account
3. Login and test features!

## Step 5: Update CLIENT_URL (Important!)

After first deployment, you need to update the CLIENT_URL:

1. In Vercel Dashboard, go to your project
2. Settings → Environment Variables
3. Edit `CLIENT_URL` and replace with your actual Vercel URL
4. Save
5. Go to Deployments tab
6. Click the "..." menu on latest deployment
7. Click "Redeploy"

## That's It! 🎉

Your ONDC app is now live at:
- **App**: `https://YOUR-APP-NAME.vercel.app`
- **API**: `https://YOUR-APP-NAME.vercel.app/api`
- **Health Check**: `https://YOUR-APP-NAME.vercel.app/health`

## Common Issues

**Build fails?**
- Check the build logs
- Make sure MongoDB connection string is correct
- Verify all required environment variables are set

**Can't login?**
- Check JWT_SECRET is set
- Verify MongoDB is accessible

**ONDC search fails?**
- This is normal without real ONDC credentials
- All other features should work fine

## Next Steps

1. Register on ONDC: https://ondc.org/tech/
2. Add custom domain (optional)
3. Enable Vercel Analytics
4. Set up monitoring

Need help? Check `VERCEL_DEPLOYMENT.md` for detailed instructions!

