# Fix: Vercel Environment Variables Setup

## The Problem

Your frontend is trying to connect to `localhost:5000` instead of your Railway backend because the `VITE_API_URL` environment variable is not set in Vercel.

## Solution: Set Environment Variables in Vercel

### Step 1: Go to Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Sign in and select your project: **mastermart-delta**
3. Go to **Settings** → **Environment Variables**

### Step 2: Add Environment Variables

Add these environment variables:

#### Required Variables:

1. **VITE_API_URL**
   - **Value**: `https://master-mart-production.up.railway.app`
   - **Important**: NO trailing slash, NO `/api` at the end
   - **Environments**: Production, Preview, Development (check all)

2. **VITE_AUTH0_DOMAIN**
   - **Value**: Your Auth0 domain (e.g., `your-domain.auth0.com`)
   - **Environments**: Production, Preview, Development (check all)

3. **VITE_AUTH0_CLIENT_ID**
   - **Value**: Your Auth0 Client ID
   - **Environments**: Production, Preview, Development (check all)

4. **VITE_AUTH0_AUDIENCE**
   - **Value**: Your Auth0 API Identifier (e.g., `https://mastermart`)
   - **Important**: This should be your API identifier, NOT your Client ID
   - **Environments**: Production, Preview, Development (check all)

5. **VITE_AUTH0_REDIRECT_URI**
   - **Value**: `https://mastermart-delta.vercel.app/callback`
   - **Environments**: Production, Preview, Development (check all)

### Step 3: Redeploy

**CRITICAL**: After adding environment variables, you MUST redeploy:

1. Go to **Deployments** tab
2. Click the **three dots (⋯)** on the latest deployment
3. Click **Redeploy**
4. Or push a new commit to trigger a new deployment

**Why?** Vite environment variables are embedded at BUILD TIME. The current deployment was built without these variables, so it's using the default `localhost:5000`.

## Quick Setup Checklist

- [ ] `VITE_API_URL` = `https://master-mart-production.up.railway.app` (no trailing slash)
- [ ] `VITE_AUTH0_DOMAIN` = Your Auth0 domain
- [ ] `VITE_AUTH0_CLIENT_ID` = Your Auth0 Client ID
- [ ] `VITE_AUTH0_AUDIENCE` = Your Auth0 API Identifier
- [ ] `VITE_AUTH0_REDIRECT_URI` = `https://mastermart-delta.vercel.app/callback`
- [ ] All variables checked for Production, Preview, and Development
- [ ] Redeployed the application

## Verify It's Working

After redeploying, check:

1. Open browser console on your Vercel site
2. Look for API calls - they should go to:
   - `https://master-mart-production.up.railway.app/api/products`
   - NOT `localhost:5000`

3. Test the API directly:
   ```bash
   curl https://master-mart-production.up.railway.app/api/products
   ```

## Common Mistakes

❌ **Wrong**: `VITE_API_URL=https://master-mart-production.up.railway.app/api`
✅ **Correct**: `VITE_API_URL=https://master-mart-production.up.railway.app`

❌ **Wrong**: `VITE_API_URL=https://master-mart-production.up.railway.app/`
✅ **Correct**: `VITE_API_URL=https://master-mart-production.up.railway.app`

❌ **Wrong**: Setting variables but not redeploying
✅ **Correct**: Set variables AND redeploy

## Still Not Working?

1. **Check Railway backend is accessible:**
   ```bash
   curl https://master-mart-production.up.railway.app/api/products
   ```

2. **Check Vercel build logs:**
   - Go to Deployments → Latest deployment → Build Logs
   - Look for any errors

3. **Verify environment variables are in the build:**
   - The build logs should show the variables being used
   - If you see `localhost:5000` in the build, the variable wasn't set

4. **Clear browser cache:**
   - Hard refresh: `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)

