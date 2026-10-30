import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/prisma.js";

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) throw new Error("Set ADMIN_EMAIL and ADMIN_PASSWORD in backend/.env");
  if (password.length < 12) throw new Error("ADMIN_PASSWORD must be at least 12 characters");
  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.adminUser.upsert({
    where: { email },
    create: { email, passwordHash, name: "Fund Astra Admin", role: "ADMIN" },
    update: { passwordHash, isActive: true }
  });

  const initialPages = [
    ["/", "Home"], ["/about", "About"], ["/partners", "Partners"], ["/contact", "Contact"],
    ["/blogs", "Blogs"], ["/services/asset-purchase", "Asset Purchase"],
    ["/services/equity-fundraising", "Equity Fundraising"], ["/services/sme-funding", "SME Funding"],
    ["/services/structured-debt", "Structured Debt"], ["/privacy-policy", "Privacy Policy"],
    ["/disclaimer", "Disclaimer"], ["/terms-of-engagement", "Terms of Engagement"]
  ] as const;
  for (const [path, pageName] of initialPages) {
    await prisma.pageSeo.upsert({
      where: { path },
      create: { path, pageName, metaTitle: pageName === "Home" ? "Fund Astra | Capital Advisory" : `${pageName} | Fund Astra` },
      update: { pageName }
    });
  }
  console.log(`Admin account ready: ${email}`);
}
main().catch((error) => { console.error(error); process.exit(1); }).finally(async () => prisma.$disconnect());
