import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Window } from "happy-dom";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");

export type Page = {
  window: Window;
  close: () => Promise<void>;
};

type FetchCall = {
  url: string;
  body: unknown;
};

// happy-dom does not mirror two browser details the page relies on:
// matchMedia, and form controls exposed as named properties (form.email).
// The shims stay in the test harness so the page script can run unchanged.
function installBrowserGaps(window: Window): void {
  window.matchMedia = ((query: string) => ({
    matches: query.includes("prefers-reduced-motion"),
    media: query,
    onchange: null,
    addListener() {},
    removeListener() {},
    addEventListener() {},
    removeEventListener() {},
    dispatchEvent() {
      return false;
    },
  })) as unknown as typeof window.matchMedia;

  const forms = window.document.forms;
  for (let i = 0; i < forms.length; i += 1) {
    const form = forms.item(i);
    if (!form) continue;
    const elements = form.elements;
    for (let j = 0; j < elements.length; j += 1) {
      const element = elements.item(j);
      const name = element?.getAttribute("name");
      if (!element || !name) continue;
      Object.defineProperty(form, name, {
        configurable: true,
        get: () => element,
      });
    }
  }
}

function mount(file: string, runScript: boolean): Page {
  const html = readFileSync(join(root, "public", file), "utf8").replace(
    '<script src="/script.js"></script>',
    "",
  );
  const css = readFileSync(join(root, "public/styles.css"), "utf8");
  const window = new Window({ url: "http://localhost/", width: 390, height: 844 });
  window.document.write(html);
  const style = window.document.createElement("style");
  style.textContent = css;
  window.document.head.append(style);
  installBrowserGaps(window);

  if (runScript) {
    window.eval(readFileSync(join(root, "public/script.js"), "utf8"));
    window.document.dispatchEvent(new window.Event("DOMContentLoaded"));
  }

  return {
    window,
    close: () => window.happyDOM.close(),
  };
}

export function loadSite(): Page {
  return mount("index.html", true);
}

export function loadNotFound(): Page {
  return mount("404.html", false);
}

export function jsonResponse(window: Window, body: unknown, status = 200) {
  return new window.Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

export function mockFetch(
  window: Window,
  respond: (url: string, body: unknown) => ReturnType<typeof jsonResponse>,
): FetchCall[] {
  const calls: FetchCall[] = [];
  const fetchImpl = async (input: Parameters<Window["fetch"]>[0], init?: Parameters<Window["fetch"]>[1]) => {
    const raw = init?.body;
    const body = typeof raw === "string" ? (JSON.parse(raw) as unknown) : null;
    const url = String(input);
    calls.push({ url, body });
    return respond(url, body);
  };
  window.fetch = fetchImpl as unknown as typeof window.fetch;
  return calls;
}

export function setField(window: Window, id: string, value: string): void {
  const element = window.document.getElementById(id);
  if (element instanceof window.HTMLInputElement || element instanceof window.HTMLTextAreaElement) {
    element.value = value;
    return;
  }
  throw new Error(`No text field #${id}`);
}

export function submitForm(window: Window, id: string): void {
  const form = window.document.getElementById(id);
  if (!(form instanceof window.HTMLFormElement)) throw new Error(`No form #${id}`);
  form.requestSubmit();
}

export function settle(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
}

export function setScroll(window: Window, y: number): void {
  Object.defineProperty(window, "scrollY", { configurable: true, get: () => y });
  window.dispatchEvent(new window.Event("scroll"));
}

export function stubSectionOffsets(window: Window, tops: Record<string, number>): void {
  for (const [id, top] of Object.entries(tops)) {
    const section = window.document.getElementById(id);
    if (!section) throw new Error(`Missing #${id}`);
    Object.defineProperty(section, "offsetTop", { configurable: true, get: () => top });
  }
}
