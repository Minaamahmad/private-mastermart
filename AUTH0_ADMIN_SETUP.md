# Auth0 Admin Setup Guide

## Overview
This guide shows you how to set up Auth0 for admin authentication with permissions/scopes instead of the traditional JWT admin system.

## Step 1: Configure Auth0 API

1. **Go to Auth0 Dashboard** → **Applications** → **APIs**
2. **Create a new API** (or use existing):
   - Name: "E-commerce API"
   - Identifier: `https://your-api-identifier` (e.g., `https://ecommerce-api`)
   - Signing Algorithm: RS256
   - Click **Create**

3. **Configure API Permissions**:
   - Go to your API → **Permissions** tab
   - Add the following permissions:
     - `create:products` - Create products
     - `update:products` - Update products
     - `delete:products` - Delete products
     - `read:orders` - View orders
     - `update:orders` - Update order status
   - Save changes

## Step 2: Create Admin Role

1. **Go to Auth0 Dashboard** → **User Management** → **Roles**
2. **Create Role**:
   - Name: "Admin"
   - Description: "E-commerce Admin"
   - Click **Create**

3. **Assign Permissions to Role**:
   - Go to the "Admin" role → **Permissions** tab
   - Click **Add Permissions**
   - Select your API (E-commerce API)
   - Select all permissions:
     - `create:products`
     - `update:products`
     - `delete:products`
     - `read:orders`
     - `update:orders`
   - Click **Add Permissions**

## Step 3: Create Admin User

1. **Go to Auth0 Dashboard** → **User Management** → **Users**
2. **Create User**:
   - Click **Create User**
   - Email: Your admin Gmail (e.g., `admin@yourdomain.com`)
   - Password: Set a secure password
   - Connection: Database (Username-Password-Authentication)
   - Click **Create**

3. **Assign Admin Role**:
   - Go to the user you just created
   - Click **Roles** tab
   - Click **Assign Roles**
   - Select "Admin" role
   - Click **Assign**

## Step 4: Update Frontend to Request Permissions

Update your frontend Auth0 configuration to request the API permissions:

### Update `frontend/src/Auth0Provider.jsx`:

```javascript
const authParams = {
  redirect_uri: redirectUri,
  audience: import.meta.env.VITE_AUTH0_AUDIENCE, // Your API identifier
  scope: 'openid profile email create:products update:products delete:products read:orders update:orders'
};
```

### Update `frontend/.env`:

```env
VITE_AUTH0_AUDIENCE=https://your-api-identifier
```

## Step 5: Update Frontend Login

When admin logs in, they need to request the API permissions. Update your login button:

```javascript
const handleAdminLogin = () => {
  loginWithRedirect({
    authorizationParams: {
      audience: import.meta.env.VITE_AUTH0_AUDIENCE,
      scope: 'openid profile email create:products update:products delete:products read:orders update:orders'
    }
  });
};
```

## Step 6: Backend Configuration

Your backend is already configured! The middleware will:
1. Verify the Auth0 token
2. Check if the token has the required permissions
3. Allow or deny access based on permissions

## Step 7: Test Admin Login

1. **Start your backend**: `cd backend && npm run dev`
2. **Start your frontend**: `cd frontend && npm run dev`
3. **Login with your admin Gmail**:
   - Go to `http://localhost:3000`
   - Click Login
   - Use your admin Gmail account
   - The token will include permissions: `['create:products', 'update:products', 'delete:products', 'read:orders', 'update:orders']`

4. **Test Admin Routes**:
   - Try creating a product: `POST /api/products`
   - Try updating a product: `PUT /api/products/:id`
   - Try deleting a product: `DELETE /api/products/:id`
   - Try viewing orders: `GET /api/orders`
   - Try updating order status: `PUT /api/orders/:id/status`

## Permission Mapping

| Route | Method | Required Permission |
|-------|--------|-------------------|
| `/api/products` | POST | `create:products` |
| `/api/products/:id` | PUT | `update:products` |
| `/api/products/:id` | DELETE | `delete:products` |
| `/api/orders` | GET | `read:orders` |
| `/api/orders/:id/status` | PUT | `update:orders` |

## Troubleshooting

### "Insufficient permissions" error:
- Check that the user has the "Admin" role assigned
- Check that the role has all required permissions
- Verify the token includes permissions (check `req.user.permissions` in backend logs)

### Token doesn't include permissions:
- Make sure you're requesting the `audience` in the login
- Make sure you're requesting the `scope` with all permissions
- Check that the API identifier matches in frontend and backend

### "Authentication required" error:
- Make sure you're sending the token in the Authorization header: `Bearer <token>`
- Verify the token is valid and not expired

## Benefits of This Approach

✅ **No separate admin database** - Uses Auth0 user management
✅ **Fine-grained permissions** - Control exactly what each admin can do
✅ **Easy to add new admins** - Just create user and assign role
✅ **Centralized authentication** - All auth through Auth0
✅ **Better security** - Auth0 handles password security, 2FA, etc.

