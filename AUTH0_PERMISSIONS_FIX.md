# Fix: "Insufficient Permissions" Error

If you're getting "Insufficient permissions" when accessing admin routes, follow these steps:

## Step 1: Create/Configure Auth0 API

1. **Go to Auth0 Dashboard** → **Applications** → **APIs**
2. **If you don't have an API yet:**
   - Click **Create API**
   - **Name**: `MasterMart API` (or any name)
   - **Identifier**: `https://mastermart` (or `https://your-api-name`)
   - **Signing Algorithm**: RS256
   - Click **Create**

3. **Enable RBAC (Role-Based Access Control):**
   - Go to your API → **Settings** tab
   - Scroll to **RBAC Settings**
   - ✅ **Enable RBAC**
   - ✅ **Add Permissions in the Access Token**
   - Click **Save**

## Step 2: Create Permissions in API

1. **Go to your API** → **Permissions** tab
2. **Add these permissions** (one by one):
   - `create:products` - Create products
   - `update:products` - Update products
   - `delete:products` - Delete products
   - `read:products` - Read products
   - `update:users` - Update users
   - `read:orders` - Read orders
   - `update:orders` - Update orders

3. **Save each permission**

## Step 3: Assign Permissions to Admin Role

1. **Go to User Management** → **Roles**
2. **Find or create "Admin" role**
3. **Go to Permissions tab**
4. **Click "Add Permissions"**
5. **Select your API** (e.g., "MasterMart API")
6. **Select ALL permissions:**
   - ✅ `create:products`
   - ✅ `update:products`
   - ✅ `delete:products`
   - ✅ `read:products`
   - ✅ `update:users`
   - ✅ `read:orders`
   - ✅ `update:orders`
7. **Click "Add"**

## Step 4: Update Environment Variables

### Backend `.env`:
```env
AUTH0_DOMAIN=your-domain.auth0.com
AUTH0_CLIENT_ID=your_client_id
AUTH0_AUDIENCE=https://mastermart
```

**IMPORTANT**: `AUTH0_AUDIENCE` should be your **API Identifier** (the one you set in Step 1), NOT your Client ID!

### Frontend `.env`:
```env
VITE_AUTH0_DOMAIN=your-domain.auth0.com
VITE_AUTH0_CLIENT_ID=your_client_id
VITE_AUTH0_AUDIENCE=https://mastermart
VITE_AUTH0_REDIRECT_URI=http://localhost:3000/callback
```

**IMPORTANT**: `VITE_AUTH0_AUDIENCE` should match your **API Identifier** (same as backend).

## Step 5: Authorize Your Application to Use the API

1. **Go to Applications** → **Your Application**
2. **Go to APIs tab**
3. **Find your API** (e.g., "MasterMart API")
4. **Click the toggle** to authorize it
5. **Click the arrow** to expand
6. **Make sure "Authorize" is checked**

## Step 6: Verify Your User Has the Admin Role

1. **Go to User Management** → **Users**
2. **Find your user** (the one you use to login)
3. **Go to Roles tab**
4. **Make sure "Admin" role is assigned**
5. **If not, click "Assign Roles" and add "Admin"**

## Step 7: Test the Fix

1. **Log out** from your application
2. **Log back in** with your Google account
3. **Check browser console** - you should see token details
4. **Try accessing** `/admin/orders` or `/admin/products`

## Debugging: Check Your Token

To see what permissions are in your token:

1. **Open browser console** (F12)
2. **Go to Application/Storage** → **Local Storage**
3. **Find `@@auth0spajs@@::...`** key
4. **Or check Network tab** → Look for API calls → Check Authorization header

You can also add this to your browser console to decode the token:
```javascript
// Get token from localStorage
const token = JSON.parse(localStorage.getItem('@@auth0spajs@@::YOUR_CLIENT_ID::default::openid profile email')).body.access_token;
// Decode token
const payload = JSON.parse(atob(token.split('.')[1]));
console.log('Token permissions:', payload.permissions);
console.log('Token scope:', payload.scope);
console.log('Token audience:', payload.aud);
```

## Common Issues

### Issue 1: "Audience is same as Client ID"
**Error**: `VITE_AUTH0_AUDIENCE equals CLIENT_ID`
**Fix**: Set `AUTH0_AUDIENCE` to your API identifier (e.g., `https://mastermart`), NOT your client ID

### Issue 2: "No permissions in token"
**Symptoms**: Token has no `permissions` array
**Fix**: 
- Make sure RBAC is enabled on your API
- Make sure "Add Permissions in the Access Token" is enabled
- Make sure permissions are assigned to the role
- Make sure your application is authorized to use the API

### Issue 3: "Permissions not assigned to role"
**Symptoms**: Role exists but has no permissions
**Fix**: Go to Role → Permissions → Add all required permissions

### Issue 4: "User doesn't have role"
**Symptoms**: User exists but no Admin role
**Fix**: Go to User → Roles → Assign "Admin" role

## Verification Checklist

- [ ] API created in Auth0
- [ ] RBAC enabled on API
- [ ] "Add Permissions in the Access Token" enabled
- [ ] All 7 permissions created in API
- [ ] All permissions assigned to Admin role
- [ ] Admin role assigned to your user
- [ ] Application authorized to use the API
- [ ] `AUTH0_AUDIENCE` set to API identifier (not client ID)
- [ ] Logged out and back in after changes

## Still Not Working?

1. **Check backend logs** - Look for permission check errors
2. **Check browser console** - Look for token details
3. **Verify token** - Use the debug code above to see what's in your token
4. **Try clearing cache** - Clear browser cache and localStorage
5. **Re-login** - Log out completely and log back in
