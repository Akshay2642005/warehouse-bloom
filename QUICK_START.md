# Quick Start Guide

## ✅ All Fixed Issues

1. **Database cleared** - Fresh tenant-based data
2. **2FA QR codes working** - Using QR code API
3. **Billing clarified** - For cloud subscription ($29/month), not orders
4. **Polar setup guide** - See POLAR_SETUP_GUIDE.md

## 🚀 Start Development

```bash
# Terminal 1 - Server
cd server
npm run dev

# Terminal 2 - Client
cd client
npm run dev
```

## 🔑 Test Login

**Demo Account:**
- Email: `demo@warehouse.com`
- Password: `password123`

This account has:
- Active tenant workspace
- 3 sample items
- 3 categories
- Full access to all features

## 📝 Test Registration

1. Go to http://localhost:8000/signup
2. Enter email and password
3. Account auto-activates (development mode)
4. Login immediately

## 🔐 Test 2FA

1. Login to demo account
2. Go to Profile page
3. Click "Setup 2FA"
4. Scan QR code with Google Authenticator
5. Enter 6-digit code
6. 2FA enabled!

## 💳 Billing Page

- Shows cloud subscription ($29/month)
- NOT for order payments
- Displays plan features and billing history
- Access via dashboard "Manage Billing" button

## 🏢 Multi-Tenant Features

All data is isolated by tenant:
- Items filtered by tenantId
- Orders filtered by tenantId
- Categories filtered by tenantId
- Analytics filtered by tenantId

## 📊 Current Database

```
Users: 1 (demo@warehouse.com)
Tenants: 1 (Demo Warehouse)
Items: 3 (Wireless Mouse, Office Desk, Notebook Pack)
Categories: 3 (Electronics, Furniture, Office Supplies)
Suppliers: 1 (TechCorp Supplies)
```

## 🔧 Polar Payments Setup

**Current State:** Auto-activates accounts (no payment required)

**To Enable Real Payments:**
1. Follow POLAR_SETUP_GUIDE.md
2. Get Polar API token
3. Update server/.env:
   ```env
   POLAR_ACCESS_TOKEN="your_token"
   POLAR_PRODUCT_ID="your_product_id"
   ```
4. Restart server

## 🎯 Key URLs

- Frontend: http://localhost:8000
- Backend API: http://localhost:4000
- Dashboard: http://localhost:8000/dashboard
- Billing: http://localhost:8000/billing
- Profile (2FA): http://localhost:8000/profile

## 🐛 Troubleshooting

**Can't login?**
- Use demo account: demo@warehouse.com / password123
- Check server is running on port 4000

**2FA QR not showing?**
- QR code uses external API (qrserver.com)
- Check internet connection
- Manual entry key is also provided

**No items showing?**
- Run: `cd server && npx tsx prisma/seed-tenant.ts`
- Refresh page

**Rate limit errors?**
- Development has 100 requests per 15 min
- Wait or restart server

## 📚 Documentation

- IMPLEMENTATION_SUMMARY.md - Full feature list
- POLAR_SETUP_GUIDE.md - Payment setup
- FIXES_APPLIED.md - Recent fixes
