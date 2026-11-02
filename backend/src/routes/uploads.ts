import { Router } from "express";
import multer from "multer";
import path from "node:path";
import fs from "node:fs";
import crypto from "node:crypto";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
const uploadDir = path.resolve(process.env.UPLOAD_DIR || "uploads");
fs.mkdirSync(uploadDir, { recursive: true });

const allowed = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const storage = multer.diskStorage({
  destination: (_req, _file, callback) => callback(null, uploadDir),
  filename: (_req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    callback(null, `${crypto.randomUUID()}${extension}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    if (!allowed.has(file.mimetype)) {
      return callback(new Error("Only JPG, PNG, WEBP or GIF images are allowed."));
    }
    callback(null, true);
  },
});

router.post("/", requireAuth, upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Choose a JPG, PNG, WEBP or GIF image (max 8MB)." });
  }

  const origin = (process.env.PUBLIC_API_ORIGIN || "http://localhost:4000").replace(/\/+$/, "");
  return res.status(201).json({ url: `${origin}/uploads/${req.file.filename}` });
});

export default router;
