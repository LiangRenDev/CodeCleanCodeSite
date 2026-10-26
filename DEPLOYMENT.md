# Deploy CodeCleanCode

Deploy target: a Cloudflare Worker with static assets, not Cloudflare Pages. The Worker in `src/index.ts` is where login and D1 will go later.

Build output directory: **`dist/`**

## Deploy command

From a machine logged into the owner's Cloudflare account:

```bash
npm install
npm run build
npm run deploy
```

`npm run deploy` is the command to publish. It builds `public/` into `dist/`, then runs `wrangler deploy`.

Do not point a Pages project at the repository root. Pages Functions under `functions/` are gone; `/api/contact` and `/api/chat` are Worker routes.

## 1. Resend

The contact form posts to `/api/contact`, which sends mail through [Resend](https://resend.com) when `RESEND_API_KEY` is set.

1. Create an API key named for this site.
2. Verify the domain you send from (for production, `codecleancode.com`).
3. Put the key on the Worker:

```bash
npx wrangler secret put RESEND_API_KEY
```

The inbox and from-address are vars in `wrangler.jsonc`:

- `CONTACT_EMAIL` — `admin@codecleancode.com` (confirm this inbox)
- `CONTACT_FROM` — `CodeCleanCode Contact Form <noreply@codecleancode.com>`

Change `CONTACT_FROM` to a sender on the verified domain, then deploy again. Until the secret is set, the form responds that it is not connected and the page still suggests the same email address.

Local form tests read `.dev.vars` (copy from `.env.example`). That file is gitignored.

## 2. Assistant (optional)

The chat widget calls `/api/chat`. It answers only when all three are set:

- `LLM_API_BASE` — OpenAI-compatible base URL, no trailing `/chat/completions`
- `LLM_MODEL` — model name that endpoint serves
- `LLM_API_KEY` — secret

```bash
npx wrangler secret put LLM_API_KEY
```

Set the base URL and model in `wrangler.jsonc` `vars`, then deploy. Leave them empty to keep the widget in its not-connected state. There is no default endpoint in the repo.

## 3. Custom domain

After the first deploy, attach `codecleancode.com` and `www.codecleancode.com` to the Worker in the Cloudflare dashboard (Workers & Pages → the `codecleancode` Worker → Settings → Domains & Routes), or with `wrangler` routes once the zone is on the account.

## 4. Login later (not in this deploy)

1. `npx wrangler d1 create codecleancode`
2. Uncomment `d1_databases` in `wrangler.jsonc` and paste the `database_id`. Binding name: `DB`.
3. Add `migrations/*.sql` and run `npx wrangler d1 migrations apply DB --remote`.
4. Add the login route under `src/routes/` and register it in `src/index.ts`.
5. `npm run types && npm run deploy`

Leave the binding commented out until that id exists.

## Logs

Workers Logs and traces are enabled in `wrangler.jsonc`. Contact and chat handlers log event names only, not message bodies or addresses. Lower `head_sampling_rate` if traffic grows.

## Checks before shipping

```bash
npm test
npm run check
npm run build
```

`npm run check` regenerates `worker-configuration.d.ts` from `wrangler.jsonc` and typechecks `src/`.
