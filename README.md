# Greendale English Version School — web (Next.js)

Public site (Phase 1). Later phases add `/admin`, `/portal` and the Express API (see PRD).

```bash
npm install
cp .env.example .env.local   # fill SMTP_* and CONTACT_TO for the contact form
npm run dev                  # http://localhost:3000
npm run build && npm start   # production (PM2 on the VPS runs `next start -p 3000`)
```

## Rules (do not break)
- **School identity lives in `config/school.js`** (name, contact, colours, nav, videos). No school-specific values in components.
- **Pages never import `/content`.** They call `lib/data/*` (`'use cache'` + `cacheTag`). Phase 2 only changes the inside of those functions to `fetch(API_INTERNAL_URL + '/api/public/...')`.
- Shapes are documented in `lib/data/types.js` (JSDoc). JavaScript only, no TypeScript.
- Images: `public/images`, videos: `public/videos` (compressed, faststart). Phase 2 moves editable media to `/var/www/greendale/uploads/public`.
- Font: Google Sans, self-hosted in `app/fonts` (OFL) so builds never need fonts.googleapis.com.
- Next 16 with `cacheComponents` + `partialPrefetching`: `params` is a Promise; no `dynamicParams`; dynamic routes use `generateStaticParams`.

## Deploy
- Now: Vercel (set `NEXT_PUBLIC_SITE_URL`, SMTP vars). Previews are `noindex` via `app/robots.js`.
- Later: VPS + PM2 + Nginx exactly as PRD §12 (never `output: 'export'`).
