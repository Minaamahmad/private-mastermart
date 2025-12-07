# Frontend UI/UX Design Prompt for E-commerce Application

## Project Overview

Create a modern, responsive e-commerce frontend application with a Temu-inspired design aesthetic. This is a full-stack e-commerce platform with customer-facing features and an admin dashboard. The application supports Cash on Delivery (COD) payments, Auth0 authentication for customers, and JWT authentication for admin users.

## Technology Stack

- **Framework**: React 18 with Vite
- **Routing**: React Router DOM v6
- **Authentication**: Auth0 React SDK (customers), JWT (admin)
- **HTTP Client**: Axios
- **Styling**: CSS (Temu-inspired modern design)
- **Image Handling**: Cloudinary integration with local fallback

## Design Requirements

### Design Style
- **Aesthetic**: Modern, clean, Temu-inspired e-commerce design
- **Color Scheme**: 
  - Primary: Gradient from #ff4757 to #ff6348 (coral/red)
  - Background: #f5f5f5 (light gray)
  - Text: #333 (dark gray)
  - Accent: White with subtle shadows
- **Typography**: System fonts (-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto')
- **Border Radius**: 8px-16px for cards, 12px-24px for buttons
- **Shadows**: Subtle box-shadows (0 2px 8px rgba(0,0,0,0.08))
- **Animations**: Smooth transitions (0.3s ease), hover effects with transform/scale

### Responsive Design
- Mobile-first approach
- Breakpoints: 640px (tablet), 1024px (desktop)
- Grid system: Auto-fill with minmax(200px-240px, 1fr)
- Touch-friendly buttons (min 44px height)

## Page Structure & Features

### 1. Navigation Bar (Navbar Component)
**Location**: Top of all pages
**Features**:
- Logo/Brand name ("E-Store") on the left
- Search bar in center (with search icon)
- Navigation menu items: Home, Products, Cart
- User authentication section:
  - If not authenticated: "Login" button (triggers Auth0 login)
  - If authenticated: Display user name/email, "Logout" button
- Admin section (only visible when admin is logged in):
  - Dashboard link
  - Products management link
  - Orders management link
  - Admin Logout button
- Responsive: Hamburger menu on mobile

**Styling**:
- Fixed or sticky positioning
- White background with shadow
- Search bar: Rounded (24px border-radius), border on focus
- Buttons: Gradient primary buttons, hover effects

### 2. Home Page
**Route**: `/`
**Features**:
- Hero section:
  - Large heading: "Welcome to Our Store"
  - Subheading: "Shop the best products with Cash on Delivery"
  - "Shop Now" CTA button
  - Gradient background (coral/red)
  - Centered text, white color
- Featured Products section:
  - Section header: "🔥 Featured Products" with "View All →" link
  - Grid of up to 6 featured products
  - Product cards with image, name, price, discount badge, stock status
- All Products section:
  - Section header: "🛍️ All Products"
  - Grid display of all products
  - Same card design as featured products

**Product Card Design**:
- White background, rounded corners (12px)
- Image: Square aspect ratio (100% padding-top), object-fit cover
- Discount badge: Top-left corner, gradient background, white text
- Product name: 2-line clamp, 14px font
- Price: Large (20px), bold, coral color (#ff4757)
- Original price: Strikethrough, gray, smaller (14px)
- Stock badge: Green (in stock) or red (out of stock)
- Hover effect: Lift up (translateY(-4px)), enhanced shadow

### 3. Products Page
**Route**: `/products`
**Features**:
- Page header: "All Products"
- Category filter badges:
  - Categories: "All Categories", "Electronics", "Clothing", "Food", "General"
  - Pill-shaped badges, active state highlighted
  - Horizontal scrollable on mobile
- Search functionality:
  - Search input with placeholder "Search products..."
  - Real-time filtering by product name/description
  - Clear button when search is active
  - Search results count display
- Product grid:
  - Same card design as home page
  - Responsive grid (auto-fill, minmax 200-240px)
  - Empty state: "No products found" message with clear search button

**Search Features**:
- URL query parameter support (?search=term)
- Search persists on page reload
- Case-insensitive search
- Searches both name and description

### 4. Product Detail Page
**Route**: `/products/:id`
**Features**:
- Two-column layout (image left, details right)
- Product image:
  - Large display (full width of left column)
  - Discount badge overlay if applicable
  - Placeholder if no image
- Product information:
  - Product name: Large heading (32px)
  - Price display: Large (36px), bold, coral color
  - Original price: Strikethrough, smaller (20px)
  - Stock status: Badge showing "X in stock" or "Out of Stock"
  - Category badge
  - Full description
- Quantity selector:
  - Minus button, number input, plus button
  - Min: 1, Max: product stock
  - Styled buttons with hover effects
- "Add to Cart" button:
  - Full width, large, gradient background
  - Disabled if out of stock
  - Navigates to cart after adding

**Layout**:
- Grid: 1fr 1fr on desktop
- Stacked on mobile
- White card with padding, rounded corners, shadow

### 5. Shopping Cart Page
**Route**: `/cart`
**Features**:
- Page header: "Shopping Cart" with item count
- Cart items list:
  - Each item displays:
    - Product image (120x120px, rounded)
    - Product name
    - Price per item
    - Quantity controls (minus, number, plus)
    - Remove button
    - Subtotal (price × quantity)
  - Items in card layout with spacing
- Empty cart state:
  - Centered message: "Your cart is empty"
  - "Browse Products" button
- Total section:
  - Gradient background card (coral)
  - "Total Amount" heading
  - Large total price display
  - "Proceed to Checkout →" button (white text on gradient)

**Interactions**:
- Update quantity: Real-time calculation
- Remove item: Confirmation or instant removal
- All changes persist to localStorage

### 6. Checkout Page
**Route**: `/checkout`
**Features**:
- Two-column layout (order summary left, form right)
- Order summary:
  - List of cart items with quantities
  - Item subtotals
  - Total amount (large, bold)
  - Payment method: "Cash on Delivery"
- Delivery information form:
  - Full Name* (required, text input)
  - Email (auto-filled if authenticated, disabled)
  - Phone Number* (required, tel input)
  - Delivery Address* (required, textarea, 4 rows)
  - "Place Order" button
- Auto-fill for authenticated users:
  - Pre-fills name, email, address from Auth0 profile
  - User can still edit if needed
- Error handling:
  - Validation messages
  - API error display
- Loading state: "Placing Order..." on submit

**Form Styling**:
- Clean form inputs with focus states
- Required field indicators (*)
- Disabled fields: Light gray background
- Submit button: Full width, gradient, disabled state

### 7. Order Confirmation Page
**Route**: `/order-confirmation/:orderId`
**Features**:
- Success message:
  - Large heading: "Order Confirmed!"
  - Thank you message
  - Centered, prominent display
- Order details card:
  - Order ID (last 8 characters)
  - Status badge
  - Customer information (name, phone, address)
  - Payment method
  - Items list with quantities and prices
  - Total amount (large, bold)
- "Continue Shopping" button:
  - Links back to products page
  - Centered below order details

**Styling**:
- Success message: Green/positive color scheme
- Order card: White background, rounded, shadow
- Clear hierarchy of information

### 8. Admin Login Page
**Route**: `/admin/login`, `/manage`, `/cp`
**Features**:
- Login form:
  - Username/Email input
  - Password input
  - "Login" button
  - Error message display
  - Link to admin registration (if applicable)
- Centered card layout
- Admin branding/styling

### 9. Admin Dashboard
**Route**: `/admin/dashboard` (Protected)
**Features**:
- Page header: "Admin Dashboard"
- Quick access cards:
  - "Manage Products" card (links to /admin/products)
  - "Manage Orders" card (links to /admin/orders)
- Grid layout (2 columns on desktop, 1 on mobile)
- Card design: White, rounded, shadow, hover effect

### 10. Admin Products Management
**Route**: `/admin/products` (Protected)
**Features**:
- Page header: "Manage Products" with "Add New Product" button
- Product form (toggleable):
  - Product Name* (text)
  - Description* (textarea, 4 rows)
  - Price (Selling Price)* (number, step 0.01)
  - Stock* (number, min 0)
  - Original Price (optional, number)
  - Discount % (optional, 0-100)
  - Category (dropdown: General, Electronics, Clothing, Food)
  - Featured Product (checkbox)
  - Product Image (file input, accept images)
  - Preview section showing calculated discount/original price
  - "Create Product" / "Update Product" button
  - Cancel button
- Products table:
  - Columns: Image, Name, Price, Original Price, Discount, Stock, Category, Featured, Actions
  - Image thumbnails (50x50px)
  - Edit button (opens form with pre-filled data)
  - Delete button (with confirmation)
- Empty state: "No Products Found" with "Add First Product" button
- Loading state: "Loading products..."
- Error handling: Error messages with dismiss button

**Form Features**:
- Auto-calculation: Discount ↔ Original Price
- Image preview for existing products
- Validation: Required fields, number validation
- File upload: Image preview before submit

### 11. Admin Orders Management
**Route**: `/admin/orders` (Protected)
**Features**:
- Page header: "Manage Orders" with "Refresh" button
- Orders list (card layout):
  - Each order card displays:
    - Order ID (last 8 characters)
    - Date and time
    - Status badge (color-coded):
      - Pending: Yellow
      - Confirmed: Blue
      - Out for Delivery: Light blue
      - Delivered: Green
      - Cancelled: Red
    - Total amount (large, bold)
    - Customer information (name, phone, address)
    - Payment method
    - Items list (product name, quantity, price)
    - Status dropdown (update order status)
- Empty state: "No orders yet."
- Loading state: "Loading..."
- Error handling: Error messages with dismiss button

**Status Badge Colors**:
- Pending: #fff3cd background, #856404 text
- Confirmed: #cfe2ff background, #084298 text
- Out for Delivery: #b6d4fe background, #052c65 text
- Delivered: #d1e7dd background, #0f5132 text
- Cancelled: #f8d7da background, #842029 text

### 12. Footer Component
**Location**: Bottom of all pages
**Features**:
- Copyright notice: "© 2024 E-Store. All rights reserved."
- Additional info: "Cash on Delivery Available"
- Centered text
- Light background, subtle border-top

### 13. Callback Page (Auth0)
**Route**: `/callback`
**Features**:
- Handles Auth0 callback
- Loading state while processing
- Redirects to home page after authentication
- Minimal UI (can be a simple loading spinner)

## Component Specifications

### Reusable Components

1. **Navbar**
   - Responsive navigation
   - Search functionality
   - Auth state management
   - Admin detection

2. **Footer**
   - Simple, consistent footer
   - Copyright and info

3. **PrivateRoute**
   - Route protection for admin pages
   - Redirects to login if not authenticated

4. **ProductCard** (implicit, used in grids)
   - Image with discount badge
   - Product name (2-line clamp)
   - Price display
   - Stock status
   - Link to product detail

5. **Loading State**
   - Centered text: "Loading..."
   - Consistent styling across pages

6. **Error State**
   - Error message display
   - Retry button (where applicable)
   - Dismiss button (admin pages)

7. **Empty State**
   - Centered message
   - Descriptive text
   - CTA button (where applicable)

## User Flows

### Customer Flow
1. **Browse**: Home → Products → Product Detail
2. **Shop**: Add to Cart → Cart → Checkout → Order Confirmation
3. **Search**: Use search bar → Filtered results
4. **Authenticate**: Login button → Auth0 → Return to site

### Admin Flow
1. **Login**: Admin Login → Dashboard
2. **Manage Products**: Dashboard → Products → Add/Edit/Delete
3. **Manage Orders**: Dashboard → Orders → Update Status

## Styling Guidelines

### Buttons
- **Primary**: Gradient background (#ff4757 to #ff6348), white text, rounded (8px), padding (12px 24px)
- **Secondary**: White background, coral border, coral text, hover: invert colors
- **Danger**: Red background or red text with border
- **Hover**: Transform translateY(-2px), enhanced shadow

### Cards
- White background
- Border radius: 12px
- Box shadow: 0 2px 8px rgba(0,0,0,0.08)
- Hover: translateY(-4px), shadow: 0 8px 24px rgba(0,0,0,0.12)
- Padding: 12-20px

### Forms
- Inputs: 2px border (#e0e0e0), rounded (8px), padding (12px)
- Focus: Border color #ff4757, box-shadow: 0 0 0 3px rgba(255,71,87,0.1)
- Labels: Bold (600), 14px, margin-bottom (8px)
- Textarea: Min-height 100px, resize vertical

### Typography
- Headings: Bold (700-800), appropriate sizes (h1: 32-48px, h2: 24-28px, h3: 18-20px)
- Body: 16px, line-height 1.5-1.8
- Small text: 12-14px, gray (#666)

### Spacing
- Container: Max-width 1400px, padding 20px 16px
- Section margins: 20-40px
- Card gaps: 16-24px
- Form groups: 20px margin-bottom

### Colors
- Primary gradient: linear-gradient(135deg, #ff4757 0%, #ff6348 100%)
- Background: #f5f5f5
- Text primary: #333
- Text secondary: #666
- Text muted: #999
- Border: #e0e0e0
- Success: Green shades (#2e7d32, #e8f5e9)
- Error: Red shades (#ff4757, #ffebee)

## Responsive Breakpoints

- **Mobile**: < 640px
  - Single column layouts
  - Smaller fonts
  - Stacked forms
  - Hamburger menu
  - Grid: minmax(160px, 1fr)

- **Tablet**: 640px - 1024px
  - 2-column layouts where appropriate
  - Grid: minmax(220px, 1fr)
  - Adjusted spacing

- **Desktop**: > 1024px
  - Full multi-column layouts
  - Grid: minmax(240px, 1fr)
  - Maximum container width: 1400px

## Interactive Elements

### Hover Effects
- Cards: Lift up, enhanced shadow
- Buttons: Scale/transform, shadow enhancement
- Links: Color change, underline
- Images: Slight scale (1.05)

### Loading States
- Spinner or "Loading..." text
- Disabled buttons during submission
- Skeleton loaders (optional enhancement)

### Error Handling
- Inline error messages
- Form validation feedback
- API error display
- Retry mechanisms

### Success States
- Order confirmation page
- Success messages
- Visual feedback on actions

## Accessibility Requirements

- Semantic HTML elements
- ARIA labels where needed
- Keyboard navigation support
- Focus indicators
- Alt text for images
- Form labels for all inputs
- Color contrast compliance (WCAG AA minimum)

## Performance Considerations

- Image optimization (lazy loading recommended)
- Code splitting for routes
- Efficient re-renders
- LocalStorage for cart persistence
- API call optimization

## Additional Features to Implement

1. **Image Handling**:
   - Support Cloudinary URLs
   - Fallback to local paths
   - Placeholder for missing images
   - Responsive image sizing

2. **Cart Management**:
   - LocalStorage persistence
   - Quantity updates
   - Item removal
   - Total calculation

3. **Search & Filter**:
   - Real-time search
   - Category filtering
   - URL parameter support
   - Search result highlighting (optional)

4. **Authentication Integration**:
   - Auth0 login/logout
   - User profile display
   - Protected routes
   - Token management

5. **Admin Features**:
   - JWT token storage
   - Protected admin routes
   - Form validation
   - Image upload preview
   - Auto-calculation features

## Deliverables

Create a complete, production-ready React frontend application with:
- All pages and components as specified
- Responsive design for all screen sizes
- Modern, Temu-inspired UI/UX
- Smooth animations and transitions
- Error handling and loading states
- Form validation
- Integration-ready for Auth0 and API endpoints
- Clean, maintainable code structure
- CSS styling matching the design system
- Accessibility features

## Notes

- Use functional components with React Hooks
- Implement proper error boundaries
- Ensure all forms have validation
- Make all interactive elements keyboard accessible
- Test on multiple screen sizes
- Ensure fast load times and smooth interactions
- Follow React best practices and patterns

---

**Use this prompt with AI design tools (like v0.dev, Claude, ChatGPT, etc.) to generate the complete frontend codebase.**

