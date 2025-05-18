// Script to create an admin user
export const createAdmin = async ({ payload, args }) => {
  try {
    const { email, password } = args;

    if (!email || !password) {
      console.error('Email and password are required. Usage: payload run create-admin --email=newadmin@example.com --password=securepassword');
      process.exit(1);
    }

    // Check if user with the email already exists
    const { docs } = await payload.find({
      collection: 'users',
      where: {
        email: { equals: email },
      },
    });

    if (docs.length > 0) {
      console.error(`User with email ${email} already exists.`);
      process.exit(1);
    }

    // Create the admin user
    const _user = await payload.create({
      collection: 'users',
      data: {
        email,
        password,
        roles: ['admin'],
      },
    });

    console.log(`Admin user created successfully: ${email}`);
    return true;
  } catch (error) {
    console.error('Error creating admin user:', error.message);
    return false;
  }
};

export default createAdmin; 