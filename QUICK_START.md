# Quick Start Guide - OnTheLine ONDC Buyer App

Get up and running with the OnTheLine ONDC buyer app in under 10 minutes!

## Prerequisites

Make sure you have these installed:
- ✅ Node.js (v16+)
- ✅ MongoDB
- ✅ Git

## Quick Setup (5 minutes)

### 1. Install Dependencies

```bash
# Install all dependencies (root + client)
npm run install:all
```

### 2. Setup Environment

```bash
# Copy environment template
cp .env.example .env
```

Edit `.env` and update these minimal required fields:

```env
# Generate a random JWT secret
JWT_SECRET=your_random_32_character_secret_here

# Your MongoDB connection (use default for local)
MONGODB_URI=mongodb://localhost:27017/ondc_buyer_app

# For testing, you can use sample ONDC values
ONDC_SUBSCRIBER_ID=test.ontheline.in
ONDC_SUBSCRIBER_URI=http://localhost:5000
```

### 3. Start MongoDB

```bash
# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Windows - Start MongoDB service
```

### 4. Run the Application

```bash
# Start both backend and frontend
npm run dev
```

That's it! 🎉

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- API Health Check: http://localhost:5000/health

## First Steps

### 1. Register an Account

1. Open http://localhost:5173
2. Click "Register"
3. Fill in your details
4. Submit

### 2. Try Searching

1. Click "Search" in the navigation
2. Enter a search term (e.g., "laptop")
3. Enter pincode (e.g., "560001")
4. Click "Search"

**Note:** In development mode, the search will use mock data since you need actual ONDC credentials for live results.

### 3. Explore Features

- ✨ Add items to cart
- 📦 View cart
- 🏠 Add delivery addresses in Profile
- 📱 Place test orders
- 📋 View order history

## Project Structure Overview

```
ontheline/
├── server/              # Backend API
│   ├── routes/         # API endpoints
│   ├── models/         # Database models
│   ├── services/       # Business logic
│   └── middleware/     # Auth, etc.
├── client/             # React frontend
│   └── src/
│       ├── pages/      # UI pages
│       ├── components/ # Reusable components
│       ├── store/      # State management
│       └── utils/      # API client
└── docs/               # Documentation
```

## Common Commands

```bash
# Development
npm run dev              # Run full stack
npm run server:dev       # Backend only
npm run client:dev       # Frontend only

# Production
npm run build           # Build frontend
npm start              # Start production server

# Maintenance
npm run install:all     # Install all dependencies
```

## What's Included?

### ✅ Complete Features

1. **User Management**
   - Registration & Login
   - Profile management
   - Address management

2. **Product Discovery**
   - Search interface
   - Category browsing
   - Product display

3. **Shopping Cart**
   - Add/remove items
   - Update quantities
   - Cart persistence

4. **Checkout Process**
   - Address selection
   - Payment method choice
   - Order placement

5. **Order Management**
   - Order history
   - Order tracking
   - Order cancellation
   - Support access

6. **ONDC Integration**
   - Beckn protocol implementation
   - All ONDC endpoints (search, select, init, confirm, etc.)
   - Webhook handlers for callbacks

### 🎨 UI/UX Features

- Modern, responsive design
- TailwindCSS styling
- Smooth animations
- Toast notifications
- Loading states
- Error handling

### 🔒 Security Features

- JWT authentication
- Password hashing
- Rate limiting
- Input validation
- CORS protection
- Helmet security headers

## Next Steps

### For Development

1. **Read Documentation**
   - `README.md` - Complete project documentation
   - `SETUP_GUIDE.md` - Detailed setup instructions
   - `API_DOCUMENTATION.md` - API reference

2. **Configure ONDC**
   - Register on ONDC portal
   - Get credentials
   - Update `.env` with real credentials
   - Set up webhooks

3. **Customize**
   - Update branding
   - Modify UI components
   - Add custom features

### For Production

1. **Follow Deployment Guide**
   - Read `DEPLOYMENT.md`
   - Choose your platform (VPS, Heroku, AWS, etc.)
   - Configure production environment
   - Set up SSL/HTTPS

2. **Setup Monitoring**
   - Configure PM2
   - Set up error tracking
   - Enable logging
   - Configure backups

## Testing the Application

### Manual Testing Flow

1. **User Registration**
   ```
   Navigate to /register
   Fill form → Submit → Auto-login
   ```

2. **Add Address**
   ```
   Go to /profile
   Click "Add Address"
   Fill details → Save
   ```

3. **Search Products**
   ```
   Go to /search
   Enter: "laptop" + pincode "560001"
   Click Search
   ```

4. **Add to Cart**
   ```
   Click "Add to Cart" on any product
   Check cart icon for count
   ```

5. **Checkout**
   ```
   Go to /cart
   Click "Proceed to Checkout"
   Select address
   Choose payment method
   Click "Place Order"
   ```

6. **View Orders**
   ```
   Go to /orders
   Click on any order for details
   Try tracking/cancellation
   ```

## Troubleshooting

### MongoDB Not Running?

```bash
# Check status
mongosh

# If error, start MongoDB
brew services start mongodb-community  # macOS
sudo systemctl start mongod            # Linux
```

### Port Already in Use?

```bash
# Find what's using port 5000
lsof -i :5000

# Kill the process
kill -9 <PID>
```

### Dependencies Issues?

```bash
# Clean install
rm -rf node_modules client/node_modules
npm run install:all
```

### Frontend Not Loading?

```bash
cd client
rm -rf node_modules dist
npm install
npm run dev
```

## Environment Variables Explained

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Backend server port | `5000` |
| `NODE_ENV` | Environment mode | `development` or `production` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/ondc_buyer_app` |
| `JWT_SECRET` | Secret for JWT tokens | Random 32+ char string |
| `ONDC_GATEWAY_URL` | ONDC gateway endpoint | Provided by ONDC |
| `ONDC_SUBSCRIBER_ID` | Your ONDC subscriber ID | Your domain/ondc |
| `ONDC_SUBSCRIBER_URI` | Your app's public URL | Your domain URL |
| `CLIENT_URL` | Frontend URL | `http://localhost:5173` |

## Getting Help

1. **Check Documentation**
   - Start with README.md
   - Review SETUP_GUIDE.md
   - Check API_DOCUMENTATION.md

2. **Check Logs**
   ```bash
   # Application logs
   tail -f logs/combined.log
   
   # Error logs
   tail -f logs/error.log
   ```

3. **Common Issues**
   - MongoDB connection → Check MongoDB is running
   - ONDC errors → Verify credentials in `.env`
   - Build errors → Delete node_modules and reinstall
   - CORS errors → Check CLIENT_URL in `.env`

4. **Need More Help?**
   - Check GitHub issues
   - Create a new issue
   - Email: support@ontheline.in

## What's Different from Production?

| Feature | Development | Production |
|---------|-------------|------------|
| API URL | localhost:5000 | Your domain |
| MongoDB | Local instance | Cloud/hosted |
| ONDC Gateway | Staging | Production |
| SSL/HTTPS | Not required | Required |
| Monitoring | Console logs | PM2/CloudWatch |
| Error Tracking | Console | Sentry/similar |

## Performance Tips

1. **For Development**
   - Use MongoDB locally
   - Enable hot reload
   - Use React DevTools
   - Check Network tab in browser

2. **For Production**
   - Enable gzip compression
   - Use CDN for assets
   - Enable MongoDB indexes
   - Set up caching
   - Monitor with PM2

## Features Coming Soon

- 🔔 Real-time notifications
- ⭐ Product reviews
- 💾 Wishlist
- 🌍 Multi-language support
- 📱 Mobile app
- 🎁 Loyalty points
- 🔄 Return/refund process

## Contributing

Want to contribute?

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
4. Submit a pull request

## License

MIT License - feel free to use for your projects!

---

**Ready to start building?** Run `npm run dev` and start coding! 🚀

If you found this helpful, please star the repository on GitHub!

