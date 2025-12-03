# OnTheLine - ONDC Buyer Participant App

A complete ONDC (Open Network for Digital Commerce) buyer participant application built with React, Node.js, Express, and MongoDB. This application allows consumers to search, discover, and purchase products from sellers on the ONDC network.

## Features

### 🛍️ For Buyers
- **Product Discovery**: Search products across the ONDC network
- **Smart Cart**: Add products from multiple sellers
- **Secure Checkout**: Multiple payment options
- **Order Tracking**: Real-time order status updates
- **Address Management**: Save and manage delivery addresses
- **Order History**: View past orders and track deliveries

### 🔧 Technical Features
- **ONDC Beckn Protocol**: Full implementation of search, select, init, confirm, status, track, cancel, support
- **RESTful APIs**: Well-structured backend APIs
- **Authentication**: JWT-based secure authentication
- **Real-time Updates**: Webhook handlers for ONDC callbacks
- **Responsive Design**: Modern UI with TailwindCSS
- **State Management**: Zustand for efficient state handling

## Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: Helmet, CORS, Rate Limiting
- **Logging**: Winston
- **Validation**: Joi

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **Routing**: React Router v6
- **State Management**: Zustand
- **HTTP Client**: Axios
- **UI Components**: Lucide Icons, Headless UI
- **Notifications**: React Hot Toast

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v16 or higher)
- MongoDB (v5 or higher)
- npm or yarn

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/ontheline.git
cd ontheline
```

### 2. Install dependencies

```bash
# Install root dependencies
npm install

# Install client dependencies
cd client && npm install && cd ..
```

### 3. Environment Configuration

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit the `.env` file with your configuration:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/ondc_buyer_app

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d

# ONDC Configuration
ONDC_GATEWAY_URL=https://staging.gateway.proteantech.in
ONDC_SUBSCRIBER_ID=your_subscriber_id
ONDC_SUBSCRIBER_URI=https://your-domain.com
ONDC_REGISTRY_URL=https://staging.registry.ondc.org/ondc
ONDC_SIGNING_PRIVATE_KEY=your_private_key_here
ONDC_SIGNING_PUBLIC_KEY=your_public_key_here
ONDC_SUBSCRIBER_TYPE=BAP
ONDC_UNIQUE_KEY_ID=your_unique_key_id

# Payment Gateway Configuration
PAYMENT_GATEWAY_KEY=your_payment_gateway_key
PAYMENT_GATEWAY_SECRET=your_payment_gateway_secret

# Frontend URL
CLIENT_URL=http://localhost:5173
```

### 4. Start MongoDB

Make sure MongoDB is running on your system:

```bash
# macOS (with Homebrew)
brew services start mongodb-community

# Linux
sudo systemctl start mongodb

# Windows
# Start MongoDB service from Services
```

### 5. Run the application

#### Development Mode

```bash
# Run both backend and frontend
npm run dev

# Or run them separately
npm run server:dev  # Backend only
npm run client:dev  # Frontend only
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

#### Production Mode

```bash
# Build frontend
npm run build

# Start server
npm start
```

## Project Structure

```
ontheline/
├── server/                      # Backend code
│   ├── index.js                # Main server file
│   ├── models/                 # Mongoose models
│   │   ├── User.js
│   │   ├── Order.js
│   │   └── Cart.js
│   ├── routes/                 # API routes
│   │   ├── auth.js
│   │   ├── ondc.js
│   │   ├── orders.js
│   │   ├── users.js
│   │   └── webhooks.js
│   ├── services/               # Business logic
│   │   ├── ondcService.js
│   │   └── paymentService.js
│   ├── middleware/             # Express middleware
│   │   └── auth.js
│   └── utils/                  # Utility functions
│       └── logger.js
├── client/                     # Frontend code
│   ├── src/
│   │   ├── components/         # React components
│   │   │   ├── Layout.jsx
│   │   │   ├── Header.jsx
│   │   │   └── Footer.jsx
│   │   ├── pages/              # Page components
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Search.jsx
│   │   │   ├── Cart.jsx
│   │   │   ├── Checkout.jsx
│   │   │   ├── Orders.jsx
│   │   │   ├── OrderDetails.jsx
│   │   │   └── Profile.jsx
│   │   ├── store/              # State management
│   │   │   ├── authStore.js
│   │   │   └── cartStore.js
│   │   ├── utils/              # Utilities
│   │   │   └── api.js
│   │   ├── App.jsx             # Main App component
│   │   ├── main.jsx            # Entry point
│   │   └── index.css           # Global styles
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── logs/                       # Application logs
├── package.json
├── .env.example
├── .gitignore
└── README.md
```

## ONDC Integration

### Registering as a Buyer App

1. Visit [ONDC Developer Portal](https://ondc.org/tech/)
2. Register your application as a Buyer App Participant (BAP)
3. Generate signing keys
4. Configure your subscriber ID and URI
5. Set up webhook endpoints for ONDC callbacks

### ONDC Endpoints

The application implements the following ONDC Beckn Protocol endpoints:

- **search**: Search for products across the network
- **select**: Get quote for selected items
- **init**: Initialize order with delivery details
- **confirm**: Confirm and place the order
- **status**: Get order status
- **track**: Track order delivery
- **cancel**: Cancel an order
- **support**: Get support information

### Webhook Callbacks

The following webhook endpoints handle ONDC callbacks:

- `POST /api/webhooks/on_search` - Receive search results
- `POST /api/webhooks/on_select` - Receive quote
- `POST /api/webhooks/on_init` - Receive payment terms
- `POST /api/webhooks/on_confirm` - Receive order confirmation
- `POST /api/webhooks/on_status` - Receive status updates
- `POST /api/webhooks/on_track` - Receive tracking information
- `POST /api/webhooks/on_cancel` - Receive cancellation confirmation
- `POST /api/webhooks/on_update` - Receive order updates
- `POST /api/webhooks/on_support` - Receive support information

## API Documentation

### Authentication

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "phone": "+91 9876543210"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Get Profile
```http
GET /api/auth/me
Authorization: Bearer <token>
```

### Product Search

```http
POST /api/ondc/search
Authorization: Bearer <token>
Content-Type: application/json

{
  "query": "laptop",
  "category": "electronics",
  "pincode": "560001"
}
```

### Cart Operations

#### Get Cart
```http
GET /api/ondc/cart
Authorization: Bearer <token>
```

#### Add to Cart
```http
POST /api/ondc/cart/add
Authorization: Bearer <token>
Content-Type: application/json

{
  "providerId": "provider123",
  "providerName": "Sample Store",
  "itemId": "item123",
  "itemName": "Product Name",
  "price": { "currency": "INR", "value": 999 },
  "quantity": 1
}
```

### Orders

#### Create Order
```http
POST /api/orders/create
Authorization: Bearer <token>
Content-Type: application/json

{
  "billingAddress": { ... },
  "deliveryAddress": { ... },
  "paymentMethod": "ON-ORDER"
}
```

#### Get Orders
```http
GET /api/orders
Authorization: Bearer <token>
```

#### Track Order
```http
GET /api/orders/:orderId/track
Authorization: Bearer <token>
```

## Deployment

### Production Checklist

- [ ] Set `NODE_ENV=production` in `.env`
- [ ] Use a strong `JWT_SECRET`
- [ ] Configure production MongoDB URI
- [ ] Set up HTTPS/SSL certificates
- [ ] Configure proper CORS origins
- [ ] Set up production ONDC credentials
- [ ] Configure production payment gateway
- [ ] Set up monitoring and logging
- [ ] Configure firewall rules
- [ ] Set up automated backups

### Docker Deployment (Optional)

Create a `Dockerfile`:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
RUN cd client && npm install && npm run build
EXPOSE 5000
CMD ["node", "server/index.js"]
```

Build and run:

```bash
docker build -t ontheline .
docker run -p 5000:5000 --env-file .env ontheline
```

## Security Considerations

1. **Environment Variables**: Never commit `.env` files to version control
2. **JWT Secret**: Use a strong, randomly generated secret
3. **HTTPS**: Always use HTTPS in production
4. **Rate Limiting**: Already implemented for API endpoints
5. **Input Validation**: Joi validation is implemented for all inputs
6. **MongoDB**: Use strong passwords and enable authentication
7. **CORS**: Configure allowed origins properly

## Troubleshooting

### MongoDB Connection Issues
```bash
# Check if MongoDB is running
mongosh
# or
mongo

# If not running, start it
brew services start mongodb-community  # macOS
sudo systemctl start mongodb           # Linux
```

### Port Already in Use
```bash
# Find process using port 5000
lsof -i :5000
# Kill the process
kill -9 <PID>
```

### ONDC Integration Issues
- Verify your subscriber credentials
- Check webhook URL is publicly accessible
- Ensure signing keys are correctly configured
- Check ONDC gateway URL is correct

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For support, email support@ontheline.in or create an issue in the repository.

## Acknowledgments

- [ONDC](https://ondc.org/) - Open Network for Digital Commerce
- [Beckn Protocol](https://beckn.org/) - Open protocol for commerce
- React and Node.js communities

## Roadmap

- [ ] Implement real-time notifications
- [ ] Add wishlist functionality
- [ ] Implement product reviews and ratings
- [ ] Add multi-language support
- [ ] Implement advanced search filters
- [ ] Add seller ratings and reviews
- [ ] Implement order return and refund
- [ ] Add loyalty points system
- [ ] Mobile app (React Native)
- [ ] Progressive Web App (PWA) support

---

Built with ❤️ for the ONDC ecosystem

