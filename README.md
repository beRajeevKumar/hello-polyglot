# Hello, Polyglot

A one-page site that greets visitors in their own language. It reads the browser's
language preferences, picks the closest locale it ships, flips to right-to-left for
Arabic, and rotates one of three taglines per language every day. No server, no
framework, no build step.

**Live:** https://berajeevkumar.github.io/hello-polyglot/

Languages today: English, Hindi, Bengali, Spanish, French, German, Portuguese (Brazil),
Japanese, Korean, Chinese (Simplified), Arabic, Russian.

## How it works

| File | Role |
|---|---|
| `index.html`, `styles.css` | The page. Light and dark themes, responsive, RTL-aware. |
| `src/locale.js` | Pure helpers: `negotiateLocale`, `isRtl`, `dailyIndex`. Shared with the tests. |
| `src/app.js` | Browser glue: loads the locale data, renders, handles the language switcher, remembers your choice. |
| `i18n/locales.json` | Greeting, call to action, and three taglines per locale. |
| `scripts/generate-taglines.mjs` | Asks Claude to redraft every tagline, then validates and writes `locales.json`. |
| `.github/workflows/` | CI runs the tests. Deploy publishes to GitHub Pages. Refresh regenerates taglines and opens a pull request. |

Locale matching, per browser preference in order: exact match first (`pt-BR`), then
same base language (`hi-IN` becomes `hi`, `pt-PT` becomes `pt-BR`), then English.

## Run it locally

The page fetches `i18n/locales.json`, so it needs to be served over HTTP rather than
opened as a file.

```bash
npm start
```

Then open http://localhost:4173. Any static server works, for example
`python3 -m http.server 4173`.

## Tests

```bash
npm test
```

Uses Node's built-in test runner. Covers locale negotiation, RTL detection, the daily
tagline rotation, the shape of the locale data, and the tagline merge step used by the
generator.

## Regenerate the taglines with Claude

The taglines were drafted by Claude. To redraft them:

```bash
export ANTHROPIC_API_KEY=sk-ant-...
npm install
npm run generate
```

`npm run generate -- --dry-run` prints the prompt and the output schema without calling
the API. The script rejects any response that misses a locale or does not return exactly
three non-empty taglines per language, so a bad generation never reaches the page.

To run it from GitHub instead, add an `ANTHROPIC_API_KEY` repository secret and start
the **Refresh taglines with Claude** workflow from the Actions tab. It opens a pull
request with the new wording for you to review.

## Deploying

Every push to `main` runs the **Deploy to GitHub Pages** workflow, which mirrors `main`
onto the `gh-pages` branch. GitHub Pages serves that branch from the repository root,
so the site updates about a minute after each push. The `.nojekyll` file tells Pages
to serve the files exactly as committed.

## Adding a language

Append an entry to `i18n/locales.json` with `code`, `name`, `nativeName`, `greeting`,
`cta`, and three `taglines`. Run `npm test`. That is all; the switcher and matching
pick it up automatically.

## Built with

This repository was created end to end inside a Claude Code cloud session, including
the tests, workflows, and this README.

## License

MIT
