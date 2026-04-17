import { getMysqlPool } from "../database/mysql";
export class IndustriesService {
    async getAllIndustries() {
        const connection = await getMysqlPool().getConnection();
        try {
            const [rows] = await connection.query("SELECT * FROM internship_industries ORDER BY id DESC");
            return rows;
        }
        finally {
            connection.release();
        }
    }
    async getActiveIndustries() {
        const connection = await getMysqlPool().getConnection();
        try {
            const [rows] = await connection.query("SELECT * FROM internship_industries WHERE active_now = 1 ORDER BY id DESC");
            return rows;
        }
        finally {
            connection.release();
        }
    }
    async getIndustryById(id) {
        const connection = await getMysqlPool().getConnection();
        try {
            const [rows] = await connection.query("SELECT * FROM internship_industries WHERE id = ?", [id]);
            const industries = rows;
            return industries.length ? industries[0] : null;
        }
        finally {
            connection.release();
        }
    }
    async createIndustry(data) {
        const connection = await getMysqlPool().getConnection();
        try {
            const [result] = await connection.query("INSERT INTO internship_industries (industry, address, website_link, active_now) VALUES (?, ?, ?, ?)", [
                data.industry,
                data.address,
                data.website_link,
                data.active_now ?? true,
            ]);
            const insertId = result.insertId;
            const industry = await this.getIndustryById(insertId);
            if (!industry) {
                throw new Error("Industry not found after creation.");
            }
            return industry;
        }
        finally {
            connection.release();
        }
    }
    async updateIndustry(id, data) {
        const connection = await getMysqlPool().getConnection();
        try {
            const existing = await this.getIndustryById(id);
            if (!existing)
                return null;
            const industry = data.industry ?? existing.industry;
            const address = data.address ?? existing.address;
            const website_link = data.website_link ?? existing.website_link;
            const active_now = data.active_now ?? existing.active_now;
            await connection.query("UPDATE internship_industries SET industry = ?, address = ?, website_link = ?, active_now = ? WHERE id = ?", [industry, address, website_link, active_now, id]);
            return await this.getIndustryById(id);
        }
        finally {
            connection.release();
        }
    }
    async deleteIndustry(id) {
        const connection = await getMysqlPool().getConnection();
        try {
            const [result] = await connection.query("DELETE FROM internship_industries WHERE id = ?", [id]);
            return result.affectedRows > 0;
        }
        finally {
            connection.release();
        }
    }
}
export default new IndustriesService();
