import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema.ts';

export const isPostgresConfigured = Boolean(process.env.SQL_HOST || process.env.DATABASE_URL);

declare global {
  var _postgresPool: Pool | undefined;
}

class MockClient {
  async query(_queryTextOrConfig: any, _values?: any) {
    return { rows: [], rowCount: 0, fields: [] };
  }
  release() {}
}

class MockPool {
  async query(_queryTextOrConfig: any, _values?: any) {
    return { rows: [], rowCount: 0, fields: [] };
  }
  async connect() {
    return new MockClient();
  }
  on() {
    return this;
  }
  end() {
    return Promise.resolve();
  }
}

export const createPool = (): Pool => {
  if (!isPostgresConfigured) {
    if (!global._postgresPool) {
      global._postgresPool = new MockPool() as unknown as Pool;
    }
    return global._postgresPool;
  }

  if (!global._postgresPool) {
    const maxConnections = process.env.DB_POOL_MAX ? parseInt(process.env.DB_POOL_MAX, 10) : 25;

    global._postgresPool = new Pool({
      host: process.env.SQL_HOST,
      user: process.env.SQL_USER,
      password: process.env.SQL_PASSWORD,
      database: process.env.SQL_DB_NAME,
      max: maxConnections,
      min: 0, // Set to 0 in Cloud SQL / Cloud Run to prevent holding stale connections that the server terminates
      idleTimeoutMillis: 15000, // Reclaim idle connections after 15s before Cloud SQL server drops them
      connectionTimeoutMillis: 8000,
      keepAlive: true,
      keepAliveInitialDelayMillis: 10000,
    });

    global._postgresPool.on('error', (err: any) => {
      // In managed Cloud SQL and PostgreSQL, when the server or Cloud SQL proxy terminates
      // an idle connection (code '57P01', 'terminating connection due to administrator command',
      // or ECONNRESET), pg.Pool automatically purges the client and creates fresh connections
      // on the next query. This is normal connection pool lifecycle behavior.
      const message = err?.message || '';
      const code = err?.code || '';

      if (
        message.includes('terminating connection') ||
        code === '57P01' ||
        code === 'ECONNRESET' ||
        code === 'ECONNREFUSED' ||
        code === 'EPIPE' ||
        code === 'ETIMEDOUT' ||
        message.includes('ECONNREFUSED')
      ) {
        // Normal idle connection or local fallback - safely ignored
        return;
      }

      console.warn('PostgreSQL pool client notice:', message || err);
    });

    global._postgresPool.on('connect', () => {
      // Active connection established
    });
  }
  return global._postgresPool;
};

const pool = createPool();

export const db = drizzle(pool, { schema });

// Re-export Video Learning database operations and validation utilities
export * from './videoLearningDb.ts';
