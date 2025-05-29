# 🔧 Fix Your Webhook-Based MCP Setup

You're absolutely right to use the webhook approach! It's much cleaner for debugging. The issue is not your architecture - it's in the **tool parameter definition**. Let me fix this for you.

## **🚨 The Real Problem**

The error `"Invalid_type", "expected": "string", "received": "undefined"` happens because your MCP tools don't have proper **JSON schema definitions**. Your webhook endpoint is fine, but the MCP server doesn't know what parameters to expect.

## **✅ Quick Fix - Custom HTTP Request Tool**

Instead of using the basic webhook approach, you need to use a **Custom HTTP Request Tool** that properly defines the parameters. Here's the fix:

### **Step 1: Replace Your Current Tools**

In your MCP Server Trigger, replace the webhook HTTP request nodes with **Custom HTTP Request Tool** nodes that have proper schema definitions.

### **Step 2: Updated Tool Configuration**

Here's the correct JSON schema for your Search Videos Tool:

```json
{
  "parameters": {
    "name": "Search_Videos_Tool",
    "description": "Search for videos in the database. Required parameter: query (string). Optional: filters object with limit, page, skillLevel, topic, etc.",
    "httpMethod": "POST",
    "url": "http://host.docker.internal:5678/webhook/6ab4de58-b889-4c16-869e-743839d89ea6",
    "authentication": "none",
    "sendBody": true,
    "specifyBody": "json",
    "jsonBody": "={{ JSON.stringify({\n  query: $input.query,\n  filters: $input.filters || {}\n}) }}",
    "schema": {
      "type": "object",
      "properties": {
        "query": {
          "type": "string",
          "description": "Search query for videos"
        },
        "filters": {
          "type": "object",
          "description": "Optional search filters",
          "properties": {
            "limit": {
              "type": "number",
              "description": "Number of results to return",
              "default": 10
            },
            "page": {
              "type": "number", 
              "description": "Page number for pagination",
              "default": 1
            },
            "skillLevel": {
              "type": "string",
              "description": "Filter by skill level",
              "enum": ["beginner", "intermediate", "advanced"]
            },
            "topic": {
              "type": "string",
              "description": "Filter by topic/category"
            }
          }
        }
      },
      "required": ["query"]
    }
  },
  "name": "Search Videos Tool",
  "type": "n8n-nodes-langchain.toolHttpRequest",
  "typeVersion": 1
}
```

## **🛠️ Implementation Script**

Let me create a fixed workflow for you:
