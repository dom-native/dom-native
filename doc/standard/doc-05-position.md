# DOM-Native Standard, Position

## Overview

This document covers `position(...)`, the `dom-native` helper for placing absolutely positioned elements relative to another element or a point.

Use it for:

- popups
- menus
- tooltips
- anchored dialogs
- context UI near pointer position

## Core API

Type signatures first, with one comment per signature.

```ts
// Position an element relative to a reference element.
export function position(el: HTMLElement, refEl: HTMLElement, opts?: PositionOptions): void;

// Position an element relative to an explicit point.
export function position(el: HTMLElement, point: { x: number; y: number }, opts?: PositionOptions): void;

// Position keywords for vertical and horizontal anchor combinations.
export type Pos = "TL" | "TC" | "TR" | "CL" | "CC" | "CR" | "BL" | "BC" | "BR";

// Position options for anchor, gap, axis control, and constraints.
export interface PositionOptions {
	pos?: Pos;
	gap?: number;
	vGap?: number;
	hGap?: number;
	x?: boolean | number;
	y?: boolean | number;
	constrain?: Window | HTMLElement | null;
	refPos?: Pos;
}
```

## Basic usage

### Relative to another element

```ts
import { position } from "dom-native";

position(menuEl, buttonEl, {
	refPos: "BL",
	pos: "TL",
	gap: 8,
});
```

Meaning:

- use the button bottom-left as the reference point
- place the menu top-left from that point
- add an 8px gap

### Relative to a point

```ts
position(menuEl, { x: evt.clientX, y: evt.clientY }, {
	pos: "TL",
	gap: 6,
});
```

Useful for context menus.

## Position model

`Pos` is two letters:

- first letter is vertical
  - `T`, top
  - `C`, center
  - `B`, bottom
- second letter is horizontal
  - `L`, left
  - `C`, center
  - `R`, right

Examples:

- `TL`, top-left
- `CC`, center-center
- `BR`, bottom-right

## Default behavior

Default options are effectively:

```ts
{
	pos: "TL",
	refPos: "BR",
	gap: 0,
	x: true,
	y: true
}
```

That means:

- anchor the element by its top-left
- use the reference bottom-right point
- position on both axes
- no gap unless provided

## Options

### `pos`

The element anchor point.

```ts
position(popupEl, buttonEl, { pos: "TL" });
```

### `refPos`

The reference anchor point.

```ts
position(popupEl, buttonEl, { refPos: "BR" });
```

### `gap`, `vGap`, `hGap`

- `gap`
  - common gap value
- `vGap`
  - vertical gap, overrides `gap`
- `hGap`
  - horizontal gap, overrides `gap`

Note that common `gap` is not applied on centered axes.

### `x` and `y`

Axis behavior:

- `true`
  - compute the axis
- `false`
  - leave the axis unchanged
- number
  - force that axis to a fixed value

Example:

```ts
position(menuEl, buttonEl, {
	x: true,
	y: 120,
});
```

### `constrain`

Constraint area.

- omitted or `window`
  - constrain within the viewport
- `HTMLElement`
  - constrain within that element
- `null`
  - no constraining

Example:

```ts
position(menuEl, buttonEl, {
	refPos: "BL",
	pos: "TL",
	gap: 8,
	constrain: window,
});
```

## Common examples

### Dropdown menu

```ts
position(menuEl, triggerEl, {
	refPos: "BL",
	pos: "TL",
	gap: 4,
});
```

### Tooltip to the right

```ts
position(tooltipEl, iconEl, {
	refPos: "CR",
	pos: "CL",
	hGap: 8,
});
```

### Context menu at pointer

```ts
position(menuEl, { x: clientX, y: clientY }, {
	pos: "TL",
	constrain: window,
});
```

## Best practices

### Use with absolutely positioned elements

`position(...)` is designed for elements that use `position: absolute;`.

### Append before measuring if needed

Because placement depends on element size, make sure the element is in the DOM and measurable before calling `position(...)`.

A common flow is:

```ts
document.body.append(menuEl);
position(menuEl, buttonEl, {
	refPos: "BL",
	pos: "TL",
	gap: 8,
});
```

### Prefer explicit anchors

For menus and popups, explicitly set both `refPos` and `pos`.

This makes intent easy to read later.

### Use constraint unless you intentionally want overflow

For floating UI, constraining to `window` is usually the safest default.

## Important nuances

### Centered axes do not use generic gap

If the relevant axis is centered, generic `gap` is ignored for that axis.
Use `vGap` or `hGap` if you need exact control.

### offsetParent is accounted for

Final `top` and `left` are adjusted relative to the element's `offsetParent`.
This makes the helper work correctly in normal positioned containers.

### Constraint is clamping, not flipping

If the element would overflow the constraint area, the helper clamps it inside.
It does not automatically choose a different anchor side.

## Recommended default

For anchored popup UI, prefer this default pattern:

```ts
position(popupEl, triggerEl, {
	refPos: "BL",
	pos: "TL",
	gap: 8,
	constrain: window,
});
```

This is simple, readable, and usually correct for menus and dropdowns.

