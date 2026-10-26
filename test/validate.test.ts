import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { escapeHtml } from "../src/lib/http.ts";
import { parseChat, parseContact } from "../src/lib/validate.ts";

describe("parseContact", () => {
  it("accepts a complete message", () => {
    const result = parseContact({
      name: "Ada",
      email: "ada@example.com",
      company: "Analytical Engines",
      message: "Hello",
      website: "",
    });
    assert.equal(result.ok, true);
    if (result.ok && !result.ignored) {
      assert.equal(result.value.email, "ada@example.com");
      assert.equal(result.value.company, "Analytical Engines");
    }
  });

  it("treats a filled honeypot as ignorable", () => {
    const result = parseContact({
      name: "Bot",
      email: "bot@example.com",
      message: "Buy followers",
      website: "https://spam.example",
    });
    assert.deepEqual(result, { ok: true, ignored: true });
  });

  it("rejects a missing message and a broken email", () => {
    assert.equal(parseContact({ name: "Ada", email: "ada@example.com" }).ok, false);
    const email = parseContact({ name: "Ada", email: "not-an-email", message: "Hi" });
    assert.equal(email.ok, false);
    if (!email.ok) assert.equal(email.field, "email");
  });
});

describe("parseChat", () => {
  it("keeps a short user turn", () => {
    const result = parseChat({ messages: [{ role: "user", content: "What do you build?" }] });
    assert.equal(result.ok, true);
    if (result.ok) assert.equal(result.messages.length, 1);
  });

  it("rejects an assistant-only transcript and oversized history", () => {
    assert.equal(parseChat({ messages: [{ role: "assistant", content: "Hi" }] }).ok, false);
    const messages = Array.from({ length: 13 }, () => ({ role: "user", content: "Hi" }));
    assert.equal(parseChat({ messages }).ok, false);
  });
});

describe("escapeHtml", () => {
  it("escapes markup", () => {
    assert.equal(escapeHtml(`<a href="x">A & B</a>`), "&lt;a href=&quot;x&quot;&gt;A &amp; B&lt;/a&gt;");
  });
});
