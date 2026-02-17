import "./globals.css";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Card Junction",
  description: "Research graded sports cards across marketplaces.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <header
  style={{
    background: "#000",
    padding: "18px 0",
    borderBottom: "3px solid #b91c1c",
  }}
>
  <div className="navbar-inner">
    <Link href="/" className="logo-wrap">
      <Image
        src="/logo.png"
        alt="Card Junction"
        width={240}
        height={60}
        priority
      />
    </Link>

    <div className="desktop-tagline">
      Where All Your Card Needs Meet
    </div>
  </div>
</header>

        <main>{children}</main>
      </body>
    </html>
  );
}
