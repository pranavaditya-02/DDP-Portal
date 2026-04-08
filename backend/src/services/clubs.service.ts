import { getMysqlPool } from '../database/mysql';
import { logger } from '../utils/logger';

export interface Club {
  id: number;
  club_name: string;
}

function convertToCamelCase(row: any): any {
  return {
    id: row.id,
    clubName: row.club_name,
  };
}

class ClubsService {
  /**
   * Get all clubs
   */
  async getAllClubs(): Promise<Club[]> {
    const pool = getMysqlPool();
    const connection = await pool.getConnection();

    try {
      const query = 'SELECT id, club_name FROM clubs ORDER BY club_name ASC';
      const [rows] = await connection.execute(query);

      return (rows as any[]).map((row) => ({
        id: row.id,
        club_name: row.club_name,
      }));
    } catch (error) {
      logger.error('Error fetching clubs:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Get a club by ID
   */
  async getClubById(id: number): Promise<Club | null> {
    const pool = getMysqlPool();
    const connection = await pool.getConnection();

    try {
      const query = 'SELECT id, club_name FROM clubs WHERE id = ?';
      const [rows] = await connection.execute(query, [id]);

      if ((rows as any[]).length === 0) {
        return null;
      }

      const row = (rows as any[])[0];
      return {
        id: row.id,
        club_name: row.club_name,
      };
    } catch (error) {
      logger.error('Error fetching club:', error);
      throw error;
    } finally {
      connection.release();
    }
  }
}

export default new ClubsService();
