#!/bin/bash

# MCP Server Import Helper Script
# This script helps you import the MCP server workflows into n8n

echo "🚀 n8n MCP Server Import Helper"
echo "================================"
echo ""

# Check if n8n is running
echo "📋 Checking n8n status..."
if curl -s http://localhost:5678 > /dev/null; then
    echo "✅ n8n is running on http://localhost:5678"
else
    echo "❌ n8n is not accessible on localhost:5678"
    echo "   Please start n8n first with: npm run n8n:start"
    exit 1
fi

echo ""
echo "📥 MCP Server Workflows to Import:"
echo "=================================="

# List all workflow files
WORKFLOW_DIR="mcp-server/workflows"
MAIN_WORKFLOW="$WORKFLOW_DIR/mcp-server-main.json"
TOOL_WORKFLOWS="$WORKFLOW_DIR/tools"

echo "1. Main MCP Server:"
echo "   📄 $MAIN_WORKFLOW"
echo ""

echo "2. Tool Workflows:"
echo "   📄 $TOOL_WORKFLOWS/create-video-tool.json"
echo "   📄 $TOOL_WORKFLOWS/get-video-tool.json"
echo "   📄 $TOOL_WORKFLOWS/update-video-tool.json"
echo "   📄 $TOOL_WORKFLOWS/search-videos-tool.json"
echo "   📄 $TOOL_WORKFLOWS/analyze-skill-level-tool.json"
echo "   📄 $TOOL_WORKFLOWS/enhance-tags-tool.json"

echo ""
echo "🔧 Import Instructions:"
echo "======================"
echo ""
echo "Step 1: Sign in to n8n"
echo "   → Open: http://localhost:5678"
echo "   → Sign in with your credentials"
echo ""
echo "Step 2: Import Tool Workflows FIRST (Important!)"
echo "   For each tool workflow:"
echo "   → Click 'Workflows' in the sidebar"
echo "   → Click '+ Add workflow'"
echo "   → Click the three dots (⋯) in the top right"
echo "   → Select 'Import from File'"
echo "   → Import in this order:"
echo "     1. create-video-tool.json"
echo "     2. get-video-tool.json"
echo "     3. update-video-tool.json"
echo "     4. search-videos-tool.json"
echo "     5. analyze-skill-level-tool.json"
echo "     6. enhance-tags-tool.json"
echo "   → SAVE each workflow and NOTE DOWN the workflow ID"
echo ""
echo "Step 3: Create Authentication Credential"
echo "   → Go to 'Credentials' in the sidebar"
echo "   → Click '+ Add Credential'"
echo "   → Search for 'HTTP Header Auth'"
echo "   → Configure:"
echo "     Name: Payload CMS Auth"
echo "     Header Name: Authorization"
echo "     Header Value: automation-users API-Key 81d19ec-911c-4fe4-92aa-18aadf6659d5"
echo "   → Save the credential"
echo ""
echo "Step 4: Apply Credentials to Tool Workflows"
echo "   For each tool workflow:"
echo "   → Open the workflow"
echo "   → Click on the HTTP Request node"
echo "   → Select 'Payload CMS Auth' as the credential"
echo "   → Save the workflow"
echo ""
echo "Step 5: Import Main MCP Server Workflow"
echo "   → Import mcp-server-main.json"
echo "   → Update the workflow IDs in each tool node"
echo "   → Configure the MCP Server Trigger node"
echo "   → Activate the workflow"
echo ""
echo "💡 Need help? Check the setup guide:"
echo "   📖 mcp-server/docs/setup-guide.md"
echo ""
echo "🎯 When you're ready to update workflow IDs, run:"
echo "   node mcp-server/scripts/update-workflow-ids.js"

# Check if workflow files exist
echo ""
echo "📋 File Status Check:"
echo "===================="

check_file() {
    if [[ -f "$1" ]]; then
        echo "✅ $1"
    else
        echo "❌ $1 (missing)"
    fi
}

check_file "$MAIN_WORKFLOW"
check_file "$TOOL_WORKFLOWS/create-video-tool.json"
check_file "$TOOL_WORKFLOWS/get-video-tool.json"
check_file "$TOOL_WORKFLOWS/update-video-tool.json"
check_file "$TOOL_WORKFLOWS/search-videos-tool.json"
check_file "$TOOL_WORKFLOWS/analyze-skill-level-tool.json"
check_file "$TOOL_WORKFLOWS/enhance-tags-tool.json"

echo ""
echo "🚀 Ready to import! Open http://localhost:5678 to get started."
