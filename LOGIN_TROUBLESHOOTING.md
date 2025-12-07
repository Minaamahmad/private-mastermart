# Login Troubleshooting Guide

## Issue: Login Button Keeps Loading

### Quick Checks

1. **Open Browser Console** (F12) and check for errors
2. **Check Network Tab** - See if Auth0 requests are being made
3. **Check Auth0 Configuration** in `.env` file

### Common Issues & Fixes

#### Issue 1: Auth0 Configuration Missing
**Symptoms:** Console shows "Auth0 configuration is missing"

**Fix:**
- Check `frontend/.env` file exists
- Verify these variables are set:
  ```
  VITE_AUTH0_DOMAIN=your-domain.auth0.com
  VITE_AUTH0_CLIENT_ID=your_client_id
  VITE_AUTH0_AUDIENCE=your_api_identifier (or client_id)
  VITE_AUTH0_REDIRECT_URI=http://localhost:3000/callback
  ```
- Restart dev server after changing `.env`

#### Issue 2: Redirect URI Mismatch
**Symptoms:** Login redirects but shows error

**Fix:**
1. Go to Auth0 Dashboard → Applications → Your App
2. Check **Allowed Callback URLs** includes: `http://localhost:3000/callback`
3. Check **Allowed Logout URLs** includes: `http://localhost:3000`
4. Check **Allowed Web Origins** includes: `http://localhost:3000`
5. Save changes

#### Issue 3: Audience Mismatch
**Symptoms:** Token retrieval fails after login

**Fix:**
- If using API, `VITE_AUTH0_AUDIENCE` should be your API identifier (e.g., `https://mastermart`)
- If not using API, you can remove `VITE_AUTH0_AUDIENCE` from `.env` or set it to your client ID
- Make sure API identifier matches in Auth0 Dashboard

#### Issue 4: CORS or Network Issues
**Symptoms:** No network requests in browser console

**Fix:**
- Check if backend is running (not required for Auth0 login, but good to check)
- Check browser console for CORS errors
- Try in incognito mode (to rule out extension issues)

### Debug Steps

1. **Check Console Logs:**
   - Open browser console (F12)
   - Click Login button
   - Look for:
     - "✅ Auth0 Provider initialized" - Good!
     - "Attempting login redirect..." - Good!
     - Any red error messages - Bad!

2. **Check Network Tab:**
   - Open Network tab in DevTools
   - Click Login
   - Look for requests to `*.auth0.com`
   - Check if they succeed (200) or fail (4xx/5xx)

3. **Test Auth0 Directly:**
   - Try accessing: `https://YOUR_DOMAIN.auth0.com/authorize?client_id=YOUR_CLIENT_ID&response_type=code&redirect_uri=http://localhost:3000/callback&scope=openid profile email`
   - Replace YOUR_DOMAIN and YOUR_CLIENT_ID
   - This should redirect to Auth0 login page

4. **Check Auth0 Dashboard:**
   - Go to Applications → Your App → Settings
   - Verify Application Type is "Single Page Web Applications"
   - Check all URLs are correct

### Quick Fix: Try This

If login still doesn't work, try this simplified version:

1. **Temporarily remove audience** from `.env`:
   ```env
   # Comment out or remove this line
   # VITE_AUTH0_AUDIENCE=...
   ```

2. **Update Auth0Provider.jsx** to not require audience:
   - The code already handles missing audience gracefully

3. **Restart dev server:**
   ```bash
   cd frontend
   npm run dev
   ```

4. **Try login again**

### Still Not Working?

1. **Check Auth0 Logs:**
   - Go to Auth0 Dashboard → Monitoring → Logs
   - Look for failed login attempts
   - Check error messages

2. **Verify Application Settings:**
   - Application Type: Single Page Web Applications
   - Token Endpoint Authentication Method: None
   - Grant Types: Authorization Code, Refresh Token

3. **Test with Minimal Config:**
   - Remove all scope requests
   - Just request: `openid profile email`
   - See if basic login works first

### Expected Behavior

When you click Login:
1. Button shows "Loading..."
2. Browser redirects to Auth0 login page (should happen immediately)
3. You see Auth0 login page
4. After login, redirects back to `/callback`
5. Then redirects to home page

If step 2 doesn't happen, that's the issue we need to fix.

