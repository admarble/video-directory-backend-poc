#!/bin/bash

echo "🚀 Installing production-ready dependencies for Video Directory Backend..."

# Critical SEO & Security packages
pnpm add @payloadcms/plugin-seo helmet compression express-rate-limit cors

# Performance & Monitoring packages  
pnpm add winston winston-daily-rotate-file @sentry/node redis ioredis

# Search & Analytics packages
pnpm add mongodb-atlas-search node-cron

# Development tools
pnpm add -D @types/cors @types/compression

echo "✅ All production dependencies installed!"
echo ""
echo "Next Steps:"
echo "1. Update payload.config.ts with new plugins"
echo "2. Add security middleware"
echo "3. Configure environment variables"
echo "4. Test the setup with: npm run dev"
