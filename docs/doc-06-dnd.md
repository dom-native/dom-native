# DOM-Native Standard, Drag and Drop

## Overview

This document covers the integrated `dnd` utilities in `dom-native` for pointer-based dragging, ghost elements, drop targets, movement constraints, and FLIP-style layout transitions.

The core package exports the drag and drop API under the `dnd` namespace:

```ts
import { dnd } from "dom-native";
```

The namespace is `dnd`, matching the public core export. The standalone `@dom-native/draggable` package is no longer needed for new code.

The `dnd` utilities provide:

- delegated draggable behavior with live selectors
- source dragging, ghost dragging, or callback-only dragging
- custom drop events with bubbling
- configurable droppable lookup
- axis and container constraints
- pointer capture for custom drag activation
- FLIP capture support for animated reordering

## Migration from `@dom-native/draggable`

The standalone package is deprecated. Remove it from new applications and use the `dnd` namespace from `dom-native`:

```sh
npm uninstall @dom-native/draggable
npm install dom-native
```

The application code becomes:

```ts
import { dnd } from "dom-native";

dnd.draggable(rootEl, ".drag-me", {
	drag: "ghost",
});
```

## Core API

The primary API signatures are:

```ts
export function draggable(rootEl: HTMLElement, controller?: dnd.DragController): void;

export function draggable(
	rootEl: HTMLElement,
	selector: string,
	controller?: dnd.DragController,
): void;

export function draggable(
	rootEl: Document,
	selector: string,
	controller?: dnd.DragController,
): void;

export function activateDrag(
	source: HTMLElement,
	event: PointerEvent,
	controller?: dnd.DragController,
): void;
```

Use `draggable(...)` for normal setup. Use `activateDrag(...)` when application logic needs to decide whether a pointer interaction should start a drag.

When a selector is provided, the root receives one delegated pointer binding and matching elements are resolved when the pointer event occurs. This keeps the binding live for elements added later.

A `Document` root must always be used with a selector. An `HTMLElement` root can be used with or without a selector.

## Basic usage

### Delegated drag source

```ts
import { dnd } from "dom-native";

export function enableDragging(rootEl: HTMLElement) {
	dnd.draggable(rootEl, ".drag-me", {
		drag: "ghost",
	});
}
```

The `.drag-me` selector is evaluated on pointer down. Newly added matching elements are therefore covered without another `draggable(...)` call.

### Drop targets

```ts
import { dnd, on, OnEvent } from "dom-native";

export function enableDrop(rootEl: HTMLElement) {
	dnd.draggable(rootEl, ".drag-me", {
		drag: "ghost",
		droppable: ".drop-zone",
	});

	on(rootEl, "DROP", ".drop-zone", (evt: OnEvent<dnd.DragEventDetail>) => {
		const clone = evt.detail.source.cloneNode(true);
		evt.selectTarget.append(clone);
	});
}
```

The `source` in the event detail is always the original drag source. When `drag: "ghost"` is used, the default behavior does not automatically move or clone the source into the drop zone. The application decides what should happen in the `DROP` handler.

### Drag the root element

When no selector is provided, the root element itself becomes the drag source:

```ts
import { dnd } from "dom-native";

dnd.draggable(cardEl, {
	drag: "source",
});
```

## Drag modes

The `drag` option controls which element follows the pointer:

- `"source"`, the default, moves the original source element.
- `"ghost"` creates and moves a separate drag element.
- `"none"` does not move an element, but still provides drag callbacks and events.

For a source with static positioning, the source is moved with a transform. For positioned elements, the helper updates `top` and `left`.

### Ghost configuration

The default ghost is a clone of the source with fixed dimensions based on the source at drag initialization. A custom ghost generator can provide a different element:

```ts
import { dnd } from "dom-native";

dnd.draggable(rootEl, ".card", {
	drag: "ghost",
	ghost: {
		create(source) {
			const ghost = source.cloneNode(true) as HTMLElement;
			ghost.classList.add("drag-preview");
			return ghost;
		},
		deleteOnEnd: true,
		followPointer: true,
	},
});
```

The ghost is appended to `document.body` when the drag passes its activation threshold. The default `deleteOnEnd` value is `true`. Set it to `false` when the application owns the ghost lifecycle.

## Drop target selection

The `droppable` option determines which element receives drop-related events:

- `true`, the default, uses the element below the pointer.
- `false` disables droppable lookup and drop events.
- A selector uses the closest matching element from the element below the pointer.
- A function receives the element below the pointer and returns an `HTMLElement` or `null`.

```ts
import { dnd } from "dom-native";

dnd.draggable(rootEl, ".card", {
	drag: "ghost",
	droppable: (overEl) => overEl.closest<HTMLElement>(".drop-zone"),
});
```

The element below the pointer is calculated while excluding the active dragged element when applicable. This allows a source or ghost to pass over nested content while the configured droppable determines the actual target.

## Constraints

Constraints can lock an axis and limit the dragged element to a container:

```ts
import { dnd } from "dom-native";

dnd.draggable(rootEl, ".thumb", {
	constraints: {
		x: true,
		y: false,
		container: ".slider",
		hitbox: "center",
	},
});
```

The available constraint options are:

- `x`
  - `true` allows horizontal movement.
  - `false` locks horizontal movement.
- `y`
  - `true` allows vertical movement.
  - `false` locks vertical movement.
- `container`
  - An `HTMLElement` defines the constraint rectangle directly.
  - A selector resolves the closest matching ancestor of the source.
- `hitbox`
  - `"top-left"` constrains the top-left point.
  - `"center"` constrains the center point.
  - `"box"` constrains the dragged element's sides.

The default movement axes are enabled. If no container is provided, no container clamping is applied.

## Controller callbacks and data

A `DragController` can receive callbacks for the drag lifecycle:

- `onDragStart`
- `onDrag`
- `onDragEnd`
- `onDragEnter`
- `onDragOver`
- `onDragLeave`
- `onDrop`

Each callback receives a custom event whose data is available through `evt.detail`.

The controller `data` value is copied into each event detail. A callback can replace `evt.detail.data` to provide updated state to later callbacks:

```ts
import { dnd } from "dom-native";

dnd.draggable(rootEl, ".card", {
	data: {
		kind: "card",
	},
	onDragStart(evt) {
		evt.detail.data = {
			kind: "card",
			startedAt: performance.now(),
		};
	},
	onDrag(evt) {
		const state = evt.detail.data;
		console.log(state);
	},
});
```

Use controller callbacks for drag-specific behavior. Use dispatched DOM events when application components outside the controller need to react.

## Event lifecycle

The custom event names are uppercase:

- `DRAGSTART` is triggered on the source after the pointer moves beyond the default drag threshold of approximately 5 pixels on either axis.
- `DRAG` reports active pointer movement on the source.
- `DRAGENTER` is triggered when a new droppable is entered.
- `DRAGOVER` reports continued movement over the current droppable.
- `DRAGLEAVE` is triggered when the current droppable changes.
- `DROP` is triggered on the active droppable when the pointer is released.
- `DRAGEND` is triggered on the source after the drag finishes.

The events bubble and are cancelable. `DRAGSTART`, `DRAG`, and `DRAGEND` target the source. `DRAGENTER`, `DRAGOVER`, `DRAGLEAVE`, and `DROP` target the resolved droppable.

`dragover` is `false` by default. Set it to `true` to dispatch `DRAGOVER` DOM events:

```ts
import { dnd } from "dom-native";

dnd.draggable(rootEl, ".card", {
	drag: "ghost",
	droppable: ".drop-zone",
	dragover: true,
});
```

The `onDragOver` controller callback is called when defined, even when `dragover` is disabled for DOM event dispatch.

## Event detail

Drag events use `dnd.DraggableEvent<D>` and expose a `dnd.DragEventDetail<D>` detail object. The useful fields include:

```ts
interface DragEventDetail<D = any> {
	data: D;
	source: HTMLElement;
	sourceOriginRect: DOMRect;
	ghost?: HTMLElement;
	ghostOriginRect?: DOMRect;
	droppable?: HTMLElement;
	over: HTMLElement;
	originX: number;
	originY: number;
	clientX: number;
	clientY: number;
	pointerEvent: PointerEvent;
}
```

The detail also includes the original source transform and, when a ghost is present, the original ghost transform.

- `source` is the element that initiated the drag.
- `ghost` is present only when ghost dragging is enabled.
- `over` is the element below the pointer.
- `droppable` is the resolved drop target for the current event.
- `originX` and `originY` are the initial pointer coordinates.
- `clientX` and `clientY` are the current pointer coordinates.
- `pointerEvent` is the originating pointer event.

## Imperative activation

Use `activateDrag(...)` when a delegated pointer handler needs to apply custom activation rules:

```ts
import { dnd, on } from "dom-native";

export function enablePanelDragging(rootEl: HTMLElement) {
	on(rootEl, "pointerdown", ".panel", (evt) => {
		const source = evt.selectTarget as HTMLElement;

		dnd.activateDrag(source, evt, {
			drag: "ghost",
			pointerCapture: document.body,
		});
	});
}
```

The default pointer capture target is the source. Set `pointerCapture` to another attached `HTMLElement` when the source should not own pointer capture. The target must be connected to the document to receive the captured pointer events.

## FLIP capture

The `dnd` namespace also provides capture support for animated DOM reordering:

```ts
import { all, append, dnd } from "dom-native";

const panels = all(rootEl, ".panel");
const invert = dnd.capture(panels);

append(overPanel, panel, "before");

const play = invert();
await play();
```

Capture the elements before changing their DOM positions. Call the returned inversion function after the change, then await the returned play promise to complete the transition.

## CSS states

The drag helpers apply temporary classes during an active drag:

- `drag-source` is applied to the source.
- `drag-ghost` is applied to a generated or custom ghost.
- `drag-over` is applied to the current droppable.
- `drag-cursor` is applied to `document.body`.

A ghost should generally not intercept pointer hit testing:

```css
.drag-ghost {
	pointer-events: none;
}
```

The helper removes these temporary classes during cleanup.

## Best practices

- Import `dnd` from `dom-native` instead of adding `@dom-native/draggable`.
- Prefer delegated selectors when a root contains dynamic draggable elements.
- Use ghost dragging when the source should remain in its original location until `DROP`.
- Use source dragging when the original element should visibly follow the pointer.
- Use `droppable` selectors to keep drop handling limited to intentional targets.
- Set `dragover: true` only when the application needs repeated DOM `DRAGOVER` events.
- Add container constraints for sliders, boards, and other bounded interfaces.
- Keep controller callbacks focused and use `DROP` handlers for application-level updates.
- Capture layout before DOM reordering when the change should be animated with FLIP.
