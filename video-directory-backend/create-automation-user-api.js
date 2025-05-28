#!/usr/bin/env node

/**
 * Create automation user via direct Payload API
 */

import 'dotenv/config';

async function createAutomationUser() {
  try {
    console.log('🚀 Creating automation user via API...');

    const payload = {
      name: 'n8n Video Agent',
      purpose: 'AI agent for automated video curation',
      permissions: 'video-full',
      rateLimitTier: 'high',
      isActive: true
    };

    const response = await fetch('http://localhost:3001/api/automation-users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Automation user created successfully!');
      console.log(`📋 User ID: ${result.doc.id}`);
      console.log(`👤 Name: ${result.doc.name}`);
      console.log(`🔑 API Key: automation-users API-Key ${result.doc.apiKey}`);
      
      console.log('\n🔧 Next steps:');
      console.log('1. Copy the API key above');
      console.log('2. Update your .env file with the API key');
      
      return result.doc.apiKey;
    } else {
      const error = await response.text();
      console.error(`❌ Failed to create automation user: ${response.status}`);
      console.error(`Response: ${error}`);
      return null;
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    return null;
  }
}

// Run if called directly
if (import.meta.url === new URL(process.argv[1], 'file:').href) {
  createAutomationUser();
}

export default createAutomationUser;
