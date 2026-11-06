# Quickstart and Validation: Web de Pizzería Fratelli

This guide describes the expected commands after implementation adds the package manifest and tests. The local server is for preview and automated tests only; it is not a production host.

## Prerequisites

- Node.js 26.13.0 LTS and npm.
- Chromium browser binaries for the first Playwright run.

## Install and preview

```sh
npm ci
npx playwright install chromium
npm run start
```

Open `http://127.0.0.1:3000`. The start command serves the static site on loopback only; it does not expose a server on the local network.

## Automated checks

```sh
npm run test:unit
npm run test:e2e
npm test
```

- Jest unit tests cover cart and price calculations using Node and native ES modules. The unit test script runs Jest with `--experimental-vm-modules`; no DOM simulator is required.
- Playwright starts the local static server through its `webServer` configuration and runs the customer flows in Chromium.
- If Chromium is missing, run `npx playwright install chromium` before the end-to-end tests.

## Manual acceptance checks

1. Browse all five food categories and compare names, formats, availability and euro prices against the verified menu snapshot.
2. Verify that products with one format can be added directly and products with multiple priced formats require a selection; no extras or drinks are shown.
3. Add two products, change a quantity, remove a line and verify the total each time.
4. Confirm with an empty cart and verify that no success notification appears. Then confirm a non-empty cart and verify the demo-only message and empty cart afterward.
5. Test the phone and map controls, keyboard navigation, visible focus, readable contrast, responsive layout and accessible notification.
6. On a representative mid/low-range PC, check that the main page content is usable within three seconds.
7. Verify permission for each product/banner image before adding it. If permission is not established, use no copied image and keep the original visual treatment complete without photos.

## Updating restaurant content

The public site has no management screen. The maintainer updates the local menu data file using the schema described in [data-model.md](data-model.md), verifies contact and catalog details against the linked sources, and checks that every product format has the correct price. Image assets remain optional and must be approved and optimized.

## Validation record

### Images (T023) — 2026-11-06

- No product or banner image has confirmed usage rights, so `assets/images/` is not created and `data/menu.json` contains no `image` or `bannerImage` fields.
- Verified result without images: the hero uses an original CSS-only decoration (gradient, pizza motif and checkered border), product cards show name, verified description and price, and the page renders no `<img>` elements, so there are no broken-image placeholders (covered by `tests/e2e/menu.spec.js`).

### Automated checks and acceptance steps (T024) — 2026-11-06

- Environment: Node.js 26.13.0, npm 11, Playwright 1.65.0 with Chromium 158.0.8127.18 (headless shell), macOS.
- `npm test`: Jest 15/15 passed (cart rules and `data/menu.json` schema); Playwright 23/23 passed.
- Manual acceptance steps 1–5 and 7 are covered by the Playwright suite and were also checked visually on 1280×900 and 375×800 viewports:
  1. 69 food products in the five categories match the Tipsi source in name, description, availability, format and price (scripted comparison against the live source: 0 mismatches). "PIZZA MITAD" is excluded by design (see `data-model.md`). No drinks are shown.
  2. All current products have one format and are added directly; the multi-format path (required selection, separate lines per format) is verified with a test fixture. No extras are offered.
  3. Adding, changing quantity and removing lines update the total each time.
  4. Empty-cart confirmation shows "Añade al menos un producto…" and no success; a non-empty confirmation shows the demo-only notice, sends no network request, keeps focus on the button and empties the cart.
  5. Phone (`tel:+34918285061`) and map links, keyboard navigation, visible focus, polite live-region announcements and responsive layout pass. Text/background pairs used by the design have a contrast ratio of at least 4.5:1.
  7. No copied images are used.
- Contact data re-verified against the Tripadvisor profile on 2026-11-06: +34 918 28 50 61; Calle Quero, 83-85, 28024 Madrid, España (40.389442, -3.760339).

### Performance (SC-006)

Navigation start to first visible `.product-card`, fresh browser context with cleared cache, five runs each, local `npm run start`:

| Device | CPU throttling | Runs (ms) | Max | Result |
|---|---|---|---|---|
| Apple M4 Pro, 24 GB (development machine) | none | 35, 32, 33, 33, 33 | 35 | Pass (< 3000 ms) |
| Same machine, emulating a low-end CPU | 4× (Chrome DevTools) | 115, 112, 114, 112, 114 | 115 | Pass (< 3000 ms) |
| Representative mid/low-range PC | — | _pending_ | — | **Pending**: repeat on the target device before publication |

### Usability study (SC-001, SC-002, SC-004)

**Pending — requires five real participants.** Record one row per participant; at least four of five must meet each threshold.

| Participant | Find product + complete demo order (< 2 min) | Find phone and address (< 20 s) | Visual clarity rating (4–5 of 5) |
|---|---|---|---|
| P1 | | | |
| P2 | | | |
| P3 | | | |
| P4 | | | |
| P5 | | | |
