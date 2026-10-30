import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "Fund Astra Admin", description: "Fund Astra website administration" };
export default function RootLayout({children}:{children:React.ReactNode}) {
  return <html lang="en"><body>{children}</body></html>;
}
