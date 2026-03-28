import { PrismaClient } from '@prisma/client';

// Turbopack (Next.js 16 default) breaks the global singleton pattern.
// We explicitly declare the type on globalThis to avoid issues.
declare global {
  // eslint-disable-next-line no-var
  var prismaInstance: PrismaClient | undefined;
}

function createPrismaClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });
}

export const db = globalThis.prismaInstance ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaInstance = db;
}
