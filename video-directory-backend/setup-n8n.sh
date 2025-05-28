#!/bin/bash

# 🚀 n8n Setup Script for AI Video Agent
# This script helps configure your n8n instance for the video curation system

echo "🤖 Setting up n8n AI Video Agent..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if n8n is running
echo "📡 Checking n8n status..."
if curl -f -s http://localhost:5678 > /dev/null; then
    echo -e "${GREEN}✅ n8n is running at http://localhost:5678${NC}"
else
    echo -e "${RED}❌ n8n is not accessible at http://localhost:5678${NC}"
    echo "Please start your n8n Docker container first"
    exit 1
fi

# Check if Payload CMS is running
echo "📡 Checking Payload CMS status..."
if curl -f -s http://localhost:3001/api/videos?limit=1 > /dev/null; then
    echo -e "${GREEN}✅ Payload CMS is running at http://localhost:3001${NC}"
else
    echo -e "${RED}❌ Payload CMS is not accessible at http://localhost:3001${NC}"
    echo "Please start your Payload CMS first: npm run dev"
    exit 1
fi

# Check API key from environment
if [ -f ".env" ]; then
    API_KEY=$(grep "AUTOMATION_API_KEY" .env | cut -d '=' -f2)
    if [ ! -z "$API_KEY" ]; then
        echo -e "${GREEN}✅ Found API key in .env file${NC}"
    else
        echo -e "${YELLOW}⚠️  API key not found in .env file${NC}"
        echo "Please ensure your automation user API key is set"
    fi
else
    echo -e "${YELLOW}⚠️  .env file not found${NC}"
fi

echo ""
echo "🔧 n8n Configuration Steps:"
echo "1. Open: http://localhost:5678"
echo "2. Go to: Workflows → Import from file"
echo "3. Import: n8n-workflows/simple-video-agent.json"
echo "4. Set up HTTP Header Auth credential:"
echo "   - Name: 'Payload CMS Auth'"
echo "   - Header Name: 'Authorization'"
echo "   - Header Value: 'automation-users API-Key YOUR_API_KEY_HERE'"
echo ""

echo "🧪 Test Commands:"
echo ""
echo "# Test the webhook directly:"
echo "curl -X POST http://localhost:5678/webhook/video-agent \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"youtubeUrl\": \"https://www.youtube.com/watch?v=dQw4w9WgXcQ\"}'"
echo ""

echo "# Test with options:"
echo "curl -X POST http://localhost:5678/webhook/video-agent \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{"
echo "    \"youtubeUrl\": \"https://www.youtube.com/watch?v=dQw4w9WgXcQ\","
echo "    \"options\": {"
echo "      \"enhanceTags\": true,"
echo "      \"analyzeSkillLevel\": true,"
echo "      \"published\": false"
echo "    }"
echo "  }'"
echo ""

echo "🎯 Expected Response:"
echo "{"
echo "  \"success\": true,"
echo "  \"message\": \"Video processed successfully\","
echo "  \"videoId\": \"abc123\","
echo "  \"published\": false,"
echo "  \"data\": { /* full video data */ }"
echo "}"
echo ""

echo -e "${GREEN}🎉 Setup guide complete!${NC}"
echo -e "${YELLOW}Next: Import the workflow in n8n and configure the HTTP credential${NC}"
