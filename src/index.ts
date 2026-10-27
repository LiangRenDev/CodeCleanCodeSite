import { handleChat } from "./routes/chat";
import { handleContact } from "./routes/contact";
import { json, logError } from "./lib/http";

// Static pages are served from dist/ unless the path is under /api/*.
// Add future routes (login, sessions) beside contact and chat, then bind D1
// in wrangler.jsonc when the database exists. Do not read env.DB until that
// binding is real — wrangler types will add it to Env.
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    try {
      if (url.pathname === "/api/contact") return await handleContact(request, env);
      if (url.pathname === "/api/chat") return await handleChat(request, env);
      if (url.pathname === "/api/health") return json({ ok: true, service: "codecleancode" });
      if (url.pathname.startsWith("/api/")) return json({ error: "Not found" }, 404);
      return await env.ASSETS.fetch(request);
    } catch (error) {
      logError("request_failed", {
        path: url.pathname,
        message: error instanceof Error ? error.name : "unknown",
      });
      return json({ error: "Internal server error" }, 500);
    }
  },
};
