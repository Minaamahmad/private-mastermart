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
  // Determine base URL - use Railway backend in production if env var not set
  let baseUrl;
  if (import.meta.env.VITE_API_URL) {
    baseUrl = import.meta.env.VITE_API_URL.replace(/\/+$/, '');
  } else if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    // Production - use Railway backend
    baseUrl = 'https://master-mart-production.up.railway.app';
  } else {
    // Development - use localhost
    baseUrl = 'http://localhost:5000';
  }
  
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

