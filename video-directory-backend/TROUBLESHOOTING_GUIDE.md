# Troubleshooting Guide: Next.js + Payload CMS Vendor Chunk Issues

## Common Symptoms
- `Error: Cannot find module './vendor-chunks/[package]@[version].js'`
- Build failures with webpack module resolution errors
- Development server failing to start
- Admin panel not loading

## Quick Fixes

### 1. Dependency Version Conflicts
```bash
# Clean install
rm -rf node_modules .next pnpm-lock.yaml
pnpm install

# Check for version conflicts
pnpm why [package-name]
```

### 2. Cache Issues
```bash
# Clear Next.js cache
rm -rf .next

# Clear pnpm cache
pnpm store prune

# Restart dev server
pnpm run dev
```

### 3. Webpack Configuration Issues
Check your `next.config.mjs` includes:
```javascript
webpack: (config, { isServer }) => {
  // Add proper module resolution
  config.resolve.alias = {
    ...config.resolve.alias,
    'problematic-package': require.resolve('problematic-package'),
  }
  return config
}
```

## Advanced Debugging

### Check Payload Admin Routes
```javascript
// In your layout or page file
console.log('Payload config:', process.env.PAYLOAD_CONFIG_PATH)
```

### Verify Environment Variables
```bash
# Check required env vars
grep -E "(MONGODB_URI|PAYLOAD_SECRET)" .env*
```

### Test Database Connection
```javascript
// Create test-db.js
import { getPayload } from 'payload'
import config from './src/payload.config.ts'

async function testDB() {
  try {
    const payload = await getPayload({ config })
    console.log('✅ Database connected successfully')
    process.exit(0)
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    process.exit(1)
  }
}

testDB()
```

## Prevention Strategies

### 1. Lock Dependencies
```json
{
  "pnpm": {
    "overrides": {
      "problematic-package": "^exact.version.here"
    }
  }
}
```

### 2. Use Exact Versions for Critical Packages
```json
{
  "dependencies": {
    "payload": "3.39.1",
    "next": "15.3.0",
    "react": "19.1.0"
  }
}
```

### 3. Regular Updates
```bash
# Check outdated packages
pnpm outdated

# Update with caution
pnpm update --interactive
```

## Emergency Recovery

If your project is completely broken:

1. **Backup Current State**
```bash
cp package.json package.json.backup
cp next.config.mjs next.config.mjs.backup
```

2. **Reset to Working Configuration**
```bash
# Use known working versions
npm install @payloadcms/next@3.39.1 payload@3.39.1 next@15.3.0
```

3. **Test Incrementally**
```bash
# Start with minimal config
pnpm run dev --turbo=false
```

## Getting Help

1. **Check Payload CMS GitHub Issues**: [payload/issues](https://github.com/payloadcms/payload/issues)
2. **Next.js Discussions**: [nextjs/discussions](https://github.com/vercel/next.js/discussions)
3. **Community Discord**: [Payload CMS Discord](https://discord.gg/payload)

## Monitoring

Add this to your startup script to catch issues early:
```javascript
// monitor-startup.js
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason)
})

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error)
  process.exit(1)
})
```
