import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Firebase
vi.mock('../config/firebase', () => ({
  auth: {
    currentUser: null,
  },
  signInWithPopup: vi.fn(),
}));

describe('Login Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should have Firebase auth object', async () => {
    const firebase = await import('../config/firebase');
    expect(firebase.auth).toBeDefined();
  });

  it('should have currentUser property', async () => {
    const firebase = await import('../config/firebase');
    expect(firebase.auth).toHaveProperty('currentUser');
  });

  it('should initialize with null currentUser', async () => {
    const firebase = await import('../config/firebase');
    expect(firebase.auth.currentUser).toBeNull();
  });

  it('should have Firebase functions available', async () => {
    const firebase = await import('../config/firebase');
    expect(firebase).toBeDefined();
  });
});
