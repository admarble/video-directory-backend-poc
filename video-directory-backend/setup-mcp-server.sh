#!/bin/bash

# 🚀 Video Directory MCP Server Setup Script
# This script helps you set up your custom MCP server in n8n following 2025 best practices

set -e

echo "🎬 Setting up Video Directory MCP Server..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Step 1: Check Prerequisites
echo -e "\n${BLUE}🔍 Checking Prerequisites...${NC}"

# Check if n8n is running
if curl -s http://localhost:5678/healthz > /dev/null 2>&1; then
    print_status "n8n is running on port 5678"
else
    print_error "n8n is not running. Please start n8n first."
    echo "  Run: docker-compose up -d n8n"
    exit 1
fi

# Check if Payload CMS is running
if curl -s http://localhost:3001/api/globals/settings > /dev/null 2>&1; then
    print_status "Payload CMS is running on port 3001"
else
    print_error "Payload CMS is not running. Please start Payload CMS first."
    echo "  Run: npm run dev"
    exit 1
fi

# Step 2: Generate Bearer Token if needed
echo -e "\n${BLUE}🔑 Generating Bearer Token...${NC}"
if [ ! -f ".mcp-bearer-token" ]; then
    BEARER_TOKEN=$(openssl rand -hex 32)
    echo "$BEARER_TOKEN" > .mcp-bearer-token
    print_status "Generated new bearer token: $BEARER_TOKEN"
else
    BEARER_TOKEN=$(cat .mcp-bearer-token)
    print_info "Using existing bearer token: $BEARER_TOKEN"
fi

# Step 3: Test API Connectivity
echo -e "\n${BLUE}🔗 Testing API Connectivity...${NC}"

# Test Payload CMS API
if curl -s -H "Authorization: automation-users API-Key 81d19ec-911c-4fe4-92aa-18aadf6659d5" \
   http://localhost:3001/api/videos?limit=1 > /dev/null; then
    print_status "Payload CMS API is accessible"
else
    print_error "Cannot access Payload CMS API. Check your automation user API key."
    exit 1
fi

# Step 4: Check Environment Variables
echo -e "\n${BLUE}🌍 Checking Environment Variables...${NC}"

if [ -f ".env" ]; then
    if grep -q "OPENAI_API_KEY" .env; then
        print_status "OpenAI API key found in .env"
    else
        print_warning "OpenAI API key not found. Add OPENAI_API_KEY to your .env file."
    fi
else
    print_warning ".env file not found. Copy from .env.example and configure."
fi

# Step 5: Workflow Import Instructions
echo -e "\n${BLUE}📋 Next Steps for n8n Setup:${NC}"
echo ""
echo "1. Import Tool Workflows:"
echo "   - Open n8n at http://localhost:5678"
echo "   - Go to Workflows → Import from file"
echo "   - Import each file from mcp-server/workflows/tools/"
echo "   - Configure 'Payload CMS Auth' credential for all HTTP nodes"
echo "   - Activate all imported workflows"
echo ""
echo "2. Import Main MCP Server:"
echo "   - Import mcp-server/workflows/mcp-server-main-updated.json"
echo "   - Replace workflow IDs with actual IDs from step 1"
echo "   - Configure bearer token: $BEARER_TOKEN"
echo "   - Activate the workflow"
echo ""
echo "3. Import AI Agent (Optional):"
echo "   - Import n8n-workflows/ai-agent-mcp-2025.json"
echo "   - Configure MCP client to connect to your server"
echo ""

# Step 6: Generate Configuration Files
echo -e "\n${BLUE}⚙️  Generating Configuration Files...${NC}"

# Update Claude Desktop config with actual bearer token
CLAUDE_CONFIG="mcp-server/config/claude-desktop-config.json"
if [ -f "$CLAUDE_CONFIG" ]; then
    # Replace placeholder with actual token
    sed -i.bak "s/your-bearer-token/$BEARER_TOKEN/g" "$CLAUDE_CONFIG"
    print_status "Updated Claude Desktop configuration"
    print_info "Claude config location: $CLAUDE_CONFIG"
fi

# Step 7: Testing Instructions
echo -e "\n${BLUE}🧪 Testing Your Setup:${NC}"
echo ""
echo "1. Test Individual Tool Workflows:"
echo "   curl -X POST http://localhost:5678/webhook/test-create-video \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"youtubeUrl\": \"https://www.youtube.com/watch?v=dQw4w9WgXcQ\"}'"
echo ""
echo "2. Test MCP Server (after activation):"
echo "   # This will be available at your MCP SSE endpoint"
echo "   # You can test with Claude Desktop or other MCP clients"
echo ""
echo "3. Test AI Agent with MCP (if imported):"
echo "   curl -X POST http://localhost:5678/webhook/video-agent-mcp \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"query\": \"Create a video from this URL: https://www.youtube.com/watch?v=dQw4w9WgXcQ\"}'"

# Step 8: Security Reminders
echo -e "\n${BLUE}🔐 Security Reminders:${NC}"
echo ""
print_warning "Keep your bearer token secure: $BEARER_TOKEN"
print_warning "Don't commit .mcp-bearer-token to version control"
print_warning "Use HTTPS in production environments"
print_warning "Regularly rotate your API keys and tokens"

# Step 9: Documentation Links
echo -e "\n${BLUE}📚 Documentation and Resources:${NC}"
echo ""
echo "📖 n8n MCP Documentation: https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-langchain.mcptrigger/"
echo "📖 Claude Desktop MCP Setup: https://docs.anthropic.com/en/docs/build-with-claude/claude-desktop"
echo "📖 Your MCP Server README: mcp-server/README.md"
echo "📖 Your Setup Guides: N8N_CONNECTION_GUIDE.md, SIMPLIFIED_N8N_GUIDE.md"

echo -e "\n${GREEN}🎉 Setup script completed!${NC}"
echo -e "Next: Import workflows in n8n and configure the workflow IDs as described above."

# Save bearer token info
echo -e "\n${YELLOW}📝 Important Information Saved:${NC}"
echo "Bearer Token: $BEARER_TOKEN (saved in .mcp-bearer-token)"
echo "SSE Endpoint: https://your-n8n-instance.com/webhook/mcp/$BEARER_TOKEN"
echo ""
echo "Replace 'your-n8n-instance.com' with your actual n8n URL when configuring clients."
