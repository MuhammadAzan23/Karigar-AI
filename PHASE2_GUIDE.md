# Phase 2 Implementation Guide

## Getting Started with Next-Level Improvements

---

## 1. Setting Up Global State Management (Zustand)

### Installation
```bash
npm install zustand
```

### Create Store
**File: `store/bookingStore.js`**
```javascript
import { create } from 'zustand';

export const useBookingStore = create((set, get) => ({
  // State
  currentBooking: null,
  bookingHistory: [],
  providers: [],
  cachedIntents: {},
  
  // Actions
  setCurrentBooking: (booking) => set({ currentBooking: booking }),
  addBookingToHistory: (booking) => set(state => ({
    bookingHistory: [booking, ...state.bookingHistory]
  })),
  cacheIntent: (query, intent) => set(state => ({
    cachedIntents: { ...state.cachedIntents, [query]: intent }
  })),
  getIntentFromCache: (query) => get().cachedIntents[query] || null,
}));
```

### Usage in Components
```javascript
import { useBookingStore } from '../store/bookingStore';

export default function ChatScreen() {
  const { cacheIntent, getIntentFromCache } = useBookingStore();
  
  const handleMessage = async (text) => {
    // Check cache first
    const cached = getIntentFromCache(text);
    if (cached) return cached;
    
    // If not cached, fetch and cache
    const intent = await extractIntent(text);
    cacheIntent(text, intent);
    return intent;
  };
}
```

---

## 2. TypeScript Migration (Gradual)

### Step 1: Setup TypeScript
```bash
npm install --save-dev typescript @types/react-native
npx tsc --init
```

### Step 2: Create Type Definitions
**File: `types/index.ts`**
```typescript
export interface Provider {
  id: string;
  name: string;
  rating: number;
  review_count: number;
  price_per_hour: number;
  distanceKm: number;
  latitude: number;
  longitude: number;
}

export interface Intent {
  service_type: 'electrician' | 'plumber' | 'AC technician' | 'tutor' | 'beautician' | 'unknown';
  location: string;
  urgency: 'low' | 'medium' | 'high';
  confidence_score: number;
  clarification_needed: boolean;
}

export interface Booking {
  id: string;
  customerId: string;
  providerId: string;
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  quotedPrice: number;
  scheduledTime: number;
}
```

### Step 3: Migrate Critical Files
Priority order:
1. Agents (`agents/*.ts`)
2. Utilities (`utils/helpers.ts`)
3. Screens (`screens/**/*.tsx`)
4. Components (`components/**/*.tsx`)

**Example - Convert agent to TS**:
```typescript
import { Intent, Provider } from '../types';

export async function extractIntent(userInput: string): Promise<Intent> {
  // Implementation
}

export function rankProviders(
  providers: Provider[],
  intent: Intent
): Provider[] {
  // Implementation
}
```

---

## 3. Adding Sentry for Error Tracking

### Setup
```bash
npx sentry-cli releases files upload-sourcemaps .
npm install @sentry/react-native
```

### Initialize in App.js
```javascript
import * as Sentry from "@sentry/react-native";

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  enableOutOfMemoryTracking: true,
  tracesSampleRate: 0.2,
});

// Wrap navigation
export default Sentry.wrap(App);
```

### Capture Errors
```javascript
try {
  // operation
} catch (error) {
  Sentry.captureException(error, {
    contexts: { 
      chat: { messageCount: messages.length }
    }
  });
}
```

---

## 4. Implementing Unit Tests

### Setup Jest
```bash
npm install --save-dev jest @testing-library/react-native
```

**File: `agents/__tests__/intentAgent.test.js`**
```javascript
import { extractIntent } from '../intentAgent';

describe('Intent Extraction', () => {
  test('should extract electrician service', async () => {
    const result = await extractIntent('Bijli ka short circuit hai');
    expect(result.service_type).toBe('electrician');
    expect(result.confidence_score).toBeGreaterThan(0.75);
  });

  test('should request clarification for ambiguous input', async () => {
    const result = await extractIntent('hello');
    expect(result.clarification_needed).toBe(true);
  });

  test('should validate using Zod schema', async () => {
    const result = await extractIntent('AC thanda nahi kar raha');
    const validated = IntentSchema.parse(result);
    expect(validated).toBeDefined();
  });
});
```

---

## 5. Adding Performance Monitoring

### Setup Firebase Performance
```bash
npm install firebase-performance
```

**File: `utils/performance.js`**
```javascript
import { initializePerformance, trace } from 'firebase/performance';
import { app } from '../config/firebase';

const perf = initializePerformance(app);

export async function measureChatResponse(fn) {
  const t = trace(perf, 'chat_agent_pipeline');
  t.start();
  
  try {
    return await fn();
  } finally {
    t.stop();
  }
}
```

### Usage
```javascript
const pipelineOutput = await measureChatResponse(() => 
  runMultiAgentPipeline(text)
);
```

---

## 6. Offline Mode with AsyncStorage

### Setup
```bash
npm install async-storage
```

**File: `utils/storage.js`**
```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';

export const storage = {
  async saveBooking(booking) {
    const bookings = await AsyncStorage.getItem('pending_bookings') || '[]';
    const list = JSON.parse(bookings);
    list.push({ ...booking, local_id: Date.now() });
    await AsyncStorage.setItem('pending_bookings', JSON.stringify(list));
  },

  async getPendingBookings() {
    const bookings = await AsyncStorage.getItem('pending_bookings') || '[]';
    return JSON.parse(bookings);
  },

  async clearPendingBookings() {
    await AsyncStorage.removeItem('pending_bookings');
  },
};
```

---

## 7. Real Backend Integration

### Setup Backend API
```javascript
// utils/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_BASE_URL,
  timeout: 10000,
});

// Retry middleware
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Handle auth failure - refresh token or login
    }
    return Promise.reject(error);
  }
);

export default api;
```

### API Endpoints
```javascript
// agents/api.js
import api from '../utils/api';

export async function extractIntentAPI(text) {
  const response = await api.post('/intent/extract', { text });
  return response.data;
}

export async function rankProvidersAPI(intent, location) {
  const response = await api.post('/matching/rank', { intent, location });
  return response.data;
}

export async function createBookingAPI(booking) {
  const response = await api.post('/bookings', booking);
  return response.data;
}
```

---

## 8. Push Notifications Setup

### Install Firebase Cloud Messaging
```bash
npm install expo-notifications firebase-messaging
```

**File: `utils/notifications.js`**
```javascript
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function registerForNotifications() {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') return null;

  const token = (await Notifications.getExpoPushTokenAsync()).data;
  return token;
}

export function subscribeToNotifications(callback) {
  return Notifications.addNotificationResponseReceivedListener(callback);
}
```

---

## 9. Analytics Implementation

### Setup Firebase Analytics
```javascript
// config/analytics.js
import { getAnalytics, logEvent } from 'firebase/analytics';
import { app } from './firebase';

export const analytics = getAnalytics(app);

export function trackBookingCreated(booking) {
  logEvent(analytics, 'booking_created', {
    service_type: booking.serviceType,
    amount: booking.quotedPrice,
    provider_id: booking.providerId,
  });
}

export function trackBookingCompleted(booking) {
  logEvent(analytics, 'booking_completed', {
    duration: booking.actualDuration,
    rating: booking.rating,
  });
}
```

---

## 10. Development Checklist

### Before Deploying Phase 2
- [ ] TypeScript types reviewed and approved
- [ ] Unit tests coverage > 70%
- [ ] Integration tests for critical flows
- [ ] E2E tests for user journeys
- [ ] Performance profiling complete
- [ ] Bundle size < 5MB
- [ ] Memory usage < 200MB
- [ ] Error tracking working in staging
- [ ] Analytics events tracked
- [ ] Accessibility audit passed
- [ ] Security audit passed
- [ ] Load testing at 10,000 users/day
- [ ] Crash rate < 0.1%
- [ ] 98%+ uptime in staging

---

## Resources & References

### Documentation
- [Zustand Docs](https://github.com/pmndrs/zustand)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Native Performance](https://reactnative.dev/docs/performance)
- [Firebase Best Practices](https://firebase.google.com/docs/guides)

### Tools
- [React DevTools](https://react-native.dev/docs/debugging)
- [Flipper](https://fbflipper.com/) for mobile debugging
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci) for performance
- [BundlePhobia](https://bundlephobia.com/) for bundle analysis

---

## Timeline Estimate

| Phase | Task | Days |
|-------|------|------|
| 1 | Setup Zustand, migrate state | 3 |
| 2 | TypeScript migration (core) | 5 |
| 3 | Add unit tests + Sentry | 4 |
| 4 | Backend API integration | 5 |
| 5 | Push notifications | 2 |
| 6 | Performance optimization | 3 |
| 7 | QA, testing, deployment | 3 |
| **Total** | | **25 days (~5 weeks)** |

---

**Questions? Issues? Check the [IMPROVEMENTS.md](./IMPROVEMENTS.md) file for full context.**
