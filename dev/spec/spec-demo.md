# Demo Build and Router Spec, Rolldown Root Flow

## Scope

- This spec defines the implementation target for the demo system only.
- It consolidates all final decisions made in dev chat.
- It is the source of truth for the next implementation phase.
- Do not change `dom-native` and `draggable` package-level build systems.

## Goals

- Build and watch demo assets from the project root using rolldown.
- Use local raw TypeScript sources from:
  - `demo/src/**/*`
  - `dom-native/src/**/*`
  - `draggable/src/**/*`
- Produce browser-ready assets for `demo/web-content/index.html`.
- Implement a single-page hash router with top tabs:
  - `dom-native`
  - `draggable`

## Root Build Design

- Add root rolldown config file:
  - `rolldown.config.js`
- Add root npm scripts:
  - `build-demo`
  - `watch-demo`
- Keep build behavior for subprojects unchanged:
  - `dom-native/package.json` scripts untouched
  - `draggable/package.json` scripts untouched
- Add one root TypeScript config for demo bundling flow (demo plus local libraries).

## Output Contract

- Final output files are:
  - `demo/web-content/js/demo-bundle.js`
  - `demo/web-content/css/demo-bundle.css`
- Update HTML references in `demo/web-content/index.html` to:
  - `./js/demo-bundle.js`
  - `./css/demo-bundle.css`

## Watch Contract

- `npm run watch-demo` must rebuild on changes under:
  - `demo/src/**/*`
  - `dom-native/src/**/*`
  - `draggable/src/**/*`
- No watch requirement for `demo/web-content/index.html`.

## Router and Navigation Design

- Demo app entry point:
  - `demo/src/main.ts`
- Navigation model:
  - Single-page app on `demo/web-content/index.html`
  - Hash routing only (portable with static server)
- Canonical routes:
  - `#dom-native/<spec>`
  - `#draggable/<spec>`
- Route fallback behavior:
  - Missing hash, malformed hash, or invalid family routes redirect to dom-native default route.
- Tab behavior:
  - Header shows tabs labeled exactly:
    - `dom-native`
    - `draggable`
  - Clicking a family tab navigates to that family default spec (simplest behavior, no cross-family state preservation).
- Router wiring:
  - Use dom-native hub scheme with `router-hub`.

## Spec Main View Changes

- `spec-main-view` must be adjusted to be route-family aware.
- Existing behavior can be reused where appropriate, but route parsing and navigation state must reflect family-first routes.
- Active tab and active spec link selection must follow current hash route.

## Default Specs

- Dom-native family default spec:
  - first dom-native spec in configured list.
- Draggable family default spec:
  - `base` (as explicitly requested, even if existing filenames suggest `basic`).

## CSS Handling

- CSS output is produced by rolldown build flow directly.
- Do not couple CSS generation to importing CSS from JS entry as the primary contract.
- Include demo CSS only for this iteration.
- The demo CSS source files use `.css` files in this flow:
  - `demo/src/css/main.css`
  - `demo/src/css/demo.css`
  - `demo/src/css/colors.css`

## Non-Goals

- No refactor of subproject package build scripts.
- No migration of published package distribution flows.
- No change to server/runtime assumptions beyond static hosting compatibility.

## Implementation File Impact (planned)

- Root:
  - `package.json` (add scripts and required dev dependency wiring for rolldown flow)
  - `rolldown.config.js` (new)
  - root demo tsconfig file (new, name to be chosen in implementation)
- Demo:
  - `demo/src/main.ts` (new app shell and routing entry)
  - `demo/src/infra/spec-main-view.ts` (route-family awareness)
  - `demo/web-content/index.html` (bundle path updates)

## Acceptance Criteria

- `npm run build-demo` succeeds from repo root and generates:
  - `demo/web-content/js/demo-bundle.js`
  - `demo/web-content/css/demo-bundle.css`
- `npm run watch-demo` rebuilds on edits in all three source trees:
  - `demo/src`
  - `dom-native/src`
  - `draggable/src`
- Opening `demo/web-content/index.html` through any local static server works.
- Default load with no hash redirects to dom-native default route.
- Invalid routes redirect to dom-native default route.
- Tabs render and switch between families correctly.
- Family route format remains canonical and stable:
  - `#dom-native/<spec>`
  - `#draggable/<spec>`

## Notes

- This spec reflects final decisions captured in dev chat as of 2026-03-09.
- If implementation discovers a hard conflict with `draggable` default slug `base`, keep the requested route contract and map internally as needed, then raise follow-up in dev chat.

## Implementation Status (updated 2026-03-09 13:59:27)

- Root demo build flow is implemented and wired from repository root:
  - `rolldown.config.js` exists and is used by root scripts.
  - `package.json` root scripts include:
    - `build-demo`
    - `watch-demo`

- Router and family-first navigation are implemented:
  - `demo/src/main.ts` handles canonical hash normalization and fallback behavior.
  - Canonical route format is active:
    - `#dom-native/<spec>`
    - `#draggable/<spec>`
  - Invalid or missing routes normalize to dom-native default.

- Family-aware main view is implemented:
  - `demo/src/infra/spec-main-view.ts` updates tab selection and spec list by active family.
  - Family tab labels are:
    - `dom-native`
    - `draggable`

- HTML output contract is implemented:
  - `demo/web-content/index.html` references:
    - `./js/demo-bundle.js`
    - `./css/demo-bundle.css`

- CSS import chain for demo bundle is aligned with current file extensions:
  - `demo/src/css/main.css` imports `.css` sources.
  - `demo/src/css/demo.css` imports `./colors.css` (not `.pcss`).

- Acceptance validation status:
  - Plan step for acceptance validation is marked done in plan files.
  - Implementation and routing contracts are aligned with this spec.

## Implementation Status (updated 2026-03-09 17:41:49)

- Demo build config relocation is implemented under `demo/`:
  - `demo/rolldown.config.js`
  - `demo/lightningcss.config.js`
  - `demo/tsconfig.json`

- Root script orchestration is implemented and remains canonical:
  - `package.json` scripts now run:
    - `node scripts/build-demo.mjs`
    - `node scripts/watch-demo.mjs`

- Build contract now always builds both bundles in one command:
  - JS via rolldown config under `demo/`
  - CSS via lightningcss config under `demo/`

- Watch contract now watches and rebuilds both:
  - JS watch via rolldown
  - CSS watch via lightningcss CLI watch mode

- Legacy root demo config files were removed:
  - `rolldown.config.js`
  - `lightningcss.config.js`
  - `tsconfig.demo.json`
