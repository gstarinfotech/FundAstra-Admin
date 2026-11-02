import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/", requireAuth, async (req, res) => {
  try {
    const leads = await prisma.lead.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(leads);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch leads",
    });
  }
});

router.patch("/:id", requireAuth, async (req, res) => {
  const parsed = z
    .object({
      status: z.enum(["NEW", "CONTACTED", "CLOSED"]),
    })
    .safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      message: "Invalid lead status",
    });
  }

  const leadId = req.params.id;

  if (typeof leadId !== "string" || !leadId) {
    return res.status(400).json({
      message: "Invalid lead ID",
    });
  }

  try {
    const lead = await prisma.lead.update({
      where: {
        id: leadId,
      },
      data: {
        status: parsed.data.status,
      },
    });

    res.json(lead);
  } catch (error) {
    res.status(404).json({
      message: "Lead not found",
    });
  }
});

export default router;