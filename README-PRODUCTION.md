# Warehouse Bloom - Production Deployment Guide

## 🚀 Enterprise-Ready Warehouse Management System

Warehouse Bloom is a comprehensive, enterprise-grade warehouse management system with integrated Polar payments, real-time analytics, and advanced security features.

## ✨ Key Features

### 🔐 Security & Authentication
- JWT-based authentication with refresh tokens
- Role-based access control (USER, STAFF, ADMIN, SUPER_ADMIN)
- Two-factor authentication support
- Account lockout protection
- Comprehensive audit logging
- Rate limiting and DDoS protection

### 💳 Payment Integration
- **Polar Payments** integration for seamless transactions
- Multiple payment methods support
- Automatic payment status tracking
- Refund management
- Payment analytics and reporting

### 📊 Advanced Analytics
- Real-time inventory tracking
- Sales performance metrics
- Payment analytics
- Low stock alerts
- Comprehensive reporting dashboard

### 🏗️ Enterprise Architecture
- Microservices-ready design
- Redis caching for performance
- Full-text search capabilities
- Database query optimization
- Horizontal scaling support

### 🔍 Inventory Management
- Advanced search and filtering
- Barcode support
- Bulk operations
- Inventory movement tracking
- Automated reorder alerts

## 🛠️ Technology Stack

### Backend
- **Node.js** with **TypeScript**
- **Express.js** web framework
- **PostgreSQL** database with **Prisma ORM**
- **Redis** for caching and sessions
- **Zod** for validation
- **Winston** for logging

### Frontend
- **React 18** with **TypeScript**
- **Vite** for build tooling
- **TanStack Query** for state management
- **shadcn/ui** component library
- **Tailwind CSS** for styling

### Infrastructure
- **Docker** containerization
- **Nginx** reverse proxy
- **Prometheus** & **Grafana** monitoring
- **SSL/TLS** encryption ready

## 📋 Prerequisites

- **Docker** 20.10+ and **Docker Compose** 2.0+
- **Git** for version control
- **SSL certificates** (for HTTPS in production)
- **Domain name** (for production deployment)

## 🚀 Quick Start

### 1. Clone and Setup

```bash
git clone <your-repository-url>
cd warehouse-bloom

# Copy and configure environment
cp .env.production .env.production.local
```

### 2. Configure Environment

Edit `.env.production.local` with your production values:

```bash
# Database - Use strong passwords
DATABASE_URL="postgresql://warehouse_user:YOUR_STRONG_PASSWORD@postgres:5432/warehouse_db"
POSTGRES_PASSWORD="YOUR_STRONG_PASSWORD"

# Security - Generate strong secrets
JWT_SECRET="YOUR_64_CHAR_RANDOM_STRING"

# Polar Payments
POLAR_ACCESS_TOKEN="your_production_polar_token"
POLAR_WEBHOOK_SECRET="your_webhook_secret"
POLAR_ENVIRONMENT="production"

# Domain
CLIENT_ORIGIN="https://your-domain.com"
VITE_API_BASE_URL="https://your-domain.com/api"
```

### 3. Deploy

```bash
# Make deployment script executable
chmod +x deploy.sh

# Deploy with database seeding (first time)
./deploy.sh --seed

# Or deploy without seeding
./deploy.sh
```

### 4. Access Your Application

- **Frontend**: https://your-domain.com
- **API**: https://your-domain.com/api
- **Monitoring**: http://your-domain.com:3000 (Grafana)

## 🔧 Configuration Options

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `REDIS_URL` | Redis connection string | Optional |
| `JWT_SECRET` | JWT signing secret (64+ chars) | Required |
| `POLAR_ACCESS_TOKEN` | Polar payments API token | Required |
| `CLIENT_ORIGIN` | Frontend domain | Required |
| `MAX_FILE_SIZE_MB` | Upload size limit | `10` |
| `RATE_LIMIT_MAX_REQUESTS` | API rate limit | `100` |

### Deployment Options

```bash
# Deploy with options
./deploy.sh --seed              # Include database seeding
./deploy.sh --skip-backup       # Skip backup creation
./deploy.sh --skip-build        # Skip Docker image building
./deploy.sh --help              # Show all options
```

## 🔒 Security Configuration

### SSL/HTTPS Setup

1. Obtain SSL certificates (Let's Encrypt recommended)
2. Place certificates in `nginx/ssl/`
3. Uncomment HTTPS server block in `nginx/nginx.prod.conf`
4. Update `CLIENT_ORIGIN` to use `https://`

### Firewall Configuration

```bash
# Allow only necessary ports
ufw allow 22    # SSH
ufw allow 80    # HTTP
ufw allow 443   # HTTPS
ufw enable
```

### Database Security

- Use strong passwords (20+ characters)
- Enable SSL connections in production
- Regular security updates
- Backup encryption

## 📊 Monitoring & Logging

### Grafana Dashboards

Access Grafana at `http://your-domain:3000`:
- Default login: `admin` / `password-from-env`
- Pre-configured dashboards for system metrics
- Application performance monitoring
- Payment transaction tracking

### Log Management

```bash
# View application logs
docker-compose -f docker-compose.prod.yml logs -f api

# View nginx logs
docker-compose -f docker-compose.prod.yml logs -f client

# View database logs
docker-compose -f docker-compose.prod.yml logs -f postgres
```

## 🔄 Maintenance

### Backup Strategy

```bash
# Manual backup
./deploy.sh --skip-build --skip-deploy

# Automated daily backups (add to crontab)
0 2 * * * /path/to/warehouse-bloom/backup.sh
```

### Updates

```bash
# Pull latest changes
git pull origin main

# Deploy updates
./deploy.sh
```

### Database Migrations

```bash
# Run migrations manually
docker-compose -f docker-compose.prod.yml run --rm api npx prisma migrate deploy
```

## 🚨 Troubleshooting

### Common Issues

1. **Services won't start**
   ```bash
   # Check logs
   docker-compose -f docker-compose.prod.yml logs
   
   # Restart services
   docker-compose -f docker-compose.prod.yml restart
   ```

2. **Database connection issues**
   ```bash
   # Check database status
   docker-compose -f docker-compose.prod.yml exec postgres pg_isready
   
   # Reset database connection
   docker-compose -f docker-compose.prod.yml restart postgres
   ```

3. **Payment webhook issues**
   - Verify `POLAR_WEBHOOK_SECRET` matches Polar dashboard
   - Check firewall allows incoming webhooks
   - Verify SSL certificate is valid

### Performance Optimization

1. **Database Performance**
   ```sql
   -- Monitor slow queries
   SELECT query, mean_time, calls 
   FROM pg_stat_statements 
   ORDER BY mean_time DESC LIMIT 10;
   ```

2. **Redis Monitoring**
   ```bash
   # Check Redis performance
   docker-compose -f docker-compose.prod.yml exec redis redis-cli info stats
   ```

## 📞 Support

### Health Checks

- **API Health**: `GET /api/status/health`
- **Database**: `GET /api/status/db`
- **Redis**: `GET /api/status/cache`

### Useful Commands

```bash
# Scale services
docker-compose -f docker-compose.prod.yml up -d --scale api=3

# Update single service
docker-compose -f docker-compose.prod.yml up -d --no-deps api

# Database shell
docker-compose -f docker-compose.prod.yml exec postgres psql -U warehouse_user warehouse_db

# Redis shell
docker-compose -f docker-compose.prod.yml exec redis redis-cli
```

## 🔐 Default Credentials

**Initial Admin User:**
- Email: `admin@warehouse.com`
- Password: `admin123`

**⚠️ IMPORTANT:** Change default passwords immediately after first login!

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

---

**🎉 Your enterprise-ready warehouse management system is now deployed and ready for production use!**