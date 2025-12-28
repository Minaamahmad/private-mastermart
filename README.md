# E-commerce Store - MERN Stack

A simple e-commerce platform for small businesses with Cash on Delivery functionality.

## Features

- **Customer Features:**
  - Browse products
  - View product details
  - Shopping cart
  - Checkout with Cash on Delivery
  - Order confirmation

- **Admin Features:**
  - Product management (CRUD)
  - Image upload for products
  - Order management
  - Order status updates

## Tech Stack

- **Frontend:** React + Vite
- **Backend:** Node.js + Express
- **Database:** MongoDB
- **Authentication:** Auth0 (Google OAuth for users, Admin role-based permissions)

## Setup Instructions

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory:
```
MONGODB_URI=mongodb://localhost:27017/ecommerce
PORT=5000
AUTH0_DOMAIN=your-domain.auth0.com
AUTH0_CLIENT_ID=your_client_id
AUTH0_AUDIENCE=your_client_id
```

4. Start MongoDB (make sure MongoDB is running on your system)

5. Start the backend server:
```bash
npm run dev
```

The backend will run on `

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the frontend directory:
```
VITE_API_URL=http://localhost:5000/api
VITE_AUTH0_DOMAIN=your-domain.auth0.com
VITE_AUTH0_CLIENT_ID=your_client_id
VITE_AUTH0_REDIRECT_URI=http://localhost:3000/callback
```

4. Start the development server:
```bash
npm run dev
```

The frontend will run on `

## Admin Setup

Admin access is managed through Auth0. To set up an admin:

1. Configure Auth0 with Google OAuth
2. Create an Admin role in Auth0
3. Assign the following permissions to the Admin role:
   - `create:products`
   - `update:products`
   - `delete:products`
   - `read:products`
   - `update:users`
   - `read:orders`
   - `update:orders`
4. Assign the Admin role to your Google account in Auth0

See `GOOGLE_ADMIN_SETUP.md` for detailed instructions.

## Project Structure

```
├── backend/
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   ├── middleware/      # Auth middleware
│   ├── uploads/         # Product images
│   └── server.js        # Entry point
│
└── frontend/
    ├── src/
    │   ├── components/  # Reusable components
    │   ├── pages/       # Page components
    │   ├── utils/       # API utilities
    │   └── App.jsx      # Main app component
    └── vite.config.js   # Vite configuration
```

## API Endpoints

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (admin)
- `PUT /api/products/:id` - Update product (admin)
- `DELETE /api/products/:id` - Delete product (admin)

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders` - Get all orders (admin)
- `GET /api/orders/:id` - Get single order (admin)
- `PUT /api/orders/:id/status` - Update order status (admin)

### Users (Auth0)
- `GET /api/users/me` - Get current user profile
- `PUT /api/users/me` - Update user profile
- `POST /api/users/sync` - Sync user from Auth0
- `GET /api/users/me/orders` - Get user orders

## License

MIT

