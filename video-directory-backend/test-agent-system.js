#!/usr/bin/env node

/**
 * Test script for AI Agent Video Curation System
 * 
 * This script tests all the endpoints and functionality
 * to ensure everything is working correctly.
 */

import https from 'https';
import http from 'http';

// Configuration
const PAYLOAD_URL = process.env.PAYLOAD_CMS_URL || 'http://localhost:3001';
const API_KEY = process.env.PAYLOAD_API_KEY || 'automation-users API-Key YOUR_KEY_HERE';
const TEST_VIDEO_URL = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'; // Rick Roll for testing

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https');
    const client = isHttps ? https : http;
    
    const req = client.request(url, {
      method: options.method || 'GET',
      headers: {
        'Authorization': API_KEY,
        'Content-Type': 'application/json',
        ...options.headers
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });
    
    req.on('error', reject);
    
    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    
    req.end();
  });
}

async function testEndpoint(name, url, options = {}) {
  log(`\n🧪 Testing ${name}...`, 'blue');
  try {
    const result = await makeRequest(url, options);
    
    if (result.status >= 200 && result.status < 300) {
      log(`✅ ${name}: PASSED (${result.status})`, 'green');
      return { success: true, result };
    } else {
      log(`❌ ${name}: FAILED (${result.status})`, 'red');
      log(`   Response: ${JSON.stringify(result.data).substring(0, 200)}...`, 'yellow');
      return { success: false, result };
    }
  } catch (error) {
    log(`❌ ${name}: ERROR - ${error.message}`, 'red');
    return { success: false, error };
  }
}

async function runTests() {
  log('🚀 Starting AI Agent Video Curation System Tests', 'blue');
  log('================================================', 'blue');
  
  const results = {};
  
  // Test 1: Check if Payload CMS is running  
  results.payloadHealth = await testEndpoint(
    'Payload CMS Health Check',
    `${PAYLOAD_URL}/api/videos?limit=1`
  );
  
  if (!results.payloadHealth.success) {
    log('\n❌ Payload CMS is not accessible. Please check if it\'s running.', 'red');
    return;
  }
  
  // Test 2: Check automation user authentication
  results.authTest = await testEndpoint(
    'Automation User Authentication',
    `${PAYLOAD_URL}/api/automation-users`
  );
  
  // Test 3: Test YouTube API endpoint
  results.youtubeAPI = await testEndpoint(
    'YouTube API Integration',
    `${PAYLOAD_URL}/api/youtube?url=${encodeURIComponent(TEST_VIDEO_URL)}`
  );
  
  // Test 4: Test skill level analyzer
  results.skillLevel = await testEndpoint(
    'Skill Level Analyzer',
    `${PAYLOAD_URL}/api/ai-tools/skill-level`,
    {
      method: 'POST',
      body: {
        title: 'Getting Started with React - Complete Beginner Tutorial',
        description: 'Learn React from scratch in this comprehensive tutorial for beginners.',
        tags: ['react', 'javascript', 'tutorial']
      }
    }
  );
  
  // Test 5: Test enhanced tags analyzer  
  results.enhancedTags = await testEndpoint(
    'Enhanced Tags Analyzer',
    `${PAYLOAD_URL}/api/ai-tools/enhanced-tags`,
    {
      method: 'POST', 
      body: {
        title: 'Building a Full Stack App with Next.js and MongoDB',
        description: 'Complete tutorial on building a modern web application using Next.js, MongoDB, and TypeScript.',
        existingTags: ['nextjs', 'mongodb']
      }
    }
  );
  
  // Test 6: Test full video creation orchestrator
  results.createVideo = await testEndpoint(
    'Video Creation Orchestrator',
    `${PAYLOAD_URL}/api/ai-tools/create-video`,
    {
      method: 'POST',
      body: {
        youtubeUrl: TEST_VIDEO_URL,
        enhanceTags: true,
        analyzeSkillLevel: true,
        uploadThumbnail: false, // Skip thumbnail for testing
        published: false
      }
    }
  );
  
  // Summary
  log('\n📊 TEST SUMMARY', 'blue');
  log('=================', 'blue');
  
  const testNames = [
    'payloadHealth',
    'authTest', 
    'youtubeAPI',
    'skillLevel',
    'enhancedTags',
    'createVideo'
  ];
  
  const passed = testNames.filter(test => results[test]?.success).length;
  const total = testNames.length;
  
  testNames.forEach(test => {
    const result = results[test];
    const status = result?.success ? '✅ PASS' : '❌ FAIL';
    const name = test.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    log(`${status} - ${name}`, result?.success ? 'green' : 'red');
  });
  
  log(`\n🎯 Overall: ${passed}/${total} tests passed`, passed === total ? 'green' : 'yellow');
  
  if (passed === total) {
    log('\n🎉 All systems are working! Your AI agent is ready to use.', 'green');
    log('\nNext steps:', 'blue');
    log('1. Set up n8n with the provided workflow', 'blue');
    log('2. Configure your API keys in n8n environment', 'blue');
    log('3. Test the full workflow with a real video URL', 'blue');
  } else {
    log('\n⚠️  Some tests failed. Please check the errors above.', 'yellow');
    log('\nCommon fixes:', 'blue');
    log('1. Ensure Payload CMS is running: npm run dev', 'blue');
    log('2. Create an automation user and get the API key', 'blue');
    log('3. Set your YOUTUBE_API_KEY environment variable', 'blue');
    log('4. Check your PAYLOAD_API_KEY format', 'blue');
  }
  
  // Clean up test video if created
  if (results.createVideo?.success && results.createVideo.result?.data?.videoId) {
    log('\n🧹 Cleaning up test video...', 'yellow');
    await testEndpoint(
      'Clean up test video',
      `${PAYLOAD_URL}/api/videos/${results.createVideo.result.data.videoId}`,
      { method: 'DELETE' }
    );
  }
}

// Run tests if called directly
const isMainModule = import.meta.url.startsWith('file:') && 
  import.meta.url === new URL(process.argv[1], 'file:').href;

if (isMainModule) {
  runTests().catch(error => {
    log(`\n💥 Test runner error: ${error.message}`, 'red');
    process.exit(1);
  });
}

export { runTests, testEndpoint };
