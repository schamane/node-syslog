---
title: Syslog Class
layout: default
parent: API Reference
nav_order: 1
---

# Syslog Class

The main syslog client class for structured logging.

## Constructor

```typescript
constructor(options?: SyslogOptions)
```

Creates a new Syslog instance with the specified options.

**Parameters:**
- `options` - Optional configuration object

## Methods

### emergency(message, context?)

Logs an emergency message.

```typescript
emergency(message: string, context?: Record<string, any>): void
```

### alert(message, context?)

Logs an alert message.

```typescript
alert(message: string, context?: Record<string, any>): void
```

### critical(message, context?)

Logs a critical message.

```typescript
critical(message: string, context?: Record<string, any>): void
```

### error(message, context?)

Logs an error message.

```typescript
error(message: string, context?: Record<string, any>): void
```

### warning(message, context?)

Logs a warning message.

```typescript
warning(message: string, context?: Record<string, any>): void
```

### notice(message, context?)

Logs a notice message.

```typescript
notice(message: string, context?: Record<string, any>): void
```

### info(message, context?)

Logs an info message.

```typescript
info(message: string, context?: Record<string, any>): void
```

### debug(message, context?)

Logs a debug message.

```typescript
debug(message: string, context?: Record<string, any>): void
```

### log(level, message, context?)

Logs a message at the specified level.

```typescript
log(level: SyslogLevel, message: string, context?: Record<string, any>): void
```

### close()

Closes the syslog connection.

```typescript
close(): void
```