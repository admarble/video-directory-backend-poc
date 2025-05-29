#!/bin/bash

# n8n Workflow Import Script using REST API
# This script imports workflows via n8n's REST API instead of the problematic CLI

N8N_URL="http://localhost:5678"
WORKFLOWS_DIR="./n8n-workflows"

echo "🚀 Starting n8n workflow import via REST API..."

# Check if n8n is running
echo "🔍 Checking if n8n is accessible..."
if ! curl -s -f "$N8N_URL/healthz" > /dev/null; then
    echo "❌ n8n is not accessible at $N8N_URL"
    echo "Please make sure n8n is running and accessible."
    exit 1
fi

echo "✅ n8n is running at $N8N_URL"

# Check if API key is provided as environment variable
if [ -z "$N8N_API_KEY" ]; then
    echo ""
    echo "⚠️  No API key found in N8N_API_KEY environment variable."
    echo ""
    echo "To use this script, you need to:"
    echo "1. Open n8n at $N8N_URL"
    echo "2. Go to Settings > n8n API"
    echo "3. Create an API key"
    echo "4. Run this script with: N8N_API_KEY='your-api-key' ./import-workflows-api.sh"
    echo ""
    echo "Alternatively, you can set the environment variable:"
    echo "export N8N_API_KEY='your-api-key'"
    echo "./import-workflows-api.sh"
    echo ""
    exit 1
fi

echo "🔑 API key found, proceeding with import..."

# Function to import a single workflow
import_workflow() {
    local file="$1"
    local filename=$(basename "$file")
    
    echo "📁 Importing: $filename"
    
    # Read and format the workflow JSON for API import
    # The API expects only specific properties, not the full export format
    workflow_data=$(cat "$file" | jq '{
        name: .name,
        nodes: .nodes,
        connections: .connections,
        settings: .settings,
        staticData: .staticData
    }')
    
    # Import via REST API with proper authentication
    response=$(curl -s -X POST \
        "$N8N_URL/api/v1/workflows" \
        -H "Content-Type: application/json" \
        -H "X-N8N-API-KEY: $N8N_API_KEY" \
        -d "$workflow_data")
    
    # Check if import was successful
    if echo "$response" | grep -q '"id"'; then
        workflow_id=$(echo "$response" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
        echo "✅ Successfully imported: $filename (ID: $workflow_id)"
        return 0
    else
        echo "❌ Failed to import: $filename"
        echo "Response: $response"
        return 1
    fi
}

# Check if jq is installed (required for JSON processing)
if ! command -v jq &> /dev/null; then
    echo "❌ jq is required but not installed."
    echo "Please install jq first:"
    echo "  macOS: brew install jq"
    echo "  Ubuntu/Debian: sudo apt-get install jq"
    echo "  CentOS/RHEL: sudo yum install jq"
    exit 1
fi

# Check if workflows directory exists
if [ ! -d "$WORKFLOWS_DIR" ]; then
    echo "❌ Workflows directory not found: $WORKFLOWS_DIR"
    exit 1
fi

# Count total workflows
total_workflows=$(find "$WORKFLOWS_DIR" -name "*.json" | wc -l)
if [ "$total_workflows" -eq 0 ]; then
    echo "❌ No workflow files found in $WORKFLOWS_DIR"
    exit 1
fi

echo "📊 Found $total_workflows workflow files to import"
echo ""

# Import all workflow files
success_count=0
failure_count=0

for workflow_file in "$WORKFLOWS_DIR"/*.json; do
    if [ -f "$workflow_file" ]; then
        if import_workflow "$workflow_file"; then
            ((success_count++))
        else
            ((failure_count++))
        fi
        echo ""
    fi
done

# Summary
echo "🎉 Workflow import completed!"
echo "✅ Successfully imported: $success_count workflows"
if [ "$failure_count" -gt 0 ]; then
    echo "❌ Failed to import: $failure_count workflows"
fi
echo ""

if [ "$success_count" -gt 0 ]; then
    echo "🌐 You can now view your imported workflows at: $N8N_URL"
fi 