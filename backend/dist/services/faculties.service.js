import { getMysqlPool } from "../database/mysql";
class FacultiesService {
    async getAllFaculties() {
        const pool = getMysqlPool();
        const [rows] = await pool.query(`SELECT id, name, email, department_id FROM faculty ORDER BY name ASC LIMIT 1000`);
        return rows;
    }
    async searchFaculties(q) {
        const pool = getMysqlPool();
        const params = [];
        let where = "";
        if (q && q.trim().length > 0) {
            const like = `%${q.toLowerCase()}%`;
            where = "WHERE LOWER(name) LIKE ? OR LOWER(id) LIKE ? OR LOWER(email) LIKE ?";
            params.push(like, like, like);
        }
        const [rows] = await pool.query(`SELECT id, name, email, department_id FROM faculty ${where} ORDER BY name ASC LIMIT 500`, params);
        return rows;
    }
}
export default new FacultiesService();
