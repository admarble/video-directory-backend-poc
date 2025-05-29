#!/bin/bash
# Quick fix script for n8n MCP connection issues

echo "🔧 Fixing n8n MCP connection issues..."

# Stop existing containers
echo "Stopping existing containers..."
docker-compose down 2>/dev/null || true
docker-compose -f docker-compose.n8n.yml down 2>/dev/null || true

# Clean up
echo "Cleaning up..."
docker system prune -f

# Start with new configuration
echo "Starting n8n with MCP fixes..."
docker-compose -f docker-compose.n8n.yml up -d

# Wait for services to start
echo "Waiting for services to start..."
sleep 30

# Show status
echo "📊 Service Status:"
docker-compose -f docker-compose.n8n.yml ps

echo ""
echo "🌐 Access URLs:"
echo "  - n8n: http://localhost:5678"
echo "  - Payload CMS: http://localhost:3001"
echo ""
echo "🔍 Debug commands:"
echo "  - View n8n logs: docker logs n8n-video-agent -f"
echo "  - Test SSE endpoint: curl -N http://localhost:5678/mcp/754ab685-0173-4eec-a996-1d56f9dc8339/sse"
echo ""
echo "✅ Next steps:"
echo "  1. Open n8n at http://localhost:5678"
echo "  2. Activate your workflow (toggle in top right)"
echo "  3. Test the MCP client connection"
echo ""
echo "🚨 If still having issues:"
echo "  - Check the MCP_CONNECTION_TROUBLESHOOTING.md file"
echo "  - Verify your workflow is set to active: true"
echo "  - Remove authentication temporarily for testing"
