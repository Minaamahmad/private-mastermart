# Permissions Update Guide

## Your Current Permissions

Based on your Auth0 API setup, you have these permissions:
- ✅ `create:products` - Create products
- ✅ `delete:products` - Delete products  
- ✅ `read:products` - Read products
- ✅ `update:products` - Update products
- ✅ `update:users` - Update users

## Missing Permissions for Full Functionality

Your code currently uses these permissions for orders:
- ❌ `read:orders` - View all orders (used in `GET /api/orders`)
- ❌ `update:orders` - Update order status (used in `PUT /api/orders/:id/status`)

## Solution: Add Missing Permissions

### Option 1: Add Orders Permissions (Recommended)

1. Go to Auth0 Dashboard → Applications → APIs → Your API (mastermart)
2. Go to **Permissions** tab
3. Click **Add Permission**
4. Add these permissions:
   - **Permission**: `read:orders`
   - **Description**: Read orders
   - Click **Add**
   
   - **Permission**: `update:orders`
   - **Description**: Update order status
   - Click **Add**

5. Go to **User Management** → **Roles** → **Admin** role
6. Go to **Permissions** tab
7. Click **Add Permissions**
8. Select your API and add:
   - `read:orders`
   - `update:orders`
9. Click **Add Permissions**

10. Update frontend scope in `Auth0Provider.jsx`:
    ```javascript
    authParams.scope = 'openid profile email create:products update:products delete:products read:products update:users read:orders update:orders';
    ```

### Option 2: Use Existing Permissions (Alternative)

If you don't want to add orders permissions, you can modify the orders routes to use a different permission or make them use `read:products` and `update:products` instead.

## Current Permission Mapping

| Route | Method | Required Permission | Status |
|-------|--------|-------------------|--------|
| `/api/products` | GET | None (public) | ✅ Works |
| `/api/products` | POST | `create:products` | ✅ Configured |
| `/api/products/:id` | PUT | `update:products` | ✅ Configured |
| `/api/products/:id` | DELETE | `delete:products` | ✅ Configured |
| `/api/orders` | GET | `read:orders` | ⚠️ Need to add |
| `/api/orders/:id/status` | PUT | `update:orders` | ⚠️ Need to add |
| `/api/users/me` | PUT | None (self-update) | ✅ Works |

## Testing Your Permissions

After adding the missing permissions:

1. **Login with your admin account**
2. **Check token permissions** - The token should include:
   ```json
   {
     "permissions": [
       "create:products",
       "delete:products",
       "read:products",
       "update:products",
       "update:users",
       "read:orders",
       "update:orders"
     ]
   }
   ```

3. **Test each route**:
   - Create product → Should work ✅
   - Update product → Should work ✅
   - Delete product → Should work ✅
   - View orders → Should work after adding `read:orders` ⚠️
   - Update order status → Should work after adding `update:orders` ⚠️

## Quick Fix

If you want to test immediately without adding orders permissions, you can temporarily modify the orders routes to use product permissions or remove the permission check:

```javascript
// In backend/routes/orders.js
// Temporarily use product permissions instead
router.get('/', verifyAuth0Token, checkPermissions('read:products'), ...);
router.put('/:id/status', verifyAuth0Token, checkPermissions('update:products'), ...);
```

But it's better to add the proper permissions for better security and clarity.

