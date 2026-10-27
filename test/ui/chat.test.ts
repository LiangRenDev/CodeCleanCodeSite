import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";
import { jsonResponse, loadSite, mockFetch, settle, submitForm, type Page } from "./dom.ts";

function messages(page: Page): string[] {
  return [...page.window.document.querySelectorAll(".chatbot-message .message-content")].map(
    (node) => node.textContent ?? "",
  );
}

describe("chat widget", () => {
  let page: Page;

  beforeEach(() => {
    page = loadSite();
  });

  afterEach(async () => {
    await page.close();
  });

  it("is on the page, closed, and opens and closes with aria state", () => {
    const { window } = page;
    const { document } = window;
    const widget = document.getElementById("chatbotWidget");
    const toggle = document.getElementById("chatbotToggle");
    const chat = document.getElementById("chatbotWindow");
    const label = toggle?.querySelector(".visually-hidden");
    assert.ok(widget);
    if (!(toggle instanceof window.HTMLButtonElement)) throw new Error("missing chat toggle");
    if (!(chat instanceof window.HTMLElement)) throw new Error("missing chat window");
    assert.equal(toggle.getAttribute("aria-expanded"), "false");
    assert.equal(label?.textContent, "Open chat");
    assert.equal(chat.hidden, true);
    assert.equal(chat.classList.contains("open"), false);

    toggle.click();
    assert.equal(toggle.getAttribute("aria-expanded"), "true");
    assert.equal(label?.textContent, "Close chat");
    assert.equal(chat.hidden, false);
    assert.equal(chat.classList.contains("open"), true);
    assert.equal(document.activeElement, document.getElementById("chatbotInput"));

    document.getElementById("chatbotClose")?.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
    assert.equal(chat.hidden, true);
    assert.equal(toggle.getAttribute("aria-expanded"), "false");

    toggle.click();
    document.dispatchEvent(new window.KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    assert.equal(chat.hidden, true);
    assert.equal(toggle.getAttribute("aria-expanded"), "false");
    assert.equal(label?.textContent, "Open chat");
  });

  it("sends a message and shows the assistant reply", async () => {
    const { window } = page;
    const calls = mockFetch(window, () =>
      jsonResponse(window, { choices: [{ message: { role: "assistant", content: "We build secure systems." } }] }),
    );
    window.document.getElementById("chatbotToggle")?.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
    const input = window.document.getElementById("chatbotInput");
    assert.ok(input instanceof window.HTMLInputElement);
    input.value = "What do you build?";
    submitForm(window, "chatbotForm");
    await settle();

    assert.equal(calls.length, 1);
    assert.equal(calls[0]?.url, "/api/chat");
    assert.deepEqual(calls[0]?.body, { messages: [{ role: "user", content: "What do you build?" }] });
    assert.equal(input.value, "");
    assert.equal(window.document.getElementById("typingIndicator"), null);
    assert.deepEqual(messages(page).slice(-2), ["What do you build?", "We build secure systems."]);
  });

  it("shows the not-connected state reported by /api/chat", async () => {
    const { window } = page;
    const notice = "The assistant is not connected yet. Use the contact form and someone will reply by email.";
    mockFetch(window, () => jsonResponse(window, { error: notice }, 503));
    const input = window.document.getElementById("chatbotInput");
    assert.ok(input instanceof window.HTMLInputElement);
    input.value = "Hello";
    submitForm(window, "chatbotForm");
    await settle();

    assert.equal(messages(page).at(-1), notice);
    assert.equal(window.document.getElementById("typingIndicator"), null);
  });
});
