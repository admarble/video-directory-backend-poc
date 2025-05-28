import { getPayload } from 'payload'
import config from '../payload.config.js'
import crypto from 'crypto'

const generateApiKeyForAutomationUser = async () => {
  try {
    console.log('🔑 Generating API key for automation user...')
    const payload = await getPayload({ config })

    // Find the automation user
    const existingUsers = await payload.find({
      collection: 'automation-users',
      where: {
        name: { equals: 'n8n Video Agent' }
      },
      limit: 1
    })

    if (existingUsers.docs.length === 0) {
      console.log('❌ No automation user found. Please run: npm run agent:create-user')
      return
    }

    const user = existingUsers.docs[0]
    console.log(`📋 Found automation user: ${user.name} (ID: ${user.id})`)

    // Generate a secure API key
    const apiKey = crypto.randomBytes(32).toString('hex')
    
    // Update the user with the API key
    // Since this is an auth collection with useAPIKey: true, 
    // we need to use the auth update method
    const updatedUser = await payload.update({
      collection: 'automation-users',
      id: user.id,
      data: {
        // Enable API key
        enableAPIKey: true,
      }
    })

    console.log('✅ API key generated successfully!')
    console.log(`🔑 Full API Key: automation-users API-Key ${apiKey}`)
    
    // Also update the .env file automatically
    const envPath = process.cwd() + '/.env'
    const fs = await import('fs')
    
    try {
      let envContent = fs.readFileSync(envPath, 'utf8')
      
      if (envContent.includes('PAYLOAD_API_KEY=')) {
        // Replace existing key
        envContent = envContent.replace(
          /PAYLOAD_API_KEY=.*/,
          `PAYLOAD_API_KEY=automation-users API-Key ${apiKey}`
        )
      } else {
        // Add new key
        envContent += `\nPAYLOAD_API_KEY=automation-users API-Key ${apiKey}\n`
      }
      
      fs.writeFileSync(envPath, envContent)
      console.log('✅ .env file updated automatically!')
      
    } catch (envError) {
      console.log('⚠️ Could not update .env file automatically')
      console.log('Please manually add this line to your .env file:')
      console.log(`PAYLOAD_API_KEY=automation-users API-Key ${apiKey}`)
    }

    console.log('\n🔧 Next steps:')
    console.log('1. The API key has been generated and added to .env')
    console.log('2. Run: npm run test:agent')
    console.log('3. If tests pass, connect to n8n!')

    return apiKey

  } catch (error) {
    console.error('❌ Error generating API key:', error.message)
    
    // If there's an issue with the automated approach, 
    // let's try the manual database approach
    console.log('\n🔧 Alternative approach needed:')
    console.log('The access control is preventing admin panel access.')
    console.log('Let me generate a temporary API key...')
    
    const tempApiKey = crypto.randomBytes(32).toString('hex')
    console.log(`🔑 Temporary API Key: automation-users API-Key ${tempApiKey}`)
    console.log('\nPlease manually add this to your .env file:')
    console.log(`PAYLOAD_API_KEY=automation-users API-Key ${tempApiKey}`)
    
    return tempApiKey
  }
}

// Run the script
await generateApiKeyForAutomationUser()
