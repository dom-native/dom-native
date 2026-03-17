# DOM-Native Standard

## Overview

`dom-native` is a DOM-first, Web Component-oriented utility library for building modern frontends with native browser primitives and TypeScript.
The browser and the DOM are the framework.

This standard follows both the public `dom-native` API and the recurring patterns used in real `dom-native` applications:

- native custom elements with `BaseHTMLElement`
- top-level `html\`...\`` fragments for static structure
- `document.importNode(HTML, true)` inside `init()`
- query and cache key elements before attach
- `replaceChildren(content)` for explicit subtree ownership
- delegated DOM events with `on(...)` and `@onEvent(...)`
- app and model reactions with `hub(...)` and `@onHub(...)`
- focused refresh methods instead of broad rerender logic

This `README.md` is the entry point and quick overview.
The detailed standards are split into the companion documents listed below.

## Overview

- **Base Element**: `BaseHTMLElement`, which extends the standard `HTMLElement` and provides simple lifecycle hooks based on DOM callbacks and event binding patterns.
  - One-time `init()`
  - Optional synchronous `preDisplay(firstCall)`
  - Optional deferred `postDisplay(firstCall)`
  - Automatic cleanup for namespaced root DOM and hub bindings
- **DOM Event** utilities, with `on(...)` for direct or delegated event binding, plus TS decorators.
  - `on(...)`, `off(...)`, `trigger(...)`
  - `@onEvent(...)`, `@onDoc(...)`, `@onWin(...)`
- **Hub Event** utilities, for lightweight topic and label based pub/sub and component reactions.
  - `hub(name)`, `sub(...)`, `pub(...)`, `unsub(...)`
  - `bindHubEvents(...)`
  - `@onHub(...)`
- **CSS / Style** utilities, for stylesheet objects, shadow DOM stylesheet adoption, and targeted runtime styling.
  - `css(...)`
  - `adoptStyleSheets(...)`
  - `style(...)`, `setClass(...)`
- **Position** utilities, for anchored floating UI placement relative to elements or points.
  - `position(...)`
  - `Pos`
  - `PositionOptions`

## Standard documents

- `doc-01-element.md`, elements, lifecycle, and DOM builders
- `doc-02-event-dom.md`, DOM event binding and decorators
- `doc-03-event-hub.md`, hub pub/sub and decorators
- `doc-04-css.md`, css objects, stylesheet adoption, and inline style helpers
- `doc-05-position.md`, anchored positioning

## Recommended reading order

- Start with `doc-01-element.md`
- Then read `doc-02-event-dom.md`
- Then `doc-03-event-hub.md`
- Use `doc-04-css.md` and `doc-05-position.md` as focused references

## Quick example

```ts
import { BaseHTMLElement, customElement, first, html, onEvent } from "dom-native";

const HTML = html`
<section class="profile-view">
	<h2 class="title"></h2>
	<button class="reload">Reload</button>
</section>
`;

@customElement("profile-view")
export class ProfileView extends BaseHTMLElement {
	#titleEl!: HTMLElement;

	init() {
		const content = document.importNode(HTML, true);
		this.#titleEl = first(content, ".title")!;
		this.replaceChildren(content);
	}

	postDisplay() {
		this.refresh();
	}

	@onEvent("pointerdown", ".reload")
	onReloadClick() {
		this.refresh();
	}

	refresh() {
		this.#titleEl.textContent = "Profile";
	}
}
```

## Core standard

- Keep static DOM structure at module scope with `html\`...\``.
- In `init()`, clone with `document.importNode(HTML, true)`.
- Query and cache key nodes from the cloned fragment before attach.
- Finish setup with `this.replaceChildren(content)`.
- Use `postDisplay()` for async loading and first refresh.
- Keep event and hub handlers thin, call focused refresh methods.
- Use `elem(...)` for dynamic nodes and custom element composition.
- Use `frag(...)` for repeated list rendering.

## How this maps to awesomeapp patterns

The awesomeapp frontend uses a very consistent `dom-native` style:

- define a top-level `const HTML = html\`...\`;`
- clone with `document.importNode(HTML, true)` in `init()`
- cache important nodes with `first(...)`, `getFirst(...)`, or `cherryChild(...)`
- attach once with `replaceChildren(content)`
- use `postDisplay()` for first async refresh
- keep `@onEvent(...)` and `@onHub(...)` handlers thin
- move DOM update logic into focused methods like `refresh()`, `refresh_view()`, `refreshMsgs()`, or `refreshConv()`
- use `elem(...)` with `$: { _data: ... }` for dynamic child custom elements
- use `frag(...)` for repeated rendering
- use `push(...)` and `pull(...)` for form-like DOM data exchange

## Notes

- `html(...)` returns a `DocumentFragment`, not an element.
- `BaseHTMLElement.init()` is called once per instance.
- `preDisplay()` is synchronous during `connectedCallback()`.
- `postDisplay()` runs in `requestAnimationFrame(...)`.
- Prefer explicit subtree replacement over broad string rerenders.

## Next step

For implementation details, continue with the individual standard documents in this folder.
