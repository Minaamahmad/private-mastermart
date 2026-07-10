'use client';

import { useEffect, useState } from 'react';
import { getProducts, createProduct, updateProduct, deleteProduct } from '@/lib/api';
import { getImageUrl } from '@/lib/imageUtils';
import '@/styles/AdminProducts.css';

const emptyForm = {
  name: '',
  description: '',
  price: '',
  originalPrice: '',
  discount: '',
  category: 'General',
  stock: '',
  featured: false,
  image: '',
};

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState(emptyForm);

  const fetchProducts = async () => {
    try {
      setError(null);
      const data = await getProducts();
      setProducts(data);
    } catch (err) {
      setError(err.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    if (!formData.name.trim() || !formData.description.trim() || !formData.price || parseFloat(formData.price) <= 0) {
      setError('Name, description, and valid price are required');
      setSubmitting(false);
      return;
    }

    const payload = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      price: parseFloat(formData.price),
      originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
      discount: formData.discount ? parseFloat(formData.discount) : 0,
      category: formData.category,
      stock: parseInt(formData.stock, 10) || 0,
      featured: formData.featured,
      image: formData.image.trim(),
    };

    try {
      if (editingProduct) {
        await updateProduct(editingProduct._id, payload);
      } else {
        await createProduct(payload);
      }
      resetForm();
      await fetchProducts();
    } catch (err) {
      setError(err.message || 'Failed to save product');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      originalPrice: product.originalPrice || '',
      discount: product.discount || '',
      category: product.category,
      stock: product.stock,
      featured: product.featured,
      image: product.image || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await deleteProduct(id);
      await fetchProducts();
    } catch (err) {
      setError(err.message || 'Failed to delete product');
    }
  };

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingProduct(null);
    setShowForm(false);
  };

  if (loading) return <div className="loading">Loading products...</div>;

  return (
    <div className="container">
      <div>
        <h1>Manage Products</h1>
        <button type="button" className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'Add New Product'}
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      {showForm && (
        <div className="card">
          <h2>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Product Name *</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Description *</label>
              <textarea name="description" value={formData.description} onChange={handleChange} required rows="4" />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Price *</label>
                <input type="number" name="price" value={formData.price} onChange={handleChange} step="0.01" min="0" required />
              </div>
              <div className="form-group">
                <label>Stock *</label>
                <input type="number" name="stock" value={formData.stock} onChange={handleChange} min="0" required />
              </div>
            </div>
            <div className="form-group">
              <label>Category</label>
              <select name="category" value={formData.category} onChange={handleChange}>
                <option value="General">General</option>
                <option value="Electronics">Electronics</option>
                <option value="Clothing">Clothing</option>
                <option value="Food">Food</option>
              </select>
            </div>
            <div className="form-group">
              <label>
                <input type="checkbox" name="featured" checked={formData.featured} onChange={handleChange} />
                Featured Product
              </label>
            </div>
            <div className="form-group">
              <label>Image URL</label>
              <input type="url" name="image" value={formData.image} onChange={handleChange} placeholder="https://..." />
            </div>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : editingProduct ? 'Update Product' : 'Create Product'}
            </button>
          </form>
        </div>
      )}

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Category</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product._id}>
                <td>
                  {product.image && getImageUrl(product.image) ? (
                    <img src={getImageUrl(product.image)} alt={product.name} />
                  ) : (
                    <div>N/A</div>
                  )}
                </td>
                <td>{product.name}</td>
                <td>Rs {product.price.toFixed(0)}</td>
                <td>{product.stock}</td>
                <td>{product.category}</td>
                <td>
                  <button type="button" className="btn-secondary" onClick={() => handleEdit(product)}>Edit</button>
                  <button type="button" className="btn-danger" onClick={() => handleDelete(product._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
