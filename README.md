# Oxford Overseas Sikar – Website

React + TypeScript + Vite. IELTS, PTE, study abroad, visa and education loan website with an EMI calculator.

## Run locally
```bash
npm install
npm run dev
```

## Put it live on GitHub Pages (free link to show the client)
1. Create a GitHub repo and push this folder to the `main` branch.
2. Repo **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Push again (or run the workflow from the **Actions** tab). Your site appears at
   `https://<your-username>.github.io/<repo-name>/`.

## Edit content
- All text, countries and services are at the top of `src/App.tsx`.
- Real photos: fill the `IMAGES` object in `src/App.tsx`, and put images in the `public/` folder
  (example: `"./photos/centre.jpg"` for `public/photos/centre.jpg`).
- Replace the placeholders `[Office address]`, `[Phone number]`, `[Hours]` and the WhatsApp number `910000000000`.
