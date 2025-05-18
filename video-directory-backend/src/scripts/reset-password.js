// Password reset functionality for Payload CMS user accounts

export const resetPassword = async ({ payload, args }) => {
  const { email, password } = args;

  if (!email || !password) {
    console.error('Email and password are required. Usage: payload run reset-password --email=user@example.com --password=newpassword');
    process.exit(1);
  }

  try {
    // Find the user by email
    const { docs: users } = await payload.find({
      collection: 'users',
      where: {
        email: { equals: email },
      },
    });

    if (!users.length) {
      console.error(`No user found with email: ${email}`);
      process.exit(1);
    }

    const userId = users[0].id;

    // Update the user's password - Payload will handle hashing internally
    await payload.update({
      collection: 'users',
      id: userId,
      data: {
        password,
      },
    });

    console.log(`Password reset successfully for user: ${email}`);
    return true;
  } catch (error) {
    console.error('Error resetting password:', error);
    return false;
  }
};

export default resetPassword; 