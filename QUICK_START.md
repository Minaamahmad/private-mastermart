# Quick Start Guide

## Understanding ERR_CONNECTION_REFUSED

This error means:
- ✅ Your frontend is running and trying to connect to the backend
- ❌ Your backend server is **NOT running** on port 5000

## Solution: Start the Backend Server

### Step 1: Open a New Terminal

You need **TWO terminals** running:
- **Terminal 1**: Backend server (port 5000)
- **Terminal 2**: Frontend server (port 3000)

### Step 2: Start the Backend

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Check if dependencies are installed:**
   ```bash
   ls node_modules
   ```
   If the folder doesn't exist or is empty, run:
   ```bash
   npm install
   ```

3. **Check if MongoDB is running:**
   ```bash
   # On Linux/Mac
   sudo systemctl status mongod
   # OR
   mongod --version
   
   # On Windows
   # Check MongoDB service in Services
   ```

4. **Check if .env file exists:**
   ```bash
   ls .env
   ```
   If it doesn't exist, create it with:
   ```bash
   # Minimum required for development
   MONGODB_URI=mongodb://localhost:27017/ecommerce
   PORT=5000
   ```

5. **Start the backend server:**
   ```bash
   npm run dev
   ```

   You should see:
   ```
   MongoDB Connected
   Server running on port 5000
   ```

### Step 3: Verify Backend is Running

Open your browser and visit:
```
http://localhost:5000/api/products
```

You should see either:
- An empty array `[]` (if no products)
- A JSON array of products
- An error about MongoDB (if MongoDB isn't running)

### Step 4: Start the Frontend (in a separate terminal)

1. **Open a NEW terminal window**
2. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

3. **Start the frontend:**
   ```bash
   npm run dev
   ```

4. **Visit:** `http://localhost:3000`

## Common Issues & Solutions

### Issue 1: "MongoDB Connection Error"

**Solution:**
- Make sure MongoDB is installed and running
- Check your `MONGODB_URI` in `backend/.env`
- For local MongoDB: `mongodb://localhost:27017/ecommerce`
- For MongoDB Atlas: Use your connection string

**Start MongoDB:**
```bash
# Linux/Mac
sudo systemctl start mongod
# OR
mongod

# Windows
# Start MongoDB service from Services
```

### Issue 2: "Port 5000 already in use"

**Solution:**
- Another process is using port 5000
- Find and kill the process:
  ```bash
  # Linux/Mac
  lsof -ti:5000 | xargs kill -9
  # OR
  sudo kill -9 $(lsof -t -i:5000)
  
  # Windows
  netstat -ano | findstr :5000
  taskkill /PID <PID> /F
  ```

### Issue 3: "Cannot find module"

**Solution:**
- Dependencies not installed
- Run: `npm install` in the backend directory

### Issue 4: "Missing .env file"

**Solution:**
- Create `backend/.env` file with minimum:
  ```env
  MONGODB_URI=mongodb://localhost:27017/ecommerce
  PORT=5000
  ```

## Development Workflow

1. **Terminal 1 - Backend:**
   ```bash
   cd backend
   npm run dev
   ```
   Keep this running!

2. **Terminal 2 - Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```
   Keep this running!

3. **Open browser:** `http://localhost:3000`

## Quick Check Commands

```bash
# Check if backend is running
curl http://localhost:5000/api/products

# Check if MongoDB is running
mongosh --eval "db.version()"

# Check what's using port 5000
lsof -i :5000  # Linux/Mac
netstat -ano | findstr :5000  # Windows
```

## Still Having Issues?

1. **Check backend terminal for errors**
2. **Check frontend terminal for errors**
3. **Verify environment variables are set**
4. **Make sure MongoDB is running**
5. **Check that ports 5000 and 3000 are not blocked**

