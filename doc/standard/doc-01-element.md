# DOM-Native Standard, Elements

## Overview

This document covers the standard element pattern for `dom-native`:

- The `BaseHTMLElement`
  - its lifecycle methods
  - `@customElement(...)`, the convenient TS decorator
- DOM Builder Helpers
  - `html\`...\``, `elem(...)`, and `frag(...)`

The dominant project style is:

- declare static structure once at module scope
- clone it in `init()`
- query and cache key elements before attach
- `replaceChildren(content)`
- do async and state sync work in `postDisplay()`

In short, this document explains how `dom-native` components are structured, rendered, and composed using native custom elements plus the standard `html`, `elem`, and `frag` builder helpers.

## BaseHTMLElement

`BaseHTMLElement` is the standard base class for application custom elements.

### What it gives you

- one-time `init()` lifecycle
- optional `preDisplay(firstCall)`
- optional `postDisplay(firstCall)`
- support for DOM event maps and decorators
- support for hub event maps and decorators
- automatic namespaced cleanup for root event bindings and hub bindings

### Lifecycle summary

```ts
abstract class BaseHTMLElement extends HTMLElement {
	init(): void;
	preDisplay?(firstCall: boolean): void;
	postDisplay?(firstCall: boolean): void;
	connectedCallback(): void;
	disconnectedCallback(): void;
}
```

- `init()`
  - called once per instance
  - use it for one-time DOM creation and key element capture
- `preDisplay(firstCall)`
  - called synchronously during `connectedCallback()`
  - use it for final sync state-to-DOM updates before paint
- `postDisplay(firstCall)`
  - called in `requestAnimationFrame(...)`
  - use it for async work, delayed refresh, or measurement
- `disconnectedCallback()`
  - if overridden, always call `super.disconnectedCallback()`

## @customElement(...)

Register a native custom element with the browser.

```ts
import { BaseHTMLElement, customElement } from "dom-native";

@customElement("hello-view")
export class HelloView extends BaseHTMLElement {}
```

Use kebab-case names, for example `agent-view` or `profile-card`.

## Standard component pattern

This is the recommended default shape.

```ts
import { BaseHTMLElement, customElement, first, html } from "dom-native";

const HTML = html`
<section class="profile-view">
	<h2 class="title"></h2>
	<div class="content"></div>
</section>
`;

@customElement("profile-view")
export class ProfileView extends BaseHTMLElement {
	#titleEl!: HTMLElement;
	#contentEl!: HTMLElement;

	init() {
		const content = document.importNode(HTML, true);
		this.#titleEl = first(content, ".title")!;
		this.#contentEl = first(content, ".content")!;
		this.replaceChildren(content);
	}

	postDisplay() {
		this.refresh();
	}

	refresh() {
		this.#titleEl.textContent = "Profile";
		this.#contentEl.textContent = "Loaded";
	}
}
```

## The important init() best practice

This is the most important pattern to preserve.

```ts
init() {
	const content = document.importNode(HTML, true);
	this.#mainEl = first(content, "main")!;
	this.replaceChildren(content);
}
```

Why this pattern is preferred:

- `HTML` is a reusable template source
- `document.importNode(HTML, true)` creates a deep clone for this instance
- queries on `content` are fast because the fragment is not attached yet
- you can capture and adjust DOM before first paint
- `replaceChildren(content)` makes ownership explicit and predictable

Recommended `init()` order:

1. clone the module-level fragment
2. query and cache key nodes from the cloned fragment
3. do small one-time setup on the cloned fragment
4. attach with `replaceChildren(content)`

## html`...`

Use `html\`...\`` for static reusable structure declared once at module scope.

```ts
import { html } from "dom-native";

const HTML = html`
<section class="settings-view">
	<header>
		<h2>Settings</h2>
	</header>
	<div class="content"></div>
</section>
`;
```

Important:

- `html(...)` returns a `DocumentFragment`
- treat it as a template source
- clone it with `document.importNode(HTML, true)` before use

### When to use `html\`...\``

Use it for:

- the main static structure of a component
- static markup chunks reused multiple times
- templates where the shape is mostly fixed

Prefer this style:

```ts
const HTML = html`
<section>
	<nav></nav>
	<div class="body"></div>
</section>
`;
```

Not this style for component skeletons:

```ts
this.innerHTML = `
<section>
	<nav></nav>
	<div class="body"></div>
</section>
`;
```

## elem(...)

Use `elem(...)` for dynamic runtime node creation.

```ts
import { elem } from "dom-native";

const buttonEl = elem("button", {
	class: "save",
	$: { textContent: "Save" },
});
```

### Signature

```ts
elem(tagName, data?)
```

### Data behavior

- normal keys become attributes
- boolean `true` becomes an empty attribute
- boolean `false` is omitted
- `$` assigns properties directly

### Common examples

```ts
elem("main-dlg", { class: "agents" });

elem("pre", {
	$: { textContent: JSON.stringify(data, null, 2) },
});

elem("agent-v", {
	$: { _data: { agent_id: 42 } },
});
```

### When to use `elem(...)`

Use it for:

- dynamic child custom elements
- runtime nodes with dynamic attributes or properties
- passing `_data` payloads into child components
- small one-off DOM nodes in refresh methods

A recurring project pattern is custom element composition through `_data`:

```ts
const childEl = elem("agent-v", {
	$: { _data: { agent_id: 42 } },
});
```

## frag(...)

Use `frag(...)` for repeated list rendering.

### Signatures

```ts
frag(): DocumentFragment;
frag<T>(items: T[], acc: (item: T) => Element | DocumentFragment | null): DocumentFragment;
```

### Example

```ts
import { elem, frag } from "dom-native";

const content = frag(items, (item) =>
	elem("li", { $: { textContent: item.label } })
);

listEl.replaceChildren(content);
```

### When to use `frag(...)`

Use it for:

- mapping arrays to children
- building a subtree in one pass
- replacing list content in one operation

If the accumulator returns `null`, that item is skipped.

## Which builder to use

### Use `html\`...\`` when

- structure is static
- template is reused
- this is the component skeleton

### Use `elem(...)` when

- a node is created dynamically at runtime
- attributes or properties depend on current state
- you need to pass `_data` or set `textContent`

### Use `frag(...)` when

- rendering repeated items
- building a list or repeated child set
- replacing a container with many generated nodes

## Focused refresh methods

A recurring project pattern is to keep handlers small and move DOM logic into focused methods.

```ts
@customElement("sample-view")
export class SampleView extends BaseHTMLElement {
	#contentEl!: HTMLElement;

	init() {
		const content = document.importNode(HTML, true);
		this.#contentEl = first(content, ".content")!;
		this.replaceChildren(content);
	}

	postDisplay() {
		this.refresh();
	}

	refresh() {
		this.#contentEl.textContent = "Loaded";
	}
}
```

Benefits:

- event handlers stay short
- route and hub changes can reuse the same method
- DOM updates are easier to trace

## Recommended recipe

A good default recipe is:

- top-level `const HTML = html\`...\`;`
- `@customElement("my-view")`
- class extends `BaseHTMLElement`
- `init()`:
  - `document.importNode(HTML, true)`
  - cache key nodes
  - `replaceChildren(content)`
- `postDisplay()`:
  - load async data if needed
  - call `refresh()`
- `refresh()`:
  - update only the needed subtree
- use `elem(...)` for dynamic children
- use `frag(...)` for repeated children

## Takeaway

The standard `dom-native` element style is:

- static structure once
- clone in `init()`
- manipulate the cloned fragment before attach
- attach with `replaceChildren(...)`
- keep updates explicit and local
- use refresh methods instead of full rerender logic

