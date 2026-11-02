import "dotenv/config";
import { prisma } from "../src/lib/prisma.js";

const pages = [
  { path: "/", pageName: "Home", metaTitle: "FUND ASTRA | Capital Decisions. Built for Your Next Move.", metaDescription: "Business funding, structured debt, equity fundraising and strategic capital advisory with Fund Astra." },
  { path: "/about", pageName: "About Us", metaTitle: "About Fund Astra | Capital Advisory", metaDescription: "Learn about Fund Astra and its capital advisory approach." },
  { path: "/contact", pageName: "Contact", metaTitle: "Contact Fund Astra | Funding Advisory", metaDescription: "Contact Fund Astra to discuss business funding and capital advisory requirements." },
  { path: "/partners", pageName: "Our Partners", metaTitle: "Our Partners | Fund Astra", metaDescription: "Explore Fund Astra's institutional lending and capital partner network." },
  { path: "/blogs", pageName: "Blogs", metaTitle: "Financial Insights Blog | Fund Astra", metaDescription: "Explore Fund Astra insights on business funding, structured debt and equity fundraising." },
  { path: "/services/sme-funding", pageName: "SME Funding", metaTitle: "SME Funding | Fund Astra", metaDescription: "SME business funding and working capital solutions structured around business requirements." },
  { path: "/services/structured-debt", pageName: "Structured Debt", metaTitle: "Structured Debt | Fund Astra", metaDescription: "Structured debt advisory and institutional financing solutions for growing businesses." },
  { path: "/services/equity-fundraising", pageName: "Equity Fundraising", metaTitle: "Equity Fundraising | Fund Astra", metaDescription: "Equity fundraising and institutional investor advisory for growing businesses." },
  { path: "/services/asset-purchase", pageName: "Asset Purchase", metaTitle: "Asset Purchase Funding | Fund Astra", metaDescription: "Capital advisory and financing solutions for business asset purchases and acquisitions." },
  { path: "/privacy-policy", pageName: "Privacy Policy", metaTitle: "Privacy Policy | Fund Astra", metaDescription: "Read how Fund Astra collects, uses and protects information submitted through its website." },
  { path: "/disclaimer", pageName: "Disclaimer", metaTitle: "Disclaimer | Fund Astra", metaDescription: "Important information about Fund Astra's website content and advisory services." },
  { path: "/terms-of-engagement", pageName: "Terms of Engagement", metaTitle: "Terms of Engagement | Fund Astra", metaDescription: "Terms governing Fund Astra's capital advisory and related services." },
];

async function main() {
  for (const page of pages) {
    await prisma.pageSeo.upsert({
      where: { path: page.path },
      update: {},
      create: {
        ...page,
        canonicalUrl: `https://fundastra.in${page.path}`,
        ogTitle: page.metaTitle,
        ogDescription: page.metaDescription,
        robotsIndex: true,
        robotsFollow: true,
      },
    });
  }
  console.log(`SEO page records ready: ${pages.length}`);
}

main()
  .catch((error) => {
    console.error("SEO seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
