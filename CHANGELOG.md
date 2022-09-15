# CHANGELOG

> Legend: `.` minor; `+` addition; `^` enhancement; `*` refactor; `-` fix; `!` change; 

### v0.11.1 - Sep 13, 2022

- `!` scanChild - rename and collapse getChild and getChrildren to scanChild
- `^!` position - make window the default constrain. Allow null value to have no constrain.
- `+` event - added nextFrame to both on(...) and @on... bindings

### v0.11.0 - Sep 11, 2022

- `+` position - add position(el, refElOrPoint, Options) to position an absolute element based on a ref
- `!` Attr - remove the deprecated attr(..) function implementation and signatures
- `!` elem - remove unused variadic tagNames signature and implementation

### v0.10.5 - Sep 10, 2022

- `!` frag - new `frag` function as `frag(items, item => Element): DocumentFragment`
- `+` getFirst - strict version of first(..) api (throw error on no match)
- `^` first - added variadic selectors (e.g., first(el, "div", "my-comp") )
```ts
const [divEl, myComp] = first(el, "div", "my-comp");
// [HTMLDivElement | null, MyComp | null] (MyComp if the global type has been updated for this tag name)
```
- `!` first - remove custom implementation when firstElementChild is not supported (should not be the case anymore)

### v0.10.4 - Sep 3, 2022

- `^` elem - add number type as attribute value
```ts
elem("div", {data-some-id: 3})
```
- `^` elem - add support for `$` `{$: {propName:propValue}` (will set the property of the newly create element)
```ts
elem("div", {
	title: "title tag attribute",          // <-- element attributes
	"data-some": "Some custom attribute",  // <-- element attributes
	$: {                                   // <-- element properties
		info: someData, 
		textContent: "some content"}
	});
```
- `^` onEvents - allow to have multiple @on... decorators on same method
- `+` events - added options?: {capture?, passive?) for @onEvent, @docEvent, @winEvent

### v0.10.3 - Jun 27, 2022

- `+` getAttr - get attribute(s) for an single el (replaces the attr as getters)
- `+` setAttr - set attribute(s) for a single el (replaces the attr as setters)

### v0.10.2 - Jun 21, 2022

- `!` minor change - `preDisplay` and `postDisplay` will be called on re-attached, first params is `firstCall: boolean`.

### v0.10.1 - Feb 6, 2022

- `+` `getChildren` and `getChild` to get direct child by tag names

### v0.10.0 - Dec 5, 2021

- `!` es module only! - Now package.json have `"type": "module"`

### v0.9.19 - Dec 06, 2020

- `^` elem - enhanced the elem(...tagNames) to return the typed tuple based on the HTMLElementTagNameMap

### v0.9.18 - Nov 30, 2020

- `.` anim - fixed type and added raftime on callback

### v0.9.17 - Nov 15, 2020

- `+` anim - added simple anim(callback(normalizedTime), duration, ease?) function for requestAnimationFrame based animation. 

### v0.9.16 - Nov 14, 2020

- `^` elem(tagNammes) - add type support for return types
- `^` attr(...) - add support for num values

### v0.9.15 - Oct 30, 2020

- `.` update build dependencies, and export `HubEventInfo`

### v0.9.14 - Sept 23, 2020

- `^` event - onEvent override target and currentTarget as HTMLElement to avoid boilercasting.

### v0.9.13 - Sept 17, 2020

- `^` - adoptStyleSheets - added support adopt multiple CSSObject, and added 's' to the api

### v0.9.12 - Sep 13, 2020

- `+` adoptStyleSheet - adopt a `CSSObject` to a shadowRoot, using constructable stylesheets if supported or append style element if not.
- `!^` css - now css returns a `CSSObject` which is composable and can be used in `adoptStyleSheet`
- `-` @onHub - fix issue where @onHub was not unbound
- `!` c-base - remove attributeChangedCallback empty implementation (perf impact for little to no value)

### v0.9.11 Sep 9, 2020

- `+` css - added `css(string)` and css\` tag template to create `<style>` element
- `+` html - added `html(string)` and html\` tag template to create DocumentFragment (@deprecate `frag`)
- `^` event - refactor BaseHTMLElement bindings (performance update)


### v0.9.10 - Sep 6, 2020

- `^` event - `@onEvent` binds to .shadowRoot when .shadowRoot exist after constructor.
- `+` escape - added `escapeHtml(string)` and `escapeAttr(string)` (using the DOM element to do the escaping)
- `.` demo - added `demo/` code sample see [DEMO (for live access)](https://demo.dom-native.org/core/index.html)
- `.` demo - added `perf`
- `.` build - changed build system and related scripts (still use rollup)


### v0.9.9 - May 13, 2020

- Inital release from [mvdom](https://github.com/mvdom/mvdom)











