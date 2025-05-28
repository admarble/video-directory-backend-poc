#!/usr/bin/env node

/**
 * Check if automation user exists and has the correct API key
 */

import { getPayload } from 'payload'
import config from './src/payload.config.ts'

async function checkAutomationUser() {
  try {
    const payload = await getPayload({ config })
    
    // Check if any automation users exist
    const result = await payload.find({
      collection: 'automation-users',
      limit: 10
    })
    
    console.log(`Found ${result.docs.length} automation users:`)
    
    result.docs.forEach((user, index) => {
      console.log(`\n${index + 1}. ${user.name}`)
      console.log(`   ID: ${user.id}`)
      console.log(`   API Key: ${user.apiKey}`)
      console.log(`   Active: ${user.isActive}`)
      console.log(`   Permissions: ${user.permissions}`)
    })
    
    // Check for the specific API key from .env
    const envApiKey = 'd0a7e5c-f1d3-4b2e-8e83-23d9544b77d1'
    const matchingUser = result.docs.find(user => user.apiKey === envApiKey)
    
    if (matchingUser) {
      console.log(`\n✅ Found matching user for API key: ${matchingUser.name}`)
      console.log(`   Active: ${matchingUser.isActive}`)
      console.log(`   Permissions: ${matchingUser.permissions}`)
    } else {
      console.log(`\n❌ No user found with API key: ${envApiKey}`)
      console.log('This is why authentication is failing!')
    }
    
  } catch (error) {
    console.error('Error checking automation users:', error)
  }
  
  process.exit(0)
}

checkAutomationUser()
