# Project handoff and laptop migration

## What this project is

This repository contains the source for Mikhail K.'s portfolio and résumé website, published at <https://basturma.kiev.ua/>. It is a static HTML, CSS, and JavaScript site with Cloudflare Pages Functions for the Rusty Drop reservation and product inquiry forms, plus a password-protected `/adm/` page. It also contains interactive game and shop/portfolio demos, images, and a downloadable résumé PDF.

The repository is the source of truth for the website code and its Git history. The current production branch is `main`.

## Move to a new laptop

1. Install Git. Node.js/npm are only needed for Wrangler-based local development or deployment.
2. Sign in to GitHub with an account that can access this repository. Changing ChatGPT/Codex accounts does not change GitHub access.
3. Clone the repository:

   ```sh
   git clone https://github.com/mikhailkyrychenko123/cv.git
   cd cv
   ```

4. Open the cloned `cv` folder in Codex or an editor. There is no package manifest or frontend build step; the site files are served directly.
5. Set a Git author identity on the new laptop if needed:

   ```sh
   git config --global user.name "Your Name"
   git config --global user.email "your-git-email@example.com"
   ```

6. For future changes, commit and push from the repository with the GitHub account that has access:

   ```sh
   git add -A
   git commit -m "Describe the change"
   git push origin main
   ```

If the GitHub repository is private and a different GitHub account will be used, grant that account access or transfer the repository. Never put a GitHub token, password, or private key in this repository.

## Important project areas

- `index.html`, `privacy.html`: main portfolio and privacy notice.
- Root-level `.css`, `.js`, and `.html` files: page styling, interactions, and game demos.
- `assets/`: portrait, project screenshots, shop imagery, illustrations, and team artwork.
- `Mikhailo_Kyrychenko_CV.pdf`: downloadable résumé.
- `functions/api/`: Pages Function endpoints for reservation and product request forms.
- `functions/adm/[[path]].js`: password-protected admin listing, CSV export, and deletion handlers.
- `functions/migrations/`: SQL migrations for the D1 database.
- `functions/SETUP.md`: detailed Cloudflare Pages and D1 setup instructions; read it before rebuilding or redeploying the backend.

## Cloudflare services needed for a full deployment

These are account-side resources and are not recreated by cloning Git:

- Cloudflare Pages project, deployment settings, and custom domain/DNS for `basturma.kiev.ua`.
- D1 database named `rustydrop-leads`, bound in Pages as `LEADS_DB`.
- The encrypted Pages secret `GAME_ADMIN_PASSWORD` for `/adm/`.
- Any reservation and product inquiry records stored in D1.

## Analytics and search setup

- Google Analytics 4 property **Basturma** has a website stream for `https://basturma.kiev.ua` with measurement ID `G-WE1P9L6KG6`. The shared `google-analytics.js` loader is included on the site's standalone HTML pages and skips embedded iframe views, plus browsers sending Do Not Track or Global Privacy Control signals.
- Google Search Console has the domain property `basturma.kiev.ua`, verified with a DNS TXT record. `https://basturma.kiev.ua/sitemap.xml` is submitted and currently reports success with six discovered URLs.
- The measurement ID is public site configuration, not a secret. Do not add Google account credentials or API secrets to the repository.

Use `functions/SETUP.md` and the SQL files in `functions/migrations/` to configure the Pages Functions. The actual Pages project name and Cloudflare account details are not stored in this repository; retrieve them from the Cloudflare dashboard. The admin password and D1 contents are intentionally not stored in Git. Before changing or losing Cloudflare account access, arrange secure access to the database and back up any records that must be retained; never commit a database export containing personal information.

## Codex and account migration limits

Git preserves this repository's committed files and history, but it does not transfer Codex chats, ChatGPT account data, local machine settings, browser sessions, or Cloudflare credentials. On the new laptop, clone this repository and reconnect the required GitHub and Cloudflare accounts separately. If switching ChatGPT/Codex accounts, give the new account's GitHub connection access to this repository.
