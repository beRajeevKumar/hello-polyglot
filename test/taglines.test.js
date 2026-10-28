import { test } from "node:test";
import assert from "node:assert/strict";
import { mergeTaglines } from "../scripts/taglines.js";

const locales = [
  { code: "en", name: "English", greeting: "Hello", cta: "Choose", taglines: ["a", "b", "c"] },
  { code: "hi", name: "Hindi", greeting: "नमस्ते", cta: "चुनें", taglines: ["d", "e", "f"] },
];

test("replaces taglines for every locale and keeps the other fields", () => {
  const merged = mergeTaglines(locales, [
    { code: "en", taglines: ["x", "y", "z"] },
    { code: "hi", taglines: ["p", "q", "r"] },
  ]);
  assert.deepEqual(merged[0], { ...locales[0], taglines: ["x", "y", "z"] });
  assert.deepEqual(merged[1], { ...locales[1], taglines: ["p", "q", "r"] });
});

test("does not mutate the input", () => {
  mergeTaglines(locales, [
    { code: "en", taglines: ["x", "y", "z"] },
    { code: "hi", taglines: ["p", "q", "r"] },
  ]);
  assert.deepEqual(locales[0].taglines, ["a", "b", "c"]);
});

test("rejects output that misses a locale", () => {
  assert.throws(() => mergeTaglines(locales, [{ code: "en", taglines: ["x", "y", "z"] }]), /hi/);
});

test("rejects output with an unknown locale code", () => {
  assert.throws(
    () =>
      mergeTaglines(locales, [
        { code: "en", taglines: ["x", "y", "z"] },
        { code: "hi", taglines: ["p", "q", "r"] },
        { code: "xx", taglines: ["1", "2", "3"] },
      ]),
    /xx/,
  );
});

test("rejects a locale without exactly three non-empty taglines", () => {
  assert.throws(
    () =>
      mergeTaglines(locales, [
        { code: "en", taglines: ["x", "y"] },
        { code: "hi", taglines: ["p", "q", "r"] },
      ]),
    /en/,
  );
  assert.throws(
    () =>
      mergeTaglines(locales, [
        { code: "en", taglines: ["x", "y", "  "] },
        { code: "hi", taglines: ["p", "q", "r"] },
      ]),
    /en/,
  );
});
