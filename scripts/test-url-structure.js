#!/usr/bin/env node

/**
 * URL structure test
 * Tests that the expected URL structure will work with Jekyll
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const docsDir = path.join(__dirname, '../docs')

console.log('🌐 Testing expected URL structure...\n')

const baseurl = '/node-syslog'

// Expected URLs and their corresponding source files
const expectedUrls = [
  { url: '/', source: 'index.md', description: 'Home page' },
  { url: '/getting-started/', source: 'getting-started.md', description: 'Getting started guide' },
  { url: '/installation/', source: 'installation.md', description: 'Installation guide' },
  { url: '/api/', source: 'api.md', description: 'API overview' },
  { url: '/examples/', source: 'examples.md', description: 'Code examples' },
  { url: '/migration/', source: 'migration.md', description: 'Migration guide' },
  { url: '/api/', source: 'api/index.html', description: 'TypeDoc API index' },
  { url: '/api/classes/Syslog.html', source: 'api/classes/Syslog.html', description: 'Syslog class documentation' }
]

console.log('Expected URL structure with baseurl', baseurl, ':')
console.log('='.repeat(50))

expectedUrls.forEach(expected => {
  const sourcePath = path.join(docsDir, expected.source)
  const exists = fs.existsSync(sourcePath)
  const fullUrl = baseurl + expected.url
  
  if (exists) {
    console.log(`✅ ${fullUrl} <- ${expected.source} (${expected.description})`)
  } else {
    console.log(`❌ ${fullUrl} <- ${expected.source} (${expected.description}) - FILE MISSING`)
  }
})

console.log('\n📋 Navigation structure test:')
console.log('='.repeat(30))

// Test navigation structure based on just-the-docs expectations
const configPath = path.join(docsDir, '_config.yml')
const config = fs.readFileSync(configPath, 'utf8')

// Check if API collection is properly configured
if (config.includes('collections:\n  api:')) {
  console.log('✅ API collection configured')
} else {
  console.log('❌ API collection not configured')
}

// Check if just-the-docs navigation is set up
if (config.includes('just_the_docs:')) {
  console.log('✅ Just-the-docs navigation configured')
} else {
  console.log('❌ Just-the-docs navigation not configured')
}

// Check permalink structure
if (config.includes('permalink: pretty')) {
  console.log('✅ Pretty permalinks configured (no .html extensions)')
} else {
  console.log('❌ Pretty permalinks not configured')
}

console.log('\n🔍 Potential 404 causes:')
console.log('='.repeat(25))

// Check for common issues that cause 404s
const issues = []

// Check for pages directory (should not exist with just-the-docs)
const pagesDir = path.join(docsDir, 'pages')
if (fs.existsSync(pagesDir)) {
  issues.push('pages/ directory exists - may conflict with just-the-docs')
}

// Check for conflicting layouts
const layoutsDir = path.join(docsDir, '_layouts')
if (fs.existsSync(layoutsDir)) {
  const layoutFiles = fs.readdirSync(layoutsDir)
  if (layoutFiles.length > 0) {
    issues.push(`_layouts directory has files: ${layoutFiles.join(', ')} - may conflict with theme`)
  }
}

// Check for duplicate index files
const apiIndex = path.join(docsDir, 'api', 'index.md')
if (fs.existsSync(apiIndex)) {
  issues.push('api/index.md exists - may conflict with TypeDoc index.html')
}

if (issues.length === 0) {
  console.log('✅ No common 404 causes detected')
} else {
  issues.forEach(issue => console.log(`⚠️  ${issue}`))
}

console.log('\n✅ URL structure test complete!')