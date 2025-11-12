---
title: Getting Started
nav_order: 2
has_children: false
---

# Getting Started Guide

This guide will help you get up and running with node-syslog quickly. You'll learn how to install, configure, and use the library in your Node.js applications.

## Prerequisites

Before you begin, ensure you have:

- **Node.js** version 22.x LTS or higher
- **Linux** operating system (ARM64 or AMD64)
- **npm** or **pnpm** package manager
- (Optional) **rsyslog** or **syslog-ng** for log management

### Legacy Version Support

This version requires **Node.js 22.0.0+**. If you need support for older Node.js versions:

- **Node.js 18+**: Use `npm install node-syslog@1.x` (legacy version)
- **Node.js < 18**: Consider migrating to `modern-syslog` for broader compatibility

See the [migration guide]({{ site.baseurl }}/migration/) for detailed instructions on upgrading from legacy versions.

## Installation

### Basic Installation

```bash
npm install node-syslog
```

### Using pnpm (Recommended for Development)

```bash
pnpm add node-syslog
```

### Verify Installation

```bash
node -e "console.log(require('node-syslog'))"
```

If the installation was successful, you should see the module exports without errors.

## Basic Usage

### Import the Library

```typescript
// ES6 import
import { Syslog } from 'node-syslog'

// CommonJS require
const { Syslog } = require('node-syslog')
```

### Create a Simple Logger

```typescript
import { Syslog } from 'node-syslog'

// Create logger with basic configuration
const logger = new Syslog({
  ident: 'myapp',
  facility: 'local0'
})

// Log a message
logger.info('Hello, syslog!')

// Close when done
logger.close()
```

### Run Your First Program

Save this as `example.js`:

```javascript
const { Syslog } = require('node-syslog')

const logger = new Syslog({
  ident: 'example',
  facility: 'local0'
})

logger.info('This is my first syslog message!')
logger.warning('Something might be wrong')
logger.error('An error occurred')

logger.close()
```

Run it:

```bash
node example.js
```

Check your system logs:

```bash
# For systems using journalctl
journalctl -f | grep example

# For traditional syslog
tail -f /var/log/syslog | grep example
```

## Configuration Options

### Full Configuration Example

```typescript
import { Syslog, SyslogFacility, SyslogLevel, SyslogOption } from 'node-syslog'

const logger = new Syslog({
  ident: 'production-app',
  facility: SyslogFacility.DAEMON,
  options: [
    SyslogOption.PID,      // Include process ID
    SyslogOption.NDELAY,   // Open connection immediately
    SyslogOption.LOG_PID   // Log the PID with each message
  ],
  logLevel: SyslogLevel.INFO
})
```

### Configuration Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `ident` | string | Required | Identifier for log messages |
| `facility` | SyslogFacilityType | 'user' | Syslog facility (kern, user, mail, daemon, etc.) |
| `options` | SyslogOptionType[] | [] | Syslog options (pid, ndelay, nowait, etc.) |
| `logLevel` | SyslogLevelType | 'info' | Minimum log level to output |

### Available Facilities

```typescript
import { SyslogFacility } from 'node-syslog'

// Common facilities
SyslogFacility.KERN      // Kernel messages
SyslogFacility.USER      // User-level messages (default)
SyslogFacility.MAIL      // Mail system
SyslogFacility.DAEMON    // System daemons
SyslogFacility.AUTH      // Security/authorization
SyslogFacility.SYSLOG    // Internal syslog messages
SyslogFacility.LPR       // Line printer subsystem
SyslogFacility.NEWS      // Network news subsystem
SyslogFacility.UUCP      // UUCP subsystem
SyslogFacility.CRON      // Clock daemon
SyslogFacility.AUTHPRIV  // Security/authorization (private)
SyslogFacility.FTP       // FTP daemon
SyslogFacility.LOCAL0    // Local use 0
SyslogFacility.LOCAL1    // Local use 1
// ... LOCAL2 through LOCAL7
```

### Available Log Levels

```typescript
import { SyslogLevel } from 'node-syslog'

// From most to least severe
SyslogLevel.EMERG     // Emergency: system is unusable
SyslogLevel.ALERT     // Alert: action must be taken immediately
SyslogLevel.CRIT      // Critical: critical conditions
SyslogLevel.ERR       // Error: error conditions
SyslogLevel.WARNING   // Warning: warning conditions
SyslogLevel.NOTICE    // Notice: normal but significant condition
SyslogLevel.INFO      // Informational: informational messages
SyslogLevel.DEBUG     // Debug: debug-level messages
```

## Logging Methods

### Basic Logging

```typescript
logger.emerg('System is unusable!')
logger.alert('Immediate action required!')
logger.crit('Critical system failure')
logger.error('Database connection failed')
logger.warning('High memory usage detected')
logger.notice('Server configuration updated')
logger.info('User logged in successfully')
logger.debug('Processing request details')
```

### Structured Logging

```typescript
// Log with additional context
logger.info('User action completed', {
  userId: 12345,
  action: 'purchase',
  amount: 99.99,
  timestamp: new Date().toISOString()
})

logger.error('API request failed', {
  url: '/api/users',
  method: 'POST',
  statusCode: 500,
  error: 'Database timeout',
  requestId: 'req_abc123'
})
```

### Conditional Logging

```typescript
// Only log if level is enabled
if (logger.isDebugEnabled()) {
  logger.debug('Expensive debug operation', {
    largeObject: getLargeObject(),
    computationResult: expensiveComputation()
  })
}
```

## Real-World Examples

### Express.js Web Application

```typescript
import express from 'express'
import { Syslog, SyslogFacility } from 'node-syslog'

const app = express()
const logger = new Syslog({
  ident: 'webapp',
  facility: SyslogFacility.LOCAL0,
  options: ['pid', 'ndelay']
})

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now()
  
  res.on('finish', () => {
    const duration = Date.now() - start
    logger.info('HTTP Request', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get('User-Agent'),
      ip: req.ip
    })
  })
  
  next()
})

// Error handling
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method
  })
  
  res.status(500).json({ error: 'Internal server error' })
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  logger.info('Server started', { port: PORT })
})
```

### CLI Application

```typescript
#!/usr/bin/env node

import { Command } from 'commander'
import { Syslog, SyslogFacility } from 'node-syslog'

const program = new Command()
const logger = new Syslog({
  ident: 'mycli',
  facility: SyslogFacility.LOCAL1
})

program
  .name('mycli')
  .description('My CLI application')
  .version('1.0.0')

program
  .command('process')
  .argument('<file>', 'file to process')
  .option('-v, --verbose', 'verbose output')
  .action((file, options) => {
    logger.info('Processing file', { file })
    
    try {
      // Your processing logic here
      logger.info('File processed successfully', { file })
    } catch (error) {
      logger.error('File processing failed', {
        file,
        error: error.message
      })
      process.exit(1)
    }
  })

program.parse()
```

### Background Service

```typescript
import { Syslog, SyslogFacility, SyslogLevel } from 'node-syslog'

class BackgroundService {
  private logger: Syslog
  private running = false

  constructor() {
    this.logger = new Syslog({
      ident: 'background-service',
      facility: SyslogFacility.DAEMON,
      options: ['pid', 'ndelay'],
      logLevel: SyslogLevel.INFO
    })
  }

  async start() {
    this.running = true
    this.logger.info('Background service started')
    
    while (this.running) {
      try {
        await this.processTasks()
      } catch (error) {
        this.logger.error('Task processing failed', {
          error: error.message,
          stack: error.stack
        })
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 5000))
      }
    }
  }

  async stop() {
    this.running = false
    this.logger.info('Background service stopped')
    this.logger.close()
  }

  private async processTasks() {
    // Your background processing logic
    this.logger.debug('Processing background tasks')
    
    // Simulate work
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
}

// Handle graceful shutdown
const service = new BackgroundService()

process.on('SIGTERM', async () => {
  await service.stop()
  process.exit(0)
})

process.on('SIGINT', async () => {
  await service.stop()
  process.exit(0)
})

service.start().catch(error => {
  console.error('Failed to start service:', error)
  process.exit(1)
})
```

## Best Practices

### 1. Always Close the Logger

```typescript
// Good - explicit cleanup
logger.close()

// Better - use try/finally
try {
  logger.info('Doing work')
  // ... your code
} finally {
  logger.close()
}

// Best - automatic cleanup with process hooks
process.on('exit', () => logger.close())
process.on('SIGINT', () => logger.close())
process.on('SIGTERM', () => logger.close())
```

### 2. Use Appropriate Log Levels

```typescript
// Use appropriate levels for different situations
logger.debug('Detailed debugging info')        // Development only
logger.info('Normal application flow')        // Production info
logger.warning('Something unusual but not error')  // Attention needed
logger.error('Error that doesn't stop execution')   // Errors
logger.crit('Critical error affecting functionality') // Critical
logger.emerg('System unusable')               // Emergency
```

### 3. Include Context in Messages

```typescript
// Good - includes context
logger.error('Database connection failed', {
  host: 'localhost',
  port: 5432,
  database: 'myapp',
  attempt: 3,
  maxRetries: 5
})

// Less useful - no context
logger.error('Database connection failed')
```

### 4. Avoid Sensitive Data

```typescript
// Bad - logs sensitive information
logger.info('User login', {
  username: 'admin',
  password: 'secret123',  // Never log passwords!
  creditCard: '4111-1111-1111-1111'  // Never log PII!
})

// Good - sanitizes sensitive data
logger.info('User login', {
  username: 'admin',
  password: '[REDACTED]',
  creditCard: '[REDACTED]'
})
```

## Troubleshooting

### Common Issues

#### 1. "Module not found" Error

**Problem**: `Error: Cannot find module 'node-syslog'`

**Solution**: Ensure you're running on Linux and the native module compiled correctly:

```bash
# Rebuild native module
npm rebuild node-syslog

# Check platform
node -e "console.log(process.platform, process.arch)"
```

#### 2. Permission Denied

**Problem**: Can't write to syslog

**Solution**: Check syslog configuration and permissions:

```bash
# Check if syslog is running
systemctl status rsyslog

# Test syslog manually
logger "Test message from $(whoami)"
```

#### 3. Messages Not Appearing

**Problem**: No messages in system logs

**Solution**: Check syslog configuration and filters:

```bash
# View all messages
journalctl -f

# Filter by your application
journalctl -f | grep your-app-ident

# Check syslog configuration
cat /etc/rsyslog.conf | grep -v "^#"
```

### Debug Mode

Enable debug logging to troubleshoot issues:

```typescript
import { Syslog, SyslogLevel } from 'node-syslog'

const logger = new Syslog({
  ident: 'debug-app',
  facility: 'local0',
  logLevel: SyslogLevel.DEBUG  // Enable all levels including debug
})

logger.debug('Debug mode enabled')
logger.debug('Configuration:', logger.getConfig())
```

## Next Steps

Now that you have the basics down, explore these topics:

- [API Reference]({{ site.baseurl }}/api/) - Complete API documentation
- [Installation Guide]({{ site.baseurl }}/installation/) - Advanced installation options
- [Migration Guide]({{ site.baseurl }}/migration/) - Migrating from the old node-syslog
- [Examples]({{ site.baseurl }}/examples/) - More usage examples

If you run into issues, check the [troubleshooting section](#troubleshooting) or open an issue on [GitHub](https://github.com/schamane/node-syslog/issues).