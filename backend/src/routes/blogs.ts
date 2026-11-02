import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

const schema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  excerpt: z.string().default(""),
  content: z.string().default(""),
  contentBlocks: z.array(z.any()).optional(),
  featuredImage: z.string().default(""),
  metaTitle: z.string().default(""),
  metaDescription: z.string().default(""),
  focusKeyword: z.string().default(""),
  canonicalUrl: z.string().default(""),
  ogTitle: z.string().default(""),
  ogDescription: z.string().default(""),
  ogImage: z.string().default(""),
  robotsIndex: z.boolean().default(true),
  robotsFollow: z.boolean().default(true),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT"),
});

router.get("/", async (_req, res) => {
  return res.json(await prisma.blog.findMany({ orderBy: { updatedAt: "desc" } }));
});

router.post("/", async (req, res) => {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid blog data", errors: parsed.error.flatten() });
  const data = parsed.data;
  try {
    const blog = await prisma.blog.create({
      data: {
        ...data,
        contentBlocks: data.contentBlocks ?? [],
        publishedAt: data.status === "PUBLISHED" ? new Date() : null,
      },
    });
    return res.status(201).json(blog);
  } catch {
    return res.status(409).json({ message: "A blog with this slug already exists" });
  }
});

router.put("/:id", async (req, res) => {
  const parsed = schema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid blog data", errors: parsed.error.flatten() });
  try {
    const id = String(req.params.id);
    const old = await prisma.blog.findUnique({ where: { id } });
    if (!old) return res.status(404).json({ message: "Blog not found" });
    const data = parsed.data;
    const blog = await prisma.blog.update({
      where: { id },
      data: {
        ...data,
        ...(data.status === "PUBLISHED" && !old.publishedAt ? { publishedAt: new Date() } : {}),
        ...(data.status === "DRAFT" ? { publishedAt: null } : {}),
      },
    });
    return res.json(blog);
  } catch {
    return res.status(409).json({ message: "Could not update blog. Check whether the slug is already in use." });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await prisma.blog.delete({ where: { id: String(req.params.id) } });
    return res.json({ success: true });
  } catch {
    return res.status(404).json({ message: "Blog not found" });
  }
});

export default router;
