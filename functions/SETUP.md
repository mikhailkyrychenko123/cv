# Cloudflare Pages lead form setup

The forms store reservation emails and product inquiries (email, selected product, consent timestamp, and privacy notice version) in a private Cloudflare D1 database. They do not write files into the Pages deployment. The protected `/adm/` page lists, exports, and deletes both kinds of requests.

## One-time Cloudflare setup

1. Create a D1 database: `npx wrangler d1 create rustydrop-leads`.
2. Create the table: `npx wrangler d1 execute rustydrop-leads --remote --file=functions/migrations/0001_game_leads.sql`.
3. Add the product inquiry table: `npx wrangler d1 execute rustydrop-leads --remote --file=functions/migrations/0002_product_requests.sql`.
4. Add the visitor-counter tables: `npx wrangler d1 execute rustydrop-leads --remote --file=functions/migrations/0003_visitor_counter.sql`.
5. In the Pages project, open **Settings → Functions → D1 database bindings**. Add a binding named `LEADS_DB` and select `rustydrop-leads`, then redeploy.
6. Set the admin password as an encrypted Pages secret: `npx wrangler pages secret put GAME_ADMIN_PASSWORD --project-name <your-pages-project>`. Enter the password at the prompt; do not put it in a source file.
7. From this project directory, deploy with `npx wrangler pages deploy . --project-name <your-pages-project>`.

Dashboard drag-and-drop does not compile a `functions/` directory. Deploy with Wrangler (or Git integration) so the form and `/adm/` handlers are included.

Before collecting real submissions, confirm the controller details and privacy notice in `privacy.html` for the legal identity and operating location of the person or business running the forms.
