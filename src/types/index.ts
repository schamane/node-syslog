/**
 * Syslog facility constants
 * 
 * Facilities determine the type of program that is logging the message.
 * Common facilities include LOG_USER for general user-level messages
 * and LOG_DAEMON for system daemons.
 */
export const SyslogFacility = {
  LOG_KERN: 0,
  LOG_USER: 1,
  LOG_MAIL: 2,
  LOG_DAEMON: 3,
  LOG_AUTH: 4,
  LOG_SYSLOG: 5,
  LOG_LPR: 6,
  LOG_NEWS: 7,
  LOG_UUCP: 8,
  LOG_CRON: 9,
  LOG_AUTHPRIV: 10,
  LOG_FTP: 11,
  LOG_LOCAL0: 16,
  LOG_LOCAL1: 17,
  LOG_LOCAL2: 18,
  LOG_LOCAL3: 19,
  LOG_LOCAL4: 20,
  LOG_LOCAL5: 21,
  LOG_LOCAL6: 22,
  LOG_LOCAL7: 23,
} as const;

export type SyslogFacilityType = typeof SyslogFacility[keyof typeof SyslogFacility];

/**
 * Syslog level constants
 * 
 * Levels indicate the severity of the log message.
 * Lower numbers indicate higher severity (LOG_EMERG = 0 is most severe).
 */
export const SyslogLevel = {
  LOG_EMERG: 0,
  LOG_ALERT: 1,
  LOG_CRIT: 2,
  LOG_ERR: 3,
  LOG_WARNING: 4,
  LOG_NOTICE: 5,
  LOG_INFO: 6,
  LOG_DEBUG: 7,
} as const;

export type SyslogLevelType = typeof SyslogLevel[keyof typeof SyslogLevel];

/**
 * Syslog option constants
 * 
 * Options control the behavior of syslog connection.
 * Common options include LOG_PID to include the process ID
 * and LOG_CONS to write to console if syslog is unavailable.
 */
export const SyslogOption = {
  LOG_PID: 0x01,
  LOG_CONS: 0x02,
  LOG_ODELAY: 0x04,
  LOG_NDELAY: 0x08,
  LOG_NOWAIT: 0x10,
  LOG_PERROR: 0x20,
} as const;

export type SyslogOptionType = typeof SyslogOption[keyof typeof SyslogOption];

/**
 * Configuration options for Syslog initialization
 */
export interface SyslogOptions {
  /**
   * Identifier string that will appear in log messages
   * @defaultValue Process name or script filename
   */
  ident?: string;
  
  /**
   * Syslog facility for categorizing log messages
   * @defaultValue SyslogFacility.LOG_USER
   */
  facility?: SyslogFacilityType;
  
  /**
   * Syslog options controlling connection behavior
   * @defaultValue SyslogOption.LOG_PID
   */
  options?: SyslogOptionType;
}

/**
 * Native module interface (for internal use)
 */
interface NativeSyslog {
  openlog(ident: string, option: number, facility: number): void;
  syslog(priority: number, message: string): void;
  closelog(): void;
  getFacilities(): Record<string, number>;
  getLevels(): Record<string, number>;
  getOptions(): Record<string, number>;
}

declare const native: NativeSyslog;