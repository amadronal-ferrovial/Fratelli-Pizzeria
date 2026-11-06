# Research: Web de Pizzería Fratelli

**Date**: 2026-11-06

## Decisions

### Static frontend and local menu snapshot

- **Decision**: Use HTML, CSS and browser ES modules with a local JSON snapshot for the restaurant and the selected food menu. Do not fetch Tipsi data at runtime.
- **Rationale**: This follows the constitution's no-build, no-framework and local-JSON requirements, avoids a backend/API dependency, and keeps the customer site available if the source menu is unavailable.
- **Alternatives considered**: Live Tipsi integration was excluded by the constitution and is not required by the spec. A framework or bundler would add setup and runtime complexity without a need in this single-site scope.

### Runtime and package manager

- **Decision**: Node.js 26.13.0 LTS and npm. Node is used for preview and development tests only, not by site visitors.
- **Rationale**: The owner confirmed this version. The official Node release page lists 26.13.0 as LTS on the planning date. The selected Jest and Playwright versions support Node 26.
- **Alternatives considered**: Node 24.22.2 LTS was offered but not selected. The available environment uses Node 25, which is marked EOL by the official release schedule.
- **Reproducibility**: Pin the approved package versions and commit `package-lock.json`. The repository currently ignores `/package-lock.json`; remove that ignore entry as part of implementation setup.

### Local static server

- **Decision**: Add `serve@14.2.6` as a development dependency and expose a single local command. Bind to `tcp://127.0.0.1:3000`, disable clipboard copying and port switching, and serve the repository root.
- **Rationale**: The owner selected a Node static server and approved `serve`. It avoids maintaining custom request/path/MIME handling. Playwright can start it through its `webServer` configuration.
- **Alternatives considered**:
  - Python's built-in `http.server` needs a separate Python runtime on some machines and was not selected.
  - A custom `node:http` server avoids a package but adds code to maintain and test.
- **Boundary**: `serve` is for local preview and automated tests only, not public production hosting. Production deployment remains static-host-provider agnostic and outside this feature's scope.

### Unit and browser tests

- **Decision**: Use `jest@30.5.2` for pure cart/pricing modules and `@playwright/test@1.65.0` for real-browser flows. Limit the default Playwright project to Chromium.
- **Rationale**: The owner confirmed both tools and versions. Browser behavior, layout, keyboard access and the simulated order are verified in a real browser; arithmetic and cart transitions can be unit tested without a DOM.
- **ES module constraint**: Jest 30's native ESM support is documented as experimental and requires transforms disabled and Node's `--experimental-vm-modules` flag. Keep the Jest suite small and import only pure modules; do not add Babel or jsdom.
- **Playwright integration**: Its `webServer` option can start the npm preview command and wait for `http://127.0.0.1:3000`. Restrict Playwright to `tests/e2e` so it does not collect Jest files.
- **Alternatives considered**: Using jsdom for UI tests would add a DOM package and duplicate coverage that Playwright can perform in the browser. Firefox/WebKit projects would download extra browser binaries without a stated cross-browser requirement.

### Images and visual content

- **Decision**: Use local, optimized product or banner images only after usage rights are verified. If rights are unavailable or a product has no image, keep the page complete with original CSS decoration and text.
- **Rationale**: This avoids a runtime dependency on third-party image servers, supports the three-second initial-content goal, and avoids copying material without confirmed permission.
- **Alternatives considered**: Hotlinking images from Tipsi or Tripadvisor was rejected because it adds external availability, privacy and performance dependencies.

## Sources

- [Node.js release schedule](https://nodejs.org/en/about/previous-releases)
- [serve README](https://github.com/vercel/serve), [CLI options](https://github.com/vercel/serve/blob/main/source/utilities/cli.ts), and [server implementation](https://github.com/vercel/serve/blob/main/source/utilities/server.ts)
- [serve 14.2.6 package metadata](https://registry.npmjs.org/serve/14.2.6)
- [Jest 30.5 ESM guide](https://jestjs.io/docs/ecmascript-modules) and [configuration reference](https://jestjs.io/docs/configuration)
- [Jest 30.5.2 package metadata](https://registry.npmjs.org/jest/30.5.2)
- [Playwright test web server](https://playwright.dev/docs/test-webserver), [best practices](https://playwright.dev/docs/best-practices), and [browser installation](https://playwright.dev/docs/browsers)
- [@playwright/test 1.65.0 package metadata](https://registry.npmjs.org/@playwright/test/1.65.0)
- [MDN: JavaScript modules and local serving](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)
- [Tipsi food menu reference](https://order.tipsipro.com/restaurants/95e4d962-dc79-427c-9e9d-6746276a7c9e?menu=72d151fb-b719-6539-aa66-6f5cbb617f88)
- [Tripadvisor restaurant listing](https://www.tripadvisor.es/Restaurant_Review-g187514-d10670751-Reviews-Pizzeria_Fratelli-Madrid.html)
