# Tasks: Web de Pizzería Fratelli

**Input**: Design documents in `specs/001-pizzeria-web/`

**Prerequisites**: `plan.md` and `spec.md`; also `research.md`, `data-model.md`, `contracts/ui.md` and `quickstart.md`.

**Tests**: Required by the constitution's Test-First principle. For each user story, write and observe its tests failing before implementing that story.

**Organization**: Tasks are grouped by user story so each increment can be validated against its own acceptance criteria.

## Formato

- Every task uses `- [ ] Tnnn`; `[P]` marks work that can run in parallel, and `[USn]` identifies a user-story task.
- Tasks specify the files to create or update. Keep the menu data in JSON and cart/pricing logic independent of the DOM.

## Phase 1: Setup

**Purpose**: Establish the approved npm tooling and reproducible local test/preview commands.

- [X] T001 [P] Update `.gitignore`: stop ignoring `/package-lock.json`, keep `/yarn.lock` ignored, and ignore `/node_modules/`, `/playwright-report/`, `/test-results/`, `/.github/skills/` and `/.DS_Store`; keep `.specify/` (including its scripts, templates, workflows and constitution), `specs/` and `.github/workflows/` trackable.
- [X] T002 [P] Create `package.json` with `"type": "module"`, an `engines.node` range beginning at 26.13.0 and below 27, and exact development dependencies `serve@14.2.6`, `jest@30.5.2` and `@playwright/test@1.65.0`; define `start`, `test:unit`, `test:e2e` and `test` scripts, with `start` bound to `tcp://127.0.0.1:3000` and disabling clipboard copying and port switching.
- [X] T003 Generate and commit-ready `package-lock.json` from `package.json` using Node.js 26.13.0; verify a clean `npm ci` install.
- [X] T004 [P] Configure `jest.config.mjs` for native ESM, Node environment, tests under `tests/unit/` and disabled transforms; run Jest through Node's `--experimental-vm-modules` flag.
- [X] T005 [P] Configure `playwright.config.mjs` to run Chromium tests from `tests/e2e/` and start `npm run start` through `webServer`, waiting for `http://127.0.0.1:3000`.

## Phase 2: Foundational

**Purpose**: Establish a failing-first test gate, then create the shared semantic page shell and accessibility baseline.

- [X] T006 Add failing shell/accessibility browser tests in `tests/e2e/menu.spec.js` for Spanish document language, semantic landmarks, visible navigation links to `#menu` and `#contact`, keyboard focus and responsive layout; run them and observe failure before creating the shell.
- [X] T007 [P] Create `index.html` with Spanish document language, metadata, semantic header/nav/main/footer landmarks, links to `#menu` and `#contact`, stylesheet and module entry points, and empty section targets for restaurant identity, menu, cart and contact.
- [X] T008 [P] Establish shared responsive typography, layout, color, visible focus and reduced-motion defaults in `styles/site.css`; use system fonts and avoid external runtime assets.

**Checkpoint**: The shell tests have been observed failing before the page shell and styles were implemented; the static foundation is now ready for user stories.

## Phase 3: User Story 1 - Explorar la pizzería y su carta (Priority: P1) 🎯 MVP

**Goal**: Present the restaurant identity and verified food catalog in a polished, responsive, accessible page.

**Independent Test**: Open the site without placing an order; verify the required hero/banner and restaurant identity, all five food categories, available products and their verified names/prices/formats, navigation links to menu/contact, and usable layout on desktop and a small viewport. Confirm no drinks menu or staff editor is exposed.

### Tests for User Story 1

- [X] T009 [US1] Extend `tests/e2e/menu.spec.js` with failing-first tests for a visible hero/banner section, restaurant identity, the five food categories, product details, navigation links, responsive layout, and absence of drinks/admin UI; measure wall-clock time immediately before `page.goto()` until the first `.product-card` is visible and require <3000 ms on a documented representative mid/low-range PC using Chromium with a fresh context and cold cache.

### Implementation for User Story 1

- [X] T010 [US1] Create `data/menu.json` from the linked, verified food menu and re-verify the public phone/address before publication. Preserve these `data-model.md` constraints verbatim: restaurant `name` is "Required, non-empty"; `bannerImage` "Omit if usage rights are not verified"; `phone` and `address` are "Required and re-verified before publication"; `mapUrl` "Must point to the verified restaurant location"; `menuId` is "Unique"; menu `categories[]` are "Non-empty; do not include the separate drinks menu"; category IDs are "Unique within the menu", names "Required, non-empty", and order a "Non-negative integer"; product IDs are "Unique", `categoryId` "Must refer to an existing category", names "Required, non-empty", descriptions "Show only when verified and non-empty", unavailable products "Unavailable products cannot be added", images "Must resolve to an asset; meaningful alt text required", and formats "At least one format"; format IDs are "Unique within the product", names "Required, non-empty", and `priceCents` a "Non-negative integer". Do not invent missing catalog details or use images without verified rights.
- [X] T011 [P] [US1] Implement `scripts/app.js` to load `data/menu.json` and always render a visible hero/banner section with restaurant identity and food categories; render a banner image only when an approved asset exists. Use `.hero`, `.menu-category` and `.product-card`, gracefully omit unverified descriptions/images, visibly report load errors, and never render drinks or management UI.
- [X] T012 [P] [US1] Style the identity, required hero/banner section, category navigation and product cards in `styles/site.css` using the shared `.hero`, `.menu-category` and `.product-card` classes; ensure readable responsive layouts and no broken-image placeholders.
- [X] T013 [US1] Run `npm run test:e2e -- tests/e2e/menu.spec.js` and compare every published product name, price and format in `data/menu.json` against the verified source; correct any mismatch before marking US1 complete.

## Phase 4: User Story 2 - Preparar un pedido de demostración (Priority: P2)

**Goal**: Let a customer select product formats, update a temporary cart, review its total and complete a clearly simulated confirmation.

**Independent Test**: Add products from the menu, select required formats, change quantities, remove a line and check the total; verify empty-cart confirmation is prevented and non-empty confirmation displays a demo-only success notification and clears the cart without any network submission.

### Tests for User Story 2

- [X] T014 [P] [US2] Add pure cart/pricing cases in `tests/unit/cart.test.js` for adding, incrementing, changing quantity, removing, totals, format separation and empty-cart confirmation; cover these `data-model.md` constraints verbatim: `line.productId` "Must refer to an available product"; `line.formatId` "Must belong to the selected product"; `line.quantity` is a "Positive integer"; `line.unitPriceCents` is "Derived from the menu snapshot; never independently editable"; `cart.totalCents` is `sum(quantity * unitPriceCents)`; and "Quantity zero removes the line." Run the unit tests and observe failure before implementing cart logic.
- [X] T015 [P] [US2] Extend `tests/e2e/menu.spec.js` with browser coverage for format selection, cart updates/removal/totals, empty-cart validation, demo-only success feedback and cart clearing; run the new cases and observe failure before implementing the order flow.

### Implementation for User Story 2

- [X] T016 [US2] Implement DOM-free cart and price operations in `scripts/cart.js`; keep cart state in memory, distinguish lines by product and format, increment repeated selections, recalculate totals from menu prices, reject unavailable/invalid selections, and create no order, payment or customer record.
- [X] T017 [US2] Integrate the cart in `scripts/app.js`, `index.html` and `styles/site.css`: require a format choice only for multi-format products, provide quantity/remove controls and a live total, prevent confirmation when empty, announce an accessible demo-only success notification without moving focus, and clear the cart after success.
- [X] T018 [US2] Run `npm run test:unit` and `npm run test:e2e -- tests/e2e/menu.spec.js`; resolve failures and verify that no request is sent to Tipsi or the restaurant.

## Phase 5: User Story 3 - Encontrar cómo contactar y llegar al restaurante (Priority: P2)

**Goal**: Make the verified telephone and full address easy to find, call and open in a map service.

**Independent Test**: Open the contact section, verify the visible phone and full address, check the `tel:` and verified map links, and confirm the text remains available if an external action is unavailable.

### Tests for User Story 3

- [X] T019 [US3] Extend `tests/e2e/menu.spec.js` with contact tests for the verified phone, full address, `tel:` action, map destination and keyboard operation; run the new cases and observe failure before implementing contact UI.

### Implementation for User Story 3

- [X] T020 [US3] Render the verified restaurant contact data in the contact section using `data/menu.json`, `scripts/app.js`, `index.html` and `styles/site.css`; make the phone a `tel:` link, the location a link to the verified `mapUrl`, and the visible address/phone selectable as text.
- [X] T021 [US3] Run `npm run test:e2e -- tests/e2e/menu.spec.js`; re-check the phone, address and map destination against the public source and correct `data/menu.json` before marking US3 complete.

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Document operations and verify accessibility, performance and the complete acceptance flow.

- [X] T022 [P] Update `README.md` with Node/npm prerequisites, preview and test commands, how to update `data/menu.json`, and the provider-agnostic static deployment boundary.
- [X] T023 [P] Verify any rights-approved image assets under `assets/images/` are local and optimized; if none are approved, verify the CSS/text treatment remains complete without images and document that result in `specs/001-pizzeria-web/quickstart.md`.
- [ ] T024 Run `npm test` and execute the manual acceptance steps in `specs/001-pizzeria-web/quickstart.md`; conduct the five-person usability checks in `specs/001-pizzeria-web/spec.md` SC-001, SC-002 and SC-004 (at least four of five must meet each threshold) and record outcomes in `specs/001-pizzeria-web/quickstart.md`; on the documented representative mid/low-range PC, use Chromium with a fresh context and cold cache to measure navigation start until the first product is visible, repeat five times and require each run under 3000 ms, recording device/browser/results in `specs/001-pizzeria-web/quickstart.md`; verify accessibility/keyboard behavior and no real order or personal-data flow.

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: T001, T002, T004 and T005 can start in parallel; T003 depends on T001 and T002.
- **Foundational (Phase 2)**: Starts after Setup. T006 must fail before shell implementation; T007 and T008 can run in parallel afterward and block all user-story work.
- **User Stories (Phase 3+)**: US1 starts after the foundation. US2 follows US1 because its end-to-end flow uses the implemented menu. US3 follows US2 because all stories integrate into the same page shell, `scripts/app.js` and `styles/site.css`; avoid concurrent edits to those shared files.
- **Polish (Phase 6)**: Starts after US1, US2 and US3; T022 and T023 can run in parallel, followed by full validation T024.

### User Story Dependencies

- **US1 (P1)**: Depends on Setup and Foundational phases; no dependency on another story.
- **US2 (P2)**: Depends on US1's rendered catalog so customers can add real menu entries to the demo cart.
- **US3 (P2)**: Contact data originates in US1's restaurant JSON; implementation follows US2 to avoid conflicting edits to the shared page/controller/style files.

### Parallel Opportunities

- Setup: T001, T002, T004 and T005; then T003 after the manifest and ignore rules are ready.
- Foundational: T006 runs first and must fail; then T007 and T008 can run in parallel.
- US1: after T009 fails and T010 establishes the data, implement `scripts/app.js` (T011) and style its agreed classes in `styles/site.css` (T012) in parallel.
- US2: write `tests/unit/cart.test.js` (T014) and extend `tests/e2e/menu.spec.js` (T015) in parallel; both must fail before T016/T017.
- US3: no parallel implementation task is suitable because it touches the shared single-page integration files; complete T019 before T020.
- Polish: T022 and T023.

## Parallel Example: User Story 1

After T009 has established failing browser expectations and T010 has established the JSON data contract:

```text
Run in parallel:
T011 — implement menu rendering in scripts/app.js
T012 — style the agreed menu classes in styles/site.css
```

## Parallel Example: User Story 2

After US1 is complete, prepare the independent unit and browser test files together, and observe both fail before implementation:

```text
Run in parallel:
T014 — cart/pricing unit tests in tests/unit/cart.test.js
T015 — cart/order browser tests in tests/e2e/menu.spec.js
```

## Parallel Example: User Story 3

There are no safe parallel implementation tasks for this story because its contact UI uses the same page, app controller and stylesheet as earlier stories. Write and fail T019 first, then implement T020.

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Setup and Foundational phases.
2. Complete US1, including failing-first browser tests and verified catalog content.
3. Stop and validate the restaurant presentation and food menu independently.
4. Treat this as the first reviewable site increment; the demo cart and contact actions arrive in subsequent stories.

### Incremental Delivery

1. Setup + Foundational → static accessible shell and tooling.
2. US1 → restaurant identity and verified food catalog; validate independently.
3. US2 → simulated cart; validate price logic and demo-only confirmation.
4. US3 → verified contact and location actions.
5. Polish → document, run all checks and verify performance/accessibility acceptance.

## Notes

- `[P]` means different files can be changed without waiting on an incomplete task.
- Tests are required by the constitution and must fail before the corresponding implementation.
- Keep order/cart state in memory only; never add a real order API, payment, personal-data form or runtime Tipsi call.
- Keep `package-lock.json` versioned, keep Yarn lockfiles ignored, and do not commit local agent tooling ignored by `.gitignore`.
