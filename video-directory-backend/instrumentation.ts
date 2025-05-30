export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Pre-warm database connections for better performance
    if (process.env.NODE_ENV === 'development') {
      try {
        const { warmupConnections } = await import('./src/lib/warmup')
        // Don't await - run in background to avoid blocking startup
        warmupConnections().catch(console.error)
      } catch (error) {
        console.error('Failed to import warmup:', error)
      }
    }
    
    // Sentry removed for POC - not needed for core functionality
    // await import('./src/utils/sentry')
  }
}
