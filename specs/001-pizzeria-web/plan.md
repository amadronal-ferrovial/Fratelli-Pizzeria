# Implementation Plan: Web de Pizzería Fratelli

**Branch**: `dev` (feature: `001-pizzeria-web`) | **Date**: 2026-11-06 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification for a Spanish, customer-facing restaurant site with a food catalog, contact details, and a simulated order flow.

## Summary

Create a polished, responsive static website for Pizzería Fratelli. It presents the verified food menu, restaurant contact information and optional licensed imagery, and supports a temporary cart with format selection and a clearly simulated confirmation. Use plain HTML, CSS and JavaScript modules; keep catalog data in a local JSON file and use Node only for development and tests. No real orders, payments, customer data, backend or live Tipsi integration are in scope.

## Technical Context

**Language/Version**: HTML5, CSS3 and browser JavaScript ES modules; Node.js 26.13.0 LTS for tooling only.

**Primary Dependencies**: Development tools only: `serve@14.2.6`, `jest@30.5.2`, `@playwright/test@1.65.0`. No application framework or runtime package.

**Storage**: Restaurant and food-menu snapshot in `data/menu.json`; cart kept in memory; no persisted orders or customer data.

**Testing**: Jest 30.5.2 for pure cart/pricing logic; Playwright Test 1.65.0 with Chromium for browser flows. Jest's native ESM mode requires `--experimental-vm-modules`.

**Target Platform**: Current desktop and mobile browsers; local preview bound to `127.0.0.1:3000`. The static output remains host-provider agnostic.

**Project Type**: Single static web frontend; no API or server-side application.

**Performance Goals**: Main page content is available for use in under 3 seconds on a representative mid/low-range PC.

**Constraints**: No build step, framework, backend, live menu API, payments, personal-data collection, drink menu or staff administration screen. Use local, optimized image assets only after usage rights are confirmed.

**Scale/Scope**: One restaurant, one food menu with five current categories, product formats/prices, one temporary cart and one contact/location section.

## Constitution Check

*GATE: Must pass before Phase 0 research and be re-checked after Phase 1 design.*

| Constitution rule | Plan alignment | Gate |
|---|---|---|
| Lightweight, no-build stack | Plain HTML/CSS/ES modules; `serve` is local development tooling only. | PASS |
| Simplicity (YAGNI) | One frontend, no framework/backend/admin screen; only the approved development tools are added. | PASS |
| Test-first | Jest unit tests and Playwright user-flow tests are planned before implementation. | PASS |
| Content in local JSON | The verified menu snapshot and restaurant details live in a local JSON data file; no runtime API. | PASS |
| Operator-friendly and accessible | Responsive semantic UI, keyboard access, readable contrast and optimized images are required. | PASS |
| Stack and reproducibility constraints | Owner confirmed Node 26.13.0, npm, `serve`, Jest and Playwright versions. The ignored npm lockfile rule must be removed so `package-lock.json` can be committed. Existing untracked `.github/` and `.specify/` tooling remains outside this feature; apply the constitution's agent-state ignore rules before committing it. | PASS |

## Project Structure

### Documentation (this feature)

```text
specs/001-pizzeria-web/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── ui.md
└── tasks.md             # Created later by /speckit-tasks
```

### Source Code (repository root)

```text
index.html
styles/
└── site.css
scripts/
├── app.js
└── cart.js
data/
└── menu.json
assets/
└── images/                # Only approved, optimized local images
tests/
├── unit/
│   └── cart.test.js
└── e2e/
    └── menu.spec.js
jest.config.mjs
playwright.config.mjs
package.json
package-lock.json
```

**Structure Decision**: One static frontend at the repository root. `app.js` loads the JSON catalog and handles page interactions; `cart.js` contains DOM-free cart and price rules so Jest can test them directly. The root `.gitignore` must stop ignoring `package-lock.json`; `yarn.lock` remains ignored because npm is the selected package manager.

## Complexity Tracking

The architecture introduces no constitutional violations. Per Constitution Principle II,
these approved development tools are justified explicitly; none is an application runtime
dependency.

| Tool/dependency | Why needed | Simpler alternative rejected because |
|---|---|---|
| Node.js 26.13.0 LTS and npm | Run the local preview, npm scripts and the approved test tools reproducibly. | Browser-only execution cannot run the required Jest and Playwright checks or the selected local server. |
| `serve@14.2.6` | Provide a single-command static preview on loopback and a server for Playwright. | Python's server adds a second runtime; a custom Node server adds code to maintain and test. |
| `jest@30.5.2` | Test DOM-free cart and pricing logic as required by the constitution. | Manual-only checks are not repeatable; adding a DOM simulator or transpiler is unnecessary for pure modules. |
| `@playwright/test@1.65.0` with Chromium | Exercise customer journeys and accessibility in a real browser as required by the constitution. | A DOM simulator does not validate real-browser behavior; extra browser engines add downloads without a stated requirement. |

### Post-design Constitution Check

The design still passes all gates: it introduces no app runtime dependency, backend, framework, external API or persisted order data. `serve` is restricted to local preview and Playwright startup; the public deliverable is static files. ESM unit tests use Jest's documented experimental VM-module mode rather than adding a transpiler or DOM simulator. Approved product imagery is stored locally and optimized; otherwise the design remains complete without product photos.
