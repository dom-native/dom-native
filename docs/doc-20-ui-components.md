# UI Components

## Overview

`@dom-native/ui` provides a small set of form-oriented custom elements built on `dom-native`.

The form elements share two primary base classes:

- `BaseFieldElement` defines the common form field contract.
- `BaseInputElement` extends that contract for text-like and composite input controls.

Checkboxes and radio buttons use `BaseToggleElement`, which also extends `BaseFieldElement`. SVG symbol helpers provide reusable icons for inputs, toggles, and other UI components.

The component hierarchy is:

```text
BaseHTMLElement
	BaseFieldElement
		BaseInputElement
			DInputElement
			DTextareaElement
			DSelectElement
		BaseToggleElement
			DCheckElement
			DRadioElement

BaseHTMLElement
	SymbolElement
		IcoElement
```

## BaseFieldElement

`BaseFieldElement` is the foundation for custom elements that behave like form fields. It establishes a consistent `name` and `value` interface and integrates fields with the `dom-native` push and pull system.

It manages:

- `name`, `readonly`, `disabled`, and `placeholder` properties
- `.d-field` classification for all fields
- `.dx` classification for named fields
- `.d-focus`, `.no-value`, and `.no-label` state classes
- autofocus after initialization
- guarded `CHANGE` and `CANCEL` events
- common push and pull behavior for `.d-field` elements

Every concrete field must implement its value contract:

```ts
abstract get value(): any;
abstract set value(value: any);
```

The getter, setter, user interaction, and emitted event value must use the same representation. For example, text fields return strings, checkboxes return their checked value or an unchecked value, radios return a value only when selected, and selects return the selected option value.

### Field lifecycle

A subclass must call `super.init()` from its own `init()` method. The base initialization applies common classes, focus tracking, label state, autofocus, and the delayed event-ready state.

The event-ready delay prevents initial value synchronization from emitting an application-level change. Subclasses should therefore call:

```ts
this.triggerChange();
this.triggerCancel();
```

instead of emitting those events directly.

A `CHANGE` event contains:

```ts
{
	detail: {
		name,
		value,
	}
}
```

### Push and pull integration

The base field module registers one pusher and puller for every `.d-field`:

```ts
pusher(".d-field", function (this: BaseFieldElement, value: any) {
	this.value = value;
});

puller(".d-field", function (this: BaseFieldElement) {
	return this.value;
});
```

New form controls should inherit from `BaseFieldElement` when they have a meaningful `name` and `value`. This avoids separate data exchange registrations for each element type.

## BaseInputElement

`BaseInputElement` extends `BaseFieldElement` for controls that share input-like structure and behavior. It is the base of:

- `DInputElement`
- `DTextareaElement`
- `DSelectElement`

Its shadow DOM provides stable slots and parts:

```html
<slot name="icon-lead"></slot>
<slot name="icon-trail"></slot>
<slot name="label"></slot>
<slot name="label-trail"></slot>
<slot name="text-trail"></slot>
<div class="box" part="box"></div>
```

The concrete control is created separately and receives the `ctrl` class and `ctrl` part.

Each subclass implements:

```ts
abstract createCtrlEl():
	HTMLElement | HTMLInputElement | HTMLTextAreaElement;

abstract getInitialValue(): string | null;
```

The base constructor and lifecycle handle:

- creation of the concrete control
- construction of the shadow root
- leading and trailing icons
- label, label-trail, and text-trail elements
- initial value application
- `.no-value` synchronization
- focus forwarding
- Escape cancellation
- native change forwarding
- label clicks that focus the control
- synchronization of `readonly`, `disabled`, and `placeholder`

For native input and textarea controls, common native attributes are forwarded to the internal element. This lets the custom element expose a field API while retaining native editing behavior.

### Concrete input responsibilities

`DInputElement` creates an `HTMLInputElement`, supports text and password types, and uses the native input value.

`DTextareaElement` creates an `HTMLTextAreaElement`. Its initial value can come from the first non-empty text node or from the `value` attribute.

`DSelectElement` creates a display control rather than a native value element. It reuses the input layout, labels, placeholder, and icon support while managing its options through a separate popup component.

Each concrete input remains responsible for:

- normalizing its value
- updating its internal control
- synchronizing `.no-value`
- calling `triggerChange()` after an effective value update

## Toggle form elements

`BaseToggleElement` extends `BaseFieldElement` for controls with a checked state. It is the shared base of `DCheckElement` and `DRadioElement`.

It provides:

- a reflective `checked` property
- checked and unchecked value semantics
- label and visual slots
- pointer interaction guards for `disabled` and `readonly`
- visual replacement when `checked` changes
- guarded change event emission

Concrete toggles implement:

```ts
abstract renderVisualEl(): Element;
abstract handleClick(): void;
```

`DCheckElement` toggles its current state. `DRadioElement` coordinates with sibling radios that have the same name and prevents a selected radio from unchecking itself through a repeated click.

Both controls render their state with SVG symbols.

## SVG icon symbols

### Default symbol source

`dom-native-ui/src/svg-icons-symbols-default.ts` exports `SVG_SYMBOLS`, a generated SVG string containing the default icon definitions.

The root `<svg>` contains reusable `<symbol>` elements:

```html
<svg xmlns="http://www.w3.org/2000/svg">
	<symbol id="d-ico-check-on" viewBox="0 0 24 24">
		<path d="..."></path>
	</symbol>
</svg>
```

Each symbol has:

- a document-wide unique ID
- a `viewBox` defining its coordinate system
- reusable path or polygon geometry

The default set includes checkbox, radio, chevron, favorite, star, tick, triangle, and visibility symbols.

Because the file is generated, icon geometry should normally be changed through its source generation process rather than by manually editing the generated TypeScript.

### Loading symbols into the document

Applications load the default symbols once during startup:

```ts
import { loadDefaultIcons } from "@dom-native/ui";

loadDefaultIcons();
```

`loadDefaultIcons()` passes the generated SVG string to `loadSvgSymbols(...)`.

The loader:

- waits for `DOMContentLoaded` when the document is still loading
- parses the SVG string into an element
- applies `display: none` to the SVG root
- appends the root to `document.head`

The SVG does not need to be visually displayed. Its symbols only need to exist in the document so that other SVG elements can reference their IDs.

Applications can load additional symbols with:

```ts
import { loadSvgSymbols } from "@dom-native/ui";

loadSvgSymbols(`
<svg xmlns="http://www.w3.org/2000/svg">
	<symbol id="d-ico-account" viewBox="0 0 24 24">
		<path d="..."></path>
	</symbol>
</svg>
`);
```

Symbol IDs must remain unique across all loaded icon sets.

### Referencing a symbol

`svgSymbolEl(...)` creates a lightweight SVG reference:

```ts
const iconEl = svgSymbolEl("d-ico-check-on", {
	slot: "visual",
});
```

It produces:

```html
<svg class="symbol d-ico-check-on" slot="visual">
	<use xlink:href="#d-ico-check-on"></use>
</svg>
```

The `<use>` element renders the geometry from the symbol stored in the document. This avoids repeating full path data for every icon instance.

The same helper is used by:

- checkbox and radio visuals
- input leading and trailing icons
- the select chevron
- `d-symbol`
- `d-ico`

### Coloring symbols

The symbol geometry is separated from its presentation. Components color each SVG instance through CSS `fill`.

For example, toggle styles can use different theme variables for each state:

```css
d-check > [slot="visual"] {
	fill: var(--d-field-choice-off-fill);
}

d-check[checked] > [slot="visual"] {
	fill: var(--d-field-choice-on-fill);
}
```

Input icons use their own field icon color:

```css
d-input [slot="icon-lead"],
d-input [slot="icon-trail"] {
	fill: var(--d-field-ico);
}
```

This strategy allows one symbol definition to be reused at different sizes, in different controls, and with different colors. State changes require updating an attribute, class, CSS variable, or referenced symbol rather than duplicating or rewriting SVG path data.

## Implementation guidance

When adding a form component:

- inherit from `BaseFieldElement` for a named value-bearing field
- inherit from `BaseInputElement` for a text-like or composite input
- inherit from `BaseToggleElement` for checked-state controls
- call `super.init()`
- define clear and consistent value semantics
- honor `disabled` and `readonly` for user interaction
- synchronize visual state and `.no-value`
- emit changes through `triggerChange()`
- reuse `svgSymbolEl(...)` for symbol-based icons
- load each symbol collection once
- keep symbol IDs stable and globally unique
- color icon instances through CSS rather than embedding control-specific colors in the symbol geometry

These base classes keep field behavior consistent while allowing concrete elements to remain focused on their own control, value, and interaction logic.
