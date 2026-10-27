const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type Field = "name" | "email" | "company" | "message";

export type ValidContact = {
  name: string;
  email: string;
  company: string;
  message: string;
};

export type ContactParse =
  | { ok: true; ignored: true }
  | { ok: true; ignored: false; value: ValidContact }
  | { ok: false; error: string; field?: Field };

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export type ChatParse =
  | { ok: true; messages: ChatMessage[] }
  | { ok: false; error: string };

function asRecord(value: unknown): Record<string, unknown> | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function textField(record: Record<string, unknown>, key: string): string {
  const value = record[key];
  return typeof value === "string" ? value.trim() : "";
}

export function parseContact(body: unknown): ContactParse {
  const record = asRecord(body);
  if (!record) return { ok: false, error: "Expected an object" };

  // Honeypot. Bots that fill hidden fields get a quiet success from the route.
  if (textField(record, "website")) return { ok: true, ignored: true };

  const name = textField(record, "name");
  const email = textField(record, "email");
  const company = textField(record, "company");
  const message = textField(record, "message");

  if (!name) return { ok: false, error: "Name is required", field: "name" };
  if (name.length > 100) return { ok: false, error: "Name is too long", field: "name" };
  if (!email) return { ok: false, error: "Email is required", field: "email" };
  if (email.length > 254 || !EMAIL_PATTERN.test(email)) {
    return { ok: false, error: "Email address is not valid", field: "email" };
  }
  if (company.length > 120) return { ok: false, error: "Company is too long", field: "company" };
  if (!message) return { ok: false, error: "Message is required", field: "message" };
  if (message.length > 5000) return { ok: false, error: "Message is too long", field: "message" };

  return { ok: true, ignored: false, value: { name, email, company, message } };
}

export function parseChat(body: unknown): ChatParse {
  const record = asRecord(body);
  if (!record) return { ok: false, error: "Expected an object" };

  const messages = record.messages;
  if (!Array.isArray(messages) || messages.length === 0) {
    return { ok: false, error: "A message is required" };
  }
  if (messages.length > 12) return { ok: false, error: "Conversation is too long" };

  const parsed: ChatMessage[] = [];
  for (const entry of messages) {
    const item = asRecord(entry);
    if (!item) return { ok: false, error: "Invalid message" };
    const role = item.role;
    const content = typeof item.content === "string" ? item.content.trim() : "";
    if (role !== "user" && role !== "assistant") return { ok: false, error: "Invalid message role" };
    if (!content || content.length > 2000) return { ok: false, error: "Invalid message length" };
    parsed.push({ role, content });
  }

  if (parsed[parsed.length - 1]?.role !== "user") {
    return { ok: false, error: "The latest message must be from the visitor" };
  }

  return { ok: true, messages: parsed };
}
