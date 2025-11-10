---
title: Examples
layout: default
parent: Documentation
nav_order: 6
---

# Examples

Real-world examples and usage patterns for node-syslog.

## Web Application Examples

### Express.js Server

```typescript
import express from 'express'
import { Syslog, SyslogFacility, SyslogOption } from 'node-syslog'

const app = express()
const logger = new Syslog({
  ident: 'webapp',
  facility: SyslogFacility.LOCAL0,
  options: [SyslogOption.PID, SyslogOption.NDELAY]
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
      ip: req.ip,
      contentLength: res.get('Content-Length')
    })
  })
  
  next()
})

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    userAgent: req.get('User-Agent'),
    ip: req.ip
  })
  
  res.status(500).json({ 
    error: 'Internal server error',
    requestId: req.headers['x-request-id']
  })
})

// Routes
app.get('/health', (req, res) => {
  logger.debug('Health check requested')
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.post('/api/users', (req, res) => {
  logger.info('Creating user', {
    ip: req.ip,
    userAgent: req.get('User-Agent')
  })
  
  try {
    // User creation logic here
    const userId = Math.floor(Math.random() * 10000)
    
    logger.info('User created successfully', {
      userId,
      ip: req.ip
    })
    
    res.status(201).json({ userId, message: 'User created' })
  } catch (error) {
    logger.error('User creation failed', {
      error: error instanceof Error ? error.message : String(error),
      ip: req.ip
    })
    
    res.status(400).json({ error: 'Failed to create user' })
  }
})

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  logger.info('Server started', { 
    port: PORT,
    nodeVersion: process.version,
    environment: process.env.NODE_ENV || 'development'
  })
})

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully')
  logger.close()
  process.exit(0)
})

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully')
  logger.close()
  process.exit(0)
})
```

### Fastify Server

```typescript
import fastify from 'fastify'
import { Syslog, SyslogFacility } from 'node-syslog'

const app = fastify({
  logger: false // We'll use our own logger
})

const logger = new Syslog({
  ident: 'fastify-app',
  facility: SyslogFacility.LOCAL1
})

// Request logging hook
app.addHook('onRequest', async (request, reply) => {
  request.startTime = Date.now()
})

app.addHook('onResponse', async (request, reply) => {
  const duration = Date.now() - (request.startTime as number)
  
  logger.info('HTTP Request', {
    method: request.method,
    url: request.url,
    statusCode: reply.statusCode,
    duration: `${duration}ms`,
    userAgent: request.headers['user-agent'],
    ip: request.ip,
    contentLength: reply.getHeader('content-length')
  })
})

// Error handling hook
app.addHook('onError', async (request, reply, error) => {
  logger.error('Request error', {
    error: error.message,
    stack: error.stack,
    url: request.url,
    method: request.method,
    statusCode: reply.statusCode
  })
})

// Routes
app.get('/health', async (request, reply) => {
  logger.debug('Health check requested')
  return { 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  }
})

app.post('/api/data', async (request, reply) => {
  logger.info('Processing data', {
    ip: request.ip,
    contentType: request.headers['content-type']
  })
  
  try {
    const data = request.body as any
    
    // Validate data
    if (!data || typeof data !== 'object') {
      logger.warning('Invalid data received', { ip: request.ip })
      return reply.status(400).send({ error: 'Invalid data' })
    }
    
    // Process data
    const result = {
      id: Math.floor(Math.random() * 1000),
      processed: true,
      timestamp: new Date().toISOString()
    }
    
    logger.info('Data processed successfully', {
      resultId: result.id,
      ip: request.ip
    })
    
    return reply.status(201).send(result)
  } catch (error) {
    logger.error('Data processing failed', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      ip: request.ip
    })
    
    return reply.status(500).send({ error: 'Processing failed' })
  }
})

const start = async () => {
  try {
    const PORT = process.env.PORT || 3000
    await app.listen({ port: PORT, host: '0.0.0.0' })
    
    logger.info('Fastify server started', {
      port: PORT,
      nodeVersion: process.version,
      environment: process.env.NODE_ENV || 'development'
    })
  } catch (err) {
    logger.error('Failed to start server', {
      error: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined
    })
    process.exit(1)
  }
}

start()

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully')
  logger.close()
  process.exit(0)
})
```

## Database Examples

### PostgreSQL with pg

```typescript
import { Pool, PoolClient } from 'pg'
import { Syslog, SyslogFacility } from 'node-syslog'

const logger = new Syslog({
  ident: 'database-service',
  facility: SyslogFacility.LOCAL2
})

// Database connection pool
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'myapp',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

// Log pool events
pool.on('connect', (client) => {
  logger.debug('New database client connected', {
    totalCount: pool.totalCount,
    idleCount: pool.idleCount,
    waitingCount: pool.waitingCount
  })
})

pool.on('error', (err, client) => {
  logger.error('Database pool error', {
    error: err.message,
    stack: err.stack,
    totalCount: pool.totalCount
  })
})

interface User {
  id: number
  name: string
  email: string
  created_at: Date
}

class UserService {
  async createUser(name: string, email: string): Promise<User> {
    const client = await pool.connect()
    
    try {
      logger.info('Creating user', { name, email })
      
      const result = await client.query(
        'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
        [name, email]
      )
      
      const user = result.rows[0]
      
      logger.info('User created successfully', {
        userId: user.id,
        name: user.name,
        email: user.email
      })
      
      return user
    } catch (error) {
      logger.error('Failed to create user', {
        error: error instanceof Error ? error.message : String(error),
        name,
        email,
        stack: error instanceof Error ? error.stack : undefined
      })
      throw error
    } finally {
      client.release()
      
      logger.debug('Database client released', {
        totalCount: pool.totalCount,
        idleCount: pool.idleCount,
        waitingCount: pool.waitingCount
      })
    }
  }
  
  async getUserById(id: number): Promise<User | null> {
    const client = await pool.connect()
    
    try {
      logger.debug('Fetching user by ID', { userId: id })
      
      const result = await client.query(
        'SELECT * FROM users WHERE id = $1',
        [id]
      )
      
      const user = result.rows[0] || null
      
      if (user) {
        logger.debug('User found', { userId: id, name: user.name })
      } else {
        logger.warning('User not found', { userId: id })
      }
      
      return user
    } catch (error) {
      logger.error('Failed to fetch user', {
        error: error instanceof Error ? error.message : String(error),
        userId: id,
        stack: error instanceof Error ? error.stack : undefined
      })
      throw error
    } finally {
      client.release()
    }
  }
  
  async updateUser(id: number, updates: Partial<User>): Promise<User> {
    const client = await pool.connect()
    
    try {
      logger.info('Updating user', { userId: id, updates })
      
      const fields = Object.keys(updates).filter(key => updates[key as keyof User] !== undefined)
      const values = fields.map(field => updates[field as keyof User])
      const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ')
      
      const query = `UPDATE users SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *`
      const result = await client.query(query, [id, ...values])
      
      const user = result.rows[0]
      
      if (user) {
        logger.info('User updated successfully', {
          userId: id,
          updatedFields: fields
        })
      } else {
        logger.warning('User not found for update', { userId: id })
      }
      
      return user
    } catch (error) {
      logger.error('Failed to update user', {
        error: error instanceof Error ? error.message : String(error),
        userId: id,
        updates,
        stack: error instanceof Error ? error.stack : undefined
      })
      throw error
    } finally {
      client.release()
    }
  }
}

// Usage example
async function main() {
  const userService = new UserService()
  
  try {
    // Create a user
    const user = await userService.createUser('John Doe', 'john@example.com')
    console.log('Created user:', user)
    
    // Fetch the user
    const fetchedUser = await userService.getUserById(user.id)
    console.log('Fetched user:', fetchedUser)
    
    // Update the user
    const updatedUser = await userService.updateUser(user.id, { name: 'John Smith' })
    console.log('Updated user:', updatedUser)
    
  } catch (error) {
    logger.error('Application error', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    })
  } finally {
    await pool.end()
    logger.close()
  }
}

main().catch(error => {
  logger.error('Failed to start application', {
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined
  })
  process.exit(1)
})
```

## Background Service Examples

### Worker Thread Service

```typescript
import { Worker, isMainThread, parentPort, workerData } from 'worker_threads'
import { Syslog, SyslogFacility, SyslogLevel } from 'node-syslog'

interface Job {
  id: string
  type: string
  data: any
  priority: 'low' | 'medium' | 'high'
  createdAt: Date
}

interface JobResult {
  jobId: string
  success: boolean
  result?: any
  error?: string
  processedAt: Date
  duration: number
}

class WorkerService {
  private logger: Syslog
  private workers: Worker[] = []
  private jobQueue: Job[] = []
  private isProcessing = false

  constructor(private workerCount: number = 4) {
    this.logger = new Syslog({
      ident: 'worker-service',
      facility: SyslogFacility.DAEMON,
      options: ['pid', 'ndelay'],
      logLevel: SyslogLevel.INFO
    })
  }

  async start(): Promise<void> {
    this.logger.info('Starting worker service', { workerCount: this.workerCount })
    
    // Create worker threads
    for (let i = 0; i < this.workerCount; i++) {
      const worker = new Worker(__filename, {
        workerData: { workerId: i }
      })
      
      worker.on('message', (result: JobResult) => {
        this.handleJobResult(result)
      })
      
      worker.on('error', (error) => {
        this.logger.error('Worker error', {
          workerId: i,
          error: error.message,
          stack: error.stack
        })
      })
      
      worker.on('exit', (code) => {
        if (code !== 0) {
          this.logger.error('Worker stopped unexpectedly', {
            workerId: i,
            exitCode: code
          })
        }
      })
      
      this.workers.push(worker)
      this.logger.info('Worker created', { workerId: i })
    }
    
    // Start processing jobs
    this.processJobs()
    
    this.logger.info('Worker service started successfully', {
      workerCount: this.workers.length
    })
  }

  addJob(job: Omit<Job, 'createdAt'>): void {
    const fullJob: Job = {
      ...job,
      createdAt: new Date()
    }
    
    this.jobQueue.push(fullJob)
    
    this.logger.info('Job added to queue', {
      jobId: fullJob.id,
      type: fullJob.type,
      priority: fullJob.priority,
      queueSize: this.jobQueue.length
    })
  }

  private async processJobs(): Promise<void> {
    this.isProcessing = true
    
    while (this.isProcessing) {
      if (this.jobQueue.length > 0 && this.workers.length > 0) {
        const job = this.jobQueue.shift()!
        const worker = this.workers[Math.floor(Math.random() * this.workers.length)]
        
        this.logger.debug('Dispatching job to worker', {
          jobId: job.id,
          type: job.type,
          queueSize: this.jobQueue.length
        })
        
        worker.postMessage(job)
      } else {
        // Wait a bit before checking again
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }
  }

  private handleJobResult(result: JobResult): void {
    if (result.success) {
      this.logger.info('Job completed successfully', {
        jobId: result.jobId,
        duration: result.duration,
        processedAt: result.processedAt
      })
    } else {
      this.logger.error('Job failed', {
        jobId: result.jobId,
        error: result.error,
        duration: result.duration,
        processedAt: result.processedAt
      })
    }
  }

  async stop(): Promise<void> {
    this.logger.info('Stopping worker service')
    
    this.isProcessing = false
    
    // Wait for current jobs to finish (with timeout)
    const timeout = setTimeout(() => {
      this.logger.warning('Timeout waiting for jobs to finish')
    }, 30000)
    
    while (this.jobQueue.length > 0) {
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
    
    clearTimeout(timeout)
    
    // Terminate workers
    await Promise.all(this.workers.map(worker => worker.terminate()))
    
    this.logger.info('Worker service stopped')
    this.logger.close()
  }

  getStats() {
    return {
      workerCount: this.workers.length,
      queueSize: this.jobQueue.length,
      isProcessing: this.isProcessing
    }
  }
}

// Worker thread code
if (!isMainThread) {
  const { workerId } = workerData as { workerId: number }
  const logger = new Syslog({
    ident: `worker-${workerId}`,
    facility: SyslogFacility.LOCAL3
  })

  parentPort?.on('message', async (job: Job) => {
    const startTime = Date.now()
    
    logger.debug('Processing job', {
      workerId,
      jobId: job.id,
      type: job.type
    })
    
    try {
      // Simulate different job types
      let result: any
      
      switch (job.type) {
        case 'email':
          result = await processEmail(job.data)
          break
        case 'image':
          result = await processImage(job.data)
          break
        case 'report':
          result = await processReport(job.data)
          break
        default:
          throw new Error(`Unknown job type: ${job.type}`)
      }
      
      const jobResult: JobResult = {
        jobId: job.id,
        success: true,
        result,
        processedAt: new Date(),
        duration: Date.now() - startTime
      }
      
      logger.info('Job processed successfully', {
        workerId,
        jobId: job.id,
        type: job.type,
        duration: jobResult.duration
      })
      
      parentPort?.postMessage(jobResult)
    } catch (error) {
      const jobResult: JobResult = {
        jobId: job.id,
        success: false,
        error: error instanceof Error ? error.message : String(error),
        processedAt: new Date(),
        duration: Date.now() - startTime
      }
      
      logger.error('Job processing failed', {
        workerId,
        jobId: job.id,
        type: job.type,
        error: jobResult.error,
        duration: jobResult.duration
      })
      
      parentPort?.postMessage(jobResult)
    }
  })

  async function processEmail(data: any): Promise<any> {
    // Simulate email processing
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500))
    return { sent: true, recipient: data.to }
  }

  async function processImage(data: any): Promise<any> {
    // Simulate image processing
    await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 1000))
    return { processed: true, size: data.size, format: 'jpeg' }
  }

  async function processReport(data: any): Promise<any> {
    // Simulate report generation
    await new Promise(resolve => setTimeout(resolve, Math.random() * 3000 + 2000))
    return { generated: true, pages: Math.floor(Math.random() * 50) + 10 }
  }
}

// Main application
if (isMainThread) {
  async function main() {
    const service = new WorkerService(4)
    
    await service.start()
    
    // Add some sample jobs
    for (let i = 1; i <= 20; i++) {
      const types = ['email', 'image', 'report']
      const priorities = ['low', 'medium', 'high']
      
      service.addJob({
        id: `job-${i}`,
        type: types[Math.floor(Math.random() * types.length)],
        data: { id: i, content: `Sample data ${i}` },
        priority: priorities[Math.floor(Math.random() * priorities.length)] as any
      })
    }
    
    // Monitor progress
    const monitor = setInterval(() => {
      const stats = service.getStats()
      console.log('Stats:', stats)
      
      if (stats.queueSize === 0) {
        clearInterval(monitor)
        setTimeout(() => service.stop(), 2000)
      }
    }, 2000)
  }
  
  main().catch(error => {
    console.error('Failed to start application:', error)
    process.exit(1)
  })
}
```

## CLI Application Examples

### Command Line Tool

```typescript
#!/usr/bin/env node

import { Command } from 'commander'
import { readFileSync, writeFileSync } from 'fs'
import { Syslog, SyslogFacility, SyslogLevel } from 'node-syslog'

const program = new Command()
const logger = new Syslog({
  ident: 'mycli',
  facility: SyslogFacility.LOCAL1,
  options: ['pid', 'ndelay']
})

program
  .name('mycli')
  .description('My CLI application with logging')
  .version('1.0.0')

program
  .command('process')
  .description('Process a file')
  .argument('<file>', 'file to process')
  .option('-o, --output <file>', 'output file')
  .option('-v, --verbose', 'verbose output')
  .option('-l, --level <level>', 'log level', 'info')
  .action((file, options) => {
    logger.info('Processing file started', { 
      file,
      output: options.output,
      verbose: options.verbose
    })
    
    try {
      // Set log level if specified
      if (options.level && options.level !== 'info') {
        logger.info(`Log level set to ${options.level}`)
      }
      
      // Read file
      if (options.verbose) {
        logger.debug('Reading file', { file })
      }
      
      const content = readFileSync(file, 'utf8')
      const lines = content.split('\n').filter(line => line.trim())
      
      logger.info('File read successfully', {
        file,
        lines: lines.length,
        size: content.length
      })
      
      // Process content
      const processed = lines.map((line, index) => {
        if (options.verbose) {
          logger.debug('Processing line', { 
            lineNumber: index + 1, 
            content: line.substring(0, 50) + '...' 
          })
        }
        
        // Example processing: convert to uppercase and add line number
        return `${index + 1}: ${line.toUpperCase()}`
      })
      
      const result = processed.join('\n')
      
      // Write output
      if (options.output) {
        writeFileSync(options.output, result)
        logger.info('Output written', { 
          output: options.output,
          size: result.length 
        })
      } else {
        console.log(result)
        logger.info('Output printed to console')
      }
      
      logger.info('File processing completed successfully', {
        file,
        linesProcessed: lines.length,
        outputSize: result.length
      })
      
    } catch (error) {
      logger.error('File processing failed', {
        file,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      })
      process.exit(1)
    }
  })

program
  .command('monitor')
  .description('Monitor system resources')
  .option('-i, --interval <seconds>', 'monitoring interval', '5')
  .option('-c, --count <number>', 'number of iterations', '10')
  .action((options) => {
    const interval = parseInt(options.interval) * 1000
    const count = parseInt(options.count)
    
    logger.info('Starting system monitoring', {
      interval: interval / 1000,
      count
    })
    
    let iteration = 0
    
    const monitor = setInterval(() => {
      iteration++
      
      const memUsage = process.memoryUsage()
      const cpuUsage = process.cpuUsage()
      
      logger.info('System metrics', {
        iteration,
        memory: {
          rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
          heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
          heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
          external: `${Math.round(memUsage.external / 1024 / 1024)}MB`
        },
        cpu: {
          user: cpuUsage.user,
          system: cpuUsage.system
        },
        uptime: `${Math.round(process.uptime())}s`
      })
      
      if (iteration >= count) {
        clearInterval(monitor)
        logger.info('System monitoring completed', {
          totalIterations: iteration
        })
      }
    }, interval)
  })

// Global error handling
process.on('uncaughtException', (error) => {
  logger.critical('Uncaught exception', {
    error: error.message,
    stack: error.stack
  })
  logger.close()
  process.exit(1)
})

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled rejection', {
    reason: reason instanceof Error ? reason.message : String(reason),
    stack: reason instanceof Error ? reason.stack : undefined
  })
})

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down')
  logger.close()
  process.exit(0)
})

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down')
  logger.close()
  process.exit(0)
})

program.parse()
```

## Testing Examples

### Unit Testing with Vitest

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { Syslog, SyslogFacility, SyslogLevel } from '../src/index'

// Mock the native module
vi.mock('../binding.node', () => ({
  init: vi.fn(),
  log: vi.fn(),
  close: vi.fn(),
  setLogLevel: vi.fn()
}))

describe('Syslog', () => {
  let logger: Syslog

  beforeEach(() => {
    logger = new Syslog({
      ident: 'test-app',
      facility: SyslogFacility.LOCAL0,
      logLevel: SyslogLevel.DEBUG
    })
  })

  afterEach(() => {
    logger.close()
  })

  describe('constructor', () => {
    it('should create logger with valid options', () => {
      expect(logger).toBeDefined()
    })

    it('should throw error with invalid facility', () => {
      expect(() => new Syslog({
        ident: 'test',
        facility: 'invalid' as any
      })).toThrow('Invalid facility: invalid')
    })

    it('should throw error with invalid log level', () => {
      expect(() => new Syslog({
        ident: 'test',
        logLevel: 'invalid' as any
      })).toThrow('Invalid log level: invalid')
    })

    it('should require ident parameter', () => {
      expect(() => new Syslog({} as any)).toThrow('ident is required')
    })
  })

  describe('logging methods', () => {
    it('should log emergency messages', () => {
      const { log } = require('../binding.node')
      
      logger.emerg('Emergency message', { context: 'test' })
      
      expect(log).toHaveBeenCalledWith(
        expect.any(Number), // LOG_EMERG
        expect.stringContaining('Emergency message')
      )
    })

    it('should log alert messages', () => {
      const { log } = require('../binding.node')
      
      logger.alert('Alert message')
      
      expect(log).toHaveBeenCalledWith(
        expect.any(Number), // LOG_ALERT
        expect.stringContaining('Alert message')
      )
    })

    it('should log critical messages', () => {
      const { log } = require('../binding.node')
      
      logger.crit('Critical message')
      
      expect(log).toHaveBeenCalledWith(
        expect.any(Number), // LOG_CRIT
        expect.stringContaining('Critical message')
      )
    })

    it('should log error messages', () => {
      const { log } = require('../binding.node')
      
      logger.error('Error message', { code: 'TEST_ERROR' })
      
      expect(log).toHaveBeenCalledWith(
        expect.any(Number), // LOG_ERR
        expect.stringContaining('Error message')
      )
    })

    it('should log warning messages', () => {
      const { log } = require('../binding.node')
      
      logger.warning('Warning message')
      
      expect(log).toHaveBeenCalledWith(
        expect.any(Number), // LOG_WARNING
        expect.stringContaining('Warning message')
      )
    })

    it('should log notice messages', () => {
      const { log } = require('../binding.node')
      
      logger.notice('Notice message')
      
      expect(log).toHaveBeenCalledWith(
        expect.any(Number), // LOG_NOTICE
        expect.stringContaining('Notice message')
      )
    })

    it('should log info messages', () => {
      const { log } = require('../binding.node')
      
      logger.info('Info message')
      
      expect(log).toHaveBeenCalledWith(
        expect.any(Number), // LOG_INFO
        expect.stringContaining('Info message')
      )
    })

    it('should log debug messages', () => {
      const { log } = require('../binding.node')
      
      logger.debug('Debug message')
      
      expect(log).toHaveBeenCalledWith(
        expect.any(Number), // LOG_DEBUG
        expect.stringContaining('Debug message')
      )
    })
  })

  describe('log level filtering', () => {
    it('should filter debug messages when log level is info', () => {
      const { log } = require('../binding.node')
      
      const infoLogger = new Syslog({
        ident: 'test',
        logLevel: SyslogLevel.INFO
      })
      
      infoLogger.debug('This should not appear')
      infoLogger.info('This should appear')
      
      expect(log).toHaveBeenCalledTimes(1)
      expect(log).toHaveBeenCalledWith(
        expect.any(Number), // LOG_INFO
        expect.stringContaining('This should appear')
      )
    })

    it('should check if debug is enabled', () => {
      const infoLogger = new Syslog({
        ident: 'test',
        logLevel: SyslogLevel.INFO
      })
      
      expect(infoLogger.isDebugEnabled()).toBe(false)
      
      const debugLogger = new Syslog({
        ident: 'test',
        logLevel: SyslogLevel.DEBUG
      })
      
      expect(debugLogger.isDebugEnabled()).toBe(true)
    })
  })

  describe('context handling', () => {
    it('should handle context objects', () => {
      const { log } = require('../binding.node')
      
      logger.info('Test message', {
        userId: 123,
        action: 'login',
        ip: '192.168.1.1'
      })
      
      expect(log).toHaveBeenCalledWith(
        expect.any(Number),
        expect.stringContaining('Test message'),
        expect.stringContaining('userId=123'),
        expect.stringContaining('action=login'),
        expect.stringContaining('ip=192.168.1.1')
      )
    })

    it('should handle circular references in context', () => {
      const { log } = require('../binding.node')
      
      const context: any = { userId: 123 }
      context.circular = context
      
      expect(() => {
        logger.info('Test message', context)
      }).not.toThrow()
    })
  })

  describe('cleanup', () => {
    it('should close syslog connection', () => {
      const { close } = require('../binding.node')
      
      logger.close()
      
      expect(close).toHaveBeenCalled()
    })
  })
})
```

These examples demonstrate various real-world usage patterns for node-syslog in different application types and scenarios.