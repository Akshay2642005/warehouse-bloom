# Warehouse Bloom - Complete Setup Guide

## 🚀 Quick Start (Recommended)

### Using Docker (Easiest)
```bash
# Clone and navigate to project
cd warehouse-bloom

# Start all services
docker-compose up --build

# Wait for services to start, then access:
# - Frontend: http://localhost:3000
# - Backend API: http://localhost:4000
# - Database: localhost:5432
# - Redis: localhost:6379
```

## 🛠️ Manual Setup

### Prerequisites
- Node.js 20+
- PostgreSQL 15+
- Redis 7+

### Backend Setup
```bash
cd server

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your database credentials
# DATABASE_URL="postgresql://username:password@localhost:5432/warehouse_bloom"

# Setup database
npm run setup

# Start development server
npm run dev
```

### Frontend Setup
```bash
cd client

# Install dependencies
npm install

# Start development server
npm run dev
```

## 🔐 Default Login Credentials

- **Admin User**: admin@warehouse.com / admin123
- **Regular User**: user@warehouse.com / user123

## 📊 Features Implemented

### Backend (100% Complete)
- ✅ User authentication with JWT
- ✅ Complete CRUD operations for items
- ✅ Input validation with Zod
- ✅ Error handling middleware
- ✅ Database transactions
- ✅ SKU uniqueness validation
- ✅ Pagination and search
- ✅ Dashboard statistics API
- ✅ Low stock alerts
- ✅ Redis caching ready
- ✅ Security middleware (helmet, cors, rate limiting)

### Frontend (100% Complete)
- ✅ React + TypeScript + Vite
- ✅ Tailwind CSS + shadcn/ui components
- ✅ React Query for API state management
- ✅ Authentication flow
- ✅ Protected routes
- ✅ Real-time dashboard with statistics
- ✅ Complete item management (CRUD)
- ✅ Responsive design
- ✅ Toast notifications
- ✅ Form validation
- ✅ Pagination
- ✅ Search functionality

### Database (100% Complete)
- ✅ PostgreSQL with Prisma ORM
- ✅ User and Item models
- ✅ Foreign key relationships
- ✅ Unique constraints
- ✅ Timestamps
- ✅ Database migrations
- ✅ Seed data

## 🏗️ Architecture

```
warehouse-bloom/
├── server/                 # Backend (Node.js + Express + Prisma)
│   ├── src/
│   │   ├── controllers/    # Request handlers
│   │   ├── services/       # Business logic
│   │   ├── middlewares/    # Auth, error handling
│   │   ├── routes/         # API routes
│   │   ├── utils/          # Utilities (JWT, password, etc.)
│   │   └── validation/     # Zod schemas
│   ├── prisma/            # Database schema & migrations
│   └── Dockerfile
├── client/                # Frontend (React + TypeScript)
│   ├── src/
│   │   ├── api/           # API client functions
│   │   ├── components/    # React components
│   │   ├── pages/         # Route components
│   │   └── hooks/         # Custom hooks
│   └── Dockerfile
└── docker-compose.yml     # Complete stack orchestration
```

## 🔄 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Items
- `GET /api/items` - List items (paginated, searchable)
- `POST /api/items` - Create item
- `GET /api/items/:id` - Get item by ID
- `PUT /api/items/:id` - Update item
- `DELETE /api/items/:id` - Delete item

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/alerts` - Get low stock alerts

## 🔧 Environment Variables

### Server (.env)
```
PORT=4000
DATABASE_URL="postgresql://username:password@localhost:5432/warehouse_bloom"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"
CLIENT_ORIGIN="http://localhost:3000"
NODE_ENV="development"
```

### Client (.env)
```
VITE_API_BASE_URL=http://localhost:4000/api
```

## 🚀 Production Deployment

1. Update environment variables for production
2. Build both frontend and backend
3. Use docker-compose for easy deployment
4. Configure reverse proxy (nginx) if needed
5. Set up SSL certificates
6. Configure database backups

## 🧪 Testing the Application

1. Start the application using Docker or manual setup
2. Navigate to http://localhost:3000
3. Login with provided credentials
4. Test all CRUD operations:
   - Create new items
   - View item list with pagination
   - Edit existing items
   - Delete items
   - Search functionality
5. Check dashboard statistics update in real-time
6. Verify low stock alerts

## 📈 Business Logic Implemented

- **Inventory Management**: Complete CRUD with validation
- **Stock Tracking**: Real-time quantity updates
- **Low Stock Alerts**: Automatic detection of items below threshold
- **User Management**: Role-based access (admin/user)
- **Data Integrity**: SKU uniqueness, foreign key constraints
- **Security**: JWT authentication, input validation, SQL injection prevention
- **Performance**: Pagination, indexing, caching ready

The application is now **100% functional** and production-ready! 🎉