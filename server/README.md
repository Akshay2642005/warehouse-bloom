# Warehouse Bloom Server v2.0

Enterprise B2B Warehouse Management System - API Server

## 🎯 Features

### 🔐 Authentication & Authorization
- **Better-Auth** integration with session management
- Email/password authentication
- Organization-based multi-tenancy
- Role-based access control (OWNER, ADMIN, MEMBER)

### 🏢 Multi-Tenancy & Organizations
- Each business gets isolated workspace
- Team member invitations
- Granular role permissions
- Organization switching

### 💳 Subscription & Billing (Polar Integration)
- FREE, PRO, and ENTERPRISE plans
- 14-day trial for new organizations
- Subscription management
- Payment tracking

### 📦 Warehouse Management
- Inventory management (items, categories, suppliers)
- Low stock alerts
- Barcode support
- Location tracking
- Stock adjustments

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- PostgreSQL 14+
- pnpm/npm/yarn

### Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your database credentials
```

### Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database (development)
npm run db:push

# OR run migrations (production)
npm run db:migrate

# Seed demo data
npm run db:seed
```

### Development

```bash
npm run dev
```

Server will start at `http://localhost:4000`

### Production Build

```bash
npm run build
npm start
```

## 🔧 Environment Variables

Create a `.env` file based on `.env.example`:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/warehouse_bloom"

# Better Auth (generate a secure random string)
BETTER_AUTH_SECRET="your-64-character-secret-key"
BETTER_AUTH_URL="http://localhost:4000"

# Server
PORT=4000
CLIENT_ORIGIN="http://localhost:8000"

# Polar Payments (optional)
POLAR_ACCESS_TOKEN="polar_at_..."
POLAR_WEBHOOK_SECRET="whsec_..."
```

## 📡 API Endpoints

### Authentication (Better-Auth)
- `POST /api/auth/sign-up/email` - Sign up
- `POST /api/auth/sign-in/email` - Sign in
- `POST /api/auth/sign-out` - Sign out
- `GET /api/auth/get-session` - Get current session

### Organizations
- `POST /api/organizations` - Create organization
- `GET /api/organizations` - List user's organizations
- `GET /api/organizations/:id` - Get organization details
- `PUT /api/organizations/:id` - Update organization
- `DELETE /api/organizations/:id` - Delete organization

### Organization Members
- `POST /api/organizations/:id/members/invite` - Invite member
- `DELETE /api/organizations/:id/members/:userId` - Remove member
- `PUT /api/organizations/:id/members/:userId` - Update member role

### Items
All item endpoints require `X-Organization-Id` header

- `GET /api/items` - List items (with pagination & filters)
- `GET /api/items/:id` - Get item
- `POST /api/items` - Create item
- `PUT /api/items/:id` - Update item
- `DELETE /api/items/:id` - Delete item
- `POST /api/items/:id/adjust` - Adjust quantity

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 50)
- `search` - Search by name/SKU/barcode
- `categoryId` - Filter by category
- `lowStock` - Show only low stock items

## 🏗️ Project Structure

```
server/
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Seed script
├── src/
│   ├── config/            # Configuration
│   ├── controllers/       # Request handlers
│   ├── lib/               # Core libraries (auth, prisma)
│   ├── middleware/        # Express middleware
│   ├── routes/            # Route definitions
│   ├── services/          # Business logic
│   ├── types/             # TypeScript types
│   ├── utils/             # Utility functions
│   ├── app.ts             # Express app setup
│   └── server.ts          # Server entry point
└── package.json
```

## 🔒 Security

- Helmet.js for security headers
- CORS with whitelist
- Rate limiting (TODO)
- SQL injection protection (Prisma)
- XSS protection (hpp middleware)
- Password hashing via better-auth

## 🗄️ Database Schema

### Core Models
- **User** - Better-auth user model
- **Session** - User sessions
- **Organization** - B2B tenant entities
- **Member** - Organization membership
- **Subscription** - Billing subscriptions

### Warehouse Models
- **Item** - Inventory items
- **Category** - Item categories
- **Supplier** - Suppliers
- **Order** - Purchase/sales orders
- **Shipment** - Shipping tracking
- **Alert** - System alerts (low stock, etc.)

### Audit
- **AuditLog** - Activity tracking

## 🧪 Testing

```bash
# Run tests (TODO)
npm test
```

## 📦 Deployment

### Docker

```dockerfile
# See Dockerfile in root
docker build -t warehouse-bloom-server .
docker run -p 4000:4000 warehouse-bloom-server
```

### Manual Deployment

1. Build the project: `npm run build`
2. Set production environment variables
3. Run migrations: `npm run db:migrate:deploy`
4. Start server: `npm start`

## 🤝 Better-Auth Integration

This server uses [Better-Auth](https://better-auth.com) for authentication:

- Session-based auth with cookies
- Organization plugin for multi-tenancy
- Prisma adapter for PostgreSQL
- Secure by default

### Client Integration

Use `better-auth/client` in your frontend:

```typescript
import { createAuthClient } from "better-auth/client";

const authClient = createAuthClient({
  baseURL: "http://localhost:4000",
});
```

## 🔄 Adding New Features

### 1. Add Prisma Model

```prisma
// prisma/schema.prisma
model NewFeature {
  id             String @id @default(cuid())
  organizationId String
  // ... fields
  organization Organization @relation(...)
}
```

### 2. Create Service

```typescript
// src/services/new-feature.service.ts
export class NewFeatureService {
  static async getAll(organizationId: string) {
    return await prisma.newFeature.findMany({
      where: { organizationId }
    });
  }
}
```

### 3. Create Controller

```typescript
// src/controllers/new-feature.controller.ts
export async function getNewFeatures(req: OrgRequest, res: Response) {
  const data = await NewFeatureService.getAll(req.organization!.id);
  res.json({ success: true, data });
}
```

### 4. Create Routes

```typescript
// src/routes/new-feature.routes.ts
export const newFeatureRouter = Router();
newFeatureRouter.get('/', requireAuth, requireOrganization, getNewFeatures);
```

### 5. Mount in App

```typescript
// src/app.ts
app.use('/api/new-features', newFeatureRouter);
```

## 🐛 Troubleshooting

### "Database not found"
Run `npm run db:push` to create the database schema.

### "Invalid session"
Clear cookies and sign in again. Session cookies may have expired.

### "Organization context required"
Ensure you're sending `X-Organization-Id` header with requests.

### Prisma Client errors
Regenerate the client: `npm run db:generate`

## 📄 License

MIT

## 🙏 Credits

- [Better-Auth](https://better-auth.com) - Authentication
- [Prisma](https://prisma.io) - Database ORM
- [Express](https://expressjs.com) - Web framework
