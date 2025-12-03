# Deployment Guide - OnTheLine ONDC Buyer App

This guide covers deploying the OnTheLine ONDC buyer app to various platforms.

## Table of Contents
1. [VPS Deployment (Ubuntu)](#vps-deployment-ubuntu)
2. [Heroku Deployment](#heroku-deployment)
3. [AWS Deployment](#aws-deployment)
4. [Docker Deployment](#docker-deployment)
5. [Vercel/Netlify (Frontend only)](#vercel-netlify-frontend-only)

## VPS Deployment (Ubuntu)

### Prerequisites
- Ubuntu 20.04 or higher
- Root or sudo access
- Domain name pointed to your server

### Step 1: Initial Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Install Nginx
sudo apt install nginx -y

# Install Certbot for SSL
sudo apt install certbot python3-certbot-nginx -y
```

### Step 2: Clone and Setup Application

```bash
# Create application directory
sudo mkdir -p /var/www/ontheline
cd /var/www/ontheline

# Clone repository
git clone <your-repo-url> .

# Install dependencies
npm install
cd client && npm install && npm run build && cd ..

# Create .env file
sudo nano .env
# Add your production configuration
```

### Step 3: Install PM2

```bash
sudo npm install -g pm2

# Start application
pm2 start server/index.js --name ontheline

# Save PM2 configuration
pm2 save

# Setup PM2 to start on system boot
pm2 startup systemd
```

### Step 4: Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/ontheline
```

Add the following configuration:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Serve static files
    location / {
        root /var/www/ontheline/client/dist;
        try_files $uri $uri/ /index.html;
    }

    # Proxy API requests to Node.js
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Increase upload size limit
    client_max_body_size 10M;
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/ontheline /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Step 5: Setup SSL Certificate

```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Follow the prompts to complete SSL setup.

### Step 6: Setup Firewall

```bash
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw enable
```

### Step 7: Setup Auto-Deployment (Optional)

Create a deployment script:

```bash
sudo nano /var/www/ontheline/deploy.sh
```

Add:

```bash
#!/bin/bash
cd /var/www/ontheline
git pull origin main
npm install
cd client && npm install && npm run build && cd ..
pm2 restart ontheline
```

Make it executable:

```bash
sudo chmod +x /var/www/ontheline/deploy.sh
```

## Heroku Deployment

### Step 1: Prepare Application

Create `Procfile` in root:

```
web: node server/index.js
```

Update `package.json`:

```json
{
  "scripts": {
    "start": "node server/index.js",
    "heroku-postbuild": "cd client && npm install && npm run build"
  },
  "engines": {
    "node": "18.x",
    "npm": "9.x"
  }
}
```

### Step 2: Deploy to Heroku

```bash
# Install Heroku CLI
curl https://cli-assets.heroku.com/install.sh | sh

# Login to Heroku
heroku login

# Create Heroku app
heroku create ontheline-app

# Add MongoDB addon
heroku addons:create mongolab:sandbox

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your_jwt_secret
heroku config:set ONDC_GATEWAY_URL=your_ondc_gateway
# ... add all other environment variables

# Deploy
git push heroku main

# Open application
heroku open
```

## AWS Deployment

### Using AWS Elastic Beanstalk

### Step 1: Install EB CLI

```bash
pip install awsebcli
```

### Step 2: Initialize EB

```bash
eb init -p node.js-18 ontheline-app --region us-east-1
```

### Step 3: Create Environment

```bash
eb create ontheline-env
```

### Step 4: Set Environment Variables

```bash
eb setenv NODE_ENV=production JWT_SECRET=your_secret MONGODB_URI=your_mongo_uri
```

### Step 5: Deploy

```bash
eb deploy
```

### Using AWS EC2

Follow the VPS deployment guide, but use an Amazon Linux 2 AMI and adjust package manager commands accordingly (use `yum` instead of `apt`).

## Docker Deployment

### Step 1: Create Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY client/package*.json ./client/

# Install dependencies
RUN npm install --production
RUN cd client && npm install && cd ..

# Copy application files
COPY . .

# Build frontend
RUN cd client && npm run build && cd ..

# Expose port
EXPOSE 5000

# Create logs directory
RUN mkdir -p logs

# Start application
CMD ["node", "server/index.js"]
```

### Step 2: Create docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongo:27017/ondc_buyer_app
      - JWT_SECRET=${JWT_SECRET}
      - ONDC_GATEWAY_URL=${ONDC_GATEWAY_URL}
      - ONDC_SUBSCRIBER_ID=${ONDC_SUBSCRIBER_ID}
      - ONDC_SUBSCRIBER_URI=${ONDC_SUBSCRIBER_URI}
      - CLIENT_URL=${CLIENT_URL}
    depends_on:
      - mongo
    restart: unless-stopped

  mongo:
    image: mongo:7.0
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db
    restart: unless-stopped

volumes:
  mongo-data:
```

### Step 3: Create .env file

```bash
cp .env.example .env
# Edit .env with your production values
```

### Step 4: Build and Run

```bash
# Build image
docker-compose build

# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Step 5: Deploy to Docker Hub (Optional)

```bash
# Build image
docker build -t yourusername/ontheline:latest .

# Login to Docker Hub
docker login

# Push image
docker push yourusername/ontheline:latest
```

## Vercel/Netlify (Frontend Only)

If you want to deploy frontend and backend separately:

### Frontend on Vercel

1. Update `client/vite.config.js`:

```javascript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://your-backend-api.com',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: 'dist'
  }
})
```

2. Create `vercel.json` in client folder:

```json
{
  "rewrites": [
    { "source": "/api/(.*)", "destination": "https://your-backend-api.com/api/$1" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

3. Deploy:

```bash
cd client
npm install -g vercel
vercel
```

### Frontend on Netlify

1. Create `client/netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/api/*"
  to = "https://your-backend-api.com/api/:splat"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

2. Deploy:

```bash
cd client
npm install -g netlify-cli
netlify deploy --prod
```

## Post-Deployment Checklist

- [ ] Verify all environment variables are set correctly
- [ ] Test user registration and login
- [ ] Test product search functionality
- [ ] Test cart operations
- [ ] Test order placement
- [ ] Test ONDC webhook callbacks
- [ ] Verify SSL certificate is working
- [ ] Setup monitoring (PM2 monitoring, New Relic, DataDog)
- [ ] Configure automatic backups for MongoDB
- [ ] Setup error tracking (Sentry)
- [ ] Configure log rotation
- [ ] Setup CDN for static assets (CloudFlare, AWS CloudFront)
- [ ] Test performance and optimize
- [ ] Setup health check monitoring
- [ ] Configure automated deployment pipeline

## Monitoring and Maintenance

### PM2 Monitoring

```bash
# View logs
pm2 logs ontheline

# Monitor processes
pm2 monit

# View process info
pm2 info ontheline

# Restart application
pm2 restart ontheline

# View metrics
pm2 describe ontheline
```

### MongoDB Backup

```bash
# Create backup
mongodump --db ondc_buyer_app --out /backup/$(date +%Y%m%d)

# Restore backup
mongorestore --db ondc_buyer_app /backup/20240101/ondc_buyer_app
```

### Log Rotation

Create `/etc/logrotate.d/ontheline`:

```
/var/www/ontheline/logs/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
    sharedscripts
    postrotate
        pm2 reloadLogs
    endscript
}
```

## Troubleshooting

### Application won't start
```bash
pm2 logs ontheline --lines 100
```

### Database connection issues
```bash
sudo systemctl status mongod
mongo --eval "db.adminCommand('ping')"
```

### Nginx errors
```bash
sudo nginx -t
sudo tail -f /var/log/nginx/error.log
```

### SSL certificate issues
```bash
sudo certbot renew --dry-run
```

## Support

For deployment issues:
- Check application logs: `pm2 logs ontheline`
- Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
- Check MongoDB logs: `sudo tail -f /var/log/mongodb/mongod.log`
- Contact: support@ontheline.in

---

Good luck with your deployment! 🚀

