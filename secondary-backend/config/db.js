import mysql from "mysql2/promise";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 4000,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,

  ssl: {
    ca: fs.readFileSync("./ca.pem"),
  },
});

// Test connection
export const testDB = async () => {
  try {
    const conn = await pool.getConnection();
    console.log("✅ Connected to TiDB");
    conn.release();
  } catch (err) {
    console.error("❌ DB Connection Failed:", err);
  }
};

export default pool;