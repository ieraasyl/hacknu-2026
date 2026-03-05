import { drizzle } from 'drizzle-orm/d1';
import type { D1Database } from '@cloudflare/workers-types';

// Import both app and auth schemas
import * as schema from '@/db/schema';
import * as authSchema from '@/db/auth-schema';

// Merge all tables for Drizzle
export const fullSchema = {
  ...schema,
  ...authSchema,
};

/**
 * Get database instance from D1 binding
 * This should be called within request handlers to have access to the D1 binding
 */
export function getDb(d1: D1Database) {
  return drizzle(d1, { schema: fullSchema });
}

// Re-export individual schemas for convenience
export * from '@/db/schema';
export * from '@/db/auth-schema';
