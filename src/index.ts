export {
  Syslog,
  createSyslog,
  defaultLogger,
  Facilities,
  Levels,
  Options,
  emergency,
  alert,
  critical,
  error,
  warning,
  notice,
  info,
  debug,
} from './syslog.js';

export type {
  SyslogOptions,
  SyslogFacilityType,
  SyslogLevelType,
  SyslogOptionType,
} from './types/index.js';

export {
  SyslogFacility,
  SyslogLevel,
  SyslogOption,
} from './types/index.js';