import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth, type AuthRequest } from "../middleware/auth.js";

const router = Router();

router.post("/login", async (req, res) => {
  const parsed = z.object({ email: z.string().email(), password: z.string().min(1) }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Enter a valid email and password" });
  const admin = await prisma.adminUser.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
  if (!admin || !admin.isActive || !(await bcrypt.compare(parsed.data.password, admin.passwordHash))) {
    return res.status(401).json({ message: "Incorrect email or password" });
  }
  const secret = process.env.JWT_SECRET;
  if (!secret) return res.status(500).json({ message: "Server authentication is not configured" });
  const token = jwt.sign({ id: admin.id, email: admin.email, role: admin.role }, secret, { expiresIn: "12h" });
  await prisma.activityLog.create({ data: { adminId: admin.id, action: "LOGIN", entity: "AdminUser" } });
  res.json({ token, admin: { id: admin.id, email: admin.email, name: admin.name, role: admin.role } });
});

router.get("/me", requireAuth, async (req: AuthRequest, res) => {
  const admin = await prisma.adminUser.findUnique({ where: { id: req.admin!.id }, select: { id: true, email: true, name: true, role: true } });
  if (!admin) return res.status(404).json({ message: "Admin not found" });
  res.json({ admin });
});

export default router;
