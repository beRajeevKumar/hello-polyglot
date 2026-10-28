import { test } from "node:test";
import assert from "node:assert/strict";
import { negotiateLocale, isRtl, dailyIndex } from "../src/locale.js";

const available = ["en", "hi", "bn", "es", "fr", "de", "pt-BR", "ja", "ko", "zh", "ar", "ru"];

test("picks an exact match when the browser locale is available", () => {
  assert.equal(negotiateLocale(["pt-BR", "en"], available), "pt-BR");
});

test("falls back to the base language when only the region differs", () => {
  assert.equal(negotiateLocale(["hi-IN", "en-US"], available), "hi");
});

test("maps a regional request onto the only regional variant shipped", () => {
  assert.equal(negotiateLocale(["pt-PT"], available), "pt-BR");
});

test("matches case-insensitively", () => {
  assert.equal(negotiateLocale(["DE-at"], available), "de");
});

test("honours the browser's preference order", () => {
  assert.equal(negotiateLocale(["xx", "fr", "en"], available), "fr");
});

test("returns the default when nothing matches", () => {
  assert.equal(negotiateLocale(["tlh"], available), "en");
});

test("returns the default for empty or missing input", () => {
  assert.equal(negotiateLocale([], available), "en");
  assert.equal(negotiateLocale(undefined, available), "en");
});

test("allows a different default locale", () => {
  assert.equal(negotiateLocale(["tlh"], available, "hi"), "hi");
});

test("isRtl is true only for right-to-left scripts", () => {
  assert.equal(isRtl("ar"), true);
  assert.equal(isRtl("he-IL"), true);
  assert.equal(isRtl("ur"), true);
  assert.equal(isRtl("en"), false);
  assert.equal(isRtl("hi"), false);
});

test("dailyIndex rotates deterministically by UTC day", () => {
  const jan1 = new Date(Date.UTC(2026, 0, 1));
  const jan1Late = new Date(Date.UTC(2026, 0, 1, 23, 59));
  const jan2 = new Date(Date.UTC(2026, 0, 2));
  const jan4 = new Date(Date.UTC(2026, 0, 4));
  assert.equal(dailyIndex(3, jan1), dailyIndex(3, jan1Late));
  assert.notEqual(dailyIndex(3, jan1), dailyIndex(3, jan2));
  assert.equal(dailyIndex(3, jan1), dailyIndex(3, jan4));
});

test("dailyIndex always stays in range", () => {
  for (let i = 0; i < 400; i++) {
    const idx = dailyIndex(3, new Date(Date.UTC(2026, 0, 1 + i)));
    assert.ok(idx >= 0 && idx < 3, `index ${idx} out of range on day ${i}`);
  }
  assert.equal(dailyIndex(0, new Date()), 0);
});
