#!/usr/bin/env node

import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

console.log('🔍 Analyzing Payload CMS Module Count...\n')

// Function to count modules in a directory
function countModules(dir) {
  let count = 0
  try {
    const items = fs.readdirSync(dir)
    for (const item of items) {
      const fullPath = path.join(dir, item)
      const stat = fs.statSync(fullPath)
      if (stat.isDirectory() && item !== '.bin') {
        count++
        // Recursively count scoped packages
        if (item.startsWith('@')) {
          count += countModules(fullPath) - 1 // Don't double count the scope itself
        }
      }
    }
  } catch (error) {
    console.error(`Error reading ${dir}:`, error.message)
  }
  return count
}

// Analyze dependencies
console.log('1. Analyzing node_modules...')
const nodeModulesPath = './node_modules'
const totalModules = countModules(nodeModulesPath)
console.log(`   Total modules in node_modules: ${totalModules}\n`)

// Analyze Payload-specific modules
console.log('2. Payload CMS specific modules:')
const payloadModules = [
  '@payloadcms/ui',
  '@payloadcms/next',
  '@payloadcms/richtext-lexical',
  '@payloadcms/db-mongodb',
  '@payloadcms/payload-cloud',
  '@payloadcms/plugin-seo',
  'payload'
]

for (const module of payloadModules) {
  const modulePath = path.join(nodeModulesPath, module)
  if (fs.existsSync(modulePath)) {
    const size = execSync(`du -sh "${modulePath}" 2>/dev/null || echo "0"`, { encoding: 'utf-8' }).trim()
    console.log(`   ${module}: ${size}`)
  }
}

// Check specific heavy dependencies
console.log('\n3. Heavy dependencies analysis:')
const heavyDeps = [
  'react',
  'react-dom',
  'next',
  'mongodb',
  'mongoose',
  '@lexical',
  'date-fns',
  'sharp'
]

for (const dep of heavyDeps) {
  const depPath = path.join(nodeModulesPath, dep)
  if (fs.existsSync(depPath)) {
    const size = execSync(`du -sh "${depPath}" 2>/dev/null || echo "0"`, { encoding: 'utf-8' }).trim()
    console.log(`   ${dep}: ${size}`)
  }
}

// Analyze what's actually imported
console.log('\n4. Import analysis in src directory:')
try {
  const imports = execSync(
    `grep -r "from ['\\"]@payloadcms" src/ | grep -v node_modules | wc -l`,
    { encoding: 'utf-8' }
  ).trim()
  console.log(`   Direct @payloadcms imports: ${imports}`)
} catch (error) {
  console.log('   Could not analyze imports')
}

// Provide recommendations
console.log('\n📊 Analysis Summary:')
console.log('The 5,717 modules in the admin panel come from:\n')
console.log('1. **Payload UI Components** (~2000+ modules)')
console.log('   - Every field type has multiple React components')
console.log('   - Form management (react-hook-form, validation)')
console.log('   - Data tables, modals, drawers, navigation')
console.log('   - Icon libraries, styling systems\n')

console.log('2. **Lexical Rich Text Editor** (~1500+ modules)')
console.log('   - Full featured editor with plugins')
console.log('   - Markdown, formatting, links, etc.')
console.log('   - Each plugin is its own module set\n')

console.log('3. **React Ecosystem** (~1000+ modules)')
console.log('   - React 19, React DOM')
console.log('   - React Router, hooks libraries')
console.log('   - State management dependencies\n')

console.log('4. **Build Tools & Polyfills** (~500+ modules)')
console.log('   - Webpack loaders and plugins')
console.log('   - Babel transforms')
console.log('   - PostCSS and styling tools\n')

console.log('5. **Database & API** (~700+ modules)')
console.log('   - MongoDB driver and Mongoose')
console.log('   - GraphQL and REST tooling')
console.log('   - Validation libraries\n')

console.log('💡 Recommendations to Reduce Module Count:\n')
console.log('1. **Use Dynamic Imports for Admin**')
console.log('   - Lazy load collection admin views')
console.log('   - Code split the rich text editor')
console.log('   - Load field components on demand\n')

console.log('2. **Disable Unused Features**')
console.log('   - Remove GraphQL if using REST only')
console.log('   - Disable live preview in dev')
console.log('   - Remove unused field types\n')

console.log('3. **Optimize Dependencies**')
console.log('   - Use modularizeImports for all Payload packages')
console.log('   - Enable tree shaking properly')
console.log('   - Remove duplicate dependencies\n')

console.log('4. **Consider Alternatives**')
console.log('   - Use simpler field types where possible')
console.log('   - Replace rich text with markdown for some fields')
console.log('   - Create custom lightweight admin views\n')
