#!/bin/bash
# Restore n8n workflows from backup

echo "🔄 Restoring n8n workflows from backup..."

# Read the workflow backup
WORKFLOW_FILE="/Users/tony/Documents/Projects/Video Directory Backend/video-directory-backend/recovered-workflows.json"

if [ ! -f "$WORKFLOW_FILE" ]; then
    echo "❌ Workflow backup file not found: $WORKFLOW_FILE"
    exit 1
fi

echo "📁 Found workflow backup file"

# Import workflows using n8n CLI via API
echo "📥 Importing workflows..."

# Get first workflow and import it
curl -X POST http://localhost:5678/api/v1/workflows/import \
  -H "Content-Type: application/json" \
  -d @"$WORKFLOW_FILE" \
  --silent

if [ $? -eq 0 ]; then
    echo "✅ Workflows imported successfully!"
else
    echo "❌ Failed to import workflows"
    echo "💡 You can manually import by:"
    echo "   1. Open http://localhost:5678"
    echo "   2. Go to Workflows → Import"
    echo "   3. Upload: $WORKFLOW_FILE"
fi

echo ""
echo "🌐 n8n is available at: http://localhost:5678"
echo "📁 Workflow backup location: $WORKFLOW_FILE"
echo ""
echo "📋 Next steps:"
echo "   1. Open n8n and check if your workflows are restored"
echo "   2. If not, manually import the workflow file"
echo "   3. Recreate any missing credentials (API keys, etc.)"
echo "   4. Activate your MCP workflow"
