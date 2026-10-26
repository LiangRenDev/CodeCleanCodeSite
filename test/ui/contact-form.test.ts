import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";
import { jsonResponse, loadSite, mockFetch, setField, settle, submitForm, type Page } from "./dom.ts";

describe("contact form", () => {
  let page: Page;

  beforeEach(() => {
    page = loadSite();
  });

  afterEach(async () => {
    await page.close();
  });

  it("includes a honeypot that is present and hidden", () => {
    const { window } = page;
    const { document } = window;
    const honeypot = document.querySelector(".form-honeypot");
    const field = document.getElementById("website");
    assert.ok(honeypot);
    assert.equal(honeypot.getAttribute("aria-hidden"), "true");
    assert.ok(field instanceof window.HTMLInputElement);
    assert.equal(field.getAttribute("name"), "website");
    assert.equal(field.tabIndex, -1);
    assert.equal(honeypot.contains(field), true);

    const style = window.getComputedStyle(honeypot);
    assert.equal(style.position, "absolute");
    assert.equal(style.left, "-10000px");
    assert.equal(style.width, "1px");
    assert.equal(style.height, "1px");
    assert.equal(style.overflow, "hidden");
  });

  it("rejects a submit that is missing name, email, or message", async () => {
    const { window } = page;
    const calls = mockFetch(window, () => jsonResponse(window, { success: true }));
    setField(window, "name", "   ");
    setField(window, "email", "ada@example.com");
    submitForm(window, "contactForm");
    await settle();

    const status = window.document.getElementById("formStatus");
    assert.equal(status?.textContent, "Name, email, and a message are required.");
    assert.equal(status?.classList.contains("is-error"), true);
    assert.equal(calls.length, 0);
    assert.equal(window.document.querySelector(".submit-btn")?.textContent?.includes("Send Message"), true);
  });

  it("shows a success status and resets the form", async () => {
    const { window } = page;
    const calls = mockFetch(window, () => jsonResponse(window, { success: true }));
    setField(window, "name", "Ada Lovelace");
    setField(window, "email", "ada@example.com");
    setField(window, "company", "Analytical Engines");
    setField(window, "message", "Need a resilient inference service.");
    submitForm(window, "contactForm");
    await settle();

    assert.equal(calls.length, 1);
    assert.equal(calls[0]?.url, "/api/contact");
    assert.deepEqual(calls[0]?.body, {
      name: "Ada Lovelace",
      email: "ada@example.com",
      company: "Analytical Engines",
      message: "Need a resilient inference service.",
      website: "",
    });

    const status = window.document.getElementById("formStatus");
    assert.equal(status?.textContent, "Thank you. We'll reply by email.");
    assert.equal(status?.classList.contains("is-success"), true);
    const button = window.document.querySelector(".submit-btn");
    assert.equal(button?.textContent, "Message sent");
    assert.equal(button instanceof window.HTMLButtonElement && button.disabled, true);
    const message = window.document.getElementById("message");
    assert.equal(message instanceof window.HTMLTextAreaElement && message.value, "");
  });

  it("shows the server error and keeps the form editable", async () => {
    const { window } = page;
    mockFetch(window, () =>
      jsonResponse(window, { success: false, error: "The contact form is not connected yet." }, 503),
    );
    setField(window, "name", "Ada");
    setField(window, "email", "ada@example.com");
    setField(window, "message", "Hello");
    submitForm(window, "contactForm");
    await settle();

    const status = window.document.getElementById("formStatus");
    assert.equal(status?.textContent, "The contact form is not connected yet.");
    assert.equal(status?.classList.contains("is-error"), true);
    const button = window.document.querySelector(".submit-btn");
    assert.equal(button instanceof window.HTMLButtonElement && button.disabled, false);
    assert.match(button?.textContent ?? "", /Send Message/);
    const message = window.document.getElementById("message");
    assert.equal(message instanceof window.HTMLTextAreaElement && message.value, "Hello");
  });
});
