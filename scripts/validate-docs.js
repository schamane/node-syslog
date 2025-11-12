#!/usr/bin/env node

/**
 * Documentation validation script
 * Validates Jekyll site structure and links
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Configuration
const rootDir = path.join(__dirname, '..')
const docsDir = path.join(__dirname, '../docs')
const requiredFiles = [
  'index.md',
  'getting-started.md',
  'installation.md',
  'api.md',
  'examples.md',
  'migration.md'
]

const requiredDirs = [
  'api'
]

const requiredRootFiles = [
  // None - _config.yml is in docs/ directory
]

// Validation results
let errors = []
let warnings = []

function validateFile(filePath) {
  if (!fs.existsSync(filePath)) {
    errors.push(`❌ Missing required file: ${path.relative(rootDir, filePath)}`)
    return false
  }
  
  const content = fs.readFileSync(filePath, 'utf8')
  
  // Check for Jekyll frontmatter
  if (filePath.endsWith('.md') && !filePath.includes('README.md')) {
    if (!content.startsWith('---')) {
      warnings.push(`⚠️  Missing Jekyll frontmatter: ${path.relative(docsDir, filePath)}`)
    }
  }
  
  return true
}

function validateDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    errors.push(`❌ Missing required directory: ${path.relative(rootDir, dirPath)}`)
    return false
  }
  return true
}

function validateLinks(content, filePath) {
  // Simple link validation for markdown files
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g
  let match
  
  while ((match = linkRegex.exec(content)) !== null) {
    const link = match[2]
    
    // Skip external links, anchors, and Jekyll liquid templates
    if (link.startsWith('http') || link.startsWith('#') || link.includes('{{') || link.includes('}}')) {
      continue
    }
    
    // Convert relative link to absolute path
    const linkPath = path.resolve(path.dirname(filePath), link)
    
    if (!fs.existsSync(linkPath)) {
      warnings.push(`⚠️  Broken link in ${path.relative(docsDir, filePath)}: ${link}`)
    }
  }
}

function validateNavigation() {
  const configPath = path.join(docsDir, '_config.yml')
  if (!fs.existsSync(configPath)) {
    errors.push('❌ Missing _config.yml')
    return
  }
  
  const config = fs.readFileSync(configPath, 'utf8')
  
  if (!config.includes('just-the-docs')) {
    warnings.push('⚠️  just-the-docs theme not configured in _config.yml')
  }
  
  if (!config.includes('baseurl')) {
    warnings.push('⚠️  baseurl not configured in _config.yml')
  }
}

function validateApiDocs() {
  const apiDir = path.join(docsDir, 'api')
  
  if (!fs.existsSync(apiDir)) {
    warnings.push('⚠️  API documentation not found. Run: npm run docs:build')
    return
  }
  
  // Recursively find all documentation files
  function findDocumentationFiles(dir) {
    const files = []
    const items = fs.readdirSync(dir)
    
    for (const item of items) {
      const fullPath = path.join(dir, item)
      const stat = fs.statSync(fullPath)
      
      if (stat.isDirectory()) {
        files.push(...findDocumentationFiles(fullPath))
      } else if (item.endsWith('.html') || item.endsWith('.md')) {
        files.push(path.relative(apiDir, fullPath))
      }
    }
    
    return files
  }
  
  const apiFiles = findDocumentationFiles(apiDir)
  
  if (apiFiles.length === 0) {
    warnings.push('⚠️  No API documentation files found')
  }
  
  // Check for main API files
  const expectedApiFiles = [
    'index.html', 
    'classes/Syslog.html', 
    'variables/SyslogFacility.html', 
    'variables/SyslogLevel.html', 
    'variables/SyslogOption.html',
    'types/SyslogFacilityType.html', 
    'types/SyslogLevelType.html', 
    'types/SyslogOptionType.html',
    'interfaces/SyslogOptions.html'
  ]
  expectedApiFiles.forEach(expected => {
    const found = apiFiles.some(f => f === expected)
    if (!found) {
      warnings.push(`⚠️  Missing API documentation section: ${expected}`)
    }
  })
}

function main() {
  console.log('🔍 Validating documentation structure...\n')
  
  // Validate required root files
  console.log('📄 Checking required root files...')
  requiredRootFiles.forEach(file => {
    const filePath = path.join(rootDir, file)
    validateFile(filePath)
  })
  
  // Validate required files
  console.log('📄 Checking required docs files...')
  requiredFiles.forEach(file => {
    const filePath = path.join(docsDir, file)
    validateFile(filePath)
  })
  
  // Validate required directories
  console.log('📁 Checking required directories...')
  requiredDirs.forEach(dir => {
    const dirPath = path.join(docsDir, dir)
    validateDir(dirPath)
  })
  
  // Validate navigation
  console.log('🧭 Checking navigation configuration...')
  validateNavigation()
  
  // Validate API docs
  console.log('📚 Checking API documentation...')
  validateApiDocs()
  
  // Validate links in markdown files
  console.log('🔗 Checking internal links...')
  const markdownFiles = requiredFiles.filter(f => f.endsWith('.md'))
  markdownFiles.forEach(file => {
    const filePath = path.join(docsDir, file)
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8')
      validateLinks(content, filePath)
    }
  })
  
  // Results
  console.log('\n📊 Validation Results:')
  console.log('========================')
  
  if (errors.length === 0 && warnings.length === 0) {
    console.log('✅ All checks passed! Documentation is ready.')
    process.exit(0)
  }
  
  if (errors.length > 0) {
    console.log('\n❌ Errors:')
    errors.forEach(error => console.log(error))
  }
  
  if (warnings.length > 0) {
    console.log('\n⚠️  Warnings:')
    warnings.forEach(warning => console.log(warning))
  }
  
  if (errors.length > 0) {
    console.log('\n❌ Validation failed due to errors.')
    process.exit(1)
  } else {
    console.log('\n⚠️  Validation passed with warnings.')
    process.exit(0)
  }
}

main()