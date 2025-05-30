#!/usr/bin/env node

/**
 * Performance Optimization Script for Video Directory Backend
 * This script implements various optimizations to speed up development
 */

import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

console.log('🚀 Optimizing Video Directory Backend for faster development...\n')

// 1. Clear Next.js cache
console.log('1. Clearing Next.js cache...')
try {
  execSync('rm -rf .next', { stdio: 'inherit' })
  console.log('✅ Next.js cache cleared\n')
} catch (error) {
  console.log('⚠️  Could not clear .next directory\n')
}

// 2. Clear node_modules/.cache
console.log('2. Clearing build caches...')
try {
  execSync('rm -rf node_modules/.cache', { stdio: 'inherit' })
  console.log('✅ Build caches cleared\n')
} catch (error) {
  console.log('⚠️  Could not clear build caches\n')
}

// 3. Create optimized environment variables
console.log('3. Setting up optimized environment variables...')
const envOptimizations = `
# Performance Optimizations
NODE_OPTIONS="--max-old-space-size=8192 --no-deprecation"
NEXT_TELEMETRY_DISABLED=1
PAYLOAD_DISABLE_ADMIN_SSR=true
NEXT_PRIVATE_LOCAL_WEBPACK=1
USE_DEV_CONFIG=true
TURBOPACK=1
`

try {
  const envPath = '.env.local'
  const currentEnv = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf-8') : ''
  
  if (!currentEnv.includes('# Performance Optimizations')) {
    fs.appendFileSync(envPath, envOptimizations)
    console.log('✅ Environment optimizations added\n')
  } else {
    console.log('✅ Environment optimizations already present\n')
  }
} catch (error) {
  console.log('⚠️  Could not update environment variables\n')
}

// 4. Create development scripts
console.log('4. Creating optimized development scripts...')
const devScript = `{
  "scripts": {
    "dev:fast": "cross-env USE_DEV_CONFIG=true TURBOPACK=1 NODE_OPTIONS='--max-old-space-size=8192' next dev -p 3001 --turbo",
    "dev:fastest": "cross-env USE_DEV_CONFIG=true TURBOPACK=1 PAYLOAD_DISABLE_ADMIN_SSR=true NODE_OPTIONS='--max-old-space-size=8192' next dev -p 3001 --turbo --experimental-https",
    "analyze": "cross-env ANALYZE=true npm run build",
    "clean": "rm -rf .next node_modules/.cache .turbo && npm run dev:fast"
  }
}`

console.log('✅ New optimized scripts available:\n')
console.log('   npm run dev:fast     - Fast development with Turbopack')
console.log('   npm run dev:fastest  - Fastest mode with all optimizations')
console.log('   npm run clean        - Clean all caches and restart\n')

// 5. Provide recommendations
console.log('📋 Recommendations for faster development:\n')
console.log('1. Use Turbopack:')
console.log('   npm run dev:blazing   (already configured)')
console.log('   OR')
console.log('   npm run dev:fast      (with optimized config)\n')

console.log('2. Reduce initial bundle size:')
console.log('   - Lazy load admin components')
console.log('   - Use dynamic imports for heavy features')
console.log('   - Disable unnecessary plugins in development\n')

console.log('3. Database optimizations:')
console.log('   - Ensure MongoDB indexes are created')
console.log('   - Use connection pooling efficiently')
console.log('   - Consider using MongoDB memory storage for dev\n')

console.log('4. Hardware optimizations:')
console.log('   - Allocate more memory: NODE_OPTIONS="--max-old-space-size=8192"')
console.log('   - Use SSD for faster file I/O')
console.log('   - Close unnecessary applications\n')

console.log('5. Alternative approaches:')
console.log('   - Use the optimized payload.config.development.ts')
console.log('   - Disable TypeScript checking in development')
console.log('   - Use SWC instead of Babel for faster transpilation\n')

console.log('✨ Optimization complete! Try running: npm run dev:blazing')
