import 'fake-indexeddb/auto';
import { vi } from 'vitest';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

// Mock global objects and APIs
global.indexedDB = require('fake-indexeddb');
global.IDBKeyRange = require('fake-indexeddb/lib/FDBKeyRange');

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn()
};
global.localStorage = localStorageMock;

// Mock sessionStorage
global.sessionStorage = localStorageMock;

// Mock navigator
global.navigator = {
  ...global.navigator,
  onLine: true,
  language: 'en-US',
  userAgent: 'Mozilla/5.0 (Test Environment)',
  connection: {
    effectiveType: '4g',
    downlink: 10
  }
};

// Mock crypto for secure random generation
global.crypto = {
  getRandomValues: (arr) => {
    for (let i = 0; i < arr.length; i++) {
      arr[i] = Math.floor(Math.random() * 256);
    }
    return arr;
  }
};

// Mock fetch for API calls
global.fetch = vi.fn();

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: vi.fn(),
  warn: vi.fn(),
  error: vi.fn()
};

// Mock DOM methods
global.document = {
  ...global.document,
  createElement: vi.fn(() => ({
    style: {},
    classList: {
      add: vi.fn(),
      remove: vi.fn(),
      contains: vi.fn()
    },
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    appendChild: vi.fn(),
    removeChild: vi.fn(),
    querySelector: vi.fn(),
    querySelectorAll: vi.fn(() => []),
    getElementById: vi.fn(),
    dispatchEvent: vi.fn()
  })),
  addEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
  querySelector: vi.fn(),
  querySelectorAll: vi.fn(() => []),
  getElementById: vi.fn(),
  body: {
    appendChild: vi.fn(),
    removeChild: vi.fn()
  }
};

// Mock window object
global.window = {
  ...global.window,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  location: {
    hash: '',
    href: 'http://localhost:3000',
    origin: 'http://localhost:3000'
  },
  history: {
    pushState: vi.fn(),
    replaceState: vi.fn()
  }
};

// Reset all mocks before each test
beforeEach(() => {
  vi.clearAllMocks();
  localStorageMock.clear();
  
  // Reset IndexedDB
  global.indexedDB = require('fake-indexeddb');
  
  // Reset navigator online status
  global.navigator.onLine = true;
});