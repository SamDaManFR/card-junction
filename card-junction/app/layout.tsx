import "./globals.css";
import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Card Junction",
  description: "Explore PSA-graded baseball cards and compare active listings.",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <a href="#main-content" className="skip-link">Skip to content</a>
        <SiteHeader />
        <div className="page-shell" id="main-content" tabIndex={-1}>{children}</div>
      </body>
    </html>
  );
}
