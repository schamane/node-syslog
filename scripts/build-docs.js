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
const jekyllApiDir = path.join(__dirname, '../docs/_api')

// Ensure API directory exists
if (!fs.existsSync(apiDir)) {
  console.log('API directory does not exist. Run TypeDoc first: npm run docs:build')
  process.exit(1)
}

// Clean and recreate Jekyll API directory
if (fs.existsSync(jekyllApiDir)) {
  fs.rmSync(jekyllApiDir, { recursive: true, force: true })
}
fs.mkdirSync(jekyllApiDir, { recursive: true })

// Extract content from TypeDoc HTML and convert to Jekyll pages
function convertTypeDocToJekyll(htmlFilePath, outputPath, title) {
  const htmlContent = fs.readFileSync(htmlFilePath, 'utf8')
  
  // Extract the main content from TypeDoc HTML
  const bodyMatch = htmlContent.match(/<body[^>]*>([\s\S]*?)<\/body>/)
  if (!bodyMatch) {
    console.warn(`Could not extract body content from ${htmlFilePath}`)
    return
  }
  
  let bodyContent = bodyMatch[1]
  
  // Remove TypeDoc-specific elements
  bodyContent = bodyContent.replace(/<script[^>]*>[\s\S]*?<\/script>/g, '')
  bodyContent = bodyContent.replace(/<header[^>]*>[\s\S]*?<\/header>/g, '')
  bodyContent = bodyContent.replace(/<nav[^>]*>[\s\S]*?<\/nav>/g, '')
  bodyContent = bodyContent.replace(/<footer[^>]*>[\s\S]*?<\/footer>/g, '')
  
  // Extract the main content container
  const contentMatch = bodyContent.match(/<div[^>]*class="[^"]*container[^"]*"[^>]*>([\s\S]*?)<\/div>/)
  if (contentMatch) {
    bodyContent = contentMatch[1]
  }
  
  // Clean up HTML
  bodyContent = bodyContent.replace(/<script[^>]*>[\s\S]*?<\/script>/g, '')
  bodyContent = bodyContent.replace(/<style[^>]*>[\s\S]*?<\/style>/g, '')
  
  // Create Jekyll frontmatter
  const frontmatter = `---
title: "${title}"
layout: api
parent: API Reference
nav_order: auto
---

`
  
  // Write Jekyll page
  const jekyllContent = frontmatter + bodyContent
  fs.writeFileSync(outputPath, jekyllContent)
}

// Process TypeDoc HTML files
function processTypeDocFiles(sourceDir, targetDir, parentPath = '') {
  const files = fs.readdirSync(sourceDir)
  
  for (const file of files) {
    const sourcePath = path.join(sourceDir, file)
    const stat = fs.statSync(sourcePath)
    
    if (stat.isDirectory()) {
      const targetSubDir = path.join(targetDir, file)
      fs.mkdirSync(targetSubDir, { recursive: true })
      processTypeDocFiles(sourcePath, targetSubDir, `${parentPath}/${file}`)
    } else if (file.endsWith('.html')) {
      const fileName = path.basename(file, '.html')
      const title = fileName.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
      const outputPath = path.join(targetDir, `${fileName}.html`)
      
      convertTypeDocToJekyll(sourcePath, outputPath, title)
      console.log(`✅ Converted ${file} → ${path.relative(jekyllApiDir, outputPath)}`)
    }
  }
}

// Create API index page
const apiIndex = `---
title: "API Reference"
layout: api
parent: Documentation
nav_order: 4
has_children: true
---

# API Reference

Complete API documentation for the node-syslog library.

## Core Classes

### [Syslog]({{ site.baseurl }}/_api/classes/Syslog.html)

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

### [SyslogFacility]({{ site.baseurl }}/_api/variables/SyslogFacility.html)

Syslog facility constants.

### [SyslogLevel]({{ site.baseurl }}/_api/variables/SyslogLevel.html)

Log level constants.

### [SyslogOption]({{ site.baseurl }}/_api/variables/SyslogOption.html)

Syslog option constants.

## Interfaces

### [SyslogOptions]({{ site.baseurl }}/_api/interfaces/SyslogOptions.html)

Configuration options for creating a Syslog instance.

## Functions

### [createSyslog]({{ site.baseurl }}/_api/functions/createSyslog.html)

Create a new syslog instance with the specified options.

### [alert]({{ site.baseurl }}/_api/functions/alert.html)
### [critical]({{ site.baseurl }}/_api/functions/critical.html)
### [debug]({{ site.baseurl }}/_api/functions/debug.html)
### [emergency]({{ site.baseurl }}/_api/functions/emergency.html)
### [error]({{ site.baseurl }}/_api/functions/error.html)
### [info]({{ site.baseurl }}/_api/functions/info.html)
### [notice]({{ site.baseurl }}/_api/functions/notice.html)
### [warning]({{ site.baseurl }}/_api/functions/warning.html)

Convenience functions for different log levels.

---

*This documentation is automatically generated from TypeScript source code.*
`

fs.writeFileSync(path.join(jekyllApiDir, 'index.html'), apiIndex)

// Process all TypeDoc files
processTypeDocFiles(apiDir, jekyllApiDir)

// Copy TypeDoc assets to Jekyll assets
const assetsSourceDir = path.join(apiDir, 'assets')
const assetsTargetDir = path.join(__dirname, '../docs/assets/api')

if (fs.existsSync(assetsSourceDir)) {
  if (fs.existsSync(assetsTargetDir)) {
    fs.rmSync(assetsTargetDir, { recursive: true, force: true })
  }
  fs.mkdirSync(assetsTargetDir, { recursive: true })
  
  const assetFiles = fs.readdirSync(assetsSourceDir)
  for (const file of assetFiles) {
    const sourcePath = path.join(assetsSourceDir, file)
    const targetPath = path.join(assetsTargetDir, file)
    fs.copyFileSync(sourcePath, targetPath)
  }
  console.log('✅ Copied TypeDoc assets to Jekyll assets')
}

console.log('✅ API documentation converted to Jekyll format')
console.log('📁 Generated files in:', jekyllApiDir)