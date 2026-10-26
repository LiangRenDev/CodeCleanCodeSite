# CodeCleanCode

Company site for CodeCleanCode: AI-powered applications, security architecture, and resilient infrastructure.

The public site is a static page. A Cloudflare Worker serves it and owns `/api/*`, so a later login backend can be added in the same Worker with a D1 binding. Login is not built yet.

## Live site

- Production: [https://codecleancode.com](https://codecleancode.com) (coming soon)
- Preview host: deploy with the owner's Cloudflare account

## Develop

```bash
npm install
npm test
npm run check
npm run dev
```

`npm run dev` starts Wrangler. The site is at the local URL Wrangler prints (usually http://localhost:8787).

Copy `.env.example` to `.dev.vars` before trying the contact form locally. Do not commit `.dev.vars`.

## Build and deploy

Build output directory: **`dist/`**

```bash
npm install
npm run build
npm run deploy
```

`npm run build` copies `public/` to `dist/`.

`npm run deploy` runs that build, then `wrangler deploy`. It publishes the Worker and the static assets together. Run it with the owner's Cloudflare account. This repository does not deploy itself.

Set secrets before the contact form or assistant can send anything:

```bash
npx wrangler secret put RESEND_API_KEY
npx wrangler secret put LLM_API_KEY
```

`LLM_API_KEY` can be any placeholder until an assistant endpoint exists. The chat widget stays on the page and tells visitors the assistant is not connected when `LLM_API_BASE` or `LLM_MODEL` is empty.

See [DEPLOYMENT.md](DEPLOYMENT.md) for Resend, the custom domain, and the D1 step for login.

## Pages

Single marketing page, plus a 404 page:

| Section | What it covers |
| --- | --- |
| Home | Headline, calls to action, uptime / support / encryption figures, terminal |
| Services | AI-powered applications, security architecture, resilient infrastructure |
| About | Philosophy and three principles |
| Contact | Email link and contact form (`POST /api/contact`) |
| Assistant | Chat widget (`POST /api/chat`), off until configured |
| 404 | Unknown paths |

## Placeholders to fill in

These are marked on the page or left blank on purpose. Nothing here is a real profile, price, client, or testimonial.

- Footer: `GitHub — add link`, `LinkedIn — add link`, `X — add link`
- Footer: `Careers — not listed yet`
- Inbox: `admin@codecleancode.com` (already used in this repo; confirm it is the right address)
- Sender: `CONTACT_FROM` in `wrangler.jsonc` must be a verified Resend domain before mail delivers
- Assistant: `LLM_API_BASE`, `LLM_MODEL`, and secret `LLM_API_KEY`
- Login database: the commented `d1_databases` block in `wrangler.jsonc`

## Architecture

```
public/                 Source for the static site
dist/                   Build output deployed as Workers static assets
src/index.ts            Worker entry. Routes /api/*, then falls through to assets
src/routes/contact.ts   Contact form → Resend
src/routes/chat.ts      Optional assistant proxy
wrangler.jsonc          Worker, assets, vars, and the future D1 binding
```

`/api/*` runs the Worker first. Every other path is a file in `dist/`. Unknown paths serve `404.html`.

### Adding login later

1. Create the database: `npx wrangler d1 create codecleancode`
2. Paste the printed `database_id` into the commented `d1_databases` block in `wrangler.jsonc`. The binding name to use is `DB`.
3. Add SQL under `migrations/` and apply it with `npx wrangler d1 migrations apply DB --remote`.
4. Add a route module next to `src/routes/contact.ts` and register it in `src/index.ts`.
5. Run `npm run types` so `Env` picks up `DB`. Do not hand-write the `Env` interface.

Do not uncomment the D1 binding before the id exists. A binding without an id can provision a database on deploy.

## Stack

- HTML, CSS, and JavaScript in `public/`
- Cloudflare Workers static assets
- Worker API for the contact form (Resend) and the optional assistant
- Fonts: Orbitron and JetBrains Mono

Design notes live in [.github/instructions/FRONTEND_GUIDELINES.md](.github/instructions/FRONTEND_GUIDELINES.md).

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run build` | Write the static site to `dist/` |
| `npm run dev` | Local Worker and site |
| `npm run deploy` | Build, then `wrangler deploy` |
| `npm test` | Validation tests and UI behaviour tests |
| `npm run check` | Regenerate Worker types and typecheck |
