---
title: Migration Guide
parent: Home
nav_order: 5
has_children: false
---

# Migration Guide

This guide helps you migrate from the old `node-syslog` package to the new modern implementation.

## Overview

The new `node-syslog` is a complete rewrite with:

- ✅ Modern TypeScript API with full IntelliSense
- ✅ Fluent interface with method chaining
- ✅ Better error handling and validation
- ✅ Precompiled binaries for easy installation
- ✅ Comprehensive test coverage
- ❌ Breaking API changes (this guide helps)

## Quick Reference

| Old API | New API | Notes |
|---------|---------|-------|
| `require('node-syslog')` | `import { Syslog } from 'node-syslog'` | ES modules |
| `syslog.init()` | `new Syslog()` | Constructor-based |
| `syslog.log()` | `logger.info/error/etc()` | Specific methods |
| Constants | `Facilities/Levels/Options` | Enum-based |

## Step-by-Step Migration

### 1. Update Import

**Before:**
```javascript
const syslog = require('node-syslog');
```

**After:**
```typescript
import { Syslog, SyslogFacility, SyslogLevel, SyslogOption } from 'node-syslog';
// or for convenience functions:
import { info, error, warning } from 'node-syslog';
```

### 2. Replace Initialization

**Before:**
```javascript
syslog.init('my-app', syslog.LOG_PID | syslog.LOG_ODELAY, syslog.LOG_LOCAL0);
```

**After:**
```typescript
const logger = new Syslog({
  ident: 'my-app',
  facility: SyslogFacility.LOG_LOCAL0,
  options: SyslogOption.LOG_PID | SyslogOption.LOG_ODELAY
});
```

### 3. Update Logging Calls

**Before:**
```javascript
syslog.log(syslog.LOG_INFO, 'Application started');
syslog.log(syslog.LOG_ERR, 'Database connection failed');
```

**After (Method 1 - Instance methods):**
```typescript
logger.info('Application started');
logger.error('Database connection failed');
```

**After (Method 2 - Convenience functions):**
```typescript
import { info, error } from 'node-syslog';

info('Application started');
error('Database connection failed');
```

### 4. Update Constants

**Before:**
```javascript
const facility = syslog.LOG_LOCAL0;
const level = syslog.LOG_INFO;
const options = syslog.LOG_PID;
```

**After:**
```typescript
const facility = SyslogFacility.LOG_LOCAL0;
const level = SyslogLevel.LOG_INFO;
const options = SyslogOption.LOG_PID;
```

## Complete Migration Examples

### Example 1: Basic Web Server

**Before:**
```javascript
const syslog = require('node-syslog');
const express = require('express');

syslog.init('web-server', syslog.LOG_PID, syslog.LOG_DAEMON);

const app = express();

app.use((req, res, next) => {
  syslog.log(syslog.LOG_INFO, `${req.method} ${req.url}`);
  next();
});

app.use((err, req, res, next) => {
  syslog.log(syslog.LOG_ERR, `Error: ${err.message}`);
  res.status(500).send('Internal Server Error');
});

app.listen(3000, () => {
  syslog.log(syslog.LOG_INFO, 'Server started on port 3000');
});
```

**After:**
```typescript
import express from 'express';
import { Syslog, SyslogFacility, SyslogOption } from 'node-syslog';

const logger = new Syslog({
  ident: 'web-server',
  facility: SyslogFacility.LOG_DAEMON,
  options: SyslogOption.LOG_PID
});

const app = express();

app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Request error', { 
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method
  });
  res.status(500).send('Internal Server Error');
});

app.listen(3000, () => {
  logger.info('Server started on port 3000');
});
```

### Example 2: Database Service

**Before:**
```javascript
const syslog = require('node-syslog');
const mysql = require('mysql');

syslog.init('db-service', syslog.LOG_PID | syslog.LOG_CONS, syslog.LOG_LOCAL1);

function query(sql, params, callback) {
  syslog.log(syslog.LOG_DEBUG, `Executing query: ${sql}`);
  
  mysql.query(sql, params, (err, results) => {
    if (err) {
      syslog.log(syslog.LOG_ERR, `Query failed: ${err.message}`);
      return callback(err);
    }
    
    syslog.log(syslog.LOG_INFO, `Query returned ${results.length} rows`);
    callback(null, results);
  });
}
```

**After:**
```typescript
import mysql from 'mysql';
import { Syslog, SyslogFacility, SyslogOption } from 'node-syslog';

const logger = new Syslog({
  ident: 'db-service',
  facility: SyslogFacility.LOG_LOCAL1,
  options: SyslogOption.LOG_PID | SyslogOption.LOG_CONS
});

interface QueryResult {
  [key: string]: any;
}

function query(sql: string, params: any[]): Promise<QueryResult[]> {
  return new Promise((resolve, reject) => {
    logger.debug('Executing query', { sql, params });
    
    mysql.query(sql, params, (err: Error, results: QueryResult[]) => {
      if (err) {
        logger.error('Query failed', { 
          error: err.message,
          sql,
          params 
        });
        return reject(err);
      }
      
      logger.info('Query completed', { 
        rowCount: results.length,
        sql 
      });
      resolve(results);
    });
  });
}
```

### Example 3: Background Worker

**Before:**
```javascript
const syslog = require('node-syslog');
const { Worker } = require('worker_threads');

syslog.init('worker', syslog.LOG_PID, syslog.LOG_LOCAL2);

function processJob(job) {
  syslog.log(syslog.LOG_INFO, `Processing job ${job.id}`);
  
  try {
    // Process job...
    syslog.log(syslog.LOG_NOTICE, `Job ${job.id} completed successfully`);
  } catch (error) {
    syslog.log(syslog.LOG_CRIT, `Job ${job.id} failed: ${error.message}`);
  }
}
```

**After:**
```typescript
import { Worker } from 'worker_threads';
import { Syslog, SyslogFacility } from 'node-syslog';

const logger = new Syslog({
  ident: 'worker',
  facility: SyslogFacility.LOG_LOCAL2
});

interface Job {
  id: string;
  type: string;
  data: any;
}

async function processJob(job: Job): Promise<void> {
  logger.info('Processing job', { 
    jobId: job.id,
    jobType: job.type 
  });
  
  try {
    // Process job...
    await performJobWork(job);
    
    logger.notice('Job completed successfully', { 
      jobId: job.id 
    });
  } catch (error) {
    logger.critical('Job failed', { 
      jobId: job.id,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    throw error;
  }
}
```

## New Features You Should Use

### 1. Context Logging

**New capability:**
```typescript
logger.error('User authentication failed', {
  userId: 123,
  ip: '192.168.1.100',
  userAgent: 'Mozilla/5.0...',
  timestamp: new Date().toISOString()
});
```

### 2. Method Chaining

**New capability:**
```typescript
logger
  .debug('Starting request')
  .info('Processing data')
  .warning('Rate limit approaching')
  .error('Request failed');
```

### 3. TypeScript Support

**New capability:**
```typescript
// Full IntelliSense support
const logger = new Syslog({
  ident: 'my-app',
  facility: SyslogFacility.LOG_LOCAL0, // Auto-completion
  options: SyslogOption.LOG_PID | SyslogOption.LOG_CONS  // Type-safe
});

logger.info('Message'); // Method signatures with types
```

## Breaking Changes Summary

### Removed Features
- No more global state (each instance is independent)
- No more `syslog.log()` with level constants
- No more CommonJS require (use ES imports)

### Added Features
- Fluent interface with method chaining
- Context object support in all logging methods
- TypeScript definitions and IntelliSense
- Better error messages and validation
- Precompiled binaries

### Changed Behavior
- Constructor-based initialization instead of global init
- Specific methods for each log level
- Enum-based constants instead of plain numbers

## Testing Your Migration

### 1. Install Side-by-Side

```bash
# Keep old version for comparison
npm install node-syslog@1
npm install node-syslog@2
```

### 2. Create Compatibility Layer

```typescript
// compatibility.ts
import { Syslog, SyslogFacility, SyslogLevel, SyslogOption } from 'node-syslog';

let globalLogger: Syslog | null = null;

export const legacy = {
  init: (ident: string, options: number, facility: number) => {
    globalLogger = new Syslog({ ident, facility, options });
  },
  
  log: (priority: number, message: string) => {
    if (!globalLogger) throw new Error('Syslog not initialized');
    
    switch (priority) {
      case SyslogLevel.LOG_EMERG: globalLogger.emergency(message); break;
      case SyslogLevel.LOG_ALERT: globalLogger.alert(message); break;
      case SyslogLevel.LOG_CRIT: globalLogger.critical(message); break;
      case SyslogLevel.LOG_ERR: globalLogger.error(message); break;
      case SyslogLevel.LOG_WARNING: globalLogger.warning(message); break;
      case SyslogLevel.LOG_NOTICE: globalLogger.notice(message); break;
      case SyslogLevel.LOG_INFO: globalLogger.info(message); break;
      case SyslogLevel.LOG_DEBUG: globalLogger.debug(message); break;
    }
  }
};
```

### 3. Gradual Migration

```typescript
// Phase 1: Use compatibility layer
import { legacy } from './compatibility';
legacy.init('my-app', SyslogOption.LOG_PID, SyslogFacility.LOG_USER);
legacy.log(SyslogLevel.LOG_INFO, 'Still using old API');

// Phase 2: Mix old and new
import { Syslog } from 'node-syslog';
const logger = new Syslog({ ident: 'my-app' });
logger.info('Using new API');

// Phase 3: Full migration
// Remove compatibility layer and old imports
```

## Common Migration Issues

### Issue 1: Missing Global State

**Problem:** Old code relied on global syslog state
```javascript
// Old code - multiple files sharing global state
// file1.js
syslog.init('app', syslog.LOG_PID, syslog.LOG_USER);

// file2.js  
syslog.log(syslog.LOG_INFO, 'Message'); // Uses global state
```

**Solution:** Pass logger instance or use convenience functions
```typescript
// file1.ts
import { createSyslog } from 'node-syslog';
export const logger = createSyslog({ ident: 'app' });

// file2.ts
import { logger } from './file1';
logger.info('Message');

// Or use convenience functions:
import { info } from 'node-syslog';
info('Message'); // Uses default logger
```

### Issue 2: Different Error Handling

**Problem:** New API throws different errors
```javascript
// Old code
try {
  syslog.log(syslog.LOG_INFO, message);
} catch (e) {
  // Handle old error format
}
```

**Solution:** Update error handling
```typescript
// New code
try {
  logger.info(message);
} catch (error) {
  if (error instanceof Error) {
    // Handle new error format with better messages
    console.error('Syslog error:', error.message);
  }
}
```

## Need Help?

- Check the [API Reference]({{ site.baseurl }}/api/)
- Review [Examples](./examples.md)
- Open an [Issue](https://github.com/yourusername/node-syslog/issues)
- Start a [Discussion](https://github.com/yourusername/node-syslog/discussions)