import { describe, expect, it } from 'vitest';
import app from '../index';
import { createTestEnv } from './test-utils';

describe('API Endpoints', () => {
  const env = createTestEnv();

  describe('Public Endpoints', () => {
    it('GET /api/ should return API name', async () => {
      const res = await app.fetch(new Request('http://localhost/api/'), env);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toEqual({ name: 'TimmyAPI' });
    });

    it('POST /api/echo should return sent data', async () => {
      const testData = { test: 'data' };
      const res = await app.fetch(
        new Request('http://localhost/api/echo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(testData),
        }),
        env
      );
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toEqual(testData);
    });
  });

  describe('Protected Endpoints', () => {
    it('should reject requests without API token', async () => {
      const res = await app.fetch(
        new Request('http://localhost/api/protected/users'),
        env
      );
      expect(res.status).toBe(401);
    });

    it('should reject requests with invalid API token', async () => {
      const res = await app.fetch(
        new Request('http://localhost/api/protected/users', {
          headers: { Authorization: 'Bearer invalid_token' },
        }),
        env
      );
      expect(res.status).toBe(401);
    });

    it('should accept requests with valid API token', async () => {
      const res = await app.fetch(
        new Request('http://localhost/api/protected/users', {
          headers: { Authorization: `Bearer ${env.API_TOKEN}` },
        }),
        env
      );
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toHaveProperty('users');
      expect(Array.isArray(data.users)).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid JSON in POST requests', async () => {
      const res = await app.fetch(
        new Request('http://localhost/api/echo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: 'invalid json',
        }),
        env
      );
      expect(res.status).toBe(400);
    });

    it('should return 404 for non-existent user', async () => {
      const res = await app.fetch(
        new Request('http://localhost/api/protected/users/nonexistent', {
          headers: { Authorization: `Bearer ${env.API_TOKEN}` },
        }),
        env
      );
      expect(res.status).toBe(404);
    });
  });
}); 