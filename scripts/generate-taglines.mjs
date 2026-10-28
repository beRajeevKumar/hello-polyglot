#!/usr/bin/env node
// Redraft every tagline in i18n/locales.json with Claude, validate, and write back.
//
//   ANTHROPIC_API_KEY=sk-ant-... npm run generate
//   npm run generate -- --dry-run   # print the prompt and schema, call nothing
//
// The page's greeting, call to action, and language names are left untouched.

import { readFile, writeFile } from "node:fs/promises";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { mergeTaglines } from "./taglines.js";

const MODEL = "claude-opus-5-5";
const LOCALES_FILE = new URL("../i18n/locales.json", import.meta.url);
const dryRun = process.argv.includes("--dry-run");

const locales = JSON.parse(await readFile(LOCALES_FILE, "utf8"));

const Output = z.object({
  locales: z.array(
    z.object({
      code: z.string().describe("Locale code exactly as given, for example pt-BR"),
      taglines: z.array(z.string()).describe("Exactly three taglines in that language"),
    }),
  ),
});

const system = [
  "You write short marketing taglines for a landing page called \"Hello, Polyglot\".",
  "The page greets each visitor in their own language and stands for software built for the whole world with the help of AI.",
  "Write natively in each language. Do not translate English word for word; use phrasing a native copywriter would choose.",
  "Each tagline is one sentence, at most 70 characters, no emoji, no hashtags, no quotation marks.",
  "Return exactly three distinct taglines for every locale listed and nothing else.",
].join(" ");

const prompt = [
  "Locales to write for (code, English name, native name):",
  ...locales.map((l) => `- ${l.code}: ${l.name} (${l.nativeName})`),
  "",
  "Current taglines, for tone only; write fresh ones rather than editing these:",
  ...locales.map((l) => `- ${l.code}: ${l.taglines.join(" | ")}`),
].join("\n");

if (dryRun) {
  console.log("Model:", MODEL);
  console.log("\nSystem:\n" + system);
  console.log("\nUser:\n" + prompt);
  console.log("\nOutput schema:\n" + JSON.stringify(zodOutputFormat(Output).schema, null, 2));
  process.exit(0);
}

const client = new Anthropic();
const response = await client.messages.parse({
  model: MODEL,
  max_tokens: 16000,
  system,
  messages: [{ role: "user", content: prompt }],
  output_config: { format: zodOutputFormat(Output) },
});

if (response.stop_reason === "refusal") {
  throw new Error(`Claude declined the request: ${response.stop_details?.explanation ?? "no explanation"}`);
}
if (response.stop_reason === "max_tokens") {
  throw new Error("Response was cut off at max_tokens; nothing written");
}
if (!response.parsed_output) {
  throw new Error("Response did not match the output schema; nothing written");
}

const merged = mergeTaglines(locales, response.parsed_output.locales);
await writeFile(LOCALES_FILE, JSON.stringify(merged, null, 2) + "\n");

const usage = response.usage;
console.log(`Updated ${merged.length} locales (${usage.input_tokens} in / ${usage.output_tokens} out tokens).`);
