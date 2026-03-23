# MaxyStyles Fashion E-commerce Platform

A full-stack fashion e-commerce application with separate frontend and backend services.

## 🏗️ Project Structure

```
maxystyles/
├── frontend/                 # Next.js frontend application
│   ├── src/
│   │   ├── app/             # Next.js App Router pages
│   │   │   ├── page.tsx     # Homepage
│   │   │   ├── about/       # About page
│   │   │   ├── categories/  # Categories page
│   │   │   ├── contact/     # Contact page
│   │   │   └── products/    # Products page
│   │   ├── components/      # Reusable React components
│   │   │   ├── ui/          # shadcn/ui components
│   │   │   └── Navigation.tsx
│   │   └── lib/            # Utilities and configurations
│   ├── package.json
│   └── tailwind.config.js
│
└── backend/                 # Node.js Express API server
    ├── src/
    │   ├── models/          # MongoDB models
    │   │   ├── Product.ts
    │   │   ├── User.ts
    │   │   ├── Order.ts
    │   │   └── index.ts
    │   ├── routes/          # API routes
    │   │   ├── auth.ts      # Authentication
    │   │   ├── products.ts  # Product CRUD
    │   │   ├── users.ts     # User management
    │   │   └── orders.ts    # Order management
    │   └── server.ts        # Main server file
    ├── .env                 # Environment variables
    ├── package.json
    └── tsconfig.json
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   # Update .env file with your MongoDB URI
   MONGODB_URI=mongodb://localhost:27017/maxystyles
   JWT_SECRET=your-secret-key
   PORT=5000
   ```

4. **Start the backend server:**
   ```bash
   npm run dev
   ```
   Backend will run on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the frontend server:**
   ```bash
   npm run dev
   ```
   Frontend will run on `http://localhost:3000`

## 📱 Available Pages

### Frontend Pages
- **Homepage** (`/`) - Main landing page with hero section and features
- **Products** (`/products`) - Product catalog with search and filters
- **Categories** (`/categories`) - Browse products by category
- **About** (`/about`) - Company information and team
- **Contact** (`/contact`) - Contact forms and information
- **Admin Dashboard** (`/admin`) - Admin panel for managing products

### Backend API Endpoints

#### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

#### Products
- `GET /api/products` - Get all products (with filters)
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create new product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

#### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get single user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

#### Orders
- `GET /api/orders` - Get all orders
- `GET /api/orders/:id` - Get single order
- `POST /api/orders` - Create new order
- `PUT /api/orders/:id` - Update order

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 15 with App Router
- **Styling:** Tailwind CSS + shadcn/ui
- **Language:** TypeScript
- **Icons:** Lucide React

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose
- **Language:** TypeScript
- **Security:** Helmet, CORS, Rate Limiting

## 🔧 Features

### Current Features
✅ Responsive design with mobile-first approach  
✅ Product catalog with search and filtering  
✅ Category-based browsing  
✅ User authentication (register/login)  
✅ Admin dashboard interface  
✅ Contact forms with validation  
✅ About page with company information  

### Planned Features
🔄 Shopping cart functionality  
🔄 Payment integration (Stripe)  
🔄 Order management system  
🔄 Image upload (Cloudinary)  
🔄 Email notifications  
🔄 Product reviews and ratings  

## 🧪 Development

### Running Both Services
```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend  
cd frontend && npm run dev
```

### Database Setup
1. Install MongoDB locally or use MongoDB Atlas
2. Update the `MONGODB_URI` in `backend/.env`
3. The server will automatically connect on startup

## 📝 Environment Variables

### Backend (.env)
```env
MONGODB_URI=mongodb://localhost:27017/maxystyles
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
JWT_SECRET=your-super-secret-jwt-key-here
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test both frontend and backend
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

---

**MaxyStyles** - Where fashion meets technology ✨