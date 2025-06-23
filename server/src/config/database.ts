// src/config/database.ts
import { PrismaClient } from '@prisma/client';

// Create Prisma client instance
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
  errorFormat: 'pretty',
});

// Test database connection
const testConnection = async (): Promise<void> => {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
};

// Graceful shutdown function
const gracefulShutdown = async (): Promise<void> => {
  try {
    await prisma.$disconnect();
    console.log('🔌 Database connection closed gracefully');
  } catch (error) {
    console.error('❌ Error during database disconnect:', error);
  }
};

// Handle process termination
process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
process.on('beforeExit', gracefulShutdown);

export { prisma, testConnection, gracefulShutdown };