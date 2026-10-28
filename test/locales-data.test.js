import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const locales = JSON.parse(await readFile(new URL("../i18n/locales.json", import.meta.url), "utf8"));

test("ships English as the default locale", () => {
  assert.ok(locales.some((l) => l.code === "en"));
});

test("locale codes are unique", () => {
  const codes = locales.map((l) => l.code);
  assert.equal(new Set(codes).size, codes.length);
});

test("every locale has the fields the page renders", () => {
  for (const l of locales) {
    assert.equal(typeof l.code, "string", "code");
    assert.ok(l.code.length > 0, `${l.code}: empty code`);
    assert.ok(l.name?.length > 0, `${l.code}: name`);
    assert.ok(l.nativeName?.length > 0, `${l.code}: nativeName`);
    assert.ok(l.greeting?.length > 0, `${l.code}: greeting`);
    assert.ok(l.cta?.length > 0, `${l.code}: cta`);
    assert.ok(Array.isArray(l.taglines) && l.taglines.length === 3, `${l.code}: needs exactly 3 taglines`);
    for (const t of l.taglines) assert.ok(t.trim().length > 0, `${l.code}: empty tagline`);
  }
});
