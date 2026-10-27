import { escapeHtml, json, logError, logEvent, readJson } from "../lib/http";
import { parseContact } from "../lib/validate";

function contactEmailHtml(input: { name: string; email: string; company: string; message: string }): string {
  const companyRow = input.company
    ? `<div class="field"><div class="label">Company</div><div class="value">${escapeHtml(input.company)}</div></div>`
    : "";

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Contact form submission</title>
</head>
<body style="font-family: sans-serif; line-height: 1.6; color: #0a0e27;">
  <h1>New contact form submission</h1>
  <div class="field"><div class="label">From</div><div class="value">${escapeHtml(input.name)}</div></div>
  <div class="field"><div class="label">Email</div><div class="value">${escapeHtml(input.email)}</div></div>
  ${companyRow}
  <div class="field"><div class="label">Message</div><div class="value">${escapeHtml(input.message)}</div></div>
</body>
</html>`;
}

export async function handleContact(request: Request, env: Env): Promise<Response> {
  if (request.method !== "POST") {
    return json({ success: false, error: "Method not allowed" }, 405);
  }

  const body = await readJson(request, 20_000);
  if (!body.ok) return json({ success: false, error: body.error }, body.status);

  const parsed = parseContact(body.value);
  if (!parsed.ok) {
    logEvent("contact_rejected", { reason: "validation" });
    return json({ success: false, error: parsed.error, field: parsed.field ?? null }, 400);
  }

  if (parsed.ignored) {
    logEvent("contact_ignored", { reason: "honeypot" });
    return json({ success: true, message: "Message sent successfully" });
  }

  if (!env.RESEND_API_KEY) {
    logError("contact_unconfigured");
    return json(
      {
        success: false,
        error: "The contact form is not connected yet. Email admin@codecleancode.com instead.",
      },
      503,
    );
  }

  const { name, email, company, message } = parsed.value;
  const resendResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      authorization: `Bearer ${env.RESEND_API_KEY}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      from: env.CONTACT_FROM,
      to: [env.CONTACT_EMAIL],
      reply_to: email,
      subject: `New contact form submission from ${name.replace(/[\r\n]+/g, " ")}`,
      html: contactEmailHtml({ name, email, company, message }),
    }),
  });

  if (!resendResponse.ok) {
    logError("contact_send_failed", { status: resendResponse.status });
    return json(
      { success: false, error: "The message could not be sent. Please try again later." },
      502,
    );
  }

  logEvent("contact_sent");
  return json({ success: true, message: "Message sent successfully" });
}
