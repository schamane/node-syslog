# Node Syslog

A modern Node.js syslog library with fluent TypeScript API and native N-API bindings for Linux systems.

## Features

- 🚀 **Modern N-API** - Stable ABI compatibility across Node.js versions
- 📝 **Fluent TypeScript API** - Full IntelliSense support with method chaining
- ⚡ **Synchronous Only** - Fast, non-blocking syslog(3) calls
- 🐧 **Linux Native** - Direct syslog(3) integration for ARM64/AMD64
- 📦 **Binary Distribution** - Precompiled binaries, no compilation required
- 🧪 **Full Test Coverage** - Comprehensive tests with mocked native module

## Installation

```bash
npm install node-syslog
# or
pnpm add node-syslog
```

**Note:** This package only supports Linux x64/ARM64 systems.

## Documentation

Full documentation is available at: https://schamane.github.io/node-syslog/

## Quick Start

```typescript
import { Syslog, SyslogFacility, SyslogLevel, SyslogOption } from 'node-syslog';

// Create a logger instance
const logger = new Syslog({
  ident: 'my-app',
  facility: SyslogFacility.LOG_LOCAL0,
  options: SyslogOption.LOG_PID
});

// Use fluent interface
logger
  .info('Application started')
  .debug('Debugging information')
  .warning('Something might be wrong')
  .error('An error occurred', { userId: 123, error: 'timeout' });

// Or use convenience functions
import { info, error, debug } from 'node-syslog';

info('Simple info message');
error('Error with context', { code: 500, message: 'Internal server error' });
```

## API Reference

### Constructor Options

```typescript
interface SyslogOptions {
  ident?: string;        // Identifier (defaults to process name)
  facility?: SyslogFacility;  // Syslog facility (defaults to LOG_USER)
  options?: SyslogOption;     // Syslog options (defaults to LOG_PID)
}
```

### Logging Methods

All methods support fluent chaining:

```typescript
logger.emergency(message, context?)
logger.alert(message, context?)
logger.critical(message, context?)
logger.error(message, context?)
logger.warning(message, context?)
logger.notice(message, context?)
logger.info(message, context?)
logger.debug(message, context?)
```

### Constants

```typescript
import { SyslogFacility, SyslogLevel, SyslogOption } from 'node-syslog';

// Facilities
SyslogFacility.LOG_USER     // 1
SyslogFacility.LOG_LOCAL0   // 16
SyslogFacility.LOG_DAEMON   // 3
// ... and more

// Levels
SyslogLevel.LOG_EMERG    // 0
SyslogLevel.LOG_ALERT    // 1
SyslogLevel.LOG_CRIT     // 2
SyslogLevel.LOG_ERR      // 3
SyslogLevel.LOG_WARNING  // 4
SyslogLevel.LOG_NOTICE   // 5
SyslogLevel.LOG_INFO     // 6
SyslogLevel.LOG_DEBUG    // 7

// Options
SyslogOption.LOG_PID      // 0x01
SyslogOption.LOG_CONS     // 0x02
SyslogOption.LOG_NDELAY   // 0x08
// ... and more
```

## Examples

### Basic Usage

```typescript
import { Syslog, SyslogFacility } from 'node-syslog';

const logger = new Syslog({
  ident: 'web-server',
  facility: SyslogFacility.LOG_DAEMON
});

logger.info('Server listening on port 3000');
logger.error('Database connection failed', { 
  host: 'localhost', 
  port: 5432,
  error: 'ECONNREFUSED' 
});
```

### Context Logging

```typescript
import { createSyslog } from 'node-syslog';

const logger = createSyslog({ ident: 'auth-service' });

function logUserAction(userId: number, action: string, success: boolean) {
  logger.info('User action', {
    userId,
    action,
    success,
    timestamp: new Date().toISOString()
  });
}
```

### Method Chaining

```typescript
import { Syslog } from 'node-syslog';

const logger = new Syslog();

logger
  .debug('Starting request processing')
  .info('Request received', { method: 'GET', path: '/api/users' })
  .warning('Rate limit approaching', { current: 95, limit: 100 })
  .error('Request failed', { error: 'Timeout', duration: 5000 });
```

### Custom Facility

```typescript
import { Syslog, SyslogFacility, SyslogOption } from 'node-syslog';

const logger = new Syslog({
  ident: 'payment-service',
  facility: SyslogFacility.LOG_LOCAL1,
  options: SyslogOption.LOG_PID | SyslogOption.LOG_CONS
});

logger.critical('Payment processing failed', {
  amount: 99.99,
  currency: 'USD',
  error: 'Gateway timeout'
});
```

## Platform Support

- **Operating Systems:** Linux only
- **Architectures:** x64 (AMD64), ARM64
- **Node.js:** 22.0.0+

## Development

```bash
# Clone repository
git clone https://github.com/yourusername/node-syslog.git
cd node-syslog

# Install dependencies
pnpm install

# Build TypeScript
pnpm run build

# Build native module
pnpm run build:native

# Run tests
pnpm test

# Run tests with coverage
pnpm run test:coverage
```

## Migration from node-syslog

This is a complete rewrite with a different API. See migration guide for detailed instructions.

```typescript
// Old node-syslog
const syslog = require('node-syslog');
syslog.init('my-app', syslog.LOG_PID | syslog.LOG_ODELAY, syslog.LOG_LOCAL0);
syslog.log(syslog.LOG_INFO, 'Message');

// New node-syslog
import { Syslog, SyslogFacility, SyslogOption, SyslogLevel } from 'node-syslog';
const logger = new Syslog({
  ident: 'my-app',
  facility: SyslogFacility.LOG_LOCAL0,
  options: SyslogOption.LOG_PID | SyslogOption.LOG_ODELAY
});
logger.info('Message');
```

## License

MIT License - see LICENSE file for details.

## Contributing

Contributions are welcome! Please see CONTRIBUTING.md for guidelines.

## Support

- 📖 [Documentation](https://yourusername.github.io/node-syslog)
- 🐛 [Issue Tracker](https://github.com/yourusername/node-syslog/issues)
- 💬 [Discussions](https://github.com/yourusername/node-syslog/discussions)
