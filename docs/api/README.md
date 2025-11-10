---
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

```typescript
import { Syslog } from 'node-syslog'

const logger = new Syslog({
  ident: 'myapp',
  facility: 'local0',
  options: ['pid', 'odelay']
})
```

## Types and Enums

### [Facility]({{ site.baseurl }}/api/enums/Facility.html)

Syslog facility constants.

### [LogLevel]({{ site.baseurl }}/api/enums/LogLevel.html)

Log level constants.

### [Option]({{ site.baseurl }}/api/enums/Option.html)

Syslog option constants.

## Interfaces

### [SyslogOptions]({{ site.baseurl }}/api/interfaces/SyslogOptions.html)

Configuration options for creating a Syslog instance.

---

*This documentation is automatically generated from TypeScript source code.*