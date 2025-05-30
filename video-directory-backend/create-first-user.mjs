import { getPayload } from 'payload'
import config from './src/payload.config.ts'

async function createFirstUser() {
  try {
    const payload = await getPayload({ config })
    
    // Check if users already exist
    const existingUsers = await payload.count({
      collection: 'users'
    })
    
    console.log('Existing users count:', existingUsers.totalDocs)
    
    if (existingUsers.totalDocs === 0) {
      console.log('Creating first admin user...')
      
      const user = await payload.create({
        collection: 'users',
        data: {
          email: 'admin@videodirectory.com',
          password: 'admin123',
          role: 'admin'
        }
      })
      
      console.log('First admin user created successfully!')
      console.log('Email: admin@videodirectory.com')
      console.log('Password: admin123')
      console.log('User ID:', user.id)
    } else {
      console.log('Users already exist. Listing existing users:')
      
      const users = await payload.find({
        collection: 'users',
        limit: 10
      })
      
      users.docs.forEach((user, index) => {
        console.log(`User ${index + 1}: ${user.email} (Role: ${user.role})`)
      })
    }
    
    process.exit(0)
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

createFirstUser()
