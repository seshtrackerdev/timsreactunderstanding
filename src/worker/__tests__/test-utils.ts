import type { Env } from '../types';

export function createTestEnv(): Env {
  return {
    API_TOKEN: 'test_api_token_for_testing',
  };
}

export function createAuthHeaders(token: string = 'test_api_token_for_testing') {
  return {
    Authorization: `Bearer ${token}`,
  };
}

export function createJsonHeaders(token?: string) {
  return {
    'Content-Type': 'application/json',
    ...(token ? createAuthHeaders(token) : {}),
  };
} 