/**
 * Get the full image URL from a product image path
 * Supports both Cloudinary URLs (full URLs) and local paths
 * For Railway backend, images are served at /uploads/ path
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath) {
    return null;
  }
  
  // If it's already a full URL (Cloudinary or other), return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // If it's a local path, prepend the API URL
  // VITE_API_URL should be set to your Railway backend URL (e.g., https://your-app.railway.app)
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  
  // Remove trailing slash from API_URL if present
  const baseUrl = API_URL.replace(/\/+$/, '');
  
  // Ensure the path starts with /uploads/ if it doesn't already
  let cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  
  // If the path doesn't start with /uploads/, add it
  if (!cleanPath.startsWith('/uploads/')) {
    // Remove leading slash if present, then add /uploads/
    cleanPath = cleanPath.replace(/^\/+/, '');
    cleanPath = `/uploads/${cleanPath}`;
  }
  
  return `${baseUrl}${cleanPath}`;
};

