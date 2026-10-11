import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  createSessionToken,
  verifySessionToken,
  requireAuth,
  requireRole,
  type AuthenticatedUser,
  type AuthRequest,
} from '../src/middleware/auth.ts';
import type { Response } from 'express';

function createMockResponse() {
  let statusCode = 200;
  let body: any = null;
  const res = {
    status(code: number) {
      statusCode = code;
      return this;
    },
    json(payload: any) {
      body = payload;
      return this;
    },
    getStatusCode: () => statusCode,
    getBody: () => body,
  };
  return res as unknown as Response & { getStatusCode: () => number; getBody: () => any };
}

describe('Authentication & RBAC Middleware (src/middleware/auth.ts)', () => {
  const sampleAdmin: AuthenticatedUser = {
    id: 1,
    uid: 'admin-uid-1',
    email: 'admin@vasturitam.com',
    displayName: 'Vastu Ritam Acharya',
    role: 'admin',
    avatarUrl: '/trademark-logo.jpg',
  };

  it('signs and verifies valid HMAC session tokens', () => {
    const token = createSessionToken(sampleAdmin);
    assert.ok(token.includes('.'));

    const verified = verifySessionToken(token);
    assert.ok(verified);
    assert.equal(verified.id, sampleAdmin.id);
    assert.equal(verified.email, sampleAdmin.email);
    assert.equal(verified.role, 'admin');
  });

  it('rejects tampered or malformed session tokens', () => {
    const token = createSessionToken(sampleAdmin);
    const [payload] = token.split('.');
    const tampered = `${payload}.invalidsignature123`;

    assert.equal(verifySessionToken(tampered), null);
    assert.equal(verifySessionToken('malformed-token-without-dot'), null);
    assert.equal(verifySessionToken(''), null);
  });

  it('requireAuth blocks unauthenticated requests with 401 and allows authenticated requests', () => {
    const unauthReq = {} as AuthRequest;
    const res1 = createMockResponse();
    let nextCalled = false;

    requireAuth(unauthReq, res1, () => {
      nextCalled = true;
    });
    assert.equal(nextCalled, false);
    assert.equal(res1.getStatusCode(), 401);

    const authReq = { user: sampleAdmin } as AuthRequest;
    const res2 = createMockResponse();
    requireAuth(authReq, res2, () => {
      nextCalled = true;
    });
    assert.equal(nextCalled, true);
  });

  it('requireRole enforces role-based access control (403 Forbidden on insufficient role)', () => {
    const viewerUser: AuthenticatedUser = { ...sampleAdmin, role: 'viewer' };
    const viewerReq = { user: viewerUser } as AuthRequest;
    const res = createMockResponse();
    let nextCalled = false;

    const adminOnlyMiddleware = requireRole(['admin']);
    adminOnlyMiddleware(viewerReq, res, () => {
      nextCalled = true;
    });

    assert.equal(nextCalled, false);
    assert.equal(res.getStatusCode(), 403);

    const adminReq = { user: sampleAdmin } as AuthRequest;
    adminOnlyMiddleware(adminReq, res, () => {
      nextCalled = true;
    });
    assert.equal(nextCalled, true);
  });
});
