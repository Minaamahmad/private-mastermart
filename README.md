# Master Mart

Single-store e-commerce built with Next.js (App Router) and MongoDB.

## Stack

- **Framework:** Next.js 15 (App Router)
- **Database:** MongoDB + Mongoose
- **Payments:** Stripe Checkout

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy environment variables:

```bash
cp .env.example .env
```

3. Set `MONGODB_URI` and Stripe keys in `.env`.

4. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project structure

```
app/           # Pages and API route handlers
components/    # UI components
lib/           # DB connection, models, API client, helpers
public/        # Static assets
styles/        # CSS
```

## API routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/products` | GET, POST | List / create products |
| `/api/products/:id` | GET, PUT, DELETE | Product CRUD |
| `/api/orders` | GET | List orders (admin) |
| `/api/orders/:id` | GET | Order details |
| `/api/orders/:id/status` | PUT | Update order status |
| `/api/stripe/create-checkout-session` | POST | Start Stripe checkout |
| `/api/stripe/verify-payment/:orderId` | GET | Verify payment |
| `/api/stripe/webhook` | POST | Stripe webhook |
| `/api/health` | GET | Health check |

## Scripts

- `npm run dev` — development server
- `npm run build` — production build
- `npm start` — run production server
