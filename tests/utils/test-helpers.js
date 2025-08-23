import { vi } from 'vitest';

// Test data factories
export const createMockUser = (overrides = {}) => ({
  id: 1,
  name: 'Test User',
  email: 'test@example.com',
  age: 30,
  gender: 'male',
  preferences: {
    notifications: {
      dailyReminders: true,
      weeklyNutrition: true,
      motivationalMessages: true
    },
    dietary: {
      cuisine: 'general',
      restrictions: []
    },
    language: 'en',
    timezone: 'UTC'
  },
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  ...overrides
});

export const createMockAssessment = (overrides = {}) => ({
  id: 1,
  userId: 1,
  date: '2024-01-01',
  score: 10,
  category: 'Increased',
  responses: {
    age: 2,
    gender: 1,
    family_history: 3,
    high_blood_pressure: 2,
    physical_activity: 2,
    bmi: 1,
    gestational_diabetes: 0,
    prediabetes: 0
  },
  aiExplanation: 'Test explanation',
  recommendations: ['Test recommendation'],
  createdAt: '2024-01-01T00:00:00.000Z',
  ...overrides
});

export const createMockMoodEntry = (overrides = {}) => ({
  id: 1,
  userId: 1,
  date: '2024-01-01',
  mood: 3,
  notes: 'Test mood entry',
  aiAffirmation: 'Test affirmation',
  copingStrategies: ['Test strategy'],
  createdAt: '2024-01-01T00:00:00.000Z',
  ...overrides
});

export const createMockNutritionPlan = (overrides = {}) => ({
  id: 1,
  userId: 1,
  planType: '3-day',
  cuisine: 'general',
  dietaryRestrictions: [],
  meals: [
    {
      day: 1,
      meals: {
        breakfast: ['Oatmeal with berries'],
        lunch: ['Grilled chicken salad'],
        dinner: ['Baked salmon'],
        snack: ['Apple slices']
      }
    }
  ],
  adherenceTracking: [],
  createdAt: '2024-01-01T00:00:00.000Z',
  ...overrides
});

// Mock API responses
export const mockGeminiResponse = (text = 'Mock AI response') => ({
  candidates: [{
    content: {
      parts: [{
        text
      }]
    }
  }]
});

export const mockFetchResponse = (data, ok = true, status = 200) => {
  global.fetch.mockResolvedValueOnce({
    ok,
    status,
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(typeof data === 'string' ? data : JSON.stringify(data))
  });
};

// Database test utilities
export const setupMockDatabase = () => {
  const mockDb = {
    createUser: vi.fn(),
    getUser: vi.fn(),
    updateUser: vi.fn(),
    saveAssessment: vi.fn(),
    getUserAssessments: vi.fn(),
    getLatestAssessment: vi.fn(),
    saveMood: vi.fn(),
    getMoodByDate: vi.fn(),
    getUserMoods: vi.fn(),
    saveNutritionPlan: vi.fn(),
    getUserNutritionPlans: vi.fn(),
    saveProgress: vi.fn(),
    getUserProgress: vi.fn(),
    generateHealthReport: vi.fn(),
    getFromLocalStorage: vi.fn(),
    saveToLocalStorage: vi.fn()
  };
  
  global.window = { ...global.window, kiroDb: mockDb };
  return mockDb;
};

// AI service test utilities
export const setupMockAI = () => {
  const mockAI = {
    isInitialized: vi.fn(() => true),
    initialize: vi.fn(() => true),
    explainRiskScore: vi.fn(),
    generatePersonalizedRecommendations: vi.fn(),
    generateMealPlan: vi.fn(),
    generateMoodAffirmation: vi.fn(),
    generateCopingStrategies: vi.fn(),
    generateEnhancedSupport: vi.fn(),
    analyzeProgressTrends: vi.fn(),
    generateMotivationalMessage: vi.fn(),
    generateContent: vi.fn()
  };
  
  global.window = { ...global.window, geminiAI: mockAI };
  return mockAI;
};

// Auth service test utilities
export const setupMockAuth = () => {
  const mockAuth = {
    isAuthenticated: vi.fn(() => false),
    getCurrentUser: vi.fn(() => null),
    register: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
    updateProfile: vi.fn(),
    loadSession: vi.fn(),
    createSession: vi.fn(),
    clearSession: vi.fn()
  };
  
  global.window = { ...global.window, authService: mockAuth };
  return mockAuth;
};

// Error handler test utilities
export const setupMockErrorHandler = () => {
  const mockErrorHandler = {
    handleError: vi.fn(),
    showUserError: vi.fn(),
    performHealthCheck: vi.fn(() => Promise.resolve({ database: true })),
    logError: vi.fn()
  };
  
  global.window = { ...global.window, errorHandler: mockErrorHandler };
  return mockErrorHandler;
};

// Offline manager test utilities
export const setupMockOfflineManager = () => {
  const mockOfflineManager = {
    queueOperation: vi.fn(),
    syncOfflineData: vi.fn(),
    isOfflineMode: false,
    getQueuedOperations: vi.fn(() => []),
    clearQueue: vi.fn()
  };
  
  global.window = { ...global.window, offlineManager: mockOfflineManager };
  return mockOfflineManager;
};

// Notification service test utilities
export const setupMockNotificationService = () => {
  const mockNotificationService = {
    requestNotificationPermission: vi.fn(() => Promise.resolve('granted')),
    scheduleDailyNotifications: vi.fn(),
    scheduleWeeklySummaries: vi.fn(),
    checkForInactiveUsers: vi.fn(),
    scheduledNotifications: new Map()
  };
  
  global.window = { ...global.window, notificationService: mockNotificationService };
  return mockNotificationService;
};

// DOM test utilities
export const createMockElement = (tagName = 'div', attributes = {}) => {
  const element = {
    tagName: tagName.toUpperCase(),
    id: attributes.id || '',
    className: attributes.className || '',
    innerHTML: '',
    textContent: '',
    style: {},
    dataset: {},
    classList: {
      add: vi.fn(),
      remove: vi.fn(),
      contains: vi.fn(() => false),
      toggle: vi.fn()
    },
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    appendChild: vi.fn(),
    removeChild: vi.fn(),
    querySelector: vi.fn(),
    querySelectorAll: vi.fn(() => []),
    getAttribute: vi.fn(),
    setAttribute: vi.fn(),
    removeAttribute: vi.fn(),
    click: vi.fn(),
    focus: vi.fn(),
    blur: vi.fn(),
    ...attributes
  };
  
  return element;
};

// Event simulation utilities
export const simulateEvent = (element, eventType, eventData = {}) => {
  const event = {
    type: eventType,
    target: element,
    preventDefault: vi.fn(),
    stopPropagation: vi.fn(),
    ...eventData
  };
  
  if (element.addEventListener.mock) {
    // Find and call the event listener
    const calls = element.addEventListener.mock.calls;
    const listener = calls.find(call => call[0] === eventType);
    if (listener && listener[1]) {
      listener[1](event);
    }
  }
  
  return event;
};

// Async test utilities
export const waitFor = (condition, timeout = 1000) => {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    const check = () => {
      if (condition()) {
        resolve();
      } else if (Date.now() - startTime > timeout) {
        reject(new Error('Timeout waiting for condition'));
      } else {
        setTimeout(check, 10);
      }
    };
    
    check();
  });
};

// Date utilities for testing
export const mockDate = (dateString) => {
  const mockDate = new Date(dateString);
  vi.spyOn(global, 'Date').mockImplementation(() => mockDate);
  return mockDate;
};

export const restoreDate = () => {
  vi.restoreAllMocks();
};