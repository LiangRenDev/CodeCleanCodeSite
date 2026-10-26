import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";
import { loadNotFound, type Page } from "./dom.ts";

describe("404 page", () => {
  let page: Page;

  beforeEach(() => {
    page = loadNotFound();
  });

  afterEach(async () => {
    await page.close();
  });

  it("renders the missing-page message and a way back home", () => {
    const { document } = page.window;
    assert.equal(document.title, "Page not found | CodeCleanCode");
    assert.match(document.querySelector("h1")?.textContent ?? "", /That path does not resolve/);
    assert.match(document.querySelector(".missing-copy")?.textContent ?? "", /Head back to the start/);

    const home = document.querySelector("main a.btn");
    assert.equal(home?.getAttribute("href"), "/");
    assert.match(home?.textContent ?? "", /Back home/);
    assert.equal(document.querySelector(".logo")?.getAttribute("href"), "/");
  });
});
