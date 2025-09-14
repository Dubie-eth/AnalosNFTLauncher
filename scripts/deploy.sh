#!/bin/bash

# Analos NFT Launcher Deployment Script
# This script deploys the entire platform to production

set -e

echo "🚀 Starting Analos NFT Launcher deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_dependencies() {
    print_status "Checking dependencies..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    fi
    
    if ! command -v yarn &> /dev/null; then
        print_error "Yarn is not installed. Please install Yarn first."
        exit 1
    fi
    
    if ! command -v anchor &> /dev/null; then
        print_error "Anchor CLI is not installed. Please install Anchor first."
        exit 1
    fi
    
    if ! command -v solana &> /dev/null; then
        print_error "Solana CLI is not installed. Please install Solana CLI first."
        exit 1
    fi
    
    print_success "All dependencies are installed"
}

# Set up environment
setup_environment() {
    print_status "Setting up environment..."
    
    # Copy environment file if it doesn't exist
    if [ ! -f .env ]; then
        if [ -f env.example ]; then
            cp env.example .env
            print_warning "Created .env file from env.example. Please update with your values."
        else
            print_error "No .env file found and no env.example to copy from."
            exit 1
        fi
    fi
    
    # Load environment variables
    export $(cat .env | grep -v '^#' | xargs)
    
    print_success "Environment setup complete"
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    # Install root dependencies
    yarn install
    
    # Install workspace dependencies
    yarn workspace @analos-nft-launcher/shared install
    yarn workspace @analos-nft-launcher/contracts install
    yarn workspace @analos-nft-launcher/backend install
    yarn workspace @analos-nft-launcher/frontend install
    
    print_success "Dependencies installed"
}

# Build shared package
build_shared() {
    print_status "Building shared package..."
    
    cd shared
    yarn build
    cd ..
    
    print_success "Shared package built"
}

# Deploy smart contracts
deploy_contracts() {
    print_status "Deploying smart contracts to Analos..."
    
    cd contracts
    
    # Configure Solana CLI for Analos
    solana config set --url $RPC_URL
    solana config set --keypair ~/.config/solana/id.json
    
    # Build the program
    anchor build
    
    # Deploy to Analos
    anchor deploy --provider.cluster custom
    
    # Get the program ID
    PROGRAM_ID=$(solana address -k target/deploy/analos_nft_launcher-keypair.json)
    print_success "Contract deployed with program ID: $PROGRAM_ID"
    
    # Update the program ID in the code
    sed -i "s/NFTLauncher1111111111111111111111111111111/$PROGRAM_ID/g" programs/analos-nft-launcher/src/lib.rs
    sed -i "s/NFTLauncher1111111111111111111111111111111/$PROGRAM_ID/g" Anchor.toml
    
    cd ..
    
    print_success "Smart contracts deployed"
}

# Build backend
build_backend() {
    print_status "Building backend..."
    
    cd backend
    yarn build
    cd ..
    
    print_success "Backend built"
}

# Deploy backend
deploy_backend() {
    print_status "Deploying backend..."
    
    # Check if we're deploying to a cloud provider
    if [ "$DEPLOY_BACKEND" = "render" ]; then
        print_status "Deploying to Render..."
        # Add Render deployment commands here
    elif [ "$DEPLOY_BACKEND" = "heroku" ]; then
        print_status "Deploying to Heroku..."
        # Add Heroku deployment commands here
    else
        print_warning "No backend deployment target specified. Skipping backend deployment."
    fi
    
    print_success "Backend deployment complete"
}

# Build frontend
build_frontend() {
    print_status "Building frontend..."
    
    cd frontend
    yarn build
    cd ..
    
    print_success "Frontend built"
}

# Deploy frontend
deploy_frontend() {
    print_status "Deploying frontend..."
    
    # Check if we're deploying to Vercel
    if [ "$DEPLOY_FRONTEND" = "vercel" ]; then
        print_status "Deploying to Vercel..."
        cd frontend
        vercel --prod
        cd ..
    elif [ "$DEPLOY_FRONTEND" = "netlify" ]; then
        print_status "Deploying to Netlify..."
        cd frontend
        netlify deploy --prod --dir=out
        cd ..
    else
        print_warning "No frontend deployment target specified. Skipping frontend deployment."
    fi
    
    print_success "Frontend deployment complete"
}

# Run tests
run_tests() {
    print_status "Running tests..."
    
    # Test contracts
    cd contracts
    anchor test --provider.cluster custom
    cd ..
    
    # Test backend
    cd backend
    yarn test
    cd ..
    
    # Test frontend
    cd frontend
    yarn test
    cd ..
    
    print_success "All tests passed"
}

# Main deployment function
main() {
    echo "🎯 Analos NFT Launcher Deployment"
    echo "=================================="
    
    # Parse command line arguments
    SKIP_TESTS=false
    SKIP_CONTRACTS=false
    SKIP_BACKEND=false
    SKIP_FRONTEND=false
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --skip-tests)
                SKIP_TESTS=true
                shift
                ;;
            --skip-contracts)
                SKIP_CONTRACTS=true
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
                echo "Usage: $0 [options]"
                echo "Options:"
                echo "  --skip-tests      Skip running tests"
                echo "  --skip-contracts  Skip contract deployment"
                echo "  --skip-backend    Skip backend deployment"
                echo "  --skip-frontend   Skip frontend deployment"
                echo "  --help           Show this help message"
                exit 0
                ;;
            *)
                print_error "Unknown option: $1"
                exit 1
                ;;
        esac
    done
    
    # Run deployment steps
    check_dependencies
    setup_environment
    install_dependencies
    build_shared
    
    if [ "$SKIP_TESTS" = false ]; then
        run_tests
    fi
    
    if [ "$SKIP_CONTRACTS" = false ]; then
        deploy_contracts
    fi
    
    if [ "$SKIP_BACKEND" = false ]; then
        build_backend
        deploy_backend
    fi
    
    if [ "$SKIP_FRONTEND" = false ]; then
        build_frontend
        deploy_frontend
    fi
    
    print_success "🎉 Deployment complete!"
    echo ""
    echo "Next steps:"
    echo "1. Update your .env file with the deployed contract address"
    echo "2. Configure your domain and DNS settings"
    echo "3. Set up monitoring and logging"
    echo "4. Test the deployed application"
    echo ""
    echo "For support, visit: https://github.com/analos-nft-launcher"
}

# Run main function
main "$@"
