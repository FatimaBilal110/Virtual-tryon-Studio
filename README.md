# Virtual Try-On Studio

Vite, React, TypeScript and Tailwind app with its backend in the same repository.

## Folder map

Frontend (redesigned):
- `src/`, `public/`, `index.html`, `tailwind.config.ts`, `vercel.json`

Backend (unchanged):
- `supabase/functions/` : tryon, style-recommend, ghost-mannequin
- `api/` : Vercel serverless versions of the same three functions
- `src/integrations/supabase/` : Supabase client and types

## Run locally

```
npm install
npm run dev
```

Create a `.env` file with `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` and `VITE_SUPABASE_PROJECT_ID`.

## Before launch

- Set the contact email in `src/lib/site.ts`. The privacy and terms pages show it.
- Connect the custom domain in the Vercel project settings (Settings, Domains).
- Review `/privacy` and `/terms` with someone qualified in your jurisdiction.
