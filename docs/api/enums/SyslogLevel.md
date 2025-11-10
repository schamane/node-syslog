---
title: SyslogLevel
layout: default
parent: API Reference
nav_order: 3
---

# SyslogLevel Enum

Syslog severity level constants for prioritizing log messages.

## Values

| Value | Description |
|-------|-------------|
| `LOG_EMERG` | Emergency: system is unusable |
| `LOG_ALERT` | Alert: action must be taken immediately |
| `LOG_CRIT` | Critical: critical conditions |
| `LOG_ERR` | Error: error conditions |
| `LOG_WARNING` | Warning: warning conditions |
| `LOG_NOTICE` | Notice: normal but significant condition |
| `LOG_INFO` | Informational: informational messages |
| `LOG_DEBUG` | Debug: debug-level messages |

## Usage

```typescript
import { Syslog, SyslogLevel } from 'node-syslog'

const logger = new Syslog()

// Log at different levels
logger.log(SyslogLevel.LOG_INFO, 'Application started')
logger.log(SyslogLevel.LOG_ERR, 'Database connection failed')
```