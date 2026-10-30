"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const primary = [["/", "Marketplace"], ["/grading", "Grading"], ["/checklists", "Checklists"], ["/user/collection", "Collection"]];
const groups = [
  { title: "Research", links: [["/grading/psa", "PSA lookup"], ["/grading/bgs", "BGS"], ["/grading/sgc", "SGC"]] },
  { title: "Discover", links: [["/livestreams", "Livestream shows"], ["/livestreams/whatnot", "Whatnot"], ["/livestreams/ebay%20live", "eBay Live"], ["/local-shows", "Local card shows"], ["/suppliers", "Suppliers"]] },
  { title: "Your collection", links: [["/user", "Your account"], ["/user/wishlist", "Wish list"], ["/user/sales", "Sales"], ["/pro", "Pro"], ["/about", "About Card Junction"]] },
];

export default function SiteHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const header = useRef<HTMLElement>(null);
  const explore = useRef<HTMLDetailsElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const active = (href: string) => pathname === href;
  function close() {
    setMobileOpen(false);
    if (explore.current) explore.current.open = false;
  }
  useEffect(() => {
    function outside(event: PointerEvent) {
      if (!header.current?.contains(event.target as Node)) close();
    }
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, []);
  useEffect(() => { close(); }, [pathname]);

  return (
    <header className="site-header" ref={header} onKeyDown={(event) => {
      if (event.key !== "Escape") return;
      if (explore.current?.open) {
        explore.current.open = false;
        explore.current.querySelector("summary")?.focus();
      } else if (mobileOpen) {
        setMobileOpen(false);
        toggle.current?.focus();
      }
    }}>
      <div className="header-inner">
        <Link href="/" className="brand" onClick={close} aria-label="Card Junction home">
          <span className="brand-wordmark" aria-hidden="true"><span className="brand-mark">╱</span>CARD<span className="brand-junction">JUNCTION</span></span>
        </Link>
        <button ref={toggle} className="nav-toggle" aria-expanded={mobileOpen} aria-controls="site-navigation" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? "Close" : "Menu"}<span aria-hidden="true">{mobileOpen ? " ×" : " ☰"}</span>
        </button>
        <nav id="site-navigation" aria-label="Main navigation" className={`site-navigation${mobileOpen ? " is-open" : ""}`}>
          {primary.map(([href, label]) => <Link key={href} href={href} className="nav-link" aria-current={active(href) ? "page" : undefined} onClick={close}>{label}</Link>)}
          <details className="explore" ref={explore} onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node | null)) event.currentTarget.open = false;
          }}>
            <summary>Explore <span className="chevron" aria-hidden="true">⌄</span></summary>
            <div className="explore-panel">
              {groups.map(group => <div className="explore-group" key={group.title}>
                <p className="explore-heading">{group.title}</p>
                {group.links.map(([href, label]) => <Link href={href} key={href} aria-current={active(decodeURI(href)) ? "page" : undefined} onClick={close}>{label}</Link>)}
              </div>)}
            </div>
          </details>
        </nav>
      </div>
    </header>
  );
}
