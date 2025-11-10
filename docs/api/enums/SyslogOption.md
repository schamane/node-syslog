---
title: SyslogOption
layout: default
parent: API Reference
nav_order: 4
---

# SyslogOption Enum

Syslog option constants for configuring logging behavior.

## Values

| Value | Description |
|-------|-------------|
| `LOG_PID` | Include PID in each message |
| `LOG_CONS` | Write to console if syslog is unavailable |
| `LOG_NDELAY` | Open connection immediately |
| `LOG_NOWAIT` | Don't wait for child processes |
| `LOG_ODELAY` | Delay connection until first message |

## Usage

```typescript
import { Syslog, SyslogOption } from 'node-syslog'

const logger = new Syslog({
  options: SyslogOption.LOG_PID | SyslogOption.LOG_CONS
})
```