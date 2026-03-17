# DOM-Native Standard

## Overview

`dom-native` is a DOM-first, Web Component-oriented utility library for building modern frontends with native browser primitives and TypeScript.
The browser and the DOM are the framework.

This standard follows both the public `dom-native` API and the recurring patterns used in the awesomeapp frontend:

- native custom elements with `BaseHTMLElement`
- top-level `html\`...\`` fragments for static structure
- `document.importNode(HTML, true)` inside `init()`
- query and cache key elements before attach
- `replaceChildren(content)` for explicit subtree ownership
- delegated DOM events with `on(...)` and `@onEvent(...)`
- app and model reactions with `hub(...)` and `@onHub(...)`
- focused refresh methods instead of broad rerender logic

## Recommended reading order

- `doc-01-element.md`, elements, lifecycle, and DOM builders
- `doc-02-event-dom.md`, DOM event binding and decorators
- `doc-03-event-hub.md`, hub pub/sub and decorators
- `doc-04-css.md`, css objects, stylesheet adoption, and inline style helpers
- `doc-05-position.md`, anchored positioning

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

## Notes

- `html(...)` returns a `DocumentFragment`, not an element.
- `BaseHTMLElement.init()` is called once per instance.
- `preDisplay()` is synchronous during `connectedCallback()`.
- `postDisplay()` runs in `requestAnimationFrame(...)`.
- Prefer explicit subtree replacement over broad string rerenders.