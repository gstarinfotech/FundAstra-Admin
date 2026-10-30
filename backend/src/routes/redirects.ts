import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);
const schema = z.object({ fromPath: z.string().startsWith("/"), toPath: z.string().min(1), statusCode: z.union([z.literal(301), z.literal(302)]).default(301), isActive: z.boolean().default(true) });
router.get("/", async (_req, res) => res.json(await prisma.redirect.findMany({ orderBy: { createdAt: "desc" } })));
router.post("/", async (req, res) => {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid redirect data" });
  try { res.status(201).json(await prisma.redirect.create({ data: parsed.data })); }
  catch { res.status(409).json({ message: "This source path already has a redirect" }); }
});
router.put("/:id", async (req, res) => {
  const parsed = schema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid redirect data" });
  try { res.json(await prisma.redirect.update({ where: { id: req.params.id }, data: parsed.data })); }
  catch { res.status(404).json({ message: "Redirect not found" }); }
});
router.delete("/:id", async (req, res) => {
  try { await prisma.redirect.delete({ where: { id: req.params.id } }); res.json({ success: true }); }
  catch { res.status(404).json({ message: "Redirect not found" }); }
});
export default router;
