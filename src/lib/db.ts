/**
 * lib/db.ts
 * 
 * Prisma Database Client (Singleton)
 * 
 * What this does:
 * - Creates ONE database connection that the whole app shares
 * - In development, it reuses the same connection when you save files (hot reload)
 * - Without this pattern, Next.js hot reload would create too many connections
 */

import { PrismaClient } from '@prisma/client';

// Extend the global type to include our prisma instance
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Create ONE prisma client and reuse it
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query'], // Shows database queries in your terminal (helpful for debugging)
  });

// In development, save the client so hot reload doesn't create new connections
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
