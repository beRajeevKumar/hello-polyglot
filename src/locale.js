// Pure locale helpers shared by the page and the test suite. No DOM access here.

const RTL_LANGUAGES = new Set(["ar", "he", "iw", "fa", "ur", "ps", "sd", "ug", "yi", "dv"]);

function baseLanguage(code) {
  return String(code).toLowerCase().split("-")[0];
}

/**
 * Pick the best available locale for a list of requested locales
 * (typically `navigator.languages`), honouring the browser's preference order.
 *
 * Matching rules, per requested entry:
 *   1. exact match, case-insensitive ("pt-BR" -> "pt-BR")
 *   2. same base language, any region ("hi-IN" -> "hi", "pt-PT" -> "pt-BR")
 * Falls back to `fallback` when nothing matches.
 */
export function negotiateLocale(requested, available, fallback = "en") {
  const exact = new Map();
  const byBase = new Map();
  for (const code of available ?? []) {
    exact.set(code.toLowerCase(), code);
    const base = baseLanguage(code);
    if (!byBase.has(base)) byBase.set(base, code);
  }

  for (const wanted of requested ?? []) {
    if (!wanted) continue;
    const lower = String(wanted).toLowerCase();
    if (exact.has(lower)) return exact.get(lower);
    const base = baseLanguage(lower);
    if (byBase.has(base)) return byBase.get(base);
  }
  return fallback;
}

/** True for languages written right-to-left, so the page can flip `dir`. */
export function isRtl(code) {
  return RTL_LANGUAGES.has(baseLanguage(code));
}

/**
 * Deterministic index in [0, count) that changes once per UTC day,
 * used to rotate taglines without any server.
 */
export function dailyIndex(count, date = new Date()) {
  if (!Number.isInteger(count) || count <= 0) return 0;
  const dayNumber = Math.floor(date.getTime() / 86_400_000);
  return ((dayNumber % count) + count) % count;
}
