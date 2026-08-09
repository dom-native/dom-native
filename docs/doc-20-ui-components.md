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

## Two integration approaches

Use one of the following approaches depending on whether the application should consume the packaged UI or own the UI source.

### 1. Quick: use `@dom-native/ui` as a library

When `@dom-native/ui` is installed as a library dependency, import the package stylesheet from the application's CSS entry point and import the UI exports from the application module:

```sh
npm install @dom-native/ui dom-native
```

```css
@import "../node_modules/@dom-native/ui/css/main.css";
```

```ts
import { loadDefaultIcons } from "@dom-native/ui";

loadDefaultIcons();
```

`@dom-native/ui/css/main.css` is the package stylesheet entry point. It imports the component styles, theme variables, elevation variables, and icon styles. A CSS-aware build system follows these imports and emits the complete UI stylesheet in the application's generated CSS bundle.

Add the stylesheet import once to the application's CSS entry point. This lets the build system process the package CSS and avoids manually copying or linking the files from `node_modules`.

### 2. Production: copy and own the UI code

For production applications that need to control, audit, or modify the UI implementation, copy the UI source from the `dom-native-ui` repository into the application instead of importing it from `node_modules`.

Copy the contents of `dom-native-ui/src/` into `src/dui/` and the contents of `dom-native-ui/css/` into `css/dui/`, preserving the files' internal structure. For example:

```text
src/
  dui/
css/
  dui/
```

Import the copied stylesheet from the application's CSS entry point:

```css
@import "./dui/main.css";
```

Import the copied TypeScript entry point from the application module:

```ts
import { loadDefaultIcons } from "./dui/index.js";

loadDefaultIcons();
```

Keep `dom-native` available as an application dependency, preserve the copied UI source's internal imports, and include the stylesheets imported by the local `main.css`. The application now owns this UI code and must bring upstream changes over manually. Do not import the package stylesheet in this mode, because the local copy is the source of truth.

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

## Component usage

The demo UI under `demo/src/demo-ui/` exercises the same elements described here. The examples below use the public markup and attributes shown by those demos.

### Common setup

Importing the UI entry point registers the custom elements. Load the default SVG symbol set once during application startup:

```ts
import { loadDefaultIcons } from "@dom-native/ui";

loadDefaultIcons();
```

When the source is copied using option 2, import `loadDefaultIcons` from `./dui/index.js` instead.

### d-ico and d-symbol

Use `d-ico` for an icon element and `d-symbol` for a general-purpose SVG symbol reference:

```html
<d-ico name="d-ico-star"></d-ico>

<d-symbol name="d-ico-star"
  style="max-width:5rem;max-height:5rem;fill:blue">
</d-symbol>
```

The `name` is the complete document-wide SVG symbol ID. The default symbol collection includes names such as `d-ico-star`, `d-ico-visible`, `d-ico-check-on`, and `d-ico-radio-on`. Both elements add the symbol name as a CSS class and render an SVG `<use>` reference.

### d-input

`d-input` provides a text input with optional labels, icons, placeholder text, and trailing content:

```html
<d-input label="Label" value="Value"></d-input>
<d-input label="Label"></d-input>
<d-input label="Label" placeholder="Placeholder"></d-input>

<d-input
  icon-lead="d-ico-star"
  label-trail="Trail Label"
  label="Label"
  value="Value">
</d-input>

<d-input
  icon-trail="d-ico-visible"
  label="Label"
  value="Value">
</d-input>

<d-input label="Label" value="Value" disabled></d-input>
<d-input label="label" text-trail="CM"></d-input>
<d-input label="Password" password></d-input>
```

The `icon-lead` and `icon-trail` attributes contain complete SVG symbol IDs. A missing label is supported, and `disabled` and `readonly` are forwarded to the internal native input element.

### d-textarea

`d-textarea` uses the same field layout as `d-input` while creating a native `<textarea>` control:

```html
<d-textarea label="Label">Value...</d-textarea>

<d-textarea
  icon-lead="d-ico-star"
  label="Label"
  value="Value from attr">
Some
multi line
another one.
</d-textarea>

<d-textarea
  icon-trail="d-ico-visible"
  label="Label"
  value="Value from attr">
</d-textarea>

<d-textarea label="Label" placeholder="Placeholder"></d-textarea>
<d-textarea label="Label" value="Value" disabled></d-textarea>
```

The initial value is taken from the first non-empty text node. When there is no non-empty text node, the component uses the `value` attribute. The component also supports fields without labels and leading or trailing icons.

### d-select

`d-select` displays options in a popup and uses `<option>` children as its initial option source:

```html
<d-select label="Label" value="one">
  <option>None</option>
  <option value="one">value one</option>
  <option value="G">value G</option>
</d-select>

<d-select
  label="Label"
  placeholder="Placeholder">
  <option>None</option>
  <option value="one">value one</option>
</d-select>

<d-select
  icon-lead="d-ico-star"
  label="Label"
  value="one">
  <option>None</option>
  <option value="one">value one</option>
</d-select>

<d-select
  class="load-example"
  label="Label"
  value="one">
  Some stuff
</d-select>
```

An option without a `value` has a null value. The component supports disabled, readonly, placeholder, and no-label states. The current source marks `d-select` as under refactoring, so its API should be treated as provisional.

The demo's leading-icon example currently spells the attribute `ico-lead`. The component implementation reads `icon-lead`, which is the spelling that should be used in application markup.

A select can request options from an owning view through `D-DATA`. The event handler receives a sender function and calls it with `SelectOption[]`:

```ts
import { SelectDataSender, SelectOption } from "@dom-native/ui";
import { OnEvent, customElement, onEvent } from "dom-native";

const OPTIONS_LOADED: SelectOption[] = [
  { value: "one", content: "One" },
  { value: "two", content: "Two" },
];

@customElement("select-demo")
class SelectDemo extends HTMLElement {
  @onEvent("D-DATA")
  onSelectData(evt: OnEvent<SelectDataSender>) {
    evt.detail(OPTIONS_LOADED);
  }
}
```

This follows the data-loading pattern used by the demo select specification.

### d-check

`d-check` is a checkbox-like toggle. It can represent a boolean or a checked value:

```html
<d-check name="nameA" label="Label" checked></d-check>

<d-check
  name="mood"
  label="Label"
  value="happy"
  checked>
</d-check>

<d-check
  name="nameA"
  label="Label A"
  checked>
</d-check>
<d-check
  name="nameB"
  value="value-b"
  label="Label B">
</d-check>
<d-check
  name="nameC"
  value="value-c"
  label="Label C"
  checked>
</d-check>

<d-check checked></d-check>
<d-check label="Label" checked disabled></d-check>
<d-check label="Label" checked readonly></d-check>
```

When checked, `value` returns the `value` attribute when present, or `true` when it is absent. When unchecked, it returns `false` by default. An `unchecked-value` attribute can provide an alternate unchecked value, and `dx="pull_skip_unchecked"` makes the unchecked value `undefined`.

Pointer interaction does not change the checked state when the element is disabled or readonly. Programmatic changes through the `checked` property remain available.

### d-radio

`d-radio` coordinates radio elements that share a `name` in the same container:

```html
<d-radio
  name="nameA"
  label="Val 1"
  value="val-1">
</d-radio>

<d-radio
  name="nameA"
  label="Val 2"
  value="val-2"
  checked>
</d-radio>

<d-radio
  name="mood"
  label="Label"
  value="happy">
</d-radio>

<d-radio
  name="nameA"
  label="Val 1"
  checked
  disabled>
</d-radio>

<d-radio
  name="nameA"
  label="Val 2"
  readonly>
</d-radio>
```

Selecting one radio unchecks another checked radio with the same name. A checked radio returns its configured value, while an unchecked radio returns `undefined`. Clicking an already checked radio does not uncheck it.

