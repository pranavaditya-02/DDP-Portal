import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';
const globalForPrisma = global;
export const prisma = globalForPrisma.prisma ||
    new PrismaClient({
        log: ['warn', 'error'],
    });
if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
}
// Handle disconnection
process.on('SIGINT', async () => {
    await prisma.$disconnect();
    logger.info('Prisma disconnected');
    process.exit(0);
});
prisma.$on('error', (e) => {
    logger.error('Prisma error:', e);
});
prisma.$on('warn', (e) => {
    logger.warn('Prisma warning:', e);
});
export default prisma;
