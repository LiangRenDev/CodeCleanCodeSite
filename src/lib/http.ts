export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

export function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export async function readJson(request: Request, maxBytes: number): Promise<
  { ok: true; value: unknown } | { ok: false; error: string; status: number }
> {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("application/json")) {
    return { ok: false, error: "Expected application/json", status: 415 };
  }

  const raw = await request.text();
  if (raw.length > maxBytes) {
    return { ok: false, error: "Request is too large", status: 413 };
  }

  try {
    return { ok: true, value: JSON.parse(raw) as unknown };
  } catch {
    return { ok: false, error: "Invalid JSON", status: 400 };
  }
}

export function logEvent(event: string, fields: Record<string, string | number | boolean> = {}): void {
  console.log(JSON.stringify({ event, ...fields }));
}

export function logError(event: string, fields: Record<string, string | number | boolean> = {}): void {
  console.error(JSON.stringify({ event, ...fields }));
}
