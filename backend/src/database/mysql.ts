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
    database: process.env.MYSQL_DATABASE || 'ddp',
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
  const connection = await getMysqlPool().getConnection();
  try {
    await connection.ping();
    logger.info(`MySQL connection established for database: ${process.env.MYSQL_DATABASE || 'ddp'}.`);
  } finally {
    connection.release();
  }
};

export default getMysqlPool;
