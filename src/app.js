import { negotiateLocale, isRtl, dailyIndex } from "./locale.js";

const STORAGE_KEY = "hello-polyglot:locale";

const els = {
  detected: document.getElementById("detected"),
  greeting: document.getElementById("greeting"),
  tagline: document.getElementById("tagline"),
  cta: document.getElementById("cta"),
  select: document.getElementById("language"),
  count: document.getElementById("count"),
};

function readSaved() {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function save(code) {
  try {
    localStorage.setItem(STORAGE_KEY, code);
  } catch {
    /* private mode or blocked storage: ignore */
  }
}

function render(locale, { fromBrowser }) {
  const index = dailyIndex(locale.taglines.length);
  document.documentElement.lang = locale.code;
  document.documentElement.dir = isRtl(locale.code) ? "rtl" : "ltr";
  document.title = `${locale.greeting} · Hello, Polyglot`;

  els.greeting.textContent = locale.greeting;
  els.tagline.textContent = locale.taglines[index];
  els.cta.textContent = locale.cta;
  els.select.value = locale.code;
  els.detected.textContent = fromBrowser ? `Detected from your browser · ${locale.name}` : locale.name;

  for (const el of [els.greeting, els.tagline]) {
    el.classList.remove("fade");
    void el.offsetWidth; // restart the animation
    el.classList.add("fade");
  }
}

async function main() {
  const response = await fetch("./i18n/locales.json");
  const locales = await response.json();
  const byCode = new Map(locales.map((l) => [l.code, l]));

  for (const l of locales) {
    const option = document.createElement("option");
    option.value = l.code;
    option.textContent = `${l.nativeName} (${l.name})`;
    els.select.append(option);
  }
  els.count.textContent = `${locales.length} languages`;

  const saved = readSaved();
  const fromBrowser = !saved || !byCode.has(saved);
  const initial = fromBrowser ? negotiateLocale(navigator.languages ?? [navigator.language], [...byCode.keys()]) : saved;
  render(byCode.get(initial), { fromBrowser });

  els.select.addEventListener("change", () => {
    const code = els.select.value;
    save(code);
    render(byCode.get(code), { fromBrowser: false });
  });
}

main().catch((error) => {
  console.error(error);
  els.detected.textContent = "Could not load languages. Serve this folder over HTTP, not file://";
});
