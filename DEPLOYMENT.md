# Deployment Guide for Vercel & Railway

This guide will help you deploy your e-commerce application with images working correctly.

## Architecture

- **Frontend**: Deploy on Vercel
- **Backend**: Deploy on Railway
- **Database**: MongoDB (MongoDB Atlas recommended for production)
- **Images**: Stored on Railway backend (note: ephemeral storage - consider Cloudinary for production)

## Backend Deployment (Railway)

### Step 1: Deploy Backend to Railway

1. **Create Railway Account**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - Select the `backend` folder as the root directory

3. **Set Environment Variables**
   In Railway dashboard, go to your service → Variables tab, add:
   ```env
   MONGODB_URI=your_mongodb_atlas_connection_string
   PORT=5000
   AUTH0_DOMAIN=your-domain.auth0.com
   AUTH0_CLIENT_ID=your_client_id
   AUTH0_AUDIENCE=your_api_identifier
   NODE_ENV=production
   ```

4. **Configure Build Settings**
   - Railway should auto-detect Node.js
   - Build command: `npm install`
   - Start command: `npm start`

5. **Get Your Railway URL**
   - After deployment, Railway will provide a URL like: `https://your-app.railway.app`
   - **Save this URL** - you'll need it for frontend configuration

### Step 2: Update Auth0 Settings

1. **Update Auth0 Application Settings**
   - Go to Auth0 Dashboard → Applications → Your App
   - Add your Railway backend URL to:
     - **Allowed Callback URLs**: `https://your-vercel-app.vercel.app/callback`
     - **Allowed Logout URLs**: `https://your-vercel-app.vercel.app`
     - **Allowed Web Origins**: `https://your-vercel-app.vercel.app`

## Frontend Deployment (Vercel)

### Step 1: Deploy Frontend to Vercel

1. **Create Vercel Account**
   - Go to [vercel.com](https://vercel.com)
   - Sign up with GitHub

2. **Import Project**
   - Click "Add New Project"
   - Import your GitHub repository
   - Set **Root Directory** to `frontend`

3. **Configure Build Settings**
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

4. **Set Environment Variables**
   In Vercel dashboard → Settings → Environment Variables, add:
   ```env
   VITE_API_URL=https://your-app.railway.app
   VITE_AUTH0_DOMAIN=your-domain.auth0.com
   VITE_AUTH0_CLIENT_ID=your_client_id
   VITE_AUTH0_AUDIENCE=your_api_identifier
   VITE_AUTH0_REDIRECT_URI=https://your-vercel-app.vercel.app/callback
   ```

   **Important**: 
   - `VITE_API_URL` should be your Railway backend URL **without** `/api` at the end
   - The `/api` is automatically appended in the frontend code

5. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete
   - Vercel will provide a URL like: `https://your-app.vercel.app`

### Step 2: Update Vercel Configuration

The `vercel.json` file is already configured in the frontend folder. It includes:
- SPA routing (all routes redirect to index.html)
- Security headers
- Cache control for assets

## Image Storage Considerations

### Current Setup (Railway Ephemeral Storage)

⚠️ **Important**: Railway's filesystem is ephemeral. Images stored in the `uploads` folder will be **lost** when:
- The service restarts
- The service is redeployed
- Railway performs maintenance

### Recommended: Use Cloudinary (Production)

For production, consider using Cloudinary for image storage:

1. **Sign up for Cloudinary** (free tier available)
2. **Add to Backend `.env`**:
   ```env
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```
3. **Update Backend Code**: Modify `backend/routes/products.js` to upload to Cloudinary instead of local storage

### Alternative: Railway Volumes (Persistent Storage)

Railway offers persistent volumes for file storage:
1. Go to Railway dashboard → Your service → Volumes
2. Create a new volume
3. Mount it to `/uploads` path
4. Update your deployment to use the volume

## Troubleshooting Images Not Showing

### Issue 1: Images return 404

**Solution**: 
- Check that `VITE_API_URL` in Vercel matches your Railway backend URL
- Ensure Railway backend is running and accessible
- Check browser console for CORS errors

### Issue 2: CORS Errors

**Solution**:
- Backend CORS is configured to allow all origins (`*`)
- If issues persist, check Railway logs for errors

### Issue 3: Images load in development but not production

**Solution**:
- Verify environment variables are set correctly in Vercel
- Check that `VITE_API_URL` doesn't have trailing slash
- Ensure Railway backend URL is accessible (not localhost)

### Issue 4: Images disappear after redeploy

**Solution**:
- This is expected with ephemeral storage
- Use Cloudinary or Railway Volumes for persistent storage

## Testing Deployment

1. **Test Frontend**: Visit your Vercel URL
2. **Test API**: Visit `https://your-railway-url.railway.app/api/products`
3. **Test Images**: 
   - Create a product with an image
   - Check if image URL is: `https://your-railway-url.railway.app/uploads/filename.jpg`
   - Verify image loads in browser

## Environment Variables Checklist

### Railway (Backend)
- [ ] `MONGODB_URI`
- [ ] `PORT` (optional, Railway sets this)
- [ ] `AUTH0_DOMAIN`
- [ ] `AUTH0_CLIENT_ID`
- [ ] `AUTH0_AUDIENCE`
- [ ] `NODE_ENV=production`

### Vercel (Frontend)
- [ ] `VITE_API_URL` (Railway backend URL)
- [ ] `VITE_AUTH0_DOMAIN`
- [ ] `VITE_AUTH0_CLIENT_ID`
- [ ] `VITE_AUTH0_AUDIENCE`
- [ ] `VITE_AUTH0_REDIRECT_URI` (Vercel app URL + `/callback`)

## Post-Deployment

1. **Update Auth0 Callback URLs** with your production URLs
2. **Test all features**:
   - User registration/login
   - Product browsing
   - Image uploads
   - Cart functionality
   - Checkout process
   - Admin features

3. **Monitor Logs**:
   - Railway logs: Dashboard → Service → Logs
   - Vercel logs: Dashboard → Project → Functions → Logs

## Support

If images still don't show:
1. Check browser console for errors
2. Check Network tab for failed image requests
3. Verify Railway backend is serving images at `/uploads/` path
4. Test image URL directly in browser
5. Check CORS headers in response

