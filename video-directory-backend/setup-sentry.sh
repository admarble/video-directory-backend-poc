#!/bin/bash

# Sentry Setup Script for Video Directory Backend
# This script sets up error monitoring and performance tracking

echo "🔧 Setting up Sentry error monitoring..."

# Check if Sentry is already configured
if [ -f "sentry.properties" ]; then
    echo "⚠️ Sentry already configured. Skipping setup..."
    exit 0
fi

# Install Sentry CLI if not present
if ! command -v sentry-cli &> /dev/null; then
    echo "📦 Installing Sentry CLI..."
    npm install -g @sentry/cli
fi

# Create Sentry configuration
echo "📝 Creating Sentry configuration..."

# Create sentry.properties file
cat > sentry.properties << EOF
defaults.url=https://sentry.io/
defaults.org=${SENTRY_ORG:-your-org}
defaults.project=${SENTRY_PROJECT:-video-directory}
auth.token=${SENTRY_AUTH_TOKEN:-your-auth-token}
EOF

# Create next.config.sentry.mjs with Sentry integration
cat > next.config.sentry.mjs << 'EOF'
import { withPayload } from '@payloadcms/next/withPayload'
import { withSentryConfig } from '@sentry/nextjs'

/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['sharp'],
  distDir: '.next',
  output: 'standalone',
  poweredByHeader: false,
  // Sentry configuration
  sentry: {
    hideSourceMaps: true,
    widenClientFileUpload: true,
  },
}

const payloadConfig = withPayload(nextConfig, { 
  devBundleServerPackages: true,
  configPath: './src/payload.config.ts' 
})

const sentryWebpackPluginOptions = {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: true,
  authToken: process.env.SENTRY_AUTH_TOKEN,
}

export default withSentryConfig(payloadConfig, sentryWebpackPluginOptions)
EOF

# Create Sentry configuration file
mkdir -p src/utils
cat > src/utils/sentry.ts << 'EOF'
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV || 'development',
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Performance monitoring
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
    new Sentry.Integrations.Express({ app: undefined }),
  ],
  
  // Error filtering
  beforeSend(event, hint) {
    // Filter out known non-critical errors
    if (event.exception) {
      const error = hint.originalException
      if (error && typeof error === 'object' && 'code' in error) {
        // Skip MongoDB connection errors in development
        if (error.code === 'ECONNREFUSED' && process.env.NODE_ENV !== 'production') {
          return null
        }
      }
    }
    return event
  },
  
  // Add user context
  initialScope: {
    tags: {
      component: 'video-directory-backend',
    },
  },
})

export default Sentry
EOF

# Create instrumentation file for Sentry
cat > instrumentation.ts << 'EOF'
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./src/utils/sentry')
  }
}
EOF

# Add Sentry middleware
cat > src/middleware/sentry.ts << 'EOF'
import { NextRequest, NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'

export function sentryMiddleware(req: NextRequest, res: NextResponse) {
  // Set user context for Sentry
  Sentry.configureScope((scope) => {
    scope.setTag('path', req.nextUrl.pathname)
    scope.setContext('request', {
      url: req.url,
      method: req.method,
      headers: Object.fromEntries(req.headers.entries()),
    })
  })

  return res
}

// Error boundary for API routes
export function withSentryErrorBoundary<T extends (...args: any[]) => any>(handler: T): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await handler(...args)
    } catch (error) {
      Sentry.captureException(error)
      throw error
    }
  }) as T
}
EOF

# Update environment variables
echo "🔧 Adding Sentry environment variables..."

# Add to .env.production.example
cat >> .env.production.example << 'EOF'

# Sentry Configuration
SENTRY_DSN=your-sentry-dsn-here
SENTRY_ORG=your-sentry-org
SENTRY_PROJECT=video-directory
SENTRY_AUTH_TOKEN=your-sentry-auth-token
EOF

# Add npm script
echo "📝 Adding Sentry npm scripts..."
npm pkg set scripts.sentry:sourcemaps="sentry-cli sourcemaps inject --org \$SENTRY_ORG --project \$SENTRY_PROJECT .next && sentry-cli sourcemaps upload --org \$SENTRY_ORG --project \$SENTRY_PROJECT .next"

echo "✅ Sentry setup complete!"
echo ""
echo "🔧 Next steps:"
echo "1. Create a Sentry account at https://sentry.io"
echo "2. Create a new project for 'video-directory'"
echo "3. Copy your DSN and add it to your .env.production file"
echo "4. Replace next.config.mjs with next.config.sentry.mjs"
echo "5. Test error tracking with: npm run dev"
echo ""
echo "📊 Sentry will now track:"
echo "- Application errors and exceptions"
echo "- Performance monitoring"
echo "- API endpoint performance"
echo "- Database query performance"
echo "- User session data (anonymized)"
