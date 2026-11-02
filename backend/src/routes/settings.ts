import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth, type AuthRequest } from "../middleware/auth.js";
import { Prisma } from "@prisma/client";

const router = Router();

router.use(requireAuth);

const DEFAULT_TRACKING = {
  enabled: true,
  headCode: `<script async src="https://www.googletagmanager.com/gtag/js?id=G-Y560F8W6VL"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){window.dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-Y560F8W6VL');
</script>`,
  bodyStartCode: "",
  bodyEndCode: "",
};

const trackingSchema = z.object({
  enabled: z.boolean(),
  headCode: z.string().max(50000),
  bodyStartCode: z.string().max(50000),
  bodyEndCode: z.string().max(50000),
});

// Existing settings API
router.get("/", async (_req, res) => {
  const rows = await prisma.siteSetting.findMany();

  res.json(
    Object.fromEntries(rows.map((row) => [row.key, row.value]))
  );
});

router.put("/", async (req, res) => {
  const parsed = z.record(z.string(), z.any()).safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ message: "Settings must be an object" });
  }

  const entries = Object.entries(parsed.data);

  await prisma.$transaction(
    entries.map(([key, value]) =>
      prisma.siteSetting.upsert({
        where: { key },
        create: { key, value },
        update: { value },
      })
    )
  );

  res.json({ success: true });
});

router.get("/tracking", async (_req, res) => {
  const setting = await prisma.siteSetting.findUnique({
    where: { key: "trackingScripts" },
  });

  const value =
    setting?.value &&
      typeof setting.value === "object" &&
      !Array.isArray(setting.value)
      ? setting.value as Record<string, unknown>
      : {};

  res.json({
    enabled:
      typeof value.enabled === "boolean"
        ? value.enabled
        : DEFAULT_TRACKING.enabled,

    headCode:
      typeof value.headCode === "string"
        ? value.headCode
        : DEFAULT_TRACKING.headCode,

    bodyStartCode:
      typeof value.bodyStartCode === "string"
        ? value.bodyStartCode
        : DEFAULT_TRACKING.bodyStartCode,

    bodyEndCode:
      typeof value.bodyEndCode === "string"
        ? value.bodyEndCode
        : DEFAULT_TRACKING.bodyEndCode,
  });
});

router.put("/tracking", async (req, res) => {
  const parsed = trackingSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      message: "Invalid tracking settings. Please check the fields.",
    });
  }

  const adminReq = req as AuthRequest;
  const data = parsed.data;

  try {
    await prisma.$transaction(async (tx) => {
      await tx.siteSetting.upsert({
        where: { key: "trackingScripts" },
        create: {
          key: "trackingScripts",
          value: data as Prisma.InputJsonValue,
        },
        update: {
          value: data as Prisma.InputJsonValue,
        },
      });

      await tx.activityLog.create({
        data: {
          adminId: adminReq.admin?.id,
          action: "UPDATE",
          entity: "TrackingScripts",
          details: {
            enabled: data.enabled,
            headCodeLength: data.headCode.length,
            bodyStartCodeLength: data.bodyStartCode.length,
            bodyEndCodeLength: data.bodyEndCode.length,
          } as Prisma.InputJsonValue,
        },
      });
    });

    res.json({
      success: true,
      message: "Tracking settings saved successfully.",
    });
  } catch (error) {
    console.error("Tracking settings update failed:", error);

    res.status(500).json({
      message: "Unable to save tracking settings.",
    });
  }
});

export default router;