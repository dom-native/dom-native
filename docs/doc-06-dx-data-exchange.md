# DOM Data Exchange

The `dx` module exchanges data between plain JavaScript objects and elements in an `HTMLElement` or `DocumentFragment`. It supports pushing object values into the DOM and pulling DOM values back into an object.

## Property paths

Each participating element has a property path resolved in this order:

1. A class beginning with `dx-`. Hyphens after the prefix become dots, so `dx-address-city` maps to `address.city`.
2. The `data-dx` attribute, such as `data-dx="address.city"`.
3. The `name` attribute, such as `name="firstName"`.

Elements without a property path are skipped.

By default, `push` and `pull` find elements matching `.dx`. A custom selector can target another set of elements.

## Simple example

```html
<form class="profile-form">
	<input class="dx" name="firstName" value="Ada">
	<input class="dx" data-dx="address.city" value="London">
	<input class="dx" name="subscribed" type="checkbox" checked>
</form>
```

```ts
import { first, pull, push } from "dom-native";

const form = first(".profile-form")!;

const profile = pull(form);
// {
//   firstName: "Ada",
//   address: { city: "London" },
//   subscribed: true
// }

push(form, {
	firstName: "Grace",
	address: { city: "New York" },
	subscribed: false,
});
```

## Pulling data

`pull` reads matching elements and builds a plain object:

```ts
const data = pull(container);
const visibleData = pull(container, ".visible .dx");
```

Built-in behavior includes:

- Inputs, selects, and textareas return their current value.
- Other elements return their `innerHTML`.
- A checked checkbox or radio returns its value.
- A checked checkbox without an explicit value returns `true`.
- Unchecked checkboxes and radios are omitted.
- Repeated inputs with the same property path accumulate into an array.
- Nested paths create nested objects.

## Pushing data

`push` resolves each element's property path and applies the corresponding object value:

```ts
push(container, data);
push(container, ".editable .dx", data);
```

Built-in behavior includes:

- Inputs, selects, and textareas receive their `value`.
- Other elements receive their `innerHTML`.
- Checkboxes and radios are checked when their value matches the supplied value.
- An array checks every checkbox whose value appears in that array.
- Arrays for repeated non-checkbox and non-radio elements are distributed by occurrence.
- An `undefined` value leaves an element unchanged.
- A `null` value is passed to the element pusher.

`push` only sets matching values. It does not automatically clear elements whose properties are absent from the data.

## Custom handlers

Custom element types can register pushers and pullers:

```ts
import { puller, pusher } from "dom-native";

pusher("output[data-number]", function (value) {
	this.textContent = String(value);
});

puller("output[data-number]", function () {
	return Number(this.textContent);
});
```

Custom handlers have priority over built-in handlers. For each element, only the first matching handler runs.

## API summary

```ts
pull(el: HTMLElement | DocumentFragment, selector?: string): any

push(el: HTMLElement | DocumentFragment, data: any): void
push(el: HTMLElement | DocumentFragment, selector: string, data: any): void

pusher(selector: string, pusherFn: (value: any) => void): void
puller(selector: string, pullerFn: (existingValue: any) => any): void
```
