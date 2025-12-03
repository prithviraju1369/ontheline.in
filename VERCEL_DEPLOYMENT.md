# Vercel Deployment Guide

This guide will help you deploy your ONDC Buyer App to Vercel.

## Prerequisites

1. ✅ Vercel account (free tier works)
2. ✅ MongoDB Atlas account (for cloud database)
3. ✅ GitHub account (to connect repository)
4. ✅ ONDC credentials (optional for testing)

## Step 1: Setup MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user:
   - Go to Database Access
   - Add New Database User
   - Create username and password
4. Whitelist IP addresses:
   - Go to Network Access
   - Add IP Address
   - Allow Access from Anywhere (0.0.0.0/0) for Vercel
5. Get your connection string:
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database password
   - Example: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/ondc_buyer_app?retryWrites=true&w=majority`

## Step 2: Push to GitHub

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - ONDC Buyer App"

# Create a new repository on GitHub
# Then add remote and push
git remote add origin https://github.com/yourusername/ontheline-ondc.git
git branch -M main
git push -u origin main
```

## Step 3: Deploy to Vercel

### Option A: Using Vercel Dashboard (Recommended)

1. Go to [Vercel](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: Other
   - **Root Directory**: `./` (leave as root)
   - **Build Command**: `npm run vercel-build`
   - **Output Directory**: `client/dist`
   - **Install Command**: `npm install`

5. **Add Environment Variables** (click "Environment Variables"):
   ```env
   NODE_ENV=production
   
   # MongoDB (from MongoDB Atlas)
   MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/ondc_buyer_app?retryWrites=true&w=majority
   
   # JWT Secret (generate a new one)
   JWT_SECRET=your_production_jwt_secret_here
   JWT_EXPIRE=7d
   
   # ONDC Configuration
   ONDC_GATEWAY_URL=https://staging.gateway.proteantech.in
   ONDC_SUBSCRIBER_ID=your-vercel-app.vercel.app/ondc
   ONDC_SUBSCRIBER_URI=https://your-vercel-app.vercel.app
   ONDC_REGISTRY_URL=https://staging.registry.ondc.org/ondc
   ONDC_SIGNING_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nYourPrivateKeyHere\n-----END PRIVATE KEY-----\n
   ONDC_SIGNING_PUBLIC_KEY=-----BEGIN PUBLIC KEY-----\nYourPublicKeyHere\n-----END PUBLIC KEY-----\n
   ONDC_SUBSCRIBER_TYPE=BAP
   ONDC_UNIQUE_KEY_ID=your_unique_key_id
   
   # Payment Gateway (use test credentials or leave as is)
   PAYMENT_GATEWAY_KEY=test_key
   PAYMENT_GATEWAY_SECRET=test_secret
   
   # Client URL (will be your Vercel URL)
   CLIENT_URL=https://your-vercel-app.vercel.app
   ```

6. Click **Deploy**

### Option B: Using Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Follow the prompts:
# - Set up and deploy? Y
# - Which scope? (your account)
# - Link to existing project? N
# - What's your project's name? ontheline-ondc
# - In which directory is your code located? ./
# - Want to modify settings? N

# After first deployment, add environment variables:
vercel env add MONGODB_URI
vercel env add JWT_SECRET
# ... add all other environment variables

# Deploy to production
vercel --prod
```

## Step 4: Configure Your Domain (Optional)

1. In Vercel Dashboard, go to your project
2. Go to Settings → Domains
3. Add your custom domain
4. Follow DNS configuration instructions
5. Update these environment variables:
   - `ONDC_SUBSCRIBER_ID` → `yourdomain.com/ondc`
   - `ONDC_SUBSCRIBER_URI` → `https://yourdomain.com`
   - `CLIENT_URL` → `https://yourdomain.com`

## Step 5: Update ONDC Configuration

After deployment, update your ONDC registration with:
- **Subscriber URI**: `https://your-vercel-app.vercel.app` (or your custom domain)
- **Webhook endpoints** will be at:
  - `https://your-vercel-app.vercel.app/api/webhooks/on_search`
  - `https://your-vercel-app.vercel.app/api/webhooks/on_select`
  - etc.

## Step 6: Test Your Deployment

1. Visit your Vercel URL
2. Register a new account
3. Try logging in
4. Test all features

### API Health Check
```bash
curl https://your-vercel-app.vercel.app/health
```

Should return:
```json
{
  "status": "ok",
  "timestamp": "2025-11-29T..."
}
```

## Troubleshooting

### Build Fails
- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Verify `vercel-build` script runs locally

### Database Connection Issues
- Verify MongoDB Atlas connection string
- Check if IP whitelist includes 0.0.0.0/0
- Ensure database user has correct permissions

### Environment Variables Not Working
- Environment variables must be set in Vercel dashboard
- Redeploy after adding/changing environment variables
- Check variable names match exactly

### CORS Errors
- Verify `CLIENT_URL` matches your Vercel URL
- Check CORS configuration in `server/index.js`

### API Routes Not Found
- Ensure `vercel.json` is in root directory
- Check routes configuration in `vercel.json`
- API routes should start with `/api/`

## Continuous Deployment

Once connected to GitHub, every push to `main` branch will automatically deploy to Vercel:

```bash
git add .
git commit -m "Update feature"
git push origin main
# Vercel automatically deploys!
```

## Monitoring

1. **Logs**: View real-time logs in Vercel Dashboard → Project → Logs
2. **Analytics**: Enable Vercel Analytics for visitor insights
3. **Errors**: Check Function logs for backend errors

## Cost

- **Vercel**: Free tier includes:
  - 100 GB bandwidth
  - Unlimited deployments
  - Automatic HTTPS
  
- **MongoDB Atlas**: Free tier includes:
  - 512 MB storage
  - Shared cluster
  - Perfect for development/testing

## Production Checklist

- [ ] MongoDB Atlas configured with strong password
- [ ] Production JWT_SECRET generated (use strong random string)
- [ ] ONDC credentials registered with production URL
- [ ] All environment variables set in Vercel
- [ ] Custom domain configured (optional)
- [ ] HTTPS enabled (automatic with Vercel)
- [ ] Database backups enabled in MongoDB Atlas
- [ ] Error monitoring set up
- [ ] Analytics enabled

## Support

For issues:
- Vercel: https://vercel.com/docs
- MongoDB Atlas: https://docs.atlas.mongodb.com/
- ONDC: https://ondc.org/tech/

---

Congratulations! Your ONDC Buyer App is now live on Vercel! 🎉

