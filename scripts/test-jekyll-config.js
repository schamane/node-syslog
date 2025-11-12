#!/usr/bin/env node

/**
 * Simple Jekyll configuration test
 * Tests that the Jekyll configuration is valid and all required files exist
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const docsDir = path.join(__dirname, '../docs')

console.log('🔍 Testing Jekyll configuration...\n')

// Test 1: Check _config.yml exists and is valid
console.log('1. Checking _config.yml...')
const configPath = path.join(docsDir, '_config.yml')
if (!fs.existsSync(configPath)) {
  console.log('❌ _config.yml not found')
  process.exit(1)
}

const config = fs.readFileSync(configPath, 'utf8')
const configChecks = [
  { name: 'just-the-docs theme', pattern: /remote_theme.*just-the-docs/ },
  { name: 'baseurl configured', pattern: /baseurl:\s*["']["']/ },
  { name: 'url configured', pattern: /url:\s*["']https:\/\/schamane\.github\.io\/node-syslog["']/ },
  { name: 'API collection', pattern: /collections:\s*\n\s*api:/ },
  { name: 'markdown processor', pattern: /markdown:\s*kramdown/ }
]

configChecks.forEach(check => {
  if (check.pattern.test(config)) {
    console.log(`✅ ${check.name}`)
  } else {
    console.log(`❌ ${check.name} not found`)
  }
})

// Test 2: Check required pages exist
console.log('\n2. Checking required pages...')
const requiredPages = [
  'index.md',
  'getting-started.md', 
  'installation.md',
  'api.md',
  'examples.md',
  'migration.md'
]

requiredPages.forEach(page => {
  const pagePath = path.join(docsDir, page)
  if (fs.existsSync(pagePath)) {
    console.log(`✅ ${page}`)
  } else {
    console.log(`❌ ${page} missing`)
  }
})

// Test 3: Check API documentation
console.log('\n3. Checking API documentation...')
const apiDir = path.join(docsDir, 'api')
if (fs.existsSync(apiDir)) {
  const apiIndex = path.join(apiDir, 'index.html')
  if (fs.existsSync(apiIndex)) {
    console.log('✅ API index.html exists')
  } else {
    console.log('❌ API index.html missing')
  }
  
  const apiClasses = path.join(apiDir, 'classes')
  if (fs.existsSync(apiClasses)) {
    console.log('✅ API classes directory exists')
  } else {
    console.log('❌ API classes directory missing')
  }
} else {
  console.log('❌ API directory missing')
}

// Test 4: Check .nojekyll
console.log('\n4. Checking .nojekyll...')
const nojekyllPath = path.join(docsDir, '.nojekyll')
if (fs.existsSync(nojekyllPath)) {
  console.log('✅ .nojekyll exists')
} else {
  console.log('❌ .nojekyll missing')
}

// Test 5: Check frontmatter on main pages
console.log('\n5. Checking frontmatter...')
const pagesWithFrontmatter = ['index.md', 'api.md']
pagesWithFrontmatter.forEach(page => {
  const pagePath = path.join(docsDir, page)
  if (fs.existsSync(pagePath)) {
    const content = fs.readFileSync(pagePath, 'utf8')
    if (content.startsWith('---')) {
      console.log(`✅ ${page} has frontmatter`)
    } else {
      console.log(`❌ ${page} missing frontmatter`)
    }
  }
})

console.log('\n✅ Configuration test complete!')