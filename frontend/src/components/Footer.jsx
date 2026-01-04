import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-grid">
          <div className="footer-section">
            <h3>Master Mart</h3>
            <p>Your one-stop shop for quality products at great prices.</p>
          </div>

          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><a href="/">Home</a></li>
              <li><a href="/products">Products</a></li>
              <li><a href="/about">About Us</a></li>
              <li><a href="/contact">Contact</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Customer Service</h4>
            <ul>
              <li><a href="/shipping">Shipping Info</a></li>
              <li><a href="/returns">Returns</a></li>
              <li><a href="/faq">FAQ</a></li>
              <li><a href="/support">Support</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4>Follow Us</h4>
            <div className="social-icons">
              <a href="#" aria-label="Facebook">📘</a>
              <a href="#" aria-label="Twitter">🐦</a>
              <a href="#" aria-label="Instagram">📷</a>
              <a href="#" aria-label="Email">✉️</a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2026 Master mart. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

