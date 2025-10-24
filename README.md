# ConstitutionLab — Static site

This repository is a static HTML/CSS/JS site (no server-side code). The site includes pages such as:

- `index.html` (login/landing)
- `front.HTML` (articles explorer)
- `a.html` (sections explorer)
- `quiz.html`, `result.html`, etc.

This README explains easy ways to deploy the site publicly and how to run it locally.

---

## Quick local preview

Open a PowerShell prompt in the project folder and run a tiny HTTP server (recommended so `fetch()` works properly):

```powershell
cd 'C:\Users\anjan\OneDrive\Desktop\RANJAN\DESIGN LAB EXAM'
python -m http.server 8000 --bind 127.0.0.1
```

Then open a browser at:
- http://127.0.0.1:8000/index.html
- http://127.0.0.1:8000/front.HTML
- http://127.0.0.1:8000/a.html

To stop the server press `Ctrl+C` in the PowerShell window.

There is also a helper script: `start-server.ps1` you can double-click or run in PowerShell to start the server bound to 127.0.0.1.

---

## Deploy options (select one)

### 1) GitHub Pages (recommended for simple static sites)

1. Create a GitHub repository and push this project to it (follow GitHub docs).
2. In the repository settings -> Pages, set the source to the `gh-pages` branch or the `main` branch root.

To automatically deploy on every push, the repository already contains a GitHub Actions workflow (`.github/workflows/deploy-pages.yml`) that will publish the repository root to GitHub Pages using the built-in `GITHUB_TOKEN`. After pushing to `main`, check the Actions tab to confirm deployment.

Notes:
- The workflow publishes the repository root (no build step required).
- If you want a custom domain, configure it in Pages settings and add a `CNAME` file.

### 2) Netlify (drag & drop or connect repo)

- Drag-and-drop the project folder into Netlify's Sites UI, or connect the GitHub repository to Netlify and set the deploy branch to `main` (build command: none; publish directory: `/`).

### 3) Vercel

- Use Vercel to import your GitHub repository. When asked for a build command, leave empty. Set output directory to `/`.

### 4) Manual (FTP / your own web host)

- Upload the entire folder contents to your web host's public directory. Ensure `index.html` is in the web root.

---

## Offline-friendly option

If you want the `front.HTML` page to work without any HTTP server (i.e. open via `file://`), I can embed the full `data.json` into `data-inline.js` so the articles data is loaded from a JS variable instead of a fetch. This produces a large file but guarantees the full dataset loads when opening files locally.

Ask me to "embed data.json inline" if you want that.

---

## Files I added to help with deployment

- `start-server.ps1` — small script to run the Python HTTP server bound to 127.0.0.1:8000
- `.github/workflows/deploy-pages.yml` — GitHub Actions workflow that publishes the repository root to GitHub Pages on push

---

If you want, I can also:
- Add a short `package.json` and `gh-pages` npm script for `npm run deploy` style deploys.
- Embed `data.json` inline into `data-inline.js` (large file) so `front.HTML` never needs a server.
- Create a `deploy-to-netlify` script or `vercel.json` configuration.

Tell me which of these (if any) you want next.
