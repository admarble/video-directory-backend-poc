// Script to create an automation user for the AI agent system
export const createAutomationUser = async ({ payload, args }) => {
  try {
    const { 
      name = 'n8n Video Agent',
      purpose = 'AI agent for automated video curation',
      permissions = 'Video Management (Full)',
      rateLimitTier = 'high',
      isActive = true
    } = args;

    console.log('🤖 Creating automation user...');
    
    // Check if automation user with the name already exists
    const { docs } = await payload.find({
      collection: 'automation-users',
      where: {
        name: { equals: name },
      },
    });

    if (docs.length > 0) {
      console.log(`⚠️  Automation user with name "${name}" already exists.`);
      const existingUser = docs[0];
      
      // Generate API key if it doesn't exist
      if (!existingUser.apiKey) {
        console.log('🔑 Generating API key for existing user...');
        const updatedUser = await payload.update({
          collection: 'automation-users',
          id: existingUser.id,
          data: {
            // This will trigger the API key generation in the beforeChange hook
            regenerateApiKey: true,
          },
        });
        
        console.log('✅ API key generated for existing user');
        console.log(`📋 User ID: ${existingUser.id}`);
        console.log(`🔑 API Key: automation-users API-Key ${updatedUser.apiKey}`);
        
        return {
          success: true,
          user: updatedUser,
          apiKey: `automation-users API-Key ${updatedUser.apiKey}`,
          existing: true
        };
      } else {
        console.log('✅ Existing user already has API key');
        console.log(`📋 User ID: ${existingUser.id}`);
        console.log(`🔑 API Key: automation-users API-Key ${existingUser.apiKey}`);
        
        return {
          success: true,
          user: existingUser,
          apiKey: `automation-users API-Key ${existingUser.apiKey}`,
          existing: true
        };
      }
    }

    // Create the automation user
    console.log(`📝 Creating new automation user: ${name}`);
    const automationUser = await payload.create({
      collection: 'automation-users',
      data: {
        name,
        purpose,
        permissions,
        rateLimitTier,
        isActive,
      },
    });

    console.log('✅ Automation user created successfully');
    console.log(`📋 User ID: ${automationUser.id}`);
    console.log(`👤 Name: ${automationUser.name}`);
    console.log(`🎯 Purpose: ${automationUser.purpose}`);
    console.log(`🔐 Permissions: ${automationUser.permissions}`);
    console.log(`⚡ Rate Limit: ${automationUser.rateLimitTier}`);
    console.log(`✅ Active: ${automationUser.isActive}`);
    console.log(`🔑 API Key: automation-users API-Key ${automationUser.apiKey}`);
    
    console.log('\n🔧 Next steps:');
    console.log('1. Copy the API key above');
    console.log('2. Update your .env file: PAYLOAD_API_KEY=automation-users API-Key YOUR_KEY');
    console.log('3. Update your n8n.env file with the same API key');
    console.log('4. Run: npm run test:agent');

    return {
      success: true,
      user: automationUser,
      apiKey: `automation-users API-Key ${automationUser.apiKey}`,
      existing: false
    };
    
  } catch (error) {
    console.error('❌ Error creating automation user:', error.message);
    console.error('🔍 Full error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export default createAutomationUser;
