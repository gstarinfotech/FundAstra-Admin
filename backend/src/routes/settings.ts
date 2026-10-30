import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);
router.get("/", async (_req, res) => {
  const rows = await prisma.siteSetting.findMany();
  res.json(Object.fromEntries(rows.map((row) => [row.key, row.value])));
});
router.put("/", async (req, res) => {
  const parsed = z.record(z.string(), z.any()).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Settings must be an object" });
  const entries = Object.entries(parsed.data);
  await prisma.$transaction(entries.map(([key, value]) => prisma.siteSetting.upsert({
    where: { key }, create: { key, value }, update: { value }
  })));
  res.json({ success: true });
});
export default router;
