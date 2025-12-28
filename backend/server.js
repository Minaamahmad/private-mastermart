const getImageUrl = (imagePath) => {
  if (!imagePath) return 'https://via.placeholder.com/150'; // Fallback
  
  // If it's already a full URL (like from Cloudinary or external), use it
  if (imagePath.startsWith('http')) return imagePath;

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  
  // Ensure we don't double up on "/uploads"
  // If the DB path is "uploads/img.jpg", we just need BASE_URL/img.jpg
  // If the DB path is "img.jpg", we need BASE_URL/uploads/img.jpg
  const cleanPath = imagePath.startsWith('uploads/') 
    ? imagePath 
    : `uploads/${imagePath}`;

  return `${API_BASE_URL}/${cleanPath}`;
};

// Use it in your JSX like this:
<img src={getImageUrl(product.image)} alt={product.name} />