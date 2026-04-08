import { getMysqlPool } from '../database/mysql';
import { logger } from '../utils/logger';
import { RowDataPacket } from 'mysql2';

export interface Department {
  id: number;
  dept_name: string;
  dept_code?: string;
  created_at?: string;
  updated_at?: string;
}

export class DepartmentsService {
  async getAllDepartments(): Promise<Department[]> {
    const connection = await getMysqlPool().getConnection();
    try {
      const [rows] = await connection.query<RowDataPacket[]>(
        'SELECT id, dept_name, dept_code FROM departments ORDER BY dept_name ASC'
      );
      return rows as Department[];
    } catch (error) {
      logger.error('Error fetching departments:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  async getDepartmentById(id: number): Promise<Department | null> {
    const connection = await getMysqlPool().getConnection();
    try {
      const [rows] = await connection.query<RowDataPacket[]>(
        'SELECT id, dept_name, dept_code FROM departments WHERE id = ?',
        [id]
      );
      const departments = rows as Department[];
      return departments.length ? departments[0] : null;
    } catch (error) {
      logger.error('Error fetching department by id:', error);
      throw error;
    } finally {
      connection.release();
    }
  }
}

export default new DepartmentsService();
