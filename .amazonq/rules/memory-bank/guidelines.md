# Warehouse Bloom - Development Guidelines

## Code Quality Standards

### TypeScript Usage
- **Strict Type Safety**: All files use TypeScript with strict mode enabled
- **Interface Definitions**: Clear interfaces for data structures (CreateItemData, UpdateItemData, UseInstantSearchOptions)
- **Type Annotations**: Explicit return types for functions and methods
- **Generic Types**: Proper use of generics for reusable components and hooks
- **Type Guards**: Runtime type checking where necessary

### Import Organization
- **Absolute Imports**: Use `@/` prefix for internal imports (e.g., `@/hooks/use-mobile`, `@/lib/utils`)
- **External First**: External library imports before internal imports
- **Grouped Imports**: Related imports grouped together (React hooks, UI components, utilities)
- **Named Imports**: Prefer named imports over default imports for clarity

### Error Handling Patterns
- **Try-Catch Blocks**: Comprehensive error handling with specific error messages
- **Graceful Degradation**: Fallback mechanisms when services fail (Redis cache fallback to DB)
- **Error Logging**: Structured logging with context information
- **User-Friendly Messages**: Clear error messages for validation failures

## Component Architecture Standards

### React Component Patterns
- **forwardRef Usage**: All UI components use React.forwardRef for proper ref forwarding
- **Compound Components**: Complex components broken into sub-components (Sidebar, SidebarContent, SidebarHeader)
- **Props Spreading**: Consistent use of `{...props}` for extensibility
- **Display Names**: All components have explicit displayName for debugging

### Hook Patterns
- **Custom Hooks**: Extract reusable logic into custom hooks (useInstantSearch, useSidebar)
- **Memoization**: Use useMemo and useCallback for performance optimization
- **Cleanup**: Proper cleanup in useEffect hooks (timeout clearing, event listener removal)
- **Dependency Arrays**: Accurate dependency arrays in useEffect and useCallback

### State Management
- **Context API**: Use React Context for global state (SidebarContext)
- **Local State**: useState for component-specific state
- **Derived State**: useMemo for computed values
- **State Updates**: Functional updates for state that depends on previous state

## Backend Service Patterns

### Service Layer Architecture
- **Static Methods**: Service classes use static methods for stateless operations
- **Single Responsibility**: Each service handles one domain (ItemService, SearchService, AlertService)
- **Interface Segregation**: Clear interfaces for service method parameters
- **Dependency Injection**: Services depend on abstractions, not concrete implementations

### Database Operations
- **Prisma ORM**: All database operations use Prisma client
- **Include Patterns**: Consistent use of include for related data fetching
- **Transaction Support**: Use Prisma transactions for multi-step operations
- **Upsert Operations**: Use upsert for idempotent operations in seeding

### Caching Strategy
- **Redis Integration**: Cache frequently accessed data with TTL
- **Cache Invalidation**: Explicit cache invalidation on data mutations
- **Fallback Mechanisms**: Graceful degradation when cache is unavailable
- **Cache Keys**: Consistent naming patterns for cache keys (`sku:${sku}`)

## API Design Patterns

### Express Application Structure
- **Middleware Pipeline**: Ordered middleware for security, performance, and functionality
- **Route Organization**: Separate router files for different domains
- **Rate Limiting**: Different rate limits for different endpoint types
- **Error Handling**: Centralized error handling middleware

### Security Middleware
- **Helmet Configuration**: Comprehensive security headers with CSP
- **CORS Setup**: Dynamic CORS with credential support
- **Input Validation**: Request body size limits and validation
- **HPP Protection**: HTTP Parameter Pollution prevention

### Performance Optimization
- **Compression**: Response compression with configurable thresholds
- **Memory Monitoring**: Built-in performance and memory monitoring
- **Health Checks**: Dedicated health check endpoints
- **Request Logging**: Environment-specific logging levels

## Data Seeding Patterns

### Idempotent Operations
- **Upsert Strategy**: Use upsert operations to handle existing data
- **Existence Checks**: Check for existing data before creation
- **Conditional Creation**: Only create data if it doesn't exist
- **Transaction Safety**: Wrap related operations in transactions

### Data Relationships
- **Foreign Key Management**: Proper handling of related entity IDs
- **Cascade Operations**: Create related data in correct order
- **Reference Integrity**: Ensure all foreign keys point to valid records
- **Cleanup Operations**: Proper cleanup of test data and artifacts

## Testing Standards

### Test Organization
- **Separate Test Directories**: Dedicated test folders for different test types
- **Test Utilities**: Shared test helpers and factories
- **Environment Isolation**: Separate test environment configuration
- **Coverage Requirements**: Comprehensive test coverage for critical paths

### Mock Strategies
- **Service Mocking**: Mock external services and dependencies
- **Database Mocking**: Use test databases or in-memory alternatives
- **API Mocking**: Mock external API calls in tests
- **Time Mocking**: Mock time-dependent operations for consistent tests

## Performance Guidelines

### Frontend Optimization
- **Component Memoization**: Use React.memo for expensive components
- **Hook Optimization**: Optimize custom hooks with proper dependencies
- **Bundle Splitting**: Code splitting for better loading performance
- **Image Optimization**: Optimized images with proper sizing

### Backend Optimization
- **Database Queries**: Optimize queries with proper indexing
- **Caching Layers**: Multi-level caching strategy
- **Connection Pooling**: Efficient database connection management
- **Response Compression**: Compress API responses

## Documentation Standards

### Code Documentation
- **JSDoc Comments**: Comprehensive function and class documentation
- **Inline Comments**: Explain complex business logic
- **README Files**: Clear setup and usage instructions
- **API Documentation**: OpenAPI/Swagger documentation for APIs

### Type Documentation
- **Interface Documentation**: Document complex interfaces and types
- **Parameter Documentation**: Clear parameter descriptions
- **Return Type Documentation**: Document return types and possible values
- **Example Usage**: Provide usage examples for complex functions