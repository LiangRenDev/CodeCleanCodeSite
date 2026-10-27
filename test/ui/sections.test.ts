import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";
import { loadSite, setScroll, stubSectionOffsets, type Page } from "./dom.ts";

const sections = [
  { id: "home", href: "#home", heading: "Building" },
  { id: "services", href: "#services", heading: "What We Build" },
  { id: "about", href: "#about", heading: "Code That Matters" },
  { id: "contact", href: "#contact", heading: "Build Something Extraordinary" },
];

describe("page sections", () => {
  let page: Page;

  beforeEach(() => {
    page = loadSite();
  });

  afterEach(async () => {
    await page.close();
  });

  it("renders Home, Services, About, and Contact", () => {
    const { document } = page.window;
    for (const section of sections) {
      const element = document.getElementById(section.id);
      assert.equal(element?.tagName, "SECTION");
      assert.match(element?.textContent ?? "", new RegExp(section.heading));
    }
    assert.equal(document.querySelectorAll("#services .service-card").length, 3);
  });

  it("points each nav link at its section and follows the fragment", () => {
    const { window } = page;
    const { document } = window;
    for (const section of sections) {
      const link = document.querySelector(`#nav-menu a[href="${section.href}"]`);
      assert.ok(link instanceof window.HTMLAnchorElement);
      assert.ok((link.textContent ?? "").trim().length > 0);
      assert.equal(link.getAttribute("href"), section.href);
      assert.equal(document.querySelector(link.hash)?.id, section.id);
      link.click();
      assert.equal(window.location.hash, section.href);
    }
  });

  it("marks the nav link for the section scrolled into view", () => {
    const { window } = page;
    const { document } = window;
    stubSectionOffsets(window, { home: 0, services: 800, about: 1600, contact: 2400 });

    setScroll(window, 0);
    assert.equal(document.querySelector('.nav-link[aria-current="true"]')?.getAttribute("href"), "#home");

    setScroll(window, 900);
    assert.equal(document.querySelector('.nav-link[aria-current="true"]')?.getAttribute("href"), "#services");
    assert.equal(document.querySelector(".nav")?.classList.contains("is-scrolled"), true);

    setScroll(window, 1700);
    assert.equal(document.querySelector('.nav-link[aria-current="true"]')?.getAttribute("href"), "#about");

    setScroll(window, 2500);
    assert.equal(document.querySelector('.nav-link[aria-current="true"]')?.getAttribute("href"), "#contact");
  });
});
