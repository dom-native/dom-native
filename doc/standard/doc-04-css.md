# DOM-Native Standard, CSS

## Overview

This document covers the `dom-native` CSS helpers:

- `css(...)`
- `CSSObject`
- `adoptStyleSheets(...)`
- `style(...)`
- `setClass(...)` and `className(...)`

These helpers are intentionally small.
They help with shadow DOM stylesheets, reusable CSS text, and targeted style or class updates.

## Core API

Type signatures first, with one comment per signature.

```ts
// Create a CSSObject from a plain string.
export function css(str: string): CSSObject;

// Create a CSSObject from a tagged template.
export function css(strings: TemplateStringsArray, ...values: any[]): CSSObject;

// Adopt one or more CSSObjects onto a shadow root or shadow host.
export function adoptStyleSheets(
	el: HTMLElement | ShadowRoot,
	cssObject: CSSObject | CSSObject[],
): HTMLElement | ShadowRoot;

// Apply an inline style object to one element or many elements.
export function style<T extends HTMLElement | HTMLElement[] | null | undefined>(
	el: T,
	style: Partial<CSSStyleDeclaration>,
): T;

// Add or remove CSS class names based on object values.
export function setClass<E extends Element | Element[] | HTMLCollection | null | undefined>(
	els: E,
	keyValues: { [name: string]: boolean | object | null | undefined },
): E;

// Deprecated alias for setClass.
export function className<E extends Element | Element[] | HTMLCollection | null | undefined>(
	els: E,
	keyValues: { [name: string]: boolean | object | null | undefined },
): E;
```

## css(...)

`css(...)` creates an immutable `CSSObject`.

### Tagged template form

```ts
import { css } from "dom-native";

const STYLES = css`
:host {
	display: block;
}

.title {
	font-weight: bold;
}
`;
```

### String form

```ts
const STYLES = css(`
:host {
	display: block;
}
`);
```

### What CSSObject provides

A `CSSObject` gives access to:

- `.text`
- `.newStyle`
- `.sheet`

The main usage is stylesheet adoption in shadow DOM components.

## adoptStyleSheets(...)

Use `adoptStyleSheets(...)` with a shadow host or the shadow root itself.

```ts
import { BaseHTMLElement, adoptStyleSheets, css } from "dom-native";

const STYLES = css`
:host {
	display: block;
}
`;

export class CardView extends BaseHTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: "open" });
		adoptStyleSheets(this, STYLES);
	}
}
```

Behavior:

- if constructable stylesheets are supported, it uses `adoptedStyleSheets`
- otherwise, it falls back to appending `<style>` elements

## Best practice for shadow DOM CSS

Recommended pattern:

```ts
import { BaseHTMLElement, adoptStyleSheets, css, html } from "dom-native";

const STYLES = css`
:host {
	display: block;
}

.content {
	padding: 8px;
}
`;

const HTML = html`
<section class="content"></section>
`;

export class PanelView extends BaseHTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: "open" });
		adoptStyleSheets(this, STYLES);
	}

	init() {
		const content = document.importNode(HTML, true);
		this.shadowRoot!.replaceChildren(content);
	}
}
```

Use `css(...)` and `adoptStyleSheets(...)` for shadow DOM component-local styles.

## style(...)

Use `style(...)` for targeted inline style updates.

```ts
import { style } from "dom-native";

style(panelEl, {
	left: "10px",
	top: "20px",
	display: "block",
});
```

Also works with arrays:

```ts
style([el1, el2], {
	opacity: "0.5",
});
```

### When to use `style(...)`

Use it for:

- small imperative visual updates
- animation helpers
- positioning or runtime geometry changes
- temporary style changes

Do not use it as a replacement for normal stylesheet-based component styling.

## setClass(...)

Use `setClass(...)` to add or remove classes declaratively.

```ts
import { setClass } from "dom-native";

setClass(cardEl, {
	sel: true,
	disabled: false,
	loading: someObject,
});
```

Behavior:

- `false` or `null` removes the class
- `true` or any defined object adds the class
- `undefined` does nothing

This is useful for state-driven class toggling.

## className(...)

`className(...)` is a deprecated alias of `setClass(...)`.

Prefer `setClass(...)` in new code.

## Best practices

### Prefer stylesheet CSS for stable component styling

Use:

- `css(...)` and `adoptStyleSheets(...)` for shadow DOM styles
- normal CSS files for app-level and light DOM styling

### Prefer `style(...)` only for runtime adjustments

Good uses:

- `top`, `left`, `transform`
- temporary visibility
- measured layout updates

### Keep CSS ownership close to the component

If using shadow DOM, define a module-level `STYLES` constant next to the component.

### Avoid broad inline-style rendering patterns

Prefer:

```ts
style(menuEl, { left: `${x}px`, top: `${y}px` });
```

Not:

```ts
menuEl.setAttribute("style", `left:${x}px;top:${y}px`);
```

## Important nuances

### CSSObject is immutable, sheet is shared

The `CSSObject` text is immutable, but the returned stylesheet object is shared.
If you mutate the sheet, that affects all nodes adopting it.

### `adoptStyleSheets(...)` requires a shadow root

Passing a host without a shadow root throws an error.

### `style(...)` is passthrough

`style(...)` returns the same element or element collection it receives, which can be convenient in chains.

## Recommended default

- use `css(...)` and `adoptStyleSheets(...)` for shadow DOM component styles
- use `style(...)` for small runtime adjustments
- use `setClass(...)` for state-driven class toggling
- keep stable styling in stylesheets, not inline styles

