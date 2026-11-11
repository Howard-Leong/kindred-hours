# Kindred Hours

A text-only, scroll-revealed website for good company in Toronto. Plain HTML,
CSS, and JavaScript; no dependencies or build step. All copy is readable without
JavaScript. Reduced-motion preferences disable animation and reveal all text.

## Preview locally

From this repository, run `python3 -m http.server 8000` and open
http://localhost:8000. You can also open `index.html` directly in a browser.

## Publish

Pushing to `main` runs the GitHub Pages workflow. In repository **Settings →
Pages**, choose **GitHub Actions** as the source if it is not already selected.
The repository owner may need to enable Pages before the initial deployment.

Expected address: https://howard-leong.github.io/kindred-hours/

## Edit

- `index.html`: the story, ten principles, and telephone link.
- `styles.css`: colours, typography, layout, and accent animations.
- `script.js`: progressive, scroll-linked letter reveals.

Text reveals when scrolling down and dims again when scrolling back up. Words
wrap as a unit, and the complete text remains available to screen readers.
Telephone links work on supported devices. Scroll animation runs automatically,
with no visible controls or scroll prompts. Device reduced-motion preferences
disable animation and keep all text readable.

## Browser checks

`tests/browser.cjs` checks desktop and mobile layouts, progressive reveals,
accent triggers, keyboard telephone access, reduced motion, and the
no-JavaScript fallback. With the local server running, execute it with Node
and set `PLAYWRIGHT_MODULE` to the absolute path of an installed Playwright
package. Tests use your installed Google Chrome; Playwright is only a test
tool, not a website dependency.