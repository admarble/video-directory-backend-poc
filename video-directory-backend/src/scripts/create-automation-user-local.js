import { getPayload } from 'payload'
import config from '../payload.config.js'
import type { AutomationUser } from '../payload-types.js'

const createAutomationUser = async () => {
  try {
    console.log('🚀 Creating automation user...')
    const payload = await getPayload({ config })

    // Check if automation user already exists
    const existing = await payload.find({
      collection: 'automation-users',
      where: {
        name: { equals: 'n8n Video Agent' }
      }
    })

    if (existing.docs.length > 0) {
      console.log('⚠️ Automation user already exists!')
      const user = existing.docs[0] as AutomationUser
      console.log(`📋 User ID: ${user.id}`)
      console.log(`👤 Name: ${user.name}`)
      
      // Try to get the full user with API key from the auth endpoint
      try {
        const userWithAuth = await payload.findByID({
          collection: 'automation-users',
          id: user.id,
        })
        
        if (userWithAuth.apiKey) {
          console.log(`🔑 API Key: automation-users API-Key ${userWithAuth.apiKey}`)
        } else {
          console.log('🔑 API Key: Not available (check admin panel)')
          console.log('💡 Go to http://localhost:3001/admin -> Automation Users -> Edit User -> Generate API Key')
        }
      } catch (_authError) {
        console.log('🔑 API Key: Check admin panel for API key generation')
      }
      
      return user
    }

    // Create new automation user
    const automationUser = await payload.create({
      collection: 'automation-users',
      data: {
        name: 'n8n Video Agent',
        purpose: 'AI agent for automated video curation',
        permissions: 'video-full',
        rateLimitTier: 'high',
        isActive: true,
      },
    }) as AutomationUser

    console.log('✅ Automation user created successfully!')
    console.log(`📋 User ID: ${automationUser.id}`)
    console.log(`👤 Name: ${automationUser.name}`)
    console.log(`🎯 Purpose: ${automationUser.purpose}`)
    console.log(`🔐 Permissions: ${automationUser.permissions}`)
    console.log(`⚡ Rate Limit: ${automationUser.rateLimitTier}`)
    console.log(`✅ Active: ${automationUser.isActive}`)

    if (automationUser.apiKey) {
      console.log(`🔑 API Key: automation-users API-Key ${automationUser.apiKey}`)
    } else {
      console.log('🔑 API Key: Not generated in response')
      console.log('💡 Go to http://localhost:3001/admin -> Automation Users -> Edit User -> Enable API Key')
    }

    console.log('\n🔧 Next steps:')
    console.log('1. Open http://localhost:3001/admin')
    console.log('2. Go to Automation Users -> n8n Video Agent')
    console.log('3. Enable API Key and copy it')
    console.log('4. Update your .env file: PAYLOAD_API_KEY=automation-users API-Key YOUR_KEY')
    console.log('5. Run: npm run test:agent')

    return automationUser

  } catch (error) {
    console.error('❌ Error creating automation user:', error instanceof Error ? error.message : 'Unknown error')
    console.error('🔍 Full error:', error)
    throw error
  }
}

// Run the script
await createAutomationUser()
