import mysql from 'mysql2/promise';
import { logger } from '../utils/logger';

let mysqlPool: mysql.Pool | null = null;

const createMysqlPool = (): mysql.Pool => {
  const mysqlSslEnabled = (process.env.MYSQL_SSL ?? 'true').toLowerCase() !== 'false';
  const mysqlSslRejectUnauthorized =
    (process.env.MYSQL_SSL_REJECT_UNAUTHORIZED ?? 'false').toLowerCase() === 'true';

  return mysql.createPool({
    host: process.env.MYSQL_HOST || '127.0.0.1',
    port: Number(process.env.MYSQL_PORT || 3306),
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || '',
    waitForConnections: true,
    connectionLimit: Number(process.env.MYSQL_CONNECTION_LIMIT || 10),
    namedPlaceholders: true,
    timezone: 'Z',
    ssl: mysqlSslEnabled ? { rejectUnauthorized: mysqlSslRejectUnauthorized } : undefined,
  });
};

export const getMysqlPool = (): mysql.Pool => {
  if (!mysqlPool) {
    mysqlPool = createMysqlPool();
  }
  return mysqlPool;
};

export const verifyMysqlConnection = async (): Promise<void> => {
  if (!process.env.MYSQL_DATABASE) {
    logger.warn('MYSQL_DATABASE is not set; MySQL bulk import endpoints will fail until configured.');
    return;
  }

  const connection = await getMysqlPool().getConnection();
  try {
    await connection.ping();
    logger.info('MySQL connection established for bulk import.');
    
    // Initialize/migrate database schema
    await initializeDatabaseSchema(connection);
  } finally {
    connection.release();
  }
};

const initializeDatabaseSchema = async (connection: mysql.PoolConnection): Promise<void> => {
  try {
    // Ensure academic_project_id column exists
    try {
      await connection.execute(`
        ALTER TABLE student_project_competitions 
        ADD COLUMN academic_project_id VARCHAR(255) AFTER is_academic_project_outcome
      `);
    } catch (err: any) {
      // Column might already exist (error code 1060)
      if (err.code !== 'ER_DUP_FIELDNAME' && err.errno !== 1060) {
        throw err;
      }
    }

    // Ensure sdg_goal column exists
    try {
      await connection.execute(`
        ALTER TABLE student_project_competitions 
        ADD COLUMN sdg_goal VARCHAR(255) AFTER academic_project_id
      `);
    } catch (err: any) {
      // Column might already exist (error code 1060)
      if (err.code !== 'ER_DUP_FIELDNAME' && err.errno !== 1060) {
        throw err;
      }
    }

    logger.info('Database schema verified and initialized');
  } catch (error) {
    logger.warn('Database schema initialization warning:', error);
    // Don't throw - the application can still work even if columns don't exist
  }
};

export default getMysqlPool;
