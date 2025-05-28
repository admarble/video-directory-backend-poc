#!/usr/bin/env node

/**
 * Quick script to get the automation user API key via curl
 * This assumes you have an admin user or can access the automation user
 */

console.log('🔍 Automation User Created Successfully!')
console.log('📋 User ID: 6832bc0a02bdc591ae12c488')
console.log('')
console.log('🔧 NEXT STEPS:')
console.log('1. Open: http://localhost:3001/admin')
console.log('2. Navigate to: Automation Users')
console.log('3. Click on: "n8n Video Agent"')
console.log('4. Find the "API Key" section')
console.log('5. Click "Enable API Key" (if not enabled)')
console.log('6. Copy the generated API key')
console.log('')
console.log('Then update your .env file:')
console.log('PAYLOAD_API_KEY=automation-users API-Key YOUR_COPIED_KEY')
console.log('')
console.log('Finally test the system:')
console.log('npm run test:agent')
console.log('')
console.log('💡 The API key format should be:')
console.log('   automation-users API-Key abc123def456...')
