# Fratelli Pizzeria Constitution

## Core Principles

### I. Lightweight, No-Build Stack
The site MUST be plain HTML, CSS and JavaScript (ES modules) with no framework and no
mandatory build step. It MUST run on low/mid-range PCs and start with a single command via a
simple local static server. Rationale: operators have little web-design experience and modest
hardware; fewer moving parts means fewer failures.

### II. Simplicity (YAGNI)
Code MUST be simple but effective: write only what the current feature needs. No speculative
abstractions, no unused dependencies, no dead code. Any added dependency or tool MUST be
justified in the plan's complexity section.

### III. Test-First (NON-NEGOTIABLE)
Tests MUST be written and observed failing before implementation. Unit tests use Jest;
end-to-end user flows use Playwright. A feature is not done until its tests pass.

### IV. Content Lives in Mock JSON Data
The app is frontend-only. Products, prices and descriptions MUST live in local JSON files, not
in markup or scripts, so non-technical staff can edit content without touching code. No
backend or external API is allowed without an amendment.

### V. Operator-Friendly & Accessible
Pages MUST be responsive, readable on low-end devices, use semantic HTML and meet basic
accessibility (alt text, contrast, keyboard navigation). Images MUST be optimized for size.
The visual and content reference is the Pizzeria Fratelli (Madrid) public listing.

## Stack & Constraints

- Language/runtime: HTML5, CSS3, vanilla JavaScript (ES modules); Node.js 26.13.0 LTS and npm
  are for tooling only.
- Data: local JSON mock files; no database, no server-side code.
- Local serving: `serve@14.2.6` is development tooling only. Preview MUST bind to
  `tcp://127.0.0.1:3000`, with clipboard copying and port switching disabled; it is not a
  production server.
- Testing: Jest 30.5.2 (unit) + Playwright Test 1.65.0 with Chromium (e2e).
- Any additional stack decision (libraries, CSS frameworks, bundlers, versions) MUST be
  confirmed with the project owner before adoption.
- Version control: Conventional Commits are REQUIRED (e.g. `feat:`, `fix:`, `docs:`).
- AI agent folders and local agent state MUST be git-ignored and never committed.

## Development Workflow & Quality Gates

- Work follows the Spec Kit cycle: specify -> clarify -> plan -> tasks -> implement, each
  feature on its own branch.
- Every PR MUST pass all Jest and Playwright tests and be reviewed against this constitution.
- Lockfiles SHOULD be committed for reproducible installs.

## Governance

This constitution supersedes other practices. Amendments require a documented change, owner
approval, and a version bump following semantic versioning: MAJOR for removed or redefined
principles, MINOR for added principles or materially expanded guidance, PATCH for
clarifications. All PRs and reviews MUST verify compliance; complexity MUST be justified.

**Version**: 1.0.1 | **Ratified**: 2026-11-06 | **Last Amended**: 2026-11-06
