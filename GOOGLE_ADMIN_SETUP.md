# Google Account Admin Setup Guide

## Quick Setup: Use Your Google Account as Admin

### Step 1: Create/Find Your Google User in Auth0

1. **Go to Auth0 Dashboard** → **User Management** → **Users**
2. **If you don't have a user yet:**
   - Click **Create User**
   - Email: Your Gmail address (e.g., `yourname@gmail.com`)
   - Password: Leave empty (we'll use Google login)
   - Connection: **Google** (not Database)
   - Click **Create**

3. **If you already have a user:**
   - Find your user by email
   - Make sure they're connected to **Google** connection

### Step 2: Assign Admin Role

1. **Go to your user** → Click on the user
2. **Go to Roles tab**
3. **Click "Assign Roles"**
4. **Select "Admin" role**
5. **Click "Assign"**

### Step 3: Enable Google Connection

1. **Go to Authentication** → **Social**
2. **Find "Google"** connection
3. **Make sure it's enabled** (toggle should be ON)
4. **Click on Google connection** to configure:
   - Make sure it's enabled for your Application
   - Check that it's in the list of enabled connections

### Step 4: Configure Your Application

1. **Go to Applications** → **Your Application**
2. **Go to Connections tab**
3. **Make sure these are enabled:**
   - ✅ **Google** (for admin login)
   - ✅ **Username-Password-Authentication** (optional, for regular users)
   - ✅ **Facebook** (optional, for regular users)

### Step 5: Test Login

1. **Start your frontend**: `cd frontend && npm run dev`
2. **Go to**: `http://localhost:3000`
3. **Click "Login"**
4. **Select "Sign in with Google"** (or it will show Google option)
5. **Login with your Gmail account**
6. **After login, check:**
   - You should see your name/email in navbar
   - Admin links should appear (Dashboard, Products, Orders)
   - You should be able to access `/admin/dashboard`

## How It Works

1. **You login with Google** → Auth0 authenticates via Google
2. **Auth0 checks your role** → Finds you have "Admin" role
3. **Token includes permissions** → Your token has: `['create:products', 'update:products', 'delete:products', 'read:products', 'update:users']`
4. **Frontend detects admin** → Navbar checks token permissions and shows admin links
5. **Backend verifies permissions** → Each admin route checks for required permissions

## Troubleshooting

### "Login keeps loading"
**Fixed!** The CallbackPage now has better error handling and timeouts.

### "Admin links don't show"
- Check that your user has the "Admin" role assigned
- Check that the role has all permissions
- Check browser console for errors
- Try logging out and back in

### "Insufficient permissions" error
**This is the most common issue!** See `AUTH0_PERMISSIONS_FIX.md` for detailed step-by-step instructions.

**Quick checklist:**
1. ✅ API created in Auth0 with RBAC enabled
2. ✅ "Add Permissions in the Access Token" enabled on API
3. ✅ All permissions created in API
4. ✅ Permissions assigned to Admin role
5. ✅ `AUTH0_AUDIENCE` set to API identifier (NOT client ID)
6. ✅ Application authorized to use the API

**Required permissions:**
- `create:products`
- `update:products`
- `delete:products`
- `read:products`
- `update:users`
- `read:orders`
- `update:orders`

### "Google login not working"
- Check that Google connection is enabled
- Check that Google connection is enabled for your Application
- Verify Google OAuth app is configured in Google Cloud Console
- Check Auth0 logs for errors

## Verification

After setup, your token should contain:
```json
{
  "sub": "google-oauth2|...",
  "email": "yourname@gmail.com",
  "permissions": [
    "create:products",
    "update:products",
    "delete:products",
    "read:products",
    "update:users"
  ]
}
```

## Summary

✅ **One Google account** = Admin access
✅ **No separate admin login** = Just use Google login
✅ **Permissions-based** = Token includes what you can do
✅ **Automatic detection** = Frontend shows admin links automatically

Your Google account is now your admin account!

