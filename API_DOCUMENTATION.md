# API Documentation - OnTheLine ONDC Buyer App

Base URL: `http://localhost:5000/api` (Development)
Production URL: `https://api.yourdomain.com/api`

## Table of Contents
1. [Authentication](#authentication)
2. [User Management](#user-management)
3. [ONDC Operations](#ondc-operations)
4. [Cart Management](#cart-management)
5. [Order Management](#order-management)
6. [Webhooks](#webhooks)

## Authentication

All authenticated endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

### Register

Create a new user account.

**Endpoint:** `POST /auth/register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "phone": "+91 9876543210"
}
```

**Response:** `201 Created`
```json
{
  "message": "Registration successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "name": "John Doe",
    "phone": "+91 9876543210"
  }
}
```

**Error Responses:**
- `400 Bad Request` - Validation error or email already exists
- `500 Internal Server Error` - Server error

---

### Login

Authenticate and get access token.

**Endpoint:** `POST /auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:** `200 OK`
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "name": "John Doe",
    "phone": "+91 9876543210"
  }
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid credentials
- `500 Internal Server Error` - Server error

---

### Get Profile

Get current user profile.

**Endpoint:** `GET /auth/me`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "name": "John Doe",
    "phone": "+91 9876543210",
    "addresses": []
  }
}
```

---

### Update Profile

Update user profile information.

**Endpoint:** `PUT /auth/profile`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "John Updated Doe",
  "phone": "+91 9876543211"
}
```

**Response:** `200 OK`
```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "name": "John Updated Doe",
    "phone": "+91 9876543211"
  }
}
```

## User Management

### Get Addresses

Get all saved addresses for the user.

**Endpoint:** `GET /users/addresses`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "addresses": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "name": "Home",
      "phone": "+91 9876543210",
      "addressLine1": "123 Main Street",
      "addressLine2": "Apartment 4B",
      "city": "Bangalore",
      "state": "Karnataka",
      "pincode": "560001",
      "country": "India",
      "isDefault": true
    }
  ]
}
```

---

### Add Address

Add a new address.

**Endpoint:** `POST /users/addresses`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "Office",
  "phone": "+91 9876543210",
  "addressLine1": "456 Park Avenue",
  "addressLine2": "Floor 3",
  "city": "Mumbai",
  "state": "Maharashtra",
  "pincode": "400001",
  "country": "India",
  "latitude": 19.0760,
  "longitude": 72.8777,
  "isDefault": false
}
```

**Response:** `201 Created`
```json
{
  "message": "Address added successfully",
  "address": { /* address object */ }
}
```

---

### Update Address

Update an existing address.

**Endpoint:** `PUT /users/addresses/:addressId`

**Headers:** `Authorization: Bearer <token>`

**Request Body:** Same as Add Address

**Response:** `200 OK`

---

### Delete Address

Delete an address.

**Endpoint:** `DELETE /users/addresses/:addressId`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "message": "Address deleted successfully"
}
```

## ONDC Operations

### Search Products

Search for products on the ONDC network.

**Endpoint:** `POST /ondc/search`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "query": "laptop",
  "category": "electronics",
  "gps": "12.9716,77.5946",
  "pincode": "560001"
}
```

**Response:** `200 OK`
```json
{
  "message": "Search request sent",
  "transactionId": "550e8400-e29b-41d4-a716-446655440000",
  "messageId": "550e8400-e29b-41d4-a716-446655440001"
}
```

---

### Select Items

Get quote for selected items.

**Endpoint:** `POST /ondc/select`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "transactionId": "550e8400-e29b-41d4-a716-446655440000",
  "bppId": "seller-app.ondc.org",
  "bppUri": "https://seller-app.ondc.org",
  "providerId": "provider123",
  "items": [
    {
      "id": "item123",
      "quantity": 2
    }
  ],
  "gps": "12.9716,77.5946",
  "pincode": "560001"
}
```

**Response:** `200 OK`

---

### Initialize Order

Initialize order with billing and delivery details.

**Endpoint:** `POST /ondc/init`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "transactionId": "550e8400-e29b-41d4-a716-446655440000",
  "bppId": "seller-app.ondc.org",
  "bppUri": "https://seller-app.ondc.org",
  "providerId": "provider123",
  "items": [
    {
      "id": "item123",
      "quantity": 2
    }
  ],
  "billing": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+91 9876543210",
    "address": { /* address object */ }
  },
  "email": "john@example.com",
  "phone": "+91 9876543210",
  "deliveryLocation": { /* location object */ }
}
```

**Response:** `200 OK`

---

### Confirm Order

Confirm and place the order.

**Endpoint:** `POST /ondc/confirm`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "transactionId": "550e8400-e29b-41d4-a716-446655440000",
  "bppId": "seller-app.ondc.org",
  "bppUri": "https://seller-app.ondc.org",
  "providerId": "provider123",
  "orderId": "ORD-1234567890",
  "items": [ /* items */ ],
  "billing": { /* billing details */ },
  "fulfillments": [ /* fulfillment details */ ],
  "payment": {
    "type": "ON-ORDER",
    "status": "PAID",
    "amount": 1999,
    "currency": "INR"
  },
  "quote": { /* quote object */ }
}
```

**Response:** `200 OK`

## Cart Management

### Get Cart

Get user's cart.

**Endpoint:** `GET /ondc/cart`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "cart": {
    "_id": "507f1f77bcf86cd799439013",
    "userId": "507f1f77bcf86cd799439011",
    "items": [
      {
        "providerId": "provider123",
        "providerName": "Sample Store",
        "bppId": "seller-app.ondc.org",
        "bppUri": "https://seller-app.ondc.org",
        "itemId": "item123",
        "itemName": "Laptop",
        "itemDescriptor": {
          "name": "Laptop",
          "images": ["https://example.com/image.jpg"],
          "shortDesc": "High performance laptop"
        },
        "price": {
          "currency": "INR",
          "value": 45000
        },
        "quantity": 1
      }
    ],
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

### Add to Cart

Add item to cart.

**Endpoint:** `POST /ondc/cart/add`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "providerId": "provider123",
  "providerName": "Sample Store",
  "bppId": "seller-app.ondc.org",
  "bppUri": "https://seller-app.ondc.org",
  "itemId": "item123",
  "itemName": "Laptop",
  "itemDescriptor": {
    "name": "Laptop",
    "images": ["https://example.com/image.jpg"],
    "shortDesc": "High performance laptop"
  },
  "price": {
    "currency": "INR",
    "value": 45000
  },
  "quantity": 1,
  "fulfillmentId": "fulfillment1",
  "locationId": "location1"
}
```

**Response:** `200 OK`
```json
{
  "message": "Item added to cart",
  "cart": { /* cart object */ }
}
```

---

### Update Cart Item

Update item quantity in cart.

**Endpoint:** `PUT /ondc/cart/update/:itemId`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "quantity": 3
}
```

**Response:** `200 OK`

---

### Remove from Cart

Remove item from cart.

**Endpoint:** `DELETE /ondc/cart/remove/:itemId`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`

---

### Clear Cart

Clear all items from cart.

**Endpoint:** `DELETE /ondc/cart/clear`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`

## Order Management

### Get Orders

Get all orders for the user.

**Endpoint:** `GET /orders`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `status` (optional): Filter by status (CREATED, ACCEPTED, IN_PROGRESS, COMPLETED, CANCELLED)

**Response:** `200 OK`
```json
{
  "orders": [ /* array of order objects */ ],
  "totalPages": 5,
  "currentPage": 1,
  "totalOrders": 48
}
```

---

### Get Order Details

Get details of a specific order.

**Endpoint:** `GET /orders/:orderId`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "order": { /* complete order object */ }
}
```

---

### Create Order

Create a new order from cart.

**Endpoint:** `POST /orders/create`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "billingAddress": { /* billing address */ },
  "deliveryAddress": { /* delivery address */ },
  "paymentMethod": "ON-ORDER"
}
```

**Response:** `201 Created`

---

### Track Order

Get tracking information for an order.

**Endpoint:** `GET /orders/:orderId/track`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`

---

### Cancel Order

Cancel an order.

**Endpoint:** `POST /orders/:orderId/cancel`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "reasonId": "001",
  "reason": "Changed my mind"
}
```

**Response:** `200 OK`

---

### Get Support

Get support information for an order.

**Endpoint:** `GET /orders/:orderId/support`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`

## Webhooks

These endpoints receive callbacks from the ONDC network. They don't require authentication but should verify the ONDC signature.

### On Search Callback

**Endpoint:** `POST /webhooks/on_search`

### On Select Callback

**Endpoint:** `POST /webhooks/on_select`

### On Init Callback

**Endpoint:** `POST /webhooks/on_init`

### On Confirm Callback

**Endpoint:** `POST /webhooks/on_confirm`

### On Status Callback

**Endpoint:** `POST /webhooks/on_status`

### On Track Callback

**Endpoint:** `POST /webhooks/on_track`

### On Cancel Callback

**Endpoint:** `POST /webhooks/on_cancel`

### On Update Callback

**Endpoint:** `POST /webhooks/on_update`

### On Support Callback

**Endpoint:** `POST /webhooks/on_support`

## Error Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Invalid or missing token |
| 404 | Not Found - Resource doesn't exist |
| 500 | Internal Server Error |

## Rate Limiting

API requests are limited to 100 requests per 15 minutes per IP address.

---

For more information, visit the [GitHub repository](https://github.com/yourusername/ontheline).

