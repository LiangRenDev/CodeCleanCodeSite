import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";
import { loadSite, type Page } from "./dom.ts";

describe("mobile menu", () => {
  let page: Page;

  beforeEach(() => {
    page = loadSite();
  });

  afterEach(async () => {
    await page.close();
  });

  it("opens and closes, including aria state", () => {
    const { document } = page.window;
    const toggle = document.querySelector(".nav-toggle");
    const menu = document.getElementById("nav-menu");
    const label = toggle?.querySelector(".visually-hidden");
    assert.ok(toggle instanceof page.window.HTMLButtonElement);
    assert.ok(menu);

    assert.equal(toggle.getAttribute("aria-expanded"), "false");
    assert.equal(toggle.getAttribute("aria-controls"), "nav-menu");
    assert.equal(label?.textContent, "Open menu");
    assert.equal(menu.classList.contains("is-open"), false);

    toggle.click();
    assert.equal(toggle.getAttribute("aria-expanded"), "true");
    assert.equal(label?.textContent, "Close menu");
    assert.equal(menu.classList.contains("is-open"), true);
    assert.equal(document.body.classList.contains("nav-open"), true);

    toggle.click();
    assert.equal(toggle.getAttribute("aria-expanded"), "false");
    assert.equal(label?.textContent, "Open menu");
    assert.equal(menu.classList.contains("is-open"), false);
    assert.equal(document.body.classList.contains("nav-open"), false);
  });

  it("closes on Escape and when a section link is chosen", () => {
    const { window } = page;
    const { document } = window;
    const toggle = document.querySelector(".nav-toggle");
    const menu = document.getElementById("nav-menu");
    assert.ok(toggle instanceof window.HTMLButtonElement);
    assert.ok(menu);

    toggle.click();
    document.dispatchEvent(new window.KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    assert.equal(toggle.getAttribute("aria-expanded"), "false");
    assert.equal(menu.classList.contains("is-open"), false);

    toggle.click();
    const services = menu.querySelector('a[href="#services"]');
    assert.ok(services instanceof window.HTMLAnchorElement);
    services.click();
    assert.equal(window.location.hash, "#services");
    assert.equal(menu.classList.contains("is-open"), false);
    assert.equal(toggle.getAttribute("aria-expanded"), "false");
  });
});
