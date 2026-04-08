import { getMysqlPool } from '../database/mysql';
import { logger } from '../utils/logger';

interface SDG {
  id: number;
  sdg_number: number;
  title: string;
  [key: string]: any;
}

class SDGService {
  /**
   * Get all SDG goals
   */
  async getAllSDGs(): Promise<SDG[]> {
    const pool = getMysqlPool();
    const connection = await pool.getConnection();

    try {
      const query = 'SELECT id, sdg_number, title FROM sdg ORDER BY sdg_number ASC';
      const [rows] = await connection.execute(query);
      const results = rows as SDG[];
      
      logger.info(`Fetched ${results.length} SDG goals`);
      return results;
    } catch (error) {
      logger.error('Error fetching SDG goals:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Get SDG goal by ID
   */
  async getSDGById(id: number): Promise<SDG | null> {
    const pool = getMysqlPool();
    const connection = await pool.getConnection();

    try {
      const query = 'SELECT * FROM sdg WHERE id = ?';
      const [rows] = await connection.execute(query, [id]);
      const results = rows as SDG[];
      
      if (results.length > 0) {
        return results[0];
      }
      return null;
    } catch (error) {
      logger.error('Error fetching SDG goal:', error);
      throw error;
    } finally {
      connection.release();
    }
  }
}

export default new SDGService();
