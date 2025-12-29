# Fix Auth0 Callback URL Mismatch Error

## The Problem

You're getting this error:
```
Callback URL mismatch.
The provided redirect_uri is not in the list of allowed callback URLs.
```

This happens because your Vercel frontend URL (`https://mastermart-delta.vercel.app`) is not added to your Auth0 application's allowed callback URLs.

## The Solution: Add URLs to Auth0

### Step 1: Go to Auth0 Dashboard

1. Go to [auth0.com](https://auth0.com) and sign in
2. Go to **Applications** → Select your application

### Step 2: Add Callback URLs

In your Auth0 application settings, find the **Allowed Callback URLs** field and add:

```
https://mastermart-delta.vercel.app/callback,https://mastermart-delta.vercel.app,http://localhost:5173/callback,http://localhost:5173
```

**Important:** Add ALL of these URLs (comma-separated):
- `https://mastermart-delta.vercel.app/callback` - Production callback
- `https://mastermart-delta.vercel.app` - Production root (for redirects)
- `http://localhost:5173/callback` - Local development callback
- `http://localhost:5173` - Local development root

### Step 3: Add Allowed Logout URLs

In the **Allowed Logout URLs** field, add:

```
https://mastermart-delta.vercel.app,http://localhost:5173
```

### Step 4: Add Allowed Web Origins

In the **Allowed Web Origins** field, add:

```
https://mastermart-delta.vercel.app,http://localhost:5173
```

### Step 5: Save Changes

Click **Save Changes** at the bottom of the page.

### Step 6: Verify Environment Variables in Vercel

Make sure these are set in Vercel (Settings → Environment Variables):

- `VITE_AUTH0_DOMAIN` - Your Auth0 domain (e.g., `your-domain.auth0.com`)
- `VITE_AUTH0_CLIENT_ID` - Your Auth0 Client ID
- `VITE_AUTH0_AUDIENCE` - Your Auth0 API Audience (if using RBAC)
- `VITE_AUTH0_REDIRECT_URI` - Optional, defaults to `window.location.origin` if not set

### Step 7: Redeploy Frontend

After saving Auth0 settings, you may need to:
1. Clear your browser cache
2. Try logging in again

If it still doesn't work, trigger a new deployment in Vercel.

## Quick Checklist

- [ ] Added `https://mastermart-delta.vercel.app/callback` to Allowed Callback URLs
- [ ] Added `https://mastermart-delta.vercel.app` to Allowed Callback URLs
- [ ] Added localhost URLs for development
- [ ] Added URLs to Allowed Logout URLs
- [ ] Added URLs to Allowed Web Origins
- [ ] Saved changes in Auth0
- [ ] Verified environment variables in Vercel
- [ ] Cleared browser cache and tried again

## Why This Happens

When you deploy to Vercel, your app runs on a different domain (`mastermart-delta.vercel.app`) than localhost. Auth0 requires you to explicitly whitelist all domains that can use your Auth0 application for security reasons.

## Still Having Issues?

1. **Check the exact error message** - It will tell you what URL Auth0 received
2. **Check browser console** - Look for the exact callback URL being used
3. **Verify Vercel environment variables** - Make sure `VITE_AUTH0_DOMAIN` and `VITE_AUTH0_CLIENT_ID` are set
4. **Check Auth0 logs** - Go to Auth0 Dashboard → Monitoring → Logs to see detailed error messages



