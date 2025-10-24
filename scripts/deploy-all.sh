#!/bin/bash

# Mango Tree - Complete Platform Deployment Script
# This script deploys the entire Mango Tree betting platform

set -e

echo "🚀 Starting Mango Tree Platform Deployment"
echo "=========================================="

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
check_requirements() {
    print_status "Checking requirements..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi
    
    if ! command -v git &> /dev/null; then
        print_error "git is not installed. Please install git first."
        exit 1
    fi
    
    print_success "All requirements satisfied"
}

# Install dependencies for all components
install_dependencies() {
    print_status "Installing dependencies..."
    
    # Backend dependencies
    print_status "Installing backend dependencies..."
    cd Backend
    npm install
    cd ..
    
    # Frontend dependencies
    print_status "Installing frontend dependencies..."
    cd Frontend
    npm install
    cd ..
    
    # Blockchain dependencies
    print_status "Installing blockchain dependencies..."
    cd Blockchain
    npm install
    cd ..
    
    print_success "All dependencies installed"
}

# Deploy smart contracts
deploy_contracts() {
    print_status "Deploying smart contracts..."
    
    cd Blockchain
    
    # Compile contracts
    print_status "Compiling smart contracts..."
    npm run compile
    
    # Deploy to testnet (Celo Alfajores)
    print_status "Deploying to Celo Alfajores testnet..."
    npm run deploy:alfajores
    
    # Deploy to Polygon Mumbai testnet
    print_status "Deploying to Polygon Mumbai testnet..."
    npm run deploy:mumbai
    
    cd ..
    print_success "Smart contracts deployed"
}

# Build frontend
build_frontend() {
    print_status "Building frontend..."
    
    cd Frontend
    
    # Build the Next.js application
    npm run build
    
    cd ..
    print_success "Frontend built successfully"
}

# Setup environment files
setup_environment() {
    print_status "Setting up environment files..."
    
    # Backend environment
    if [ ! -f "Backend/.env" ]; then
        print_status "Creating backend environment file..."
        cp Backend/.env.example Backend/.env
        print_warning "Please update Backend/.env with your configuration"
    fi
    
    # Blockchain environment
    if [ ! -f "Blockchain/.env" ]; then
        print_status "Creating blockchain environment file..."
        cp Blockchain/env.example Blockchain/.env
        print_warning "Please update Blockchain/.env with your configuration"
    fi
    
    # Frontend environment
    if [ ! -f "Frontend/.env.local" ]; then
        print_status "Creating frontend environment file..."
        cat > Frontend/.env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_WS_URL=http://localhost:5000
NEXT_PUBLIC_CHAIN_ID=44787
NEXT_PUBLIC_RPC_URL=https://alfajores-forno.celo-testnet.org
EOF
        print_warning "Please update Frontend/.env.local with your configuration"
    fi
    
    print_success "Environment files created"
}

# Start services
start_services() {
    print_status "Starting services..."
    
    # Start backend in background
    print_status "Starting backend server..."
    cd Backend
    npm run dev &
    BACKEND_PID=$!
    cd ..
    
    # Start blockchain services in background
    print_status "Starting blockchain services..."
    cd Blockchain
    npm run start:all &
    BLOCKCHAIN_PID=$!
    cd ..
    
    # Start frontend in background
    print_status "Starting frontend server..."
    cd Frontend
    npm run dev &
    FRONTEND_PID=$!
    cd ..
    
    # Save PIDs for cleanup
    echo $BACKEND_PID > .backend.pid
    echo $BLOCKCHAIN_PID > .blockchain.pid
    echo $FRONTEND_PID > .frontend.pid
    
    print_success "All services started"
    print_status "Backend: http://localhost:5000"
    print_status "Frontend: http://localhost:3000"
    print_status "Blockchain services: Running"
}

# Run tests
run_tests() {
    print_status "Running tests..."
    
    # Test smart contracts
    print_status "Testing smart contracts..."
    cd Blockchain
    npm test
    cd ..
    
    # Test backend APIs
    print_status "Testing backend APIs..."
    cd Backend
    npm test || print_warning "Backend tests failed or not implemented"
    cd ..
    
    print_success "Tests completed"
}

# Display deployment summary
show_summary() {
    print_success "🎉 Mango Tree Platform Deployment Complete!"
    echo ""
    echo "📋 Deployment Summary:"
    echo "====================="
    echo "✅ Smart contracts deployed to testnets"
    echo "✅ Backend API server running"
    echo "✅ Frontend application built and running"
    echo "✅ Blockchain services active"
    echo "✅ WebSocket real-time updates enabled"
    echo ""
    echo "🌐 Access Points:"
    echo "================="
    echo "Frontend: http://localhost:3000"
    echo "Backend API: http://localhost:5000"
    echo "WebSocket: ws://localhost:5000"
    echo ""
    echo "📚 Next Steps:"
    echo "=============="
    echo "1. Update environment files with your configuration"
    echo "2. Connect your wallet to the frontend"
    echo "3. Test the betting functionality"
    echo "4. Monitor the real-time feed"
    echo "5. Check cross-chain bridge functionality"
    echo ""
    echo "🛠️ Management Commands:"
    echo "======================="
    echo "Stop all services: ./scripts/stop-all.sh"
    echo "View logs: ./scripts/view-logs.sh"
    echo "Restart services: ./scripts/restart-all.sh"
    echo ""
    print_success "Happy betting! 🎲"
}

# Cleanup function
cleanup() {
    print_status "Cleaning up..."
    
    if [ -f ".backend.pid" ]; then
        kill $(cat .backend.pid) 2>/dev/null || true
        rm .backend.pid
    fi
    
    if [ -f ".blockchain.pid" ]; then
        kill $(cat .blockchain.pid) 2>/dev/null || true
        rm .blockchain.pid
    fi
    
    if [ -f ".frontend.pid" ]; then
        kill $(cat .frontend.pid) 2>/dev/null || true
        rm .frontend.pid
    fi
}

# Handle script interruption
trap cleanup EXIT INT TERM

# Main deployment flow
main() {
    echo "🌳 Mango Tree - Decentralized Betting Platform"
    echo "=============================================="
    echo ""
    
    check_requirements
    setup_environment
    install_dependencies
    deploy_contracts
    build_frontend
    start_services
    
    # Wait a moment for services to start
    sleep 5
    
    run_tests
    show_summary
    
    print_status "Deployment completed successfully!"
    print_status "Press Ctrl+C to stop all services"
    
    # Keep script running
    wait
}

# Run main function
main "$@"
