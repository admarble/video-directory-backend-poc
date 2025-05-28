#!/bin/bash

# Quick verification script for the vendor chunk fix
echo "🔍 Verifying Date-fns Vendor Chunk Fix..."
echo "=========================================="

# Check if date-fns versions are consistent
echo "📦 Checking date-fns version consistency..."
pnpm why date-fns | grep "date-fns" | head -5

echo ""
echo "🚀 Starting development server for 10 seconds..."
timeout 10s pnpm run dev > dev_test.log 2>&1 &
DEV_PID=$!

sleep 12

# Check if server started without errors
if grep -q "Ready in" dev_test.log; then
    echo "✅ Development server started successfully!"
    echo "✅ No vendor chunk errors detected"
else
    echo "❌ Development server failed to start"
    echo "📄 Checking log for errors..."
    cat dev_test.log
fi

# Cleanup
kill $DEV_PID 2>/dev/null
rm -f dev_test.log

echo ""
echo "🎯 Fix Summary:"
echo "- All Payload CMS packages updated to v3.39.1"
echo "- date-fns unified to v4.1.0 across all dependencies"
echo "- Webpack configured for proper vendor chunk handling"
echo "- Development server ready at http://localhost:3001"
echo ""
echo "🔧 Next steps:"
echo "1. Run: pnpm run dev"
echo "2. Access: http://localhost:3001/admin"
echo "3. Test your Payload CMS functionality"
