# DOM-Native Standard, DOM Events

## Overview

This document covers DOM event binding in `dom-native`:

- Primitive event functions:  
  - `on(...)` - bind direct or delegated DOM events with optional namespace and lifecycle-friendly options
  - `off(...)` - remove bound DOM events, usually by type, selector, listener, or namespace
  - `trigger(...)` - dispatch bubbling custom events with a small, convenient API

- TS Decorators
  - `@onEvent(...)` - bind component-local events on the element, or on `shadowRoot` when present
  - `@onDoc(...)` - bind document-level events with automatic component cleanup
  - `@onWin(...)` - bind window-level events with automatic component cleanup

- The important behavior nuances

## on(...) type signatures

Type signatures first, with one comment per signature.

```ts
// Bind a native HTMLElement event type on one or more targets, no selector.
export function on<K extends keyof HTMLElementEventMap>(
	els: EventTargetOrMore | null,
	type: K,
	listener: (this: HTMLElement, ev: { selectTarget: HTMLElement } & HTMLElementEventMap[K]) => void,
	opts?: OnEventOptions,
): void;

// Bind one or more event types on one or more targets, no selector.
export function on(
	els: EventTargetOrMore | null,
	types: string,
	listener: OnEventListener,
	opts?: OnEventOptions,
): void;

// Bind a native HTMLElement event type using delegated matching with a selector.
export function on<K extends keyof HTMLElementEventMap>(
	els: EventTargetOrMore | null,
	type: K,
	selector: string | null,
	listener: (this: HTMLElement, ev: { selectTarget: HTMLElement } & HTMLElementEventMap[K]) => void,
	opts?: OnEventOptions,
): void;

// Bind one or more event types using delegated matching with a selector.
export function on(
	els: EventTargetOrMore | null,
	types: string,
	selector: string | null,
	listener: OnEventListener,
	opts?: OnEventOptions,
): void;
```

## Basic usage

### Direct binding

```ts
import { on } from "dom-native";

on(buttonEl, "click", (evt) => {
	console.log("clicked");
});
```

### Delegated binding

```ts
import { on } from "dom-native";

on(containerEl, "pointerdown", ".item", (evt) => {
	evt.selectTarget.classList.add("active");
});
```

### Multiple event types

```ts
on(inputEl, "focus, blur", (evt) => {
	console.log(evt.type);
});
```

## on(...) options

`OnEventOptions` supports:

```ts
type OnEventOptions = {
	ctx?: object;
	ns?: string;
	capture?: boolean;
	passive?: boolean;
	nextFrame?: boolean;
	silenceDisconnectedCtx?: boolean;
};
```

### Common uses

- `ctx`
  - call the listener with a specific `this`
- `ns`
  - namespace the binding for later cleanup with `off(..., {ns})`
- `capture`
  - pass capture to `addEventListener`
- `passive`
  - pass passive to `addEventListener`
- `nextFrame`
  - delay the actual binding until `requestAnimationFrame(...)`
- `silenceDisconnectedCtx`
  - skip callback execution if `ctx` is an `HTMLElement` that is disconnected

## Delegated event shape

With delegated binding, `dom-native` adds `evt.selectTarget`.

```ts
import type { OnEvent } from "dom-native";

on(listEl, "click", ".row", (evt: OnEvent) => {
	const rowEl = evt.selectTarget;
	rowEl.classList.add("sel");
});
```

This is the preferred way to access the matched delegated target.

## off(...) and trigger(...)

### Common cleanup

```ts
import { off, on } from "dom-native";

on(document, "pointerdown", handler, { ns: "menu" });
off(document, { ns: "menu" });
```

### Trigger a custom event

```ts
import { trigger } from "dom-native";

trigger(panelEl, "SAVE", { detail: { id: 1 } });
```

## Decorators

`dom-native` provides decorators for component methods.

- `@onEvent(...)`
- `@onDoc(...)`
- `@onWin(...)`

These work especially well on `BaseHTMLElement` subclasses.

## @onEvent(...)

Bind an event on the component itself.

```ts
import { BaseHTMLElement, OnEvent, customElement, html, onEvent } from "dom-native";

const HTML = html`
<section>
	<button class="save">Save</button>
</section>
`;

@customElement("editor-view")
export class EditorView extends BaseHTMLElement {
	init() {
		const content = document.importNode(HTML, true);
		this.replaceChildren(content);
	}

	@onEvent("pointerdown", ".save")
	onSaveClick(evt: OnEvent) {
		evt.selectTarget.classList.add("busy");
	}
}
```

This is the preferred default for component-local interactions.

## @onDoc(...)

Bind on `document`.

```ts
import { BaseHTMLElement, customElement, onDoc } from "dom-native";

@customElement("escape-close")
export class EscapeClose extends BaseHTMLElement {
	@onDoc("keydown")
	onDocKeydown(evt: KeyboardEvent) {
		if (evt.key === "Escape") {
			this.remove();
		}
	}
}
```

Use this for document-level interaction like outside click or keyboard shortcuts.

## @onWin(...)

Bind on `window`.

```ts
import { BaseHTMLElement, customElement, onWin } from "dom-native";

@customElement("viewport-info")
export class ViewportInfo extends BaseHTMLElement {
	@onWin("resize")
	onResize() {
		this.refresh();
	}

	refresh() {
		this.textContent = `${window.innerWidth} x ${window.innerHeight}`;
	}
}
```

Use this for resize, viewport, or other window-level reactions.

## Best practice inside components

Prefer this pattern:

```ts
@onEvent("pointerdown", ".reload")
onReloadClick() {
	this.refresh();
}
```

Not this pattern:

```ts
@onEvent("pointerdown", ".reload")
onReloadClick() {
	this.querySelector(".content")!.textContent = "Updated";
}
```

Keep handlers thin, call a focused method.

## Important nuances

### `@onEvent(...)` binds on shadowRoot when present

If the element has a `shadowRoot`, `@onEvent(...)` binds there instead of the host element.

This is convenient for shadow DOM components, but if doing manual binding with `on(...)`, bind on `this.shadowRoot` yourself.

### Parent bindings are deferred

`@onDoc(...)` and `@onWin(...)` are bound in the next frame.

This helps avoid mixing the triggering connect event with the newly bound listener.

### Parent handlers are silenced if disconnected

Document and window decorator handlers are configured so they do nothing if the component context has already been disconnected.

### Inheritance uses method-name override semantics

If a child class and parent class decorate methods with the same method name, the child method wins and the parent binding is skipped.

### Namespace cleanup matters

When binding manually on `document` or `window`, prefer a namespace and component lifecycle cleanup.

If you manually bind root events in a component, `BaseHTMLElement.forceCleanRootEvents()` can be useful.

## Recommended default

For component code, prefer:

- `@onEvent(...)` for local interactions
- `@onDoc(...)` for document-wide interactions
- `@onWin(...)` for window-wide interactions
- `on(...)` directly for non-component code or special dynamic binding needs
- thin handlers that call `refresh()` or a focused action method

