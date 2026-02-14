import "./globals.css";

export const metadata = {
  title: "Card Junction (MVP)",
  description: "Search PSA-graded baseball cards on eBay and publish checklists (starter).",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="topbar">
          <div className="topbar-inner">
            <div>
              <div style={{fontWeight: 800}}>Card Junction</div>
              <div className="muted small">MVP: PSA-graded baseball cards (eBay)</div>
            </div>
            <nav style={{display: "flex", gap: 12}}>
              <a className="pill" href="/">Search</a>
              <a className="pill" href="/checklists">Checklists</a>
              <a className="pill" href="/about">About</a>
            </nav>
          </div>
        </div>
        {children}
      </body>
    </html>
  );
}
