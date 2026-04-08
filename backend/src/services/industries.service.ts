import { getMysqlPool } from "../database/mysql";
import { logger } from "../utils/logger";
import { OkPacket, RowDataPacket } from "mysql2";

export interface Industry {
  id: number;
  industry: string;
  address: string;
  website_link: string;
  active_now: boolean;
  created_at: string;
  updated_at: string;
}

export interface IndustryInput {
  industry: string;
  address: string;
  website_link: string;
  active_now?: boolean;
}

export class IndustriesService {
  async getAllIndustries(): Promise<Industry[]> {
    const connection = await getMysqlPool().getConnection();
    try {
      const [rows] = await connection.query<RowDataPacket[]>(
        "SELECT * FROM internship_industries ORDER BY id DESC",
      );
      return rows as Industry[];
    } finally {
      connection.release();
    }
  }

  async getActiveIndustries(): Promise<Industry[]> {
    const connection = await getMysqlPool().getConnection();
    try {
      const [rows] = await connection.query<RowDataPacket[]>(
        "SELECT * FROM internship_industries WHERE active_now = 1 ORDER BY id DESC",
      );
      return rows as Industry[];
    } finally {
      connection.release();
    }
  }

  async getIndustryById(id: number): Promise<Industry | null> {
    const connection = await getMysqlPool().getConnection();
    try {
      const [rows] = await connection.query<RowDataPacket[]>(
        "SELECT * FROM internship_industries WHERE id = ?",
        [id],
      );
      const industries = rows as Industry[];
      return industries.length ? industries[0] : null;
    } finally {
      connection.release();
    }
  }

  async createIndustry(data: IndustryInput): Promise<Industry> {
    const connection = await getMysqlPool().getConnection();
    try {
      const [result] = await connection.query<OkPacket>(
        "INSERT INTO internship_industries (industry, address, website_link, active_now) VALUES (?, ?, ?, ?)",
        [
          data.industry,
          data.address,
          data.website_link,
          data.active_now ?? true,
        ],
      );
      const insertId = result.insertId;
      const industry = await this.getIndustryById(insertId);
      if (!industry) {
        throw new Error("Industry not found after creation.");
      }
      return industry;
    } finally {
      connection.release();
    }
  }

  async updateIndustry(
    id: number,
    data: Partial<IndustryInput>,
  ): Promise<Industry | null> {
    const connection = await getMysqlPool().getConnection();
    try {
      const existing = await this.getIndustryById(id);
      if (!existing) return null;

      const industry = data.industry ?? existing.industry;
      const address = data.address ?? existing.address;
      const website_link = data.website_link ?? existing.website_link;
      const active_now = data.active_now ?? existing.active_now;

      await connection.query(
        "UPDATE internship_industries SET industry = ?, address = ?, website_link = ?, active_now = ? WHERE id = ?",
        [industry, address, website_link, active_now, id],
      );

      return await this.getIndustryById(id);
    } finally {
      connection.release();
    }
  }

  async deleteIndustry(id: number): Promise<boolean> {
    const connection = await getMysqlPool().getConnection();
    try {
      const [result] = await connection.query<OkPacket>(
        "DELETE FROM internship_industries WHERE id = ?",
        [id],
      );
      return result.affectedRows > 0;
    } finally {
      connection.release();
    }
  }
}

export default new IndustriesService();
