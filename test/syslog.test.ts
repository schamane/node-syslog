import { describe, it, expect, beforeEach, vi } from 'vitest';
import mockSyslog from './mocks/native';

// Import after mocking (setup is handled in setup.ts)
import { Syslog, createSyslog, SyslogFacility, SyslogLevel, SyslogOption, Levels } from '../src/index';
import type { SyslogOptionType } from '../src/index';

describe('Syslog', () => {
  beforeEach(() => {
    mockSyslog.clearLogs();
    vi.clearAllMocks();
  });

  describe('Constructor', () => {
    it('should create a Syslog instance with default options', () => {
      const logger = new Syslog();
      expect(logger).toBeInstanceOf(Syslog);
      expect(logger.isInitialized()).toBe(true);
      expect(mockSyslog.isOpened()).toBe(true);
    });

    it('should create a Syslog instance with custom options', () => {
      const options = {
        ident: 'test-app',
        facility: SyslogFacility.LOG_LOCAL0,
        options: (SyslogOption.LOG_PID | SyslogOption.LOG_CONS) as SyslogOptionType,
      };
      
      const logger = new Syslog(options);
      expect(logger.getIdent()).toBe('test-app');
      expect(logger.getFacility()).toBe(SyslogFacility.LOG_LOCAL0);
      expect(logger.getOptions()).toBe(SyslogOption.LOG_PID | SyslogOption.LOG_CONS);
    });
  });

  describe('Logging Methods', () => {
    let logger: Syslog;

    beforeEach(() => {
      logger = new Syslog({ ident: 'test' });
    });

    it('should log emergency messages', () => {
      logger.emergency('Emergency message');
      const logs = mockSyslog.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].priority).toBe(Levels.LOG_EMERG);
      expect(logs[0].message).toBe('Emergency message');
    });

    it('should log alert messages', () => {
      logger.alert('Alert message');
      const logs = mockSyslog.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].priority).toBe(Levels.LOG_ALERT);
      expect(logs[0].message).toBe('Alert message');
    });

    it('should log critical messages', () => {
      logger.critical('Critical message');
      const logs = mockSyslog.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].priority).toBe(Levels.LOG_CRIT);
      expect(logs[0].message).toBe('Critical message');
    });

    it('should log error messages', () => {
      logger.error('Error message');
      const logs = mockSyslog.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].priority).toBe(Levels.LOG_ERR);
      expect(logs[0].message).toBe('Error message');
    });

    it('should log warning messages', () => {
      logger.warning('Warning message');
      const logs = mockSyslog.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].priority).toBe(Levels.LOG_WARNING);
      expect(logs[0].message).toBe('Warning message');
    });

    it('should log notice messages', () => {
      logger.notice('Notice message');
      const logs = mockSyslog.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].priority).toBe(Levels.LOG_NOTICE);
      expect(logs[0].message).toBe('Notice message');
    });

    it('should log info messages', () => {
      logger.info('Info message');
      const logs = mockSyslog.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].priority).toBe(Levels.LOG_INFO);
      expect(logs[0].message).toBe('Info message');
    });

    it('should log debug messages', () => {
      logger.debug('Debug message');
      const logs = mockSyslog.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].priority).toBe(Levels.LOG_DEBUG);
      expect(logs[0].message).toBe('Debug message');
    });

    it('should log messages with context', () => {
      const context = { userId: 123, action: 'login' };
      logger.error('User action failed', context);
      
      const logs = mockSyslog.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].priority).toBe(Levels.LOG_ERR);
      expect(logs[0].message).toContain('User action failed');
      expect(logs[0].message).toContain('userId=123');
      expect(logs[0].message).toContain('action="login"');
    });

    it('should handle circular references in context', () => {
      const context: any = { userId: 123 };
      context.self = context;
      
      logger.info('Circular context', context);
      
      const logs = mockSyslog.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].message).toContain('Circular context');
    });
  });

  describe('Fluent Interface', () => {
    it('should support method chaining', () => {
      const logger = new Syslog({ ident: 'test' });
      
      const result = logger
        .debug('Debug message')
        .info('Info message')
        .warning('Warning message')
        .error('Error message');
      
      expect(result).toBe(logger);
      
      const logs = mockSyslog.getLogs();
      expect(logs).toHaveLength(4);
      expect(logs[0].priority).toBe(Levels.LOG_DEBUG);
      expect(logs[1].priority).toBe(Levels.LOG_INFO);
      expect(logs[2].priority).toBe(Levels.LOG_WARNING);
      expect(logs[3].priority).toBe(Levels.LOG_ERR);
    });
  });

  describe('Resource Management', () => {
    it('should close syslog connection', () => {
      const logger = new Syslog({ ident: 'test' });
      expect(logger.isInitialized()).toBe(true);
      expect(mockSyslog.isOpened()).toBe(true);
      
      logger.close();
      expect(logger.isInitialized()).toBe(false);
      expect(mockSyslog.isOpened()).toBe(false);
    });

    it('should reinitialize after close', () => {
      const logger = new Syslog({ ident: 'test' });
      logger.close();
      
      logger.info('Message after reinit');
      expect(logger.isInitialized()).toBe(true);
      expect(mockSyslog.isOpened()).toBe(true);
      
      const logs = mockSyslog.getLogs();
      expect(logs).toHaveLength(1);
    });
  });

  describe('Constants', () => {
    it('should provide correct facility constants', () => {
      const facilities = mockSyslog.getFacilities();
      expect(facilities.LOG_USER).toBe(1);
      expect(facilities.LOG_LOCAL0).toBe(16);
      expect(facilities.LOG_DAEMON).toBe(3);
    });

    it('should provide correct level constants', () => {
      const levels = mockSyslog.getLevels();
      expect(levels.LOG_EMERG).toBe(0);
      expect(levels.LOG_DEBUG).toBe(7);
      expect(levels.LOG_ERR).toBe(3);
    });

    it('should provide correct option constants', () => {
      const options = mockSyslog.getOptions();
      expect(options.LOG_PID).toBe(0x01);
      expect(options.LOG_CONS).toBe(0x02);
      expect(options.LOG_NDELAY).toBe(0x08);
    });
  });
});

describe('createSyslog', () => {
  it('should create a new Syslog instance', () => {
    const logger = createSyslog({ ident: 'created' });
    expect(logger).toBeInstanceOf(Syslog);
    expect(logger.getIdent()).toBe('created');
  });

  it('should create instance with default options', () => {
    const logger = createSyslog();
    expect(logger).toBeInstanceOf(Syslog);
    expect(logger.isInitialized()).toBe(true);
  });
});