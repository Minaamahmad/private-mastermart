# Troubleshooting Guide: Products Not Loading

## Quick Diagnosis Steps

### Step 1: Check Backend Health

Test if your Railway backend is running:

```bash
curl https://master-mart-production.up.railway.app/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "mongodb": "connected"
}
```

**If you get an error:**
- Backend is not running or not accessible
- Check Railway logs for errors
- Verify Railway service is deployed and running

### Step 2: Test Products API Directly

```bash
curl https://master-mart-production.up.railway.app/api/products
```

**Expected Response:**
- Empty array `[]` if no products
- Array of products if products exist

**If you get an error:**
- Check Railway logs
- Verify MongoDB connection
- Check if routes are properly configured

### Step 3: Check Frontend Environment Variables

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Verify these are set:
   - `VITE_API_URL=https://master-mart-production.up.railway.app` (NO trailing slash, NO /api)
   - All Auth0 variables are set

3. **IMPORTANT**: After setting/changing variables, you MUST redeploy!

### Step 4: Check Browser Console

Open your Vercel site and check browser console (F12):

**Look for:**
- `⚠️ WARNING: API URL is set to localhost in production!` - Environment variable not set
- Network errors showing `localhost:5000` - Environment variable not set or not redeployed
- CORS errors - Backend CORS configuration issue
- 401/403 errors - Auth0 configuration issue
- 500 errors - Backend server error (check Railway logs)

## Common Issues & Solutions

### Issue 1: "Cannot connect to server"

**Symptoms:**
- Products show "Cannot connect to server"
- Network tab shows failed requests
- Console shows network errors

**Solutions:**

1. **Check Railway Backend:**
   ```bash
   curl https://master-mart-production.up.railway.app/health
   ```
   - If this fails, backend is down
   - Check Railway dashboard for service status
   - Check Railway logs for errors

2. **Check Environment Variable:**
   - Go to Vercel → Settings → Environment Variables
   - Verify `VITE_API_URL` is set to: `https://master-mart-production.up.railway.app`
   - **Redeploy** after setting/changing

3. **Check CORS:**
   - Backend should allow all origins (`origin: '*'`)
   - Check Railway logs for CORS errors

### Issue 2: "MongoDB Connection Error"

**Symptoms:**
- Backend health check shows `"mongodb": "disconnected"`
- Products API returns 500 error
- Railway logs show MongoDB connection errors

**Solutions:**

1. **Check MONGODB_URI in Railway:**
   - Go to Railway Dashboard → Your Service → Variables
   - Verify `MONGODB_URI` is set correctly
   - For MongoDB Atlas: Should be full connection string
   - For local MongoDB: `mongodb://localhost:27017/ecommerce` (won't work on Railway)

2. **MongoDB Atlas Setup:**
   - Use MongoDB Atlas (free tier available)
   - Get connection string from Atlas dashboard
   - Add to Railway environment variables
   - Whitelist Railway IPs (or use `0.0.0.0/0` for all IPs)

3. **Test MongoDB Connection:**
   - Check Railway logs for MongoDB connection messages
   - Should see: `✅ MongoDB Connected successfully`

### Issue 3: "Failed to load products" with Status Code

**Symptoms:**
- Error message shows status code (401, 403, 500, etc.)
- Products don't load

**Solutions by Status Code:**

- **401 Unauthorized:**
  - Auth0 token issue
  - Check Auth0 configuration
  - Verify user is logged in (if required)

- **403 Forbidden:**
  - Permission issue
  - Check Auth0 permissions/roles
  - Verify API permissions are set

- **500 Internal Server Error:**
  - Backend server error
  - Check Railway logs
  - Check MongoDB connection
  - Verify all environment variables are set

- **404 Not Found:**
  - Route not found
  - Check if backend routes are correct
  - Verify API URL is correct

### Issue 4: Products Load But Images Don't Show

**Symptoms:**
- Products appear but images are broken
- Console shows 404 for image URLs

**Solutions:**

1. **Check Image URLs:**
   - Images should be: `https://master-mart-production.up.railway.app/uploads/filename.jpg`
   - If showing `localhost:5000`, `VITE_API_URL` not set correctly

2. **Check Railway Static Files:**
   - Verify `/uploads` folder exists on Railway
   - Note: Railway has ephemeral storage - images may be lost on redeploy
   - Consider using Cloudinary for production

3. **Check CORS for Images:**
   - Backend should serve images with CORS headers
   - Check Network tab for CORS errors on image requests

## Debugging Checklist

- [ ] Backend health check works: `/health` endpoint
- [ ] Products API works: `/api/products` endpoint
- [ ] MongoDB is connected (check health endpoint)
- [ ] `VITE_API_URL` is set in Vercel
- [ ] Frontend was redeployed after setting environment variables
- [ ] No CORS errors in browser console
- [ ] No network errors in browser console
- [ ] Railway logs show no errors
- [ ] Auth0 variables are set correctly
- [ ] Backend is accessible from browser (test API URL directly)

## Testing Commands

```bash
# Test backend health
curl https://master-mart-production.up.railway.app/health

# Test products API
curl https://master-mart-production.up.railway.app/api/products

# Test with featured filter
curl https://master-mart-production.up.railway.app/api/products?featured=true

# Test CORS (should return CORS headers)
curl -I -X OPTIONS https://master-mart-production.up.railway.app/api/products \
  -H "Origin: https://mastermart-delta.vercel.app" \
  -H "Access-Control-Request-Method: GET"
```

## Railway Logs

To check Railway logs:
1. Go to Railway Dashboard
2. Select your service
3. Click "Logs" tab
4. Look for:
   - `✅ MongoDB Connected successfully`
   - `🚀 Server running on port XXXX`
   - Any error messages

## Vercel Logs

To check Vercel logs:
1. Go to Vercel Dashboard
2. Select your project
3. Go to "Deployments"
4. Click on latest deployment
5. Check "Build Logs" and "Function Logs"

## Still Not Working?

1. **Check all environment variables** in both Railway and Vercel
2. **Redeploy both** frontend and backend
3. **Clear browser cache** (Ctrl+Shift+R or Cmd+Shift+R)
4. **Test API endpoints directly** in browser/Postman
5. **Check Railway and Vercel status pages** for outages
6. **Review error messages** in browser console and Railway logs

