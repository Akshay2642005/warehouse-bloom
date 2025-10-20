#!/bin/bash

# Warehouse Bloom Production Deployment Script
# This script handles the complete deployment process

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BACKUP_DIR="./backups/$(date +%Y%m%d_%H%M%S)"
COMPOSE_FILE="docker-compose.prod.yml"
ENV_FILE=".env.production"

# Functions
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

check_requirements() {
    log_info "Checking deployment requirements..."
    
    # Check if Docker is installed and running
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! docker info &> /dev/null; then
        log_error "Docker is not running. Please start Docker first."
        exit 1
    fi
    
    # Check if docker-compose is available
    if ! command -v docker-compose &> /dev/null; then
        log_error "docker-compose is not installed. Please install docker-compose first."
        exit 1
    fi
    
    # Check if production environment file exists
    if [ ! -f "$ENV_FILE" ]; then
        log_error "Production environment file ($ENV_FILE) not found."
        log_info "Please copy .env.production.example to $ENV_FILE and configure it."
        exit 1
    fi
    
    log_success "All requirements met."
}

create_backup() {
    log_info "Creating backup..."
    
    mkdir -p "$BACKUP_DIR"
    
    # Backup database if running
    if docker-compose -f "$COMPOSE_FILE" ps postgres | grep -q "Up"; then
        log_info "Backing up database..."
        docker-compose -f "$COMPOSE_FILE" exec -T postgres pg_dump -U warehouse_user warehouse_db > "$BACKUP_DIR/database.sql"
        log_success "Database backup created: $BACKUP_DIR/database.sql"
    fi
    
    # Backup uploads if they exist
    if docker volume ls | grep -q "warehouse-bloom_api_uploads"; then
        log_info "Backing up uploads..."
        docker run --rm -v warehouse-bloom_api_uploads:/source -v "$(pwd)/$BACKUP_DIR":/backup alpine tar czf /backup/uploads.tar.gz -C /source .
        log_success "Uploads backup created: $BACKUP_DIR/uploads.tar.gz"
    fi
    
    log_success "Backup completed: $BACKUP_DIR"
}

build_images() {
    log_info "Building Docker images..."
    
    # Build with no cache for production
    docker-compose -f "$COMPOSE_FILE" build --no-cache --parallel
    
    log_success "Docker images built successfully."
}

run_database_migrations() {
    log_info "Running database migrations..."
    
    # Start only the database first
    docker-compose -f "$COMPOSE_FILE" up -d postgres redis
    
    # Wait for database to be ready
    log_info "Waiting for database to be ready..."
    timeout=60
    while ! docker-compose -f "$COMPOSE_FILE" exec -T postgres pg_isready -U warehouse_user -d warehouse_db; do
        sleep 2
        timeout=$((timeout - 2))
        if [ $timeout -le 0 ]; then
            log_error "Database failed to start within 60 seconds"
            exit 1
        fi
    done
    
    # Run migrations
    docker-compose -f "$COMPOSE_FILE" run --rm api npx prisma migrate deploy
    
    # Seed database if it's a fresh installation
    if [ "$1" = "--seed" ]; then
        log_info "Seeding database..."
        docker-compose -f "$COMPOSE_FILE" run --rm api npm run db:seed
    fi
    
    log_success "Database migrations completed."
}

deploy_application() {
    log_info "Deploying application..."
    
    # Stop existing containers
    docker-compose -f "$COMPOSE_FILE" down
    
    # Start all services
    docker-compose -f "$COMPOSE_FILE" up -d
    
    # Wait for services to be healthy
    log_info "Waiting for services to be healthy..."
    sleep 30
    
    # Check if services are running
    if ! docker-compose -f "$COMPOSE_FILE" ps | grep -q "Up"; then
        log_error "Some services failed to start. Check logs with: docker-compose -f $COMPOSE_FILE logs"
        exit 1
    fi
    
    log_success "Application deployed successfully."
}

run_health_checks() {
    log_info "Running health checks..."
    
    # Check API health
    max_attempts=30
    attempt=1
    while [ $attempt -le $max_attempts ]; do
        if curl -f http://localhost:3001/api/status/health &> /dev/null; then
            log_success "API health check passed."
            break
        fi
        
        if [ $attempt -eq $max_attempts ]; then
            log_error "API health check failed after $max_attempts attempts."
            exit 1
        fi
        
        log_info "Attempt $attempt/$max_attempts: API not ready yet, waiting..."
        sleep 5
        attempt=$((attempt + 1))
    done
    
    # Check frontend
    if curl -f http://localhost/health &> /dev/null; then
        log_success "Frontend health check passed."
    else
        log_warning "Frontend health check failed. Check nginx logs."
    fi
    
    log_success "Health checks completed."
}

cleanup_old_images() {
    log_info "Cleaning up old Docker images..."
    
    # Remove dangling images
    docker image prune -f
    
    # Remove old images (keep last 3 versions)
    docker images --format "table {{.Repository}}:{{.Tag}}\t{{.CreatedAt}}" | grep warehouse | sort -k2 -r | tail -n +4 | awk '{print $1}' | xargs -r docker rmi
    
    log_success "Cleanup completed."
}

show_status() {
    log_info "Deployment Status:"
    echo ""
    docker-compose -f "$COMPOSE_FILE" ps
    echo ""
    log_info "Application URLs:"
    echo "  Frontend: http://localhost"
    echo "  API: http://localhost:3001"
    echo "  Grafana: http://localhost:3000 (admin/password from env)"
    echo "  Prometheus: http://localhost:9090"
    echo ""
    log_info "Useful commands:"
    echo "  View logs: docker-compose -f $COMPOSE_FILE logs -f [service]"
    echo "  Stop all: docker-compose -f $COMPOSE_FILE down"
    echo "  Restart service: docker-compose -f $COMPOSE_FILE restart [service]"
}

# Main deployment process
main() {
    log_info "Starting Warehouse Bloom production deployment..."
    
    # Parse command line arguments
    SEED_DB=false
    SKIP_BACKUP=false
    SKIP_BUILD=false
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --seed)
                SEED_DB=true
                shift
                ;;
            --skip-backup)
                SKIP_BACKUP=true
                shift
                ;;
            --skip-build)
                SKIP_BUILD=true
                shift
                ;;
            --help)
                echo "Usage: $0 [OPTIONS]"
                echo "Options:"
                echo "  --seed         Seed the database with initial data"
                echo "  --skip-backup  Skip creating backup"
                echo "  --skip-build   Skip building Docker images"
                echo "  --help         Show this help message"
                exit 0
                ;;
            *)
                log_error "Unknown option: $1"
                exit 1
                ;;
        esac
    done
    
    # Run deployment steps
    check_requirements
    
    if [ "$SKIP_BACKUP" = false ]; then
        create_backup
    fi
    
    if [ "$SKIP_BUILD" = false ]; then
        build_images
    fi
    
    if [ "$SEED_DB" = true ]; then
        run_database_migrations --seed
    else
        run_database_migrations
    fi
    
    deploy_application
    run_health_checks
    cleanup_old_images
    show_status
    
    log_success "Deployment completed successfully!"
    log_info "Your Warehouse Bloom application is now running in production mode."
}

# Run main function with all arguments
main "$@"