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
    logger.info('MySQL connection established for bulk import.');
    
    // Initialize/migrate database schema
    await initializeDatabaseSchema(connection);
    logger.info(`MySQL connection established for database: ${process.env.MYSQL_DATABASE || 'ddp'}.`);
  } finally {
    connection.release();
  }
};

const initializeDatabaseSchema = async (connection: mysql.PoolConnection): Promise<void> => {
  try {
    // NOTE: dummy_students table is no longer used. Student data is now fetched from the main 'students' table.
    // The verified-students API endpoint now queries the 'students' table directly.
    // Legacy dummy_students table has been replaced with real student data management.

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

    // Create student_non_technical table if it doesn't exist
    try {
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS student_non_technical (
          id INT PRIMARY KEY AUTO_INCREMENT,
          student_id VARCHAR(50) NOT NULL,
          student_name VARCHAR(255) NOT NULL,
          year_of_study VARCHAR(50) NOT NULL,
          event_attended VARCHAR(100) NOT NULL,
          club_id INT,
          club_events TEXT,
          other_event_specify TEXT,
          event_start_date DATE NOT NULL,
          event_end_date DATE NOT NULL,
          event_duration INT NOT NULL,
          event_mode VARCHAR(50) NOT NULL,
          event_location VARCHAR(255) NOT NULL,
          event_organiser VARCHAR(100) NOT NULL,
          organisation_name VARCHAR(255),
          organisation_location VARCHAR(255),
          event_level VARCHAR(50) NOT NULL,
          country VARCHAR(100),
          state VARCHAR(100),
          within_bit VARCHAR(10) NOT NULL,
          home_department VARCHAR(10),
          role_in_event VARCHAR(50) NOT NULL,
          role_specify_organised TEXT,
          role_specify_participated TEXT,
          status VARCHAR(50) NOT NULL,
          prize_type VARCHAR(50),
          prize_amount INT,
          social_activity_involved VARCHAR(10) NOT NULL,
          social_activity_name VARCHAR(255),
          time_spent_hours INT NOT NULL,
          interdisciplinary VARCHAR(10) NOT NULL,
          interdisciplinary_dept INT,
          other_dept_student_count INT,
          certificate_proof_path VARCHAR(500),
          iqac_verification VARCHAR(50) DEFAULT 'initiated',
          iqac_rejection_remarks TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          created_by VARCHAR(50),
          
          INDEX idx_student_id (student_id),
          INDEX idx_status (status),
          INDEX idx_iqac_verification (iqac_verification),
          INDEX idx_event_level (event_level),
          INDEX idx_created_at (created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      
      logger.info('Student non-technical table created/verified successfully');
    } catch (err: any) {
      logger.warn('Student non-technical table initialization warning:', err.message);
    }

    // Migrate student_technical_body_memberships table to use valid_from and valid_till
    try {
      // Add valid_from column if it doesn't exist
      await connection.execute(`
        ALTER TABLE student_technical_body_memberships 
        ADD COLUMN valid_from DATE AFTER membership_society
      `);
    } catch (err: any) {
      // Column might already exist (error code 1060)
      if (err.code !== 'ER_DUP_FIELDNAME' && err.errno !== 1060) {
        logger.debug('valid_from column addition note:', err.message);
      }
    }

    try {
      // Add valid_till column if it doesn't exist
      await connection.execute(`
        ALTER TABLE student_technical_body_memberships 
        ADD COLUMN valid_till DATE AFTER valid_from
      `);
    } catch (err: any) {
      // Column might already exist (error code 1060)
      if (err.code !== 'ER_DUP_FIELDNAME' && err.errno !== 1060) {
        logger.debug('valid_till column addition note:', err.message);
      }
    }

    try {
      // Add indexes on new date columns
      await connection.execute(`
        ALTER TABLE student_technical_body_memberships 
        ADD INDEX idx_valid_from (valid_from),
        ADD INDEX idx_valid_till (valid_till)
      `);
    } catch (err: any) {
      // Indexes might already exist
      if (err.code !== 'ER_DUP_KEYNAME' && err.message.indexOf('Duplicate key name') === -1) {
        logger.debug('Index addition note:', err.message);
      }
    }

    logger.info('Database schema verified and initialized');
  } catch (error) {
    logger.warn('Database schema initialization warning:', error);
    // Don't throw - the application can still work even if columns don't exist
  }
};

export default getMysqlPool;
