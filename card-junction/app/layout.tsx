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
            padding: "14px 0",
            borderBottom: "3px solid #b91c1c",
          }}
        >
          <div
            className="container"
            style={{
              display: "flex",
              alignItems: "center",
            }}
          >
            <Link href="/" style={{ display: "flex", alignItems: "center" }}>
              <Image
                src="/logo.png"
                alt="Card Junction"
                width={240}
                height={60}
                priority
              />
            </Link>
          </div>
        </header>

        <main>{children}</main>
      </body>
    </html>
  );
}
