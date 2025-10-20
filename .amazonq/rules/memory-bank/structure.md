# Warehouse Bloom - Project Structure

## Directory Organization

### Root Level Structure
```
warehouse-bloom/
├── client/          # React frontend application
├── server/          # Express.js backend API
├── cypress/         # End-to-end testing suite
├── nginx/           # Production web server configuration
├── scripts/         # Build and deployment utilities
├── supabase/        # Database configuration
└── docker-compose.yml # Container orchestration
```

## Core Components & Architecture

### Frontend (client/)
```
client/
├── src/
│   ├── components/  # Reusable UI components (shadcn/ui)
│   ├── pages/       # Application route components
│   ├── hooks/       # Custom React hooks
│   ├── contexts/    # React context providers
│   ├── api/         # API client utilities
│   ├── lib/         # Shared utility functions
│   └── types/       # TypeScript type definitions
├── public/          # Static assets
└── tests/           # Frontend test suites
```

### Backend (server/)
```
server/
├── src/
│   ├── controllers/ # Request handlers and business logic
│   ├── services/    # Core business services
│   ├── routes/      # API endpoint definitions
│   ├── middlewares/ # Express middleware functions
│   ├── validation/  # Input validation schemas
│   ├── utils/       # Helper utilities
│   └── types/       # TypeScript interfaces
├── prisma/          # Database schema and migrations
├── tests/           # Backend test suites
└── docs/            # API documentation
```

## Architectural Patterns

### Frontend Architecture
- **Component-Based Design**: Modular React components with shadcn/ui
- **Custom Hooks Pattern**: Reusable logic extraction (useInstantSearch, etc.)
- **Context API**: Global state management for user authentication
- **API Layer Abstraction**: Centralized HTTP client with axios
- **Type-Safe Development**: Full TypeScript integration

### Backend Architecture
- **MVC Pattern**: Controllers handle requests, services contain business logic
- **Service Layer**: Separation of concerns between routes and data access
- **Middleware Pipeline**: Authentication, validation, and error handling
- **Repository Pattern**: Prisma ORM for database abstraction
- **API-First Design**: RESTful endpoints with OpenAPI documentation

### Database Design
- **Relational Model**: PostgreSQL with normalized schema
- **Migration-Based**: Version-controlled schema changes via Prisma
- **Seeding Strategy**: Automated test data generation
- **Connection Pooling**: Optimized database connection management

## Integration Points

### External Services
- **Authentication**: JWT-based session management
- **File Storage**: Asset management for QR codes and documents
- **Caching Layer**: Redis for performance optimization
- **Email Service**: Nodemailer for notifications

### Development Infrastructure
- **Containerization**: Docker for consistent environments
- **Testing Strategy**: Jest for unit/integration tests, Cypress for E2E
- **Build Pipeline**: Vite for frontend, TypeScript compilation for backend
- **Code Quality**: ESLint, TypeScript strict mode, comprehensive testing

## Deployment Architecture
- **Multi-container Setup**: Separate containers for client, server, database
- **Reverse Proxy**: Nginx for production traffic routing
- **Environment Management**: Separate configurations for dev/test/prod
- **Performance Monitoring**: Built-in analytics and logging capabilities