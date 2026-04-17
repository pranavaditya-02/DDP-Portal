import express from "express";
import { z } from "zod";
import facultiesService from "../services/faculties.service";
import { logger } from "../utils/logger";
const router = express.Router();
const searchSchema = z.object({
    q: z.string().trim().max(200).optional(),
});
router.get("/", async (req, res) => {
    try {
        const { q } = searchSchema.parse(req.query);
        const faculties = q ? await facultiesService.searchFaculties(q) : await facultiesService.getAllFaculties();
        res.json({ faculties });
    }
    catch (error) {
        logger.error("Failed to fetch faculties:", error);
        res.status(500).json({ error: "Unable to fetch faculties" });
    }
});
export default router;
