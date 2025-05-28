export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Sentry removed for POC - not needed for core functionality
    // await import('./src/utils/sentry')
  }
}
