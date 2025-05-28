#!/bin/bash

# N8N Safe Update Script
# This script safely updates n8n while preserving all data

set -e  # Exit on any error

COMPOSE_FILE="docker-compose.ai.yml"
CONTAINER_NAME="video-agent-n8n"
BACKUP_DIR="./n8n-backups"
DATE=$(date +%Y%m%d_%H%M%S)

echo "🔄 N8N Safe Update Script"
echo "========================"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

echo "📋 Step 1: Checking current setup..."
if ! docker ps | grep -q "$CONTAINER_NAME"; then
    echo "⚠️  Container not running. Starting for backup..."
    docker-compose -f "$COMPOSE_FILE" up -d n8n
    sleep 10
fi

echo "💾 Step 2: Creating pre-update backup..."

# Export all workflows
echo "  - Exporting workflows..."
docker exec -u node "$CONTAINER_NAME" n8n export:workflow --all --output="/tmp/workflows_$DATE.json" || true
docker cp "$CONTAINER_NAME:/tmp/workflows_$DATE.json" "$BACKUP_DIR/" 2>/dev/null || echo "    No workflows to backup"

# Export all credentials (encrypted)
echo "  - Exporting credentials..."
docker exec -u node "$CONTAINER_NAME" n8n export:credentials --all --output="/tmp/credentials_$DATE.json" || true
docker cp "$CONTAINER_NAME:/tmp/credentials_$DATE.json" "$BACKUP_DIR/" 2>/dev/null || echo "    No credentials to backup"

# Backup the entire data directory
echo "  - Backing up data directory..."
docker run --rm -v video-directory-backend_n8n_data:/data:ro -v "$(pwd)/$BACKUP_DIR":/backup alpine tar czf "/backup/n8n_data_$DATE.tar.gz" -C /data .

# Backup the config file (contains encryption key)
echo "  - Backing up config and encryption key..."
docker run --rm -v video-directory-backend_n8n_data:/data:ro -v "$(pwd)/$BACKUP_DIR":/backup alpine cp /data/config "/backup/config_$DATE" 2>/dev/null || echo "    No config file found"

echo "✅ Backup completed in: $BACKUP_DIR"

echo "🛑 Step 3: Stopping container..."
docker-compose -f "$COMPOSE_FILE" down

echo "🔄 Step 4: Updating n8n image..."
docker pull docker.n8n.io/n8nio/n8n:latest

echo "🚀 Step 5: Starting updated container..."
docker-compose -f "$COMPOSE_FILE" up -d n8n

echo "⏳ Step 6: Waiting for n8n to start..."
sleep 15

# Wait for n8n to be healthy
echo "  - Checking health..."
for i in {1..30}; do
    if curl -f http://localhost:5678/healthz >/dev/null 2>&1; then
        echo "✅ n8n is healthy and ready!"
        break
    fi
    echo "    Waiting... ($i/30)"
    sleep 2
done

echo "🔍 Step 7: Verifying data persistence..."
WORKFLOW_COUNT=$(docker exec -u node "$CONTAINER_NAME" n8n list:workflow 2>/dev/null | grep -c "|" || echo "0")
echo "  - Found $WORKFLOW_COUNT workflows"

if [ "$WORKFLOW_COUNT" -eq "0" ]; then
    echo "⚠️  No workflows found! Checking if restore is needed..."
    
    # Find the most recent backup
    LATEST_WORKFLOWS=$(ls -t "$BACKUP_DIR"/workflows_*.json 2>/dev/null | head -1 || echo "")
    
    if [ -n "$LATEST_WORKFLOWS" ]; then
        echo "🔄 Restoring from backup: $LATEST_WORKFLOWS"
        docker cp "$LATEST_WORKFLOWS" "$CONTAINER_NAME:/tmp/restore_workflows.json"
        docker exec -u node "$CONTAINER_NAME" n8n import:workflow --input=/tmp/restore_workflows.json
        
        # Restore credentials if available
        LATEST_CREDENTIALS=$(ls -t "$BACKUP_DIR"/credentials_*.json 2>/dev/null | head -1 || echo "")
        if [ -n "$LATEST_CREDENTIALS" ]; then
            echo "🔐 Restoring credentials from: $LATEST_CREDENTIALS"
            docker cp "$LATEST_CREDENTIALS" "$CONTAINER_NAME:/tmp/restore_credentials.json"
            docker exec -u node "$CONTAINER_NAME" n8n import:credentials --input=/tmp/restore_credentials.json || echo "    Credential restore failed (may need manual setup)"
        fi
        
        echo "✅ Restore completed!"
    else
        echo "❌ No backups found to restore from"
    fi
fi

echo ""
echo "🎉 Update Complete!"
echo "==================="
echo "n8n is running at: http://localhost:5678"
echo "Backups stored in: $BACKUP_DIR"
echo ""
echo "Next time, just run: ./safe-update-n8n.sh"

# Clean up old backups (keep last 5)
echo "🧹 Cleaning up old backups (keeping last 5)..."
ls -t "$BACKUP_DIR"/workflows_*.json 2>/dev/null | tail -n +6 | xargs rm -f 2>/dev/null || true
ls -t "$BACKUP_DIR"/credentials_*.json 2>/dev/null | tail -n +6 | xargs rm -f 2>/dev/null || true
ls -t "$BACKUP_DIR"/n8n_data_*.tar.gz 2>/dev/null | tail -n +6 | xargs rm -f 2>/dev/null || true
ls -t "$BACKUP_DIR"/config_* 2>/dev/null | tail -n +6 | xargs rm -f 2>/dev/null || true