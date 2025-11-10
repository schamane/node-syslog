---
title: SyslogOptions
layout: default
parent: API Reference
nav_order: 5
---

# SyslogOptions Interface

Configuration options for creating a Syslog instance.

## Properties

### ident?: string

Application identifier that appears in log messages. Defaults to the script name or 'node'.

**Type:** `string` (optional)

### facility?: SyslogFacility

Syslog facility to use for categorizing messages. Defaults to `LOG_USER`.

**Type:** `SyslogFacility` (optional)

### options?: SyslogOption

Syslog options for configuring logging behavior. Defaults to `LOG_PID`.

**Type:** `SyslogOption` (optional)

## Usage

```typescript
import { Syslog, SyslogFacility, SyslogOption } from 'node-syslog'

const logger = new Syslog({
  ident: 'my-application',
  facility: SyslogFacility.LOG_LOCAL0,
  options: SyslogOption.LOG_PID | SyslogOption.LOG_CONS
})
```

## Default Values

```typescript
const defaultOptions: SyslogOptions = {
  ident: process.argv[1] || 'node',
  facility: SyslogFacility.LOG_USER,
  options: SyslogOption.LOG_PID
}
```