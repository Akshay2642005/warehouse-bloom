#!/bin/bash

# Production Build Script for Warehouse Bloom
# This script builds both frontend and backend for production deployment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_dependencies() {
    log_info "Checking dependencies..."
    
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        log_error "npm is not installed"
        exit 1
    fi
    
    log_success "All dependencies are available"
}

# Build backend
build_backend() {
    log_info "Building backend..."
    
    cd server
    
    # Install dependencies
    log_info "Installing backend dependencies..."
    npm ci --only=production
    
    # Generate Prisma client
    log_info "Generating Prisma client..."
    npx prisma generate
    
    # Build TypeScript
    log_info "Compiling TypeScript..."
    npm run build
    
    cd ..
    log_success "Backend build completed"
}

# Build frontend
build_frontend() {
    log_info "Building frontend..."
    
    cd client
    
    # Install dependencies
    log_info "Installing frontend dependencies..."
    npm ci
    
    # Build for production
    log_info "Building React application..."
    npm run build
    
    cd ..
    log_success "Frontend build completed"
}

# Run tests
run_tests() {
    log_info "Running tests..."
    
    # Backend tests
    cd server
    log_info "Running backend tests..."
    npm run test
    cd ..
    
    # Frontend tests
    cd client
    log_info "Running frontend tests..."
    npm run test
    cd ..
    
    log_success "All tests passed"
}

# Create production package
create_package() {
    log_info "Creating production package..."
    
    # Create dist directory
    mkdir -p dist
    
    # Copy backend build
    cp -r server/dist dist/server
    cp -r server/node_modules dist/server/
    cp -r server/prisma dist/server/
    cp server/package.json dist/server/
    
    # Copy frontend build
    cp -r client/dist dist/client
    
    # Copy Docker files
    cp docker-compose.prod.yml dist/
    cp -r nginx dist/
    
    # Copy deployment scripts
    cp deploy.sh dist/
    cp .env.production dist/
    
    log_success "Production package created in dist/"
}

# Main build process
main() {
    log_info "Starting production build for Warehouse Bloom..."
    
    # Parse command line arguments
    SKIP_TESTS=false
    SKIP_BACKEND=false
    SKIP_FRONTEND=false
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --skip-tests)
                SKIP_TESTS=true
                shift
                ;;
            --skip-backend)
                SKIP_BACKEND=true
                shift
                ;;
            --skip-frontend)
                SKIP_FRONTEND=true
                shift
                ;;
            --help)
                echo "Usage: $0 [OPTIONS]"
                echo "Options:"
                echo "  --skip-tests     Skip running tests"
                echo "  --skip-backend   Skip backend build"
                echo "  --skip-frontend  Skip frontend build"
                echo "  --help           Show this help message"
                exit 0
                ;;
            *)
                log_error "Unknown option: $1"
                exit 1
                ;;
        esac
    done
    
    # Run build steps
    check_dependencies
    
    if [ "$SKIP_TESTS" = false ]; then
        run_tests
    fi
    
    if [ "$SKIP_BACKEND" = false ]; then
        build_backend
    fi
    
    if [ "$SKIP_FRONTEND" = false ]; then
        build_frontend
    fi
    
    create_package
    
    log_success "Production build completed successfully!"
    log_info "Your production-ready application is in the dist/ directory"
    log_info "Deploy using: cd dist && ./deploy.sh"
}

# Run main function with all arguments
main "$@"