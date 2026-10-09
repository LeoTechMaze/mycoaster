import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import * as SecureStore from 'expo-secure-store';

import { clearToken, getToken, setToken } from '../token';

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

const store = jest.mocked(SecureStore);

describe('token storage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('reads the JWT from secure storage', async () => {
    store.getItemAsync.mockResolvedValue('jwt-value');

    await expect(getToken()).resolves.toBe('jwt-value');
    expect(store.getItemAsync).toHaveBeenCalledWith('mycoaster_jwt');
  });

  it('returns null when no JWT is stored', async () => {
    store.getItemAsync.mockResolvedValue(null);

    await expect(getToken()).resolves.toBeNull();
  });

  it('writes the JWT under the same key', async () => {
    await setToken('new-jwt');

    expect(store.setItemAsync).toHaveBeenCalledWith('mycoaster_jwt', 'new-jwt');
  });

  it('deletes the JWT on clear', async () => {
    await clearToken();

    expect(store.deleteItemAsync).toHaveBeenCalledWith('mycoaster_jwt');
  });
});
