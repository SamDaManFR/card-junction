import "./globals.css";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Card Junction",
  description: "Where all your card needs meet.",
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
            padding: "18px 0 12px 0",
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

          {/* Centered nav on desktop */}
          <nav className="topnav-wrapper">
            <div className="topnav">
              <a className="navlink" href="/">Search</a>

              <div className="navgroup">
                <a className="navlabel" href="/grading">Grading <span className="caret">▾</span></a>
                <div className="navmenu">
                  <a className="navitem" href="/grading/psa">PSA</a>
                  <a className="navitem" href="/grading/bgs">BGS</a>
                  <a className="navitem" href="/grading/sgc">SGC</a>
                </div>
              </div>

              <div className="navgroup">
                <a className="navlabel" href="/livestreams">Livestream Shows <span className="caret">▾</span></a>
                <div className="navmenu">
                  <a className="navitem" href="/livestreams/whatnot">Whatnot</a>
                  <a className="navitem" href="/livestreams/ebay-live">eBay Live</a>
                </div>
              </div>

              <a className="navlink" href="/local-shows">Local Card Shows</a>
              <a className="navlink" href="/checklists">Checklists</a>
              <a className="navlink" href="/suppliers">Suppliers</a>
              <a className="navlink" href="/pro">Pro</a>

              <div className="navgroup">
                <a className="navlabel" href="/user">
                  User <span className="caret">▾</span>
                </a>
                <div className="navmenu">
                  <a className="navitem" href="/user/wishlist">Wish List</a>
                  <a className="navitem" href="/user/collection">Collection</a>
                  <a className="navitem" href="/user/sales">Sales</a>
                </div>
              </div>
            </div>
          </nav>
        </header>

        <main>{children}</main>
      </body>
    </html>
  );
}
