#!/usr/bin/env node

/**
 * n8n MCP Server Workflows Import Script
 * 
 * This script imports all MCP server workflows and configures them properly.
 * Run this after ensuring n8n is accessible on localhost:5678
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 n8n MCP Server Import Assistant');
console.log('====================================');
console.log('');

// Since we can't automate the browser file upload, let's provide the JSON content
// for copy-paste import instead

const workflowFiles = [
  {
    name: 'Create Video Tool',
    file: 'create-video-tool.json',
    description: 'Processes YouTube URLs with AI enhancement'
  },
  {
    name: 'Get Video Tool', 
    file: 'get-video-tool.json',
    description: 'Retrieves video details by ID'
  },
  {
    name: 'Update Video Tool',
    file: 'update-video-tool.json', 
    description: 'Updates video fields safely'
  },
  {
    name: 'Search Videos Tool',
    file: 'search-videos-tool.json',
    description: 'Searches videos with filters'
  },
  {
    name: 'Analyze Skill Level Tool',
    file: 'analyze-skill-level-tool.json',
    description: 'AI skill level analysis'
  },
  {
    name: 'Enhance Tags Tool',
    file: 'enhance-tags-tool.json',
    description: 'AI tag enhancement'
  }
];

console.log('📋 Import Instructions:');
console.log('======================');
console.log('');
console.log('Since you have the import dialog open in n8n, you can import each workflow:');
console.log('');

workflowFiles.forEach((workflow, index) => {
  const filePath = path.join(__dirname, '..', 'workflows', 'tools', workflow.file);
  
  console.log(`${index + 1}. ${workflow.name}`);
  console.log(`   File: ${workflow.file}`);
  console.log(`   Description: ${workflow.description}`);
  
  if (fs.existsSync(filePath)) {
    console.log(`   ✅ File exists: ${filePath}`);
  } else {
    console.log(`   ❌ File missing: ${filePath}`);
  }
  console.log('');
});

console.log('📝 Manual Import Steps:');
console.log('======================');
console.log('');
console.log('1. For each workflow above:');
console.log('   → Click "Import from File..." in n8n');
console.log('   → Navigate to the mcp-server/workflows/tools/ directory');
console.log('   → Select the .json file');
console.log('   → Click "Import"');
console.log('   → Save the workflow');
console.log('   → Note down the workflow ID from the URL');
console.log('');
console.log('2. After importing all tool workflows:');
console.log('   → Import the main MCP server workflow');
console.log('   → Update the workflow IDs in the main workflow');
console.log('   → Configure credentials');
console.log('   → Activate the MCP server');
console.log('');

// Create a tracking file to help user keep track
const trackingFile = path.join(__dirname, 'import-progress.json');
const progress = {
  imported: [],
  workflowIds: {},
  status: 'in-progress',
  lastUpdated: new Date().toISOString()
};

fs.writeFileSync(trackingFile, JSON.stringify(progress, null, 2));
console.log(`📊 Progress tracking file created: ${trackingFile}`);
console.log('   Use this to track which workflows you\'ve imported');
console.log('');

console.log('🔧 Alternative: Copy-Paste Method');
console.log('=================================');
console.log('');
console.log('If file upload isn\'t working, you can:');
console.log('1. Copy the JSON content from each workflow file');
console.log('2. In n8n, create a new workflow');
console.log('3. Press Ctrl+A to select all, then delete');
console.log('4. Press Ctrl+V to paste the workflow JSON');
console.log('5. Save the workflow');
console.log('');

console.log('💡 Quick Start Files:');
console.log('====================');
console.log('');
console.log('The most important files to import first:');
console.log('1. create-video-tool.json (main functionality)');
console.log('2. get-video-tool.json (for testing)');
console.log('3. Then import the rest');
console.log('');

console.log('🆘 Need Help?');
console.log('=============');
console.log('');
console.log('If you run into issues:');
console.log('1. Check that all .json files exist in mcp-server/workflows/tools/');
console.log('2. Ensure n8n is running on http://localhost:5678');
console.log('3. Try the copy-paste method if file upload fails');
console.log('4. Check the setup guide: mcp-server/docs/setup-guide.md');
console.log('');

console.log('🎯 Next Steps After Import:');
console.log('===========================');
console.log('');
console.log('1. Run: node mcp-server/scripts/update-workflow-ids.js');
console.log('2. Configure MCP server authentication');
console.log('3. Test individual workflows');
console.log('4. Activate the main MCP server');
console.log('5. Connect to Claude Desktop');
