#!/usr/bin/env node

/**
 * Documentation build script
 * Integrates TypeDoc API documentation with Jekyll site
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Paths
const apiDir = path.join(__dirname, '../docs/api')
const docsDir = path.join(__dirname, '../docs')

// Ensure API directory exists
if (!fs.existsSync(apiDir)) {
  console.log('API directory does not exist. Run TypeDoc first: npm run docs:build')
  process.exit(1)
}

// Create Jekyll-compatible index for API docs
const apiIndex = `---
title: API Reference
layout: default
parent: Documentation
nav_order: 4
has_children: true
---

# API Reference

Complete API documentation for the node-syslog library.

## Core Classes

### [Syslog]({{ site.baseurl }}/api/classes/Syslog.html)

The main class for syslog functionality.

\`\`\`typescript
import { Syslog } from 'node-syslog'

const logger = new Syslog({
  ident: 'myapp',
  facility: 'local0',
  options: ['pid', 'odelay']
})
\`\`\`

## Types and Constants

### [SyslogFacility]({{ site.baseurl }}/api/variables/SyslogFacility.html)

Syslog facility constants.

### [SyslogLevel]({{ site.baseurl }}/api/variables/SyslogLevel.html)

Log level constants.

### [SyslogOption]({{ site.baseurl }}/api/variables/SyslogOption.html)

Syslog option constants.

## Interfaces

### [SyslogOptions]({{ site.baseurl }}/api/interfaces/SyslogOptions.html)

Configuration options for creating a Syslog instance.

---

*This documentation is automatically generated from TypeScript source code.*
`

// Write API index (commented out to prevent conflict with TypeDoc index.html)
// fs.writeFileSync(path.join(apiDir, 'index.md'), apiIndex)
console.log('ℹ️  Skipping API index.md generation to prevent conflict with TypeDoc index.html')

// Add frontmatter to all generated markdown files
function addFrontmatter(filePath) {
  const content = fs.readFileSync(filePath, 'utf8')
  
  // Skip if already has frontmatter
  if (content.startsWith('---')) {
    return
  }
  
  const fileName = path.basename(filePath, '.md')
  const title = fileName.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  
  const frontmatter = `---
title: ${title}
layout: default
parent: API Reference
nav_order: auto
---

`
  
  fs.writeFileSync(filePath, frontmatter + content)
}

// Process all markdown files in API directory
function processApiDocs(dir) {
  const files = fs.readdirSync(dir)
  
  for (const file of files) {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)
    
    if (stat.isDirectory()) {
      processApiDocs(filePath)
    } else if (file.endsWith('.md') && file !== 'README.md') {
      addFrontmatter(filePath)
    }
  }
}

// Process API documentation
processApiDocs(apiDir)

console.log('✅ API documentation integrated with Jekyll')
console.log('📁 Generated files in:', apiDir)