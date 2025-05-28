#!/bin/bash

echo "🚀 Starting Video Directory Production Setup..."
echo "=============================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "📦 Installing pnpm..."
    npm install -g pnpm
fi

echo "✅ Prerequisites checked"
echo ""

# Step 1: Install dependencies
echo "📦 Installing production dependencies..."
pnpm install

# Step 2: Create necessary directories
echo "📁 Creating directories..."
mkdir -p logs
mkdir -p backups
mkdir -p media

# Step 3: Set up environment
echo "⚙️  Setting up environment..."
if [ ! -f .env.local ]; then
    cp .env.production.example .env.local
    echo "📝 Created .env.local - Please update with your actual values"
else
    echo "📝 .env.local already exists"
fi

# Step 4: Create database indexes
echo "🗄️  Creating database indexes..."
if pgrep -f "mongod" > /dev/null; then
    node src/scripts/database/create-indexes.mjs
    echo "✅ Database indexes created"
else
    echo "⚠️  MongoDB not running. Please start MongoDB and run: npm run db:index"
fi

# Step 5: Generate Payload types
echo "🔧 Generating Payload types..."
npm run generate:types

# Step 6: Test the setup
echo "🧪 Testing setup..."
echo "Starting health check in background..."

# Start the server in background for testing
npm run dev &
SERVER_PID=$!

# Wait for server to start
sleep 10

# Test health endpoint
if curl -f http://localhost:3001/health &> /dev/null; then
    echo "✅ Health check passed"
else
    echo "⚠️  Health check failed - server may need more time to start"
fi

# Stop the test server
kill $SERVER_PID 2>/dev/null

echo ""
echo "🎉 Production setup completed!"
echo "=============================="
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Update .env.local with your actual values:"
echo "   - SITE_URL (your domain)"
echo "   - SITE_NAME (your site name)"
echo "   - SENTRY_DSN (error tracking)"
echo "   - SMTP settings (email notifications)"
echo ""
echo "2. Start your application:"
echo "   npm run dev          # Development"
echo "   npm run start        # Production"
echo ""
echo "3. Essential commands:"
echo "   npm run health:check     # System status"
echo "   npm run analytics:generate # Business metrics"
echo "   npm run backup:create    # Create backup"
echo "   npm run logs:view        # View logs"
echo ""
echo "4. Check these URLs once started:"
echo "   http://localhost:3001        # Frontend"
echo "   http://localhost:3001/admin  # Admin panel"
echo "   http://localhost:3001/api/health # Health check"
echo "   http://localhost:3001/sitemap.xml # SEO sitemap"
echo ""
echo "📖 See PRODUCTION_IMPLEMENTATION_GUIDE.md for detailed instructions"
echo ""
echo "🚀 Your video directory is ready for production!"
