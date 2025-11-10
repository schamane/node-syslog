---
title: SyslogFacility
layout: default
parent: API Reference
nav_order: 2
---

# SyslogFacility Enum

Syslog facility constants for categorizing log messages.

## Values

| Value | Description |
|-------|-------------|
| `LOG_KERN` | Kernel messages |
| `LOG_USER` | User-level messages (default) |
| `LOG_MAIL` | Mail system |
| `LOG_DAEMON` | System daemons |
| `LOG_AUTH` | Security/authorization messages |
| `LOG_SYSLOG` | Syslog internal messages |
| `LOG_LPR` | Line printer subsystem |
| `LOG_NEWS` | Network news subsystem |
| `LOG_UUCP` | UUCP subsystem |
| `LOG_CRON` | Clock daemon |
| `LOG_AUTHPRIV` | Private security messages |
| `LOG_FTP` | FTP daemon |
| `LOG_LOCAL0` | Local facility 0 |
| `LOG_LOCAL1` | Local facility 1 |
| `LOG_LOCAL2` | Local facility 2 |
| `LOG_LOCAL3` | Local facility 3 |
| `LOG_LOCAL4` | Local facility 4 |
| `LOG_LOCAL5` | Local facility 5 |
| `LOG_LOCAL6` | Local facility 6 |
| `LOG_LOCAL7` | Local facility 7 |

## Usage

```typescript
import { Syslog, SyslogFacility } from 'node-syslog'

const logger = new Syslog({
  facility: SyslogFacility.LOG_LOCAL0
})
```