---
title: node-syslog
has_children: true
nav_order: 1
---

# node-syslog

Modern Node.js syslog library with fluent TypeScript API for Linux systems.

[![npm version](https://badge.fury.io/js/node-syslog.svg)](https://badge.fury.io/js/node-syslog)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D22.0.0-brightgreen.svg)](https://nodejs.org/)

A modern, TypeScript-native replacement for the deprecated `node-syslog` package. Built with N-API for cross-platform binary compatibility and featuring a fluent, synchronous API.

## ✨ Features

- **Modern TypeScript**: Full type safety with strict mode
- **N-API Native**: Pre-built binaries for ARM64/AMD64 Linux
- **Fluent API**: Clean, chainable interface
- **Zero Dependencies**: Runtime footprint < 50KB
- **Synchronous Only**: Direct kernel syslog(3) calls (non-blocking)
- **Linux Optimized**: Designed specifically for Linux syslog systems

## 🚀 Quick Start

### Installation

```bash
npm install node-syslog
```

### Basic Usage

```typescript
import { Syslog } from 'node-syslog'

// Create logger instance
const logger = new Syslog({
  ident: 'myapp',
  facility: 'local0',
  options: ['pid', 'odelay']
})

// Log messages
logger.info('Server started', { port: 3000 })
logger.error('Connection failed', { code: 'ECONNREFUSED' })
logger.debug('Debug information', { userId: 123 })

// Close when done
logger.close()
```

### Advanced Configuration

```typescript
import { Syslog, SyslogFacility, SyslogLevel, SyslogOption } from 'node-syslog'

const logger = new Syslog({
  ident: 'production-app',
  facility: SyslogFacility.DAEMON,
  options: [SyslogOption.PID, SyslogOption.NDELAY, SyslogOption.LOG_PID],
  logLevel: SyslogLevel.INFO
})

// Structured logging
logger.warning('High memory usage', {
  memoryUsage: process.memoryUsage(),
  threshold: '500MB'
})
```

## 🏗️ Architecture

```
┌─────────────────────────────────────────────┐
│  TypeScript API Layer (src/index.ts)        │
│  Fluent class, input validation, types      │
├─────────────────────────────────────────────┤
│  N-API C++ Bridge (src/binding.cpp)         │
│  Direct type conversion, no threadpool      │
├─────────────────────────────────────────────┤
│  C Implementation (src/syslog.c)            │
│  Direct syslog(3) calls, zero allocations   │
└─────────────────────────────────────────────┘
```

## 📚 Documentation

- [Getting Started Guide]({{ site.baseurl }}/getting-started/)
- [API Reference]({{ site.baseurl }}/api/)
- [Installation Guide]({{ site.baseurl }}/installation/)
- [Migration Guide]({{ site.baseurl }}/migration/)
- [Examples]({{ site.baseurl }}/examples/)

## 🔧 Requirements

- **Node.js**: >= 22.x LTS
- **Platform**: Linux only
- **Architecture**: ARM64 or AMD64
- **System**: rsyslog or syslog-ng (optional)

## 📊 Performance

- **Latency**: < 1μs overhead vs raw syslog(3)
- **Throughput**: > 500,000 messages/second
- **Memory**: Zero allocations in hot path
- **Binary Size**: < 50KB per architecture

## 🤝 Contributing

Contributions are welcome! Please see our [Contributing Guide](https://github.com/schamane/node-syslog/blob/main/CONTRIBUTING.md) for details.

## 📄 License

MIT License - see [LICENSE](https://github.com/schamane/node-syslog/blob/main/LICENSE.md) file for details.

## 🔗 Links

- [GitHub Repository](https://github.com/schamane/node-syslog)
- [npm Package](https://www.npmjs.com/package/node-syslog)
- [Issue Tracker](https://github.com/schamane/node-syslog/issues)
- [Discussions](https://github.com/schamane/node-syslog/discussions)

---

**Note**: This package is designed for Linux systems only. For cross-platform logging, consider alternatives like Winston or Pino.