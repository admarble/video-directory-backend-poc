#!/usr/bin/env node

/**
 * MCP Setup Fix Script
 * This script helps restructure your MCP configuration to follow the correct pattern
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Correct MCP Server Workflow Template
const mcpServerWorkflow = {
  "meta": {
    "instanceId": "your-instance-id"
  },
  "nodes": [
    {
      "parameters": {
        "authentication": "none",
        "path": "754ab685-0173-4eec-a996-1d56f9dc8339"
      },
      "id": "mcp-server-trigger",
      "name": "MCP Server Trigger",
      "type": "n8n-nodes-langchain.mcptrigger",
      "typeVersion": 1,
      "position": [300, 300]
    },
    {
      "parameters": {
        "name": "searchVideos",
        "description": "Search for videos in the database. Required parameter: query (string). Optional: filters object with limit, page, skillLevel, topic, etc.",
        "workflowId": "REPLACE_WITH_SEARCH_WORKFLOW_ID",
        "schema": {
          "type": "object",
          "properties": {
            "query": {
              "type": "string",
              "description": "Search query string"
            },
            "filters": {
              "type": "object",
              "description": "Optional filters for search",
              "properties": {
                "limit": { "type": "number" },
                "page": { "type": "number" },
                "skillLevel": { "type": "string" },
                "topic": { "type": "string" }
              }
            }
          },
          "required": ["query"]
        }
      },
      "id": "search-videos-tool",
      "name": "Search Videos Tool",
      "type": "n8n-nodes-langchain.toolWorkflow",
      "typeVersion": 1,
      "position": [500, 200]
    },
    {
      "parameters": {
        "name": "createVideo",
        "description": "Create a new video entry. Required parameters: title (string), youtubeUrl (string).",
        "workflowId": "REPLACE_WITH_CREATE_WORKFLOW_ID",
        "schema": {
          "type": "object",
          "properties": {
            "title": {
              "type": "string",
              "description": "Video title"
            },
            "youtubeUrl": {
              "type": "string",
              "description": "YouTube URL"
            },
            "description": {
              "type": "string",
              "description": "Video description"
            }
          },
          "required": ["title", "youtubeUrl"]
        }
      },
      "id": "create-video-tool",
      "name": "Create Video Tool",
      "type": "n8n-nodes-langchain.toolWorkflow",
      "typeVersion": 1,
      "position": [500, 400]
    }
  ],
  "connections": {
    "MCP Server Trigger": {
      "main": [
        [
          {
            "node": "Search Videos Tool",
            "type": "main",
            "index": 0
          },
          {
            "node": "Create Video Tool",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  },
  "active": true,
  "settings": {},
  "versionId": "1"
};

// Search Videos Implementation Workflow
const searchVideosWorkflow = {
  "nodes": [
    {
      "parameters": {},
      "id": "execute-workflow-trigger",
      "name": "When Called by MCP",
      "type": "n8n-nodes-base.executeWorkflowTrigger",
      "typeVersion": 1,
      "position": [300, 300]
    },
    {
      "parameters": {
        "functionCode": `// Extract parameters from MCP call
const query = $input.first().json.query;
const filters = $input.first().json.filters || {};

console.log('Search Videos called with:', { query, filters });

// Build search parameters
const searchParams = {
  where: {},
  limit: filters.limit || 10,
  page: filters.page || 1
};

// Add query to search
if (query) {
  searchParams.where.or = [
    { title: { contains: query } },
    { description: { contains: query } },
    { tags: { contains: query } }
  ];
}

// Add filters
if (filters.skillLevel) {
  searchParams.where.skillLevel = { equals: filters.skillLevel };
}

if (filters.topic) {
  searchParams.where.topic = { equals: filters.topic };
}

return [{ json: { searchParams } }];`
      },
      "id": "prepare-search",
      "name": "Prepare Search",
      "type": "n8n-nodes-base.function",
      "typeVersion": 1,
      "position": [500, 300]
    },
    {
      "parameters": {
        "url": "=http://host.docker.internal:3001/api/videos",
        "authentication": "predefinedCredentialType",
        "nodeCredentialType": "httpHeaderAuth",
        "sendQuery": true,
        "queryParameters": {
          "parameters": [
            {
              "name": "where",
              "value": "={{ JSON.stringify($json.searchParams.where) }}"
            },
            {
              "name": "limit",
              "value": "={{ $json.searchParams.limit }}"
            },
            {
              "name": "page",
              "value": "={{ $json.searchParams.page }}"
            }
          ]
        }
      },
      "id": "search-payload",
      "name": "Search Payload CMS",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4,
      "position": [700, 300]
    },
    {
      "parameters": {
        "functionCode": `// Format response for MCP client
const response = $input.first().json;

const result = {
  videos: response.docs || [],
  total: response.totalDocs || 0,
  page: response.page || 1,
  totalPages: response.totalPages || 1,
  query: $('When Called by MCP').first().json.query
};

console.log('Search completed:', result);

return [{ json: result }];`
      },
      "id": "format-response",
      "name": "Format Response",
      "type": "n8n-nodes-base.function",
      "typeVersion": 1,  
      "position": [900, 300]
    }
  ],
  "connections": {
    "When Called by MCP": {
      "main": [[{ "node": "Prepare Search", "type": "main", "index": 0 }]]
    },
    "Prepare Search": {
      "main": [[{ "node": "Search Payload CMS", "type": "main", "index": 0 }]]
    },
    "Search Payload CMS": {
      "main": [[{ "node": "Format Response", "type": "main", "index": 0 }]]
    }
  },
  "active": true,
  "settings": {},
  "versionId": "1"
};

// Save workflows
const workflowsDir = path.join(__dirname, 'n8n-workflows');
if (!fs.existsSync(workflowsDir)) {
  fs.mkdirSync(workflowsDir, { recursive: true });
}

fs.writeFileSync(
  path.join(workflowsDir, 'mcp-server-corrected.json'),
  JSON.stringify(mcpServerWorkflow, null, 2)
);

fs.writeFileSync(
  path.join(workflowsDir, 'search-videos-workflow.json'),
  JSON.stringify(searchVideosWorkflow, null, 2)
);

console.log('✅ Fixed MCP workflows created!');
console.log('📂 Files created:');
console.log('   - n8n-workflows/mcp-server-corrected.json');
console.log('   - n8n-workflows/search-videos-workflow.json');
console.log('');
console.log('🔧 Next steps:');
console.log('1. Import both workflows into n8n');
console.log('2. Set up HTTP Header Auth credential for Payload CMS');
console.log('3. Update workflow IDs in the MCP Server tools');
console.log('4. Activate both workflows');
console.log('5. Test MCP Client connection');
