# Setup Guide - OnTheLine ONDC Buyer App

This guide will walk you through setting up the OnTheLine ONDC buyer participant application step by step.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Local Development Setup](#local-development-setup)
3. [ONDC Registration](#ondc-registration)
4. [Database Setup](#database-setup)
5. [Configuration](#configuration)
6. [Running the Application](#running-the-application)
7. [Testing](#testing)
8. [Production Deployment](#production-deployment)

## Prerequisites

### Required Software
- **Node.js**: v16.x or higher
- **npm**: v8.x or higher (comes with Node.js)
- **MongoDB**: v5.x or higher
- **Git**: Latest version

### Installation Instructions

#### macOS
```bash
# Install Homebrew (if not installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node.js
brew install node

# Install MongoDB
brew tap mongodb/brew
brew install mongodb-community@7.0

# Start MongoDB
brew services start mongodb-community@7.0
```

#### Ubuntu/Debian Linux
```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

#### Windows
1. Download and install Node.js from [nodejs.org](https://nodejs.org/)
2. Download and install MongoDB from [mongodb.com](https://www.mongodb.com/try/download/community)
3. Start MongoDB as a Windows service

## Local Development Setup

### Step 1: Clone the Repository

```bash
git clone <your-repository-url>
cd ontheline.in
```

### Step 2: Install Dependencies

```bash
# Install root dependencies
npm install

# Install client dependencies
cd client
npm install
cd ..
```

### Step 3: Create Logs Directory

```bash
mkdir -p logs
```

## ONDC Registration

### Step 1: Register on ONDC Network

1. Visit [ONDC Developer Portal](https://ondc.org/tech/)
2. Click on "Get Started" or "Register"
3. Fill in your organization details
4. Select "Buyer App Participant (BAP)" as your participant type
5. Submit the registration form

### Step 2: Generate Signing Keys

ONDC uses Ed25519 signing for request authentication. Generate your key pair:

```bash
# Using OpenSSL
openssl genpkey -algorithm ED25519 -out private_key.pem
openssl pkey -in private_key.pem -pubout -out public_key.pem

# View the keys
cat private_key.pem
cat public_key.pem
```

Save these keys securely - you'll need them for configuration.

### Step 3: Configure Webhook URL

Your application needs to receive callbacks from ONDC. Configure your webhook URL:

**For Development:**
- Use a service like [ngrok](https://ngrok.com/) to expose your local server
- Install ngrok: `npm install -g ngrok`
- Run: `ngrok http 5000`
- Note the HTTPS URL provided (e.g., `https://abc123.ngrok.io`)

**For Production:**
- Use your domain with HTTPS (e.g., `https://api.yourdomain.com`)

### Step 4: Get ONDC Credentials

After approval, you'll receive:
- Subscriber ID (e.g., `yourdomain.com/ondc`)
- Unique Key ID
- Access to staging/production gateways

## Database Setup

### Step 1: Verify MongoDB Installation

```bash
# Check if MongoDB is running
mongosh
```

If you see the MongoDB shell, it's working! Type `exit` to quit.

### Step 2: Create Database

MongoDB will create the database automatically when the application first connects. However, you can create it manually:

```bash
mongosh
use ondc_buyer_app
db.createCollection("users")
db.createCollection("orders")
db.createCollection("carts")
exit
```

### Step 3: (Optional) Create MongoDB User

For production, create a dedicated database user:

```bash
mongosh
use admin
db.createUser({
  user: "ondc_user",
  pwd: "your_secure_password",
  roles: [
    { role: "readWrite", db: "ondc_buyer_app" }
  ]
})
exit
```

Then use this connection string in your `.env`:
```
MONGODB_URI=mongodb://ondc_user:your_secure_password@localhost:27017/ondc_buyer_app
```

## Configuration

### Step 1: Create Environment File

```bash
cp .env.example .env
```

### Step 2: Edit Configuration

Open `.env` in your text editor and update:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/ondc_buyer_app

# JWT Configuration (Generate a strong secret)
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters_long
JWT_EXPIRE=7d

# ONDC Configuration
ONDC_GATEWAY_URL=https://staging.gateway.proteantech.in
ONDC_SUBSCRIBER_ID=yourdomain.com/ondc
ONDC_SUBSCRIBER_URI=https://your-ngrok-url.ngrok.io
ONDC_REGISTRY_URL=https://staging.registry.ondc.org/ondc
ONDC_SIGNING_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nYourPrivateKeyHere\n-----END PRIVATE KEY-----
ONDC_SIGNING_PUBLIC_KEY=-----BEGIN PUBLIC KEY-----\nYourPublicKeyHere\n-----END PUBLIC KEY-----
ONDC_SUBSCRIBER_TYPE=BAP
ONDC_UNIQUE_KEY_ID=your_unique_key_id

# Payment Gateway Configuration (Use test credentials initially)
PAYMENT_GATEWAY_KEY=test_key
PAYMENT_GATEWAY_SECRET=test_secret

# Frontend URL
CLIENT_URL=http://localhost:5173
```

### Step 3: Generate JWT Secret

Generate a secure JWT secret:

```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Or use OpenSSL
openssl rand -hex 32
```

## Running the Application

### Development Mode

#### Option 1: Run Both Backend and Frontend Together

```bash
npm run dev
```

This will start:
- Backend server on http://localhost:5000
- Frontend dev server on http://localhost:5173

#### Option 2: Run Separately

Terminal 1 (Backend):
```bash
npm run server:dev
```

Terminal 2 (Frontend):
```bash
npm run client:dev
```

### Access the Application

Open your browser and navigate to:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- Health Check: http://localhost:5000/health

## Testing

### Manual Testing

1. **Register a User**
   - Go to http://localhost:5173/register
   - Fill in the registration form
   - Submit

2. **Login**
   - Use your credentials to login
   - You should be redirected to the home page

3. **Search Products**
   - Go to Search page
   - Enter a search term
   - Enter pincode (e.g., 560001)
   - Click Search

4. **Add to Cart**
   - Click "Add to Cart" on any product
   - Check cart icon to see item count

5. **Checkout**
   - Go to Cart
   - Proceed to Checkout
   - Add delivery address
   - Place order

### API Testing with Curl

```bash
# Health Check
curl http://localhost:5000/health

# Register User
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User",
    "phone": "+91 9876543210"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

## Production Deployment

### Step 1: Environment Configuration

Update `.env` for production:

```env
NODE_ENV=production
MONGODB_URI=mongodb://user:password@your-mongodb-host:27017/ondc_buyer_app
ONDC_GATEWAY_URL=https://prod.gateway.ondc.org
ONDC_SUBSCRIBER_URI=https://api.yourdomain.com
CLIENT_URL=https://yourdomain.com
```

### Step 2: Build Frontend

```bash
cd client
npm run build
cd ..
```

### Step 3: Start Production Server

```bash
npm start
```

### Step 4: Process Manager (PM2)

For production, use PM2 to manage the Node.js process:

```bash
# Install PM2 globally
npm install -g pm2

# Start application
pm2 start server/index.js --name ontheline

# Configure auto-restart on system reboot
pm2 startup
pm2 save

# Monitor logs
pm2 logs ontheline
```

### Step 5: Nginx Configuration (Optional)

If using Nginx as reverse proxy:

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Step 6: SSL Certificate

Use Let's Encrypt for free SSL:

```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

## Troubleshooting

### Common Issues

**MongoDB Connection Failed**
```bash
# Check MongoDB status
brew services list  # macOS
sudo systemctl status mongod  # Linux

# Check if port is available
lsof -i :27017
```

**Port Already in Use**
```bash
# Find and kill process
lsof -i :5000
kill -9 <PID>
```

**ONDC Webhook Not Receiving Callbacks**
- Ensure your webhook URL is publicly accessible
- Check firewall settings
- Verify ONDC credentials are correct
- Check server logs for errors

**Frontend Not Loading**
```bash
# Clear cache and rebuild
cd client
rm -rf node_modules dist
npm install
npm run build
cd ..
```

## Next Steps

1. Test all features thoroughly
2. Set up monitoring (e.g., PM2, New Relic)
3. Configure automated backups for MongoDB
4. Set up error tracking (e.g., Sentry)
5. Implement analytics (e.g., Google Analytics)
6. Review security best practices
7. Set up CI/CD pipeline

## Support

If you encounter any issues:
1. Check the logs in the `logs/` directory
2. Review the console output for errors
3. Check the MongoDB logs
4. Refer to the main README.md
5. Contact support@ontheline.in

---

Happy coding! 🚀

