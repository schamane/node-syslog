import { vi } from 'vitest';
import mockSyslog from './mocks/native';

// Set test environment
process.env.NODE_ENV = 'test';

// Make mock available globally
(globalThis as any).__MOCK_SYSLOG__ = mockSyslog;

// Mock native modules globally
vi.mock('node-gyp-build', () => vi.fn(() => mockSyslog));
vi.mock('../lib/binding/syslog_native.node', () => mockSyslog, { virtual: true });