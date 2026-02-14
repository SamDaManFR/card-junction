# Card Junction (MVP)

PSA-only graded baseball card aggregator (eBay-only) + checklist publisher starter.

## 1) Local run

```bash
npm install
cp .env.example .env.local
# fill EBAY_CLIENT_ID / EBAY_CLIENT_SECRET
npm run dev
```

Open http://localhost:3000

## 2) eBay keys + OAuth

You need an eBay developer keyset and the Buy Browse scope enabled.
This app mints an **Application access token** via the **client_credentials** OAuth flow.

## 3) Deploy (Vercel)

- Push this repo to GitHub
- Import into Vercel
- Add env vars in Vercel project settings:
  - EBAY_CLIENT_ID
  - EBAY_CLIENT_SECRET
  - EBAY_MARKETPLACE_ID=EBAY_US

## 4) Checklists

Edit `data/checklists.example.json` to start publishing your own structured checklists.
