# spec-core-dx - DOM Data eXchange (dx)

## Overview

The `dx` module provides a simple, extensible mechanism to **push** data into and **pull** data from a DOM subtree. It maps JavaScript object properties to DOM elements using a naming convention, enabling declarative two-way data binding between plain objects and form/display elements.

## Core Concepts

### Property Path Resolution

Each dx element must resolve to a **property path** (dot-separated) that maps to a position in the data object. The resolution order is:

1. **CSS class** - A class starting with `dx-`, where `-` after the prefix becomes `.` (dot notation).
   - e.g., `class="dx dx-address-street"` resolves to `address.street`
2. **`data-dx` attribute** - Explicit dot-separated path.
   - e.g., `data-dx="address.city"` resolves to `address.city`
3. **`name` attribute** - Fallback for standard form elements.
   - e.g., `name="firstName"` resolves to `firstName`

If none of these yield a path, the element is skipped during push/pull.

### Default Selector

Both `push` and `pull` use `".dx"` as the default CSS selector to find dx elements within the container. A custom selector can be provided to target a subset of elements.

## API

### `pull(el, selector?): object`

Extracts data from matching elements under `el` into a plain object.

```ts
pull(el: HTMLElement | DocumentFragment, selector?: string): any
```

- `el` - Container element to query within.
- `selector` - CSS selector for dx elements. Defaults to `".dx"`.
- Returns a plain object with property paths as keys.

### `push(el, [selector,] data): void`

Injects data from a plain object into matching elements under `el`.

```ts
push(el: HTMLElement | DocumentFragment, data: any): void
push(el: HTMLElement | DocumentFragment, selector: string, data: any): void
```

- `el` - Container element to query within.
- `selector` - CSS selector for dx elements. Defaults to `".dx"`.
- `data` - Object whose properties are distributed to matching elements.

### `pusher(selector, fn)` / `puller(selector, fn)`

Register custom pusher/puller functions. Custom entries are prepended (higher priority than built-in ones).

```ts
pusher(selector: string, pusherFn: (value: any) => void): void
puller(selector: string, pullerFn: (existingValue: any) => any): void
```

## Built-in Pushers (in order)

Pushers are matched top-to-bottom; first match wins.

| Selector | Behavior |
|---|---|
| `input[type='checkbox'], input[type='radio']` | If value is an array, checks if `this.value` is in it. Otherwise, checks if `this.value` matches value or if value is truthy (for default `"on"` values). |
| `input` | Sets `this.value = value`. |
| `select` | Sets `this.value = value`. |
| `textarea` | Sets `this.value = value`. |
| `*` (catch-all) | Sets `this.innerHTML = value`. |

### Push: Array Distribution for Repeated Elements

When the data value for a property path is an **array** and the target element is **not** a checkbox or radio, the push logic distributes array items by occurrence index. The first element with that property path gets `value[0]`, the second gets `value[1]`, etc.

### Push: Undefined Skipping

If the resolved value for a property path is `undefined`, the element is not touched (no pusher is called). This means properties absent from the data object leave the corresponding elements unchanged.

Note: `null` values are passed through to the pusher. For `input`, this results in `this.value = null`, which browsers coerce to `""`. For `*`, this results in `this.innerHTML = null`, which renders as the string `"null"`.

## Built-in Pullers (in order)

Pullers are matched top-to-bottom; first match wins. The puller function receives the `existingValue` already accumulated for that property path.

| Selector | Behavior |
|---|---|
| `input[type='checkbox'], input[type='radio']` | If checked: returns `this.value` (or `true` if value is `"on"`). For checkboxes, accumulates into an array if `existingValue` is already set. If unchecked: returns `undefined` (property is not set). |
| `input, select` | For radios: returns `this.value`. For single occurrence: returns `this.value`. If `existingValue` exists, accumulates into an array. |
| `textarea` | Returns `this.value`. |
| `*` (catch-all) | Returns `this.innerHTML`. |

### Pull: Undefined Skipping

If a puller returns `undefined`, the value is **not** set on the result object. This is how unchecked checkboxes and unchecked radios are omitted from the pulled data.

### Pull: Value Accumulation for Repeated Names

When multiple elements share the same property path:

- **Checkboxes**: If a checkbox is checked and a value already exists for that path, both values are wrapped into an array.
- **Inputs/selects**: If a value already exists, it is converted to an array and the new value is appended. This handles cases like multiple `<input name="c3">` elements producing `["val-a", "val-b"]`.
- **Radios**: The `input, select` puller detects `this.type === "radio"` and returns `this.value` directly (only the checked radio reaches this point after the checkbox/radio puller handles checked state).

## Puller Dispatch Details

The puller list is iterated in order for each dx element. The **first** selector that matches the element wins, and only that puller function runs (a `break` exits the loop). This means:

- A `<input type="checkbox">` matches `input[type='checkbox']` first, so the generic `input` puller never runs for it.
- A `<input type="text">` or `<input>` (no type) does **not** match the checkbox/radio selector, so it falls through to the `input, select` puller.

## Selector-Scoped Push/Pull

Both `push` and `pull` accept an optional selector to target a subset of dx elements. This enables operating on different sections of a form independently:

```ts
const editData = pull(el, ".edit .dx");
push(el, ".view .dx", viewData);
```

## DocumentFragment Support

Both `push` and `pull` work on `DocumentFragment` as the container, not just `HTMLElement`. This allows data binding on fragments before they are inserted into the DOM.

## Examples

### Basic Pull

```html
<form class="dx-form">
  <input class="dx" name="firstName" value="John" />
  <input class="dx" name="lastName" value="Doe" />
</form>
```

```ts
pull(formEl); // { firstName: "John", lastName: "Doe" }
```

### Nested Property Path

```html
<div class="dx dx-address-street">123 Main St</div>
<div class="dx" data-dx="address.city">Springfield</div>
```

```ts
pull(containerEl); // { address: { street: "123 Main St", city: "Springfield" } }
```

### Checkbox Pull

```html
<input class="dx" name="agree" type="checkbox" checked />
<!-- no value attribute, defaults to "on", pulled as true -->
```

```ts
pull(containerEl); // { agree: true }
```

### Multiple Same-Name Inputs

```html
<input class="dx" name="tags" value="a" />
<input class="dx" name="tags" value="b" />
```

```ts
pull(containerEl); // { tags: ["a", "b"] }
```

### Push with Null/Undefined

```ts
push(el, { a: null, b: undefined });
// Element for "a" gets value set to null (coerced to "" for inputs)
// Element for "b" is not touched (undefined means skip)
```
