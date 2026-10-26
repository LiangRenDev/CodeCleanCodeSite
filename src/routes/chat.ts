import { json, logError, logEvent, readJson } from "../lib/http";
import { parseChat } from "../lib/validate";

const NOT_CONNECTED =
  "The assistant is not connected yet. Use the contact form and someone will reply by email.";

export async function handleChat(request: Request, env: Env): Promise<Response> {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  // Vars are literal types in generated Env (including ""), so widen before use.
  const apiKey: string = env.LLM_API_KEY;
  const apiBase: string = env.LLM_API_BASE;
  const model: string = env.LLM_MODEL;
  if (!apiKey || !apiBase || !model) {
    logEvent("chat_unconfigured");
    return json({ error: NOT_CONNECTED }, 503);
  }

  const body = await readJson(request, 32_000);
  if (!body.ok) return json({ error: body.error }, body.status);

  const parsed = parseChat(body.value);
  if (!parsed.ok) {
    logEvent("chat_rejected", { reason: "validation" });
    return json({ error: parsed.error }, 400);
  }

  let endpoint: string;
  try {
    const base = new URL(apiBase);
    if (base.protocol !== "https:" && base.protocol !== "http:") {
      logError("chat_bad_base");
      return json({ error: "The assistant could not reply. Please try again later." }, 502);
    }
    endpoint = `${apiBase.replace(/\/+$/, "")}/chat/completions`;
  } catch {
    logError("chat_bad_base");
    return json({ error: "The assistant could not reply. Please try again later." }, 502);
  }

  const upstream = await fetch(endpoint, {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: parsed.messages,
      max_tokens: 500,
    }),
  });

  if (!upstream.ok) {
    logError("chat_upstream_failed", { status: upstream.status });
    return json({ error: "The assistant could not reply. Please try again later." }, 502);
  }

  const result = (await upstream.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = result.choices?.[0]?.message?.content;
  if (typeof content !== "string" || !content.trim()) {
    logError("chat_empty_reply");
    return json({ error: "The assistant returned an empty reply." }, 502);
  }

  logEvent("chat_replied");
  return json({ choices: [{ message: { role: "assistant", content } }] });
}
