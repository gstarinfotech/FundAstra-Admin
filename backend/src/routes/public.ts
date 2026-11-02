import { Router } from "express";
import { prisma } from "../lib/prisma.js";

const router = Router();

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

// Public tracking settings
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

    const enabled =
        typeof value.enabled === "boolean"
            ? value.enabled
            : DEFAULT_TRACKING.enabled;

    res.setHeader("Cache-Control", "no-store");

    res.json({
        enabled,
        headCode:
            enabled && typeof value.headCode === "string"
                ? value.headCode
                : !setting
                    ? DEFAULT_TRACKING.headCode
                    : typeof value.headCode === "string"
                        ? value.headCode
                        : "",

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

// Existing SEO API
router.get("/seo", async (req, res) => {
    const path =
        typeof req.query.path === "string"
            ? req.query.path
            : "/";

    const page = await prisma.pageSeo.findUnique({
        where: { path },
    });

    if (!page) {
        return res.status(404).json({
            message: "SEO record not found",
        });
    }

    res.json({
        path: page.path,
        pageName: page.pageName,
        metaTitle: page.metaTitle,
        metaDescription: page.metaDescription,
        canonicalUrl: page.canonicalUrl,
        ogTitle: page.ogTitle,
        ogDescription: page.ogDescription,
        ogImage: page.ogImage,
        robotsIndex: page.robotsIndex,
        robotsFollow: page.robotsFollow,
        schemaMarkup: page.schemaMarkup,
    });
});

// Existing blogs API
router.get("/blogs", async (_req, res) => {
    res.json(
        await prisma.blog.findMany({
            where: { status: "PUBLISHED" },
            orderBy: { publishedAt: "desc" },
            select: {
                title: true,
                slug: true,
                excerpt: true,
                content: true,
                contentBlocks: true,
                featuredImage: true,
                metaTitle: true,
                metaDescription: true,
                canonicalUrl: true,
                publishedAt: true,
            },
        })
    );
});

router.get("/blogs/:slug", async (req, res) => {
    const blog = await prisma.blog.findFirst({
        where: {
            slug: req.params.slug,
            status: "PUBLISHED",
        },
    });

    if (!blog) {
        return res.status(404).json({
            message: "Blog not found",
        });
    }

    res.json(blog);
});

export default router;