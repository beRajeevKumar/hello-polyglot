// Pure helper used by generate-taglines.mjs and covered by the test suite.

const TAGLINES_PER_LOCALE = 3;

/**
 * Return a copy of `locales` with each entry's taglines replaced by the matching
 * entry in `generated` ([{ code, taglines }]). Throws if any locale is missing,
 * unknown, or does not come with exactly three non-empty taglines, so a bad model
 * response can never be written to disk.
 */
export function mergeTaglines(locales, generated) {
  const known = new Set(locales.map((l) => l.code));
  const byCode = new Map();

  for (const entry of generated ?? []) {
    if (!known.has(entry.code)) {
      throw new Error(`Unknown locale code in generated output: ${entry.code}`);
    }
    const taglines = Array.isArray(entry.taglines) ? entry.taglines : [];
    const clean = taglines.map((t) => String(t).trim());
    if (clean.length !== TAGLINES_PER_LOCALE || clean.some((t) => t.length === 0)) {
      throw new Error(`Locale ${entry.code} needs exactly ${TAGLINES_PER_LOCALE} non-empty taglines`);
    }
    byCode.set(entry.code, clean);
  }

  return locales.map((locale) => {
    const taglines = byCode.get(locale.code);
    if (!taglines) throw new Error(`Generated output is missing locale ${locale.code}`);
    return { ...locale, taglines };
  });
}
