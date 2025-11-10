import { SyslogOptions, SyslogFacility, SyslogLevel, SyslogOption } from './types';

/**
 * Native module loader with fallback
 * @internal
 */
declare const require: (id: string) => any;
declare const __dirname: string;

function loadNativeModule() {
  try {
    // Try to load the precompiled binary first
    return require('../lib/binding/syslog_native.node');
  } catch (error) {
    try {
      // Fallback to the source module
      return require('node-gyp-build')(__dirname);
    } catch (fallbackError) {
      throw new Error(
        `Failed to load native syslog module. This package only supports Linux x64/ARM64.\n` +
        `Original error: ${error instanceof Error ? error.message : String(error)}\n` +
        `Fallback error: ${fallbackError instanceof Error ? fallbackError.message : String(fallbackError)}`
      );
    }
  }
}

/**
 * Main Syslog class providing fluent interface for system logging
 * 
 * This class wraps the native syslog(3) system calls with a modern TypeScript API.
 * All methods are synchronous and return the instance for method chaining.
 * 
 * @example
 * ```typescript
 * const logger = new Syslog({
 *   ident: 'my-app',
 *   facility: Facilities.LOG_LOCAL0
 * });
 * 
 * logger.info('Application started')
 *       .error('Something went wrong', { code: 500 });
 * ```
 */
export class Syslog {
  private native: any;
  private initialized: boolean = false;
  private ident: string;
  private facility: SyslogFacility;
  private options: SyslogOption;

  /**
   * Create a new Syslog instance
   * 
   * Initializes the syslog connection with the provided options.
   * If no options are provided, sensible defaults are used.
   * 
   * @param options - Configuration options for the syslog connection
   * 
   * @example
   * ```typescript
   * // Default configuration
   * const logger = new Syslog();
   * 
   * // Custom configuration
   * const logger = new Syslog({
   *   ident: 'web-server',
   *   facility: Facilities.LOG_DAEMON,
   *   options: Options.LOG_PID | Options.LOG_CONS
   * });
   * ```
   */
  constructor(options: SyslogOptions = {}) {
    this.native = loadNativeModule();
    this.ident = options.ident || (typeof require !== 'undefined' && (require as any).main?.filename) || 'node';
    this.facility = options.facility ?? SyslogFacility.LOG_USER;
    this.options = options.options ?? SyslogOption.LOG_PID;
    
    this.initialize();
  }

  private initialize(): void {
    if (!this.initialized) {
      this.native.openlog(this.ident, this.options, this.facility);
      this.initialized = true;
    }
  }

  /**
   * Log an emergency message (LOG_EMERG)
   * 
   * Emergency level indicates system is unusable (level 0).
   * 
   * @param message - The message to log
   * @param context - Optional context object with additional data
   * @returns The Syslog instance for method chaining
   * 
   * @example
   * ```typescript
   * logger.emergency('System crash detected', { 
   *   error: 'kernel_panic',
   *   timestamp: Date.now()
   * });
   * ```
   */
  emergency(message: string, context?: Record<string, any>): this {
    this.log(SyslogLevel.LOG_EMERG, message, context);
    return this;
  }

  /**
   * Log an alert message (LOG_ALERT)
   * @param message Message to log
   * @param context Optional context object
   */
  alert(message: string, context?: Record<string, any>): this {
    this.log(SyslogLevel.LOG_ALERT, message, context);
    return this;
  }

  /**
   * Log a critical message (LOG_CRIT)
   * @param message Message to log
   * @param context Optional context object
   */
  critical(message: string, context?: Record<string, any>): this {
    this.log(SyslogLevel.LOG_CRIT, message, context);
    return this;
  }

  /**
   * Log an error message (LOG_ERR)
   * @param message Message to log
   * @param context Optional context object
   */
  error(message: string, context?: Record<string, any>): this {
    this.log(SyslogLevel.LOG_ERR, message, context);
    return this;
  }

  /**
   * Log a warning message (LOG_WARNING)
   * @param message Message to log
   * @param context Optional context object
   */
  warning(message: string, context?: Record<string, any>): this {
    this.log(SyslogLevel.LOG_WARNING, message, context);
    return this;
  }

  /**
   * Log a notice message (LOG_NOTICE)
   * @param message Message to log
   * @param context Optional context object
   */
  notice(message: string, context?: Record<string, any>): this {
    this.log(SyslogLevel.LOG_NOTICE, message, context);
    return this;
  }

  /**
   * Log an info message (LOG_INFO)
   * @param message Message to log
   * @param context Optional context object
   */
  info(message: string, context?: Record<string, any>): this {
    this.log(SyslogLevel.LOG_INFO, message, context);
    return this;
  }

  /**
   * Log a debug message (LOG_DEBUG)
   * @param message Message to log
   * @param context Optional context object
   */
  debug(message: string, context?: Record<string, any>): this {
    this.log(SyslogLevel.LOG_DEBUG, message, context);
    return this;
  }

  /**
   * Log a message at the specified level
   * @param level Syslog level
   * @param message Message to log
   * @param context Optional context object
   */
  log(level: SyslogLevel, message: string, context?: Record<string, any>): this {
    if (!this.initialized) {
      this.initialize();
    }

    let formattedMessage = message;
    
    if (context) {
      try {
        const contextStr = Object.entries(context)
          .map(([key, value]) => `${key}=${JSON.stringify(value)}`)
          .join(' ');
        formattedMessage = `${message} ${contextStr}`;
      } catch (error) {
        // If JSON.stringify fails, just use string representation
        const contextStr = Object.entries(context)
          .map(([key, value]) => `${key}=${String(value)}`)
          .join(' ');
        formattedMessage = `${message} ${contextStr}`;
      }
    }

    this.native.syslog(level, formattedMessage);
    return this;
  }

  /**
   * Close the syslog connection and cleanup resources
   * 
   * Calls the underlying closelog(3) system function.
   * After calling this, the instance can be reinitialized by
   * calling any logging method.
   * 
   * @example
   * ```typescript
   * logger.close();
   * // Can be reused:
   * logger.info('Reinitialized');
   * ```
   */
  close(): void {
    if (this.initialized) {
      this.native.closelog();
      this.initialized = false;
    }
  }

  /**
   * Get the current facility
   */
  getFacility(): SyslogFacility {
    return this.facility;
  }

  /**
   * Get the current ident
   */
  getIdent(): string {
    return this.ident;
  }

  /**
   * Get the current options
   */
  getOptions(): SyslogOption {
    return this.options;
  }

  /**
   * Check if the syslog connection is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }
}

/**
 * Static access to facility constants
 */
export const Facilities: Record<string, number> = {
  LOG_KERN: SyslogFacility.LOG_KERN,
  LOG_USER: SyslogFacility.LOG_USER,
  LOG_MAIL: SyslogFacility.LOG_MAIL,
  LOG_DAEMON: SyslogFacility.LOG_DAEMON,
  LOG_AUTH: SyslogFacility.LOG_AUTH,
  LOG_SYSLOG: SyslogFacility.LOG_SYSLOG,
  LOG_LPR: SyslogFacility.LOG_LPR,
  LOG_NEWS: SyslogFacility.LOG_NEWS,
  LOG_UUCP: SyslogFacility.LOG_UUCP,
  LOG_CRON: SyslogFacility.LOG_CRON,
  LOG_AUTHPRIV: SyslogFacility.LOG_AUTHPRIV,
  LOG_FTP: SyslogFacility.LOG_FTP,
  LOG_LOCAL0: SyslogFacility.LOG_LOCAL0,
  LOG_LOCAL1: SyslogFacility.LOG_LOCAL1,
  LOG_LOCAL2: SyslogFacility.LOG_LOCAL2,
  LOG_LOCAL3: SyslogFacility.LOG_LOCAL3,
  LOG_LOCAL4: SyslogFacility.LOG_LOCAL4,
  LOG_LOCAL5: SyslogFacility.LOG_LOCAL5,
  LOG_LOCAL6: SyslogFacility.LOG_LOCAL6,
  LOG_LOCAL7: SyslogFacility.LOG_LOCAL7,
};

/**
 * Static access to level constants
 */
export const Levels: Record<string, number> = {
  LOG_EMERG: SyslogLevel.LOG_EMERG,
  LOG_ALERT: SyslogLevel.LOG_ALERT,
  LOG_CRIT: SyslogLevel.LOG_CRIT,
  LOG_ERR: SyslogLevel.LOG_ERR,
  LOG_WARNING: SyslogLevel.LOG_WARNING,
  LOG_NOTICE: SyslogLevel.LOG_NOTICE,
  LOG_INFO: SyslogLevel.LOG_INFO,
  LOG_DEBUG: SyslogLevel.LOG_DEBUG,
};

/**
 * Static access to option constants
 */
export const Options: Record<string, number> = {
  LOG_PID: SyslogOption.LOG_PID,
  LOG_CONS: SyslogOption.LOG_CONS,
  LOG_ODELAY: SyslogOption.LOG_ODELAY,
  LOG_NDELAY: SyslogOption.LOG_NDELAY,
  LOG_NOWAIT: SyslogOption.LOG_NOWAIT,
  LOG_PERROR: SyslogOption.LOG_PERROR,
};

/**
 * Create a new Syslog instance with default settings
 */
export function createSyslog(options?: SyslogOptions): Syslog {
  return new Syslog(options);
}

/**
 * Default syslog instance
 */
export const defaultLogger = new Syslog();

// Export convenience functions using the default logger
export const emergency = (message: string, context?: Record<string, any>) => 
  defaultLogger.emergency(message, context);

export const alert = (message: string, context?: Record<string, any>) => 
  defaultLogger.alert(message, context);

export const critical = (message: string, context?: Record<string, any>) => 
  defaultLogger.critical(message, context);

export const error = (message: string, context?: Record<string, any>) => 
  defaultLogger.error(message, context);

export const warning = (message: string, context?: Record<string, any>) => 
  defaultLogger.warning(message, context);

export const notice = (message: string, context?: Record<string, any>) => 
  defaultLogger.notice(message, context);

export const info = (message: string, context?: Record<string, any>) => 
  defaultLogger.info(message, context);

export const debug = (message: string, context?: Record<string, any>) => 
  defaultLogger.debug(message, context);