import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Ensure all required directories exist
 * Creates directories if they don't exist
 */
export const ensureUploadDirectories = () => {
  const directories = [
    path.join(__dirname, "../uploads"),
    path.join(__dirname, "../uploads/certificates"),
  ];

  directories.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`✓ Created directory: ${dir}`);
    } else {
      console.log(`✓ Directory exists: ${dir}`);
    }
  });
};

export const generateFileUrl = (filename) => {
  const baseUrl = process.env.SERVER_URL || "http://localhost:5000";
  return `${baseUrl}/uploads/certificates/${filename}`;
};