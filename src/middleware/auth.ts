import type { Request, Response, NextFunction } from 'express';
import { adminAuth } from '../lib/firebase-admin.ts';
import { db, isPostgresConfigured } from '../db/index.ts';
import { users } from '../db/schema.ts';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';
import { dataStore } from '../lib/dataStore.ts';

const AUTH_SECRET = process.env.AUTH_SECRET || 'vastu-ritam-super-secret-key-2026';

export interface AuthenticatedUser {
  id: number;
  uid: string;
  email: string;
  displayName: string | null;
  role: string;
  avatarUrl: string | null;
}

export interface AuthRequest extends Request {
  user?: AuthenticatedUser;
}

// Generate simple HMAC signed token for session
export function createSessionToken(user: AuthenticatedUser): string {
  const payload = Buffer.from(JSON.stringify({
    id: user.id,
    uid: user.uid,
    email: user.email,
    role: user.role,
    exp: Date.now() + 1000 * 60 * 60 * 24 * 7, // 7 days
  })).toString('base64url');

  const signature = crypto
    .createHmac('sha256', AUTH_SECRET)
    .update(payload)
    .digest('base64url');

  return `${payload}.${signature}`;
}

export function verifySessionToken(token: string): any | null {
  try {
    const [payloadB64, signature] = token.split('.');
    if (!payloadB64 || !signature) return null;

    const expectedSig = crypto
      .createHmac('sha256', AUTH_SECRET)
      .update(payloadB64)
      .digest('base64url');

    if (signature !== expectedSig) return null;

    const data = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
    if (data.exp && Date.now() > data.exp) return null;

    return data;
  } catch {
    return null;
  }
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const cookieToken = req.cookies?.['vr_session'];

  let token = '';
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split('Bearer ')[1].trim();
  } else if (cookieToken) {
    token = cookieToken;
  }

  if (!token) {
    return next();
  }

  // 1. Try internal session token
  const sessionData = verifySessionToken(token);
  if (sessionData) {
    if (isPostgresConfigured) {
      try {
        const dbUser = await db.select().from(users).where(eq(users.id, sessionData.id)).limit(1);
        if (dbUser.length > 0) {
          req.user = {
            id: dbUser[0].id,
            uid: dbUser[0].uid,
            email: dbUser[0].email,
            displayName: dbUser[0].displayName,
            role: dbUser[0].role,
            avatarUrl: dbUser[0].avatarUrl,
          };
          return next();
        }
      } catch (err) {
        console.warn('Postgres session lookup notice (falling back to dataStore):', err);
      }
    }

    // Fallback: Verify via local dataStore or HMAC-verified sessionData payload
    const dsUser = dataStore.getUserById(sessionData.id);
    req.user = {
      id: sessionData.id,
      uid: sessionData.uid,
      email: sessionData.email,
      displayName: dsUser?.displayName || 'Vastu Ritam Acharya',
      role: sessionData.role || dsUser?.role || 'admin',
      avatarUrl: dsUser?.avatarUrl || '/trademark-logo.jpg',
    };
    return next();
  }

  // 2. Try Firebase ID Token
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    if (decodedToken) {
      let dbUser = await db.select().from(users).where(eq(users.uid, decodedToken.uid)).limit(1);
      if (dbUser.length === 0 && decodedToken.email) {
        // STRICT: Only allow pre-authorized administrators. No public signup/auto-creation.
        const existingByEmail = await db
          .select()
          .from(users)
          .where(eq(users.email, decodedToken.email.toLowerCase().trim()))
          .limit(1);

        if (existingByEmail.length > 0 && ['admin', 'editor'].includes(existingByEmail[0].role)) {
          // Link Firebase UID to the authorized admin record
          await db
            .update(users)
            .set({ uid: decodedToken.uid, updatedAt: new Date() })
            .where(eq(users.id, existingByEmail[0].id));
          dbUser = existingByEmail;
        } else {
          // Unauthorized user attempting access - reject without creating account
          return next();
        }
      }

      if (dbUser.length > 0 && ['admin', 'editor'].includes(dbUser[0].role)) {
        req.user = {
          id: dbUser[0].id,
          uid: dbUser[0].uid,
          email: dbUser[0].email,
          displayName: dbUser[0].displayName,
          role: dbUser[0].role,
          avatarUrl: dbUser[0].avatarUrl,
        };
      }
    }
  } catch (fbErr) {
    // Not a valid Firebase token, continue
  }

  next();
};

export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized: Authentication required' });
  }
  next();
};

export const requireRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized: Authentication required' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden: Insufficient privileges' });
    }
    next();
  };
};
