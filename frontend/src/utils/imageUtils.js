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
  
  // Determine base URL for images
  // In development, use the current origin (Vite proxy will handle /uploads)
  // In production, use the backend URL directly
  let baseUrl;
  if (typeof window !== 'undefined') {
    // Check if we're in development (localhost)
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      // Development: Use current origin (Vite dev server) - proxy will handle it
      baseUrl = window.location.origin;
    } else {
      // Production: Use Railway backend or VITE_API_URL
      if (import.meta.env.VITE_API_URL) {
        // Extract base URL from API URL (remove /api if present)
        baseUrl = import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '').replace(/\/+$/, '');
      } else {
        // Fallback to Railway backend
        baseUrl = 'https://master-mart-production.up.railway.app';
      }
    }
  } else {
    // SSR or build time - use environment variable or default
    if (import.meta.env.VITE_API_URL) {
      baseUrl = import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '').replace(/\/+$/, '');
    } else {
      baseUrl = 'http://localhost:5000';
    }
  }
  
  // Ensure the path starts with /uploads/ if it doesn't already
  let cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  
  // If the path doesn't start with /uploads/, add it
  if (!cleanPath.startsWith('/uploads/')) {
    // Remove leading slash if present, then add /uploads/
    cleanPath = cleanPath.replace(/^\/+/, '');
    cleanPath = `/uploads/${cleanPath}`;
  }
  
  const fullUrl = `${baseUrl}${cleanPath}`;
  // Debug logging (only in development)
  if (import.meta.env.DEV && typeof window !== 'undefined') {
    console.log('🖼️ Image URL:', fullUrl, 'from path:', imagePath);
  }
  return fullUrl;
};

