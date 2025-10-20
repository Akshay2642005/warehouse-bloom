# Warehouse Bloom - Technology Stack

## Programming Languages & Versions

### Primary Languages
- **TypeScript**: ^5.8.3 (client), ^5.3.2 (server) - Type-safe JavaScript development
- **JavaScript**: ES2022+ - Modern JavaScript features and syntax
- **SQL**: PostgreSQL dialect - Database queries and schema definitions

### Runtime Environments
- **Node.js**: Latest LTS - Server-side JavaScript runtime
- **React**: ^18.3.1 - Frontend UI library with hooks and modern patterns

## Frontend Technology Stack

### Core Framework & Build Tools
- **Vite**: ^5.4.19 - Fast build tool and development server
- **React**: ^18.3.1 - Component-based UI library
- **React Router**: ^6.30.1 - Client-side routing and navigation
- **TypeScript**: ^5.8.3 - Static type checking

### UI & Styling
- **shadcn/ui**: Complete component library built on Radix UI primitives
- **Tailwind CSS**: ^3.4.17 - Utility-first CSS framework
- **Radix UI**: Comprehensive set of accessible UI components
- **Lucide React**: ^0.462.0 - Modern icon library
- **Tailwind Animate**: ^1.0.7 - Animation utilities

### State Management & Data Fetching
- **TanStack Query**: ^5.83.0 - Server state management and caching
- **React Hook Form**: ^7.61.1 - Form handling with validation
- **Zod**: ^3.25.76 - Schema validation and type inference
- **Axios**: ^1.12.2 - HTTP client for API communication

### Development & Testing
- **Jest**: ^29.7.0 - JavaScript testing framework
- **Testing Library**: React testing utilities
- **ESLint**: ^9.32.0 - Code linting and style enforcement
- **TypeScript ESLint**: ^8.38.0 - TypeScript-specific linting rules

## Backend Technology Stack

### Core Framework & Runtime
- **Express.js**: ^4.21.2 - Web application framework
- **Node.js**: Latest LTS - JavaScript runtime environment
- **TypeScript**: ^5.3.2 - Type-safe server development
- **tsx**: ^4.6.0 - TypeScript execution and hot reload

### Database & ORM
- **PostgreSQL**: Primary database system
- **Prisma**: ^5.7.0 - Type-safe database ORM and query builder
- **Redis**: ^5.8.2 - Caching and session storage

### Security & Authentication
- **JWT**: ^9.0.2 - JSON Web Token authentication
- **bcryptjs**: ^2.4.3 - Password hashing and verification
- **Helmet**: ^8.1.0 - Security headers middleware
- **CORS**: ^2.8.5 - Cross-origin resource sharing
- **Rate Limiting**: ^7.5.1 - API request throttling

### Additional Services
- **Nodemailer**: ^6.10.1 - Email sending capabilities
- **QRCode**: ^1.5.3 - QR code generation
- **Speakeasy**: ^2.0.0 - Two-factor authentication
- **Morgan**: ^1.10.1 - HTTP request logging

### Testing & Development
- **Jest**: ^29.7.0 - Testing framework
- **Supertest**: ^7.0.0 - HTTP assertion testing
- **Cross-env**: ^7.0.3 - Environment variable management

## Infrastructure & DevOps

### Containerization
- **Docker**: Container platform for consistent deployments
- **Docker Compose**: Multi-container application orchestration
- **Nginx**: ^1.21+ - Reverse proxy and static file serving

### Testing Infrastructure
- **Cypress**: End-to-end testing framework
- **K6**: Performance testing and load testing scripts
- **Jest Coverage**: Code coverage reporting and analysis

### Development Tools
- **ESLint**: Code quality and style enforcement
- **Prettier**: Code formatting (implied by ESLint config)
- **TypeScript**: Strict type checking across the entire stack
- **Hot Reload**: Development server with instant updates

## Development Commands

### Frontend (client/)
```bash
npm run dev          # Start development server
npm run build        # Production build
npm run build:dev    # Development build
npm run test         # Run test suite
npm run test:coverage # Test with coverage report
npm run lint         # Code linting
```

### Backend (server/)
```bash
npm run dev          # Start development server with hot reload
npm run build        # Compile TypeScript to JavaScript
npm run start        # Start production server
npm run test         # Run all tests
npm run test:unit    # Unit tests only
npm run test:int     # Integration tests only
npm run test:coverage # Coverage report
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema changes
npm run db:seed      # Seed database with test data
```

### Root Level
```bash
docker-compose up    # Start all services in development
docker-compose -f docker-compose.prod.yml up # Production deployment
```

## Environment Configuration
- **Development**: Local PostgreSQL, Redis, and file storage
- **Testing**: Isolated test database with cleanup scripts
- **Production**: Containerized deployment with environment variables
- **CI/CD**: Automated testing and deployment pipelines