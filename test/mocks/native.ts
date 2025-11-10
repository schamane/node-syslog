/**
 * Mock native module for testing
 * This simulates the native syslog functionality without actual system calls
 */

interface MockLogEntry {
  priority: number;
  message: string;
  timestamp: Date;
}

class MockSyslog {
  private logs: MockLogEntry[] = [];
  private isOpen: boolean = false;
  private currentIdent: string = '';
  private currentFacility: number = 1; // LOG_USER
  private currentOptions: number = 1; // LOG_PID

  openlog(ident: string, option: number, facility: number): void {
    this.currentIdent = ident;
    this.currentOptions = option;
    this.currentFacility = facility;
    this.isOpen = true;
  }

  syslog(priority: number, message: string): void {
    if (!this.isOpen) {
      throw new Error('Syslog not initialized. Call openlog() first.');
    }
    
    this.logs.push({
      priority,
      message,
      timestamp: new Date(),
    });
  }

  closelog(): void {
    this.isOpen = false;
  }

  getFacilities(): Record<string, number> {
    return {
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
    };
  }

  getLevels(): Record<string, number> {
    return {
      LOG_EMERG: 0,
      LOG_ALERT: 1,
      LOG_CRIT: 2,
      LOG_ERR: 3,
      LOG_WARNING: 4,
      LOG_NOTICE: 5,
      LOG_INFO: 6,
      LOG_DEBUG: 7,
    };
  }

  getOptions(): Record<string, number> {
    return {
      LOG_PID: 0x01,
      LOG_CONS: 0x02,
      LOG_ODELAY: 0x04,
      LOG_NDELAY: 0x08,
      LOG_NOWAIT: 0x10,
      LOG_PERROR: 0x20,
    };
  }

  // Test helper methods
  getLogs(): MockLogEntry[] {
    return [...this.logs];
  }

  clearLogs(): void {
    this.logs = [];
  }

  isOpened(): boolean {
    return this.isOpen;
  }

  getCurrentIdent(): string {
    return this.currentIdent;
  }

  getCurrentFacility(): number {
    return this.currentFacility;
  }

  getCurrentOptions(): number {
    return this.currentOptions;
  }
}

// Export singleton instance for testing
export const mockSyslog = new MockSyslog();

// Mock the native module
export default mockSyslog;