#!/bin/bash

# Analos NFT Launcher Development Setup Script
# This script sets up the development environment

set -e

echo "🛠️  Setting up Analos NFT Launcher development environment..."

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
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+ first."
        echo "Download from: https://nodejs.org/"
        exit 1
    fi
    
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version 18+ is required. Current version: $(node --version)"
        exit 1
    fi
    
    # Check Yarn
    if ! command -v yarn &> /dev/null; then
        print_error "Yarn is not installed. Please install Yarn first."
        echo "Install with: npm install -g yarn"
        exit 1
    fi
    
    # Check Anchor CLI
    if ! command -v anchor &> /dev/null; then
        print_warning "Anchor CLI is not installed. Installing..."
        cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
        avm install latest
        avm use latest
    fi
    
    # Check Solana CLI
    if ! command -v solana &> /dev/null; then
        print_warning "Solana CLI is not installed. Installing..."
        sh -c "$(curl -sSfL https://release.solana.com/v1.17.0/install)"
        export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"
    fi
    
    print_success "All dependencies are available"
}

# Set up environment files
setup_environment() {
    print_status "Setting up environment files..."
    
    # Create .env file if it doesn't exist
    if [ ! -f .env ]; then
        if [ -f env.example ]; then
            cp env.example .env
            print_success "Created .env file from env.example"
        else
            print_error "No env.example file found"
            exit 1
        fi
    else
        print_warning ".env file already exists, skipping creation"
    fi
    
    # Create .env.local for frontend
    if [ ! -f frontend/.env.local ]; then
        cat > frontend/.env.local << EOF
NEXT_PUBLIC_RPC_URL=https://rpc.analos.io
NEXT_PUBLIC_EXPLORER_URL=https://explorer.analos.io
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=ws://localhost:3001
EOF
        print_success "Created frontend/.env.local"
    fi
    
    print_success "Environment files setup complete"
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

# Set up Solana configuration
setup_solana() {
    print_status "Setting up Solana configuration..."
    
    # Configure Solana CLI for Analos
    solana config set --url https://rpc.analos.io
    
    # Generate keypair if it doesn't exist
    if [ ! -f ~/.config/solana/id.json ]; then
        solana-keygen new --no-bip39-passphrase --silent
        print_success "Generated new Solana keypair"
    else
        print_warning "Solana keypair already exists"
    fi
    
    # Check balance
    BALANCE=$(solana balance --url https://rpc.analos.io 2>/dev/null || echo "0")
    if [ "$BALANCE" = "0 SOL" ]; then
        print_warning "Your wallet has 0 SOL. You may need to fund it for testing."
        echo "Get test SOL from: https://faucet.analos.io/ (if available)"
    else
        print_success "Wallet balance: $BALANCE"
    fi
    
    print_success "Solana configuration complete"
}

# Build shared package
build_shared() {
    print_status "Building shared package..."
    
    cd shared
    yarn build
    cd ..
    
    print_success "Shared package built"
}

# Set up Git hooks
setup_git_hooks() {
    print_status "Setting up Git hooks..."
    
    # Install husky
    yarn add -D husky
    
    # Set up pre-commit hook
    npx husky install
    npx husky add .husky/pre-commit "yarn lint && yarn type-check"
    
    print_success "Git hooks setup complete"
}

# Create development scripts
create_dev_scripts() {
    print_status "Creating development scripts..."
    
    # Create start-dev script
    cat > start-dev.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting Analos NFT Launcher development servers..."

# Start backend in background
echo "Starting backend server..."
cd backend && yarn dev &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 5

# Start frontend
echo "Starting frontend server..."
cd ../frontend && yarn dev &
FRONTEND_PID=$!

echo "Development servers started!"
echo "Backend: http://localhost:3001"
echo "Frontend: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop all servers"

# Wait for user to stop
wait $BACKEND_PID $FRONTEND_PID
EOF
    
    chmod +x start-dev.sh
    
    # Create test script
    cat > test-all.sh << 'EOF'
#!/bin/bash
echo "🧪 Running all tests..."

echo "Testing shared package..."
cd shared && yarn test && cd ..

echo "Testing contracts..."
cd contracts && anchor test && cd ..

echo "Testing backend..."
cd backend && yarn test && cd ..

echo "Testing frontend..."
cd frontend && yarn test && cd ..

echo "✅ All tests completed!"
EOF
    
    chmod +x test-all.sh
    
    print_success "Development scripts created"
}

# Main setup function
main() {
    echo "🎯 Analos NFT Launcher Development Setup"
    echo "========================================"
    
    check_dependencies
    setup_environment
    install_dependencies
    setup_solana
    build_shared
    setup_git_hooks
    create_dev_scripts
    
    print_success "🎉 Development environment setup complete!"
    echo ""
    echo "Next steps:"
    echo "1. Update your .env file with your configuration"
    echo "2. Fund your wallet with test SOL if needed"
    echo "3. Run './start-dev.sh' to start development servers"
    echo "4. Visit http://localhost:3000 to see the frontend"
    echo "5. Visit http://localhost:3001 to see the backend API"
    echo ""
    echo "Useful commands:"
    echo "  ./start-dev.sh     - Start all development servers"
    echo "  ./test-all.sh      - Run all tests"
    echo "  yarn dev           - Start development servers"
    echo "  yarn build         - Build all packages"
    echo "  yarn test          - Run all tests"
    echo ""
    echo "For more information, visit: https://github.com/analos-nft-launcher"
}

# Run main function
main "$@"
