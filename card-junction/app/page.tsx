import SearchClient from "./search/SearchClient";

export default function Page() {
  return (
    <main className="container home">
      <section className="hero" aria-labelledby="home-title">
        <p className="eyebrow">The collector’s perspective</p>
        <h1 id="home-title">Find your next card.<br /><span>Understand the asking price.</span></h1>
        <p className="hero-description">Explore PSA-graded baseball cards on eBay. Compare active listings, narrow your search, and collect with perspective.</p>
        <div className="hero-meta"><span>PSA-graded baseball</span><span>Active eBay listings</span></div>
      </section>
      <SearchClient />
    </main>
  );
}
