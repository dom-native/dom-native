# dom-native for LLM

## What it is

`dom-native` is a small TypeScript utility library for building apps directly with the real DOM and native custom elements.

Core ideas:

- The DOM is the framework.
- Prefer native Web Components over virtual DOM frameworks.
- Keep APIs small, typed, and close to browser behavior.
- Provide convenience helpers, not a full framework.
- Support modern browsers only.

Main packages in this repo:

- `dom-native`, core DOM, events, custom element base class, pub/sub, positioning, DX helpers.
- `dom-native-draggable`, drag and drop helpers and FLIP animation utility.
- `dom-native-ui`, UI components built on top of `dom-native`, not covered here in depth.

## Intended usage model

Use `BaseHTMLElement` as the base for custom elements, then compose with:

- `@customElement(...)`
- `@onEvent(...)`, `@onDoc(...)`, `@onWin(...)`
- `@onHub(...)`
- DOM helpers like `first`, `all`, `append`, `elem`, `html`, `frag`
- `on` / `off` / `trigger`
- `hub(...)`
- `push` / `pull`
- `position(...)`
- `anim(...)`

## Public exports

From `dom-native/src/index.ts`:

- `version`
- `anim`, type `AnimCallback`
- `getAttr`, `setAttr`
- `BaseHTMLElement`
- `adoptStyleSheets`, `css`
- `all`, `append`, `cherryChild`, `closest`, `first`, `getFirst`, `next`, `prev`
- type `AppendPosition`
- `elem`, `frag`, `html`
- `pull`, `puller`, `push`, `pusher`
- `escapeAttr`, `escapeHtml`, `xa`, `xh`
- `addOnEvents`, `bindOnEvent`, `bindOnEvents`, `off`, `on`, `trigger`
- types `OnEvent`, `OnEventListener`, `OnListenerBySelector`
- `addHubEvents`, `bindHubEvents`, `hub`, `unbindHubEvents`
- types `Hub`, `HubBindings`, `HubEventInfo`
- `position`, types `Pos`, `PositionOptions`
- `className`, `setClass`, `style`
- `customElement`
- `onDoc`, `onEvent`, `onWin`
- `onHub`
- `val`
- deprecated `scanChild`

## BaseHTMLElement

File: `dom-native/src/c-base.ts`

`BaseHTMLElement` extends `HTMLElement` and centralizes lifecycle and safe binding behavior.

### Properties

- `uid: string`, unique per instance.
- `_nsObj: { ns: string }`, namespace used for cleanup.
- optional instance event maps:
  - `events`
  - `docEvents`
  - `winEvents`
  - `hubEvents`

### Lifecycle methods

Subclasses may define:

- `init(): void`
  - Called once, on first `connectedCallback`.
  - Safe place to set `innerHTML`, append children, bind local events.
- `preDisplay?(firstCall: boolean): void`
  - Called synchronously during `connectedCallback`, after first init/bind setup.
  - Intended for final synchronous state-to-DOM updates before paint.
- `postDisplay?(firstCall: boolean): void`
  - Called in `requestAnimationFrame(...)`.
  - Intended for async or post-render work.
- `disconnectedCallback()`
  - Must call `super.disconnectedCallback()` when overridden.

### Internal behavior

On connect:

- Determines whether document/window decorators or event maps exist.
- Binds `docEvents` and `winEvents` with `nextFrame: true` and `silenceDisconnectedCtx: true`.
- Binds hub events.
- On first connect only:
  - binds `events`
  - binds `@onEvent` decorators
  - calls `init()`
- Calls `preDisplay(firstCall)` if present.
- Schedules `postDisplay(firstCall)` if present.

On disconnect:

- Schedules cleanup of document/window handlers on next frame, only if element is still disconnected.
- Unbinds hub subscriptions immediately.
- Cleanup uses the instance namespace.

### Important subclass rules

- Always call `super()` in constructor.
- If overriding `connectedCallback()` or `disconnectedCallback()`, always call `super...()`.
- Do not call `init()` directly.
- Use `forceCleanRootEvents()` if manually binding root document/window events with the component namespace.

## Decorators

### `@customElement(tagName)`

File: `dom-native/src/ts-decorator-custom-element.ts`

Just calls:

- `customElements.define(tagName, target)`

No extra registry or abstraction.

### `@onEvent(type, selectorOrOpts?, opts?)`
### `@onDoc(type, selectorOrOpts?, opts?)`
### `@onWin(type, selectorOrOpts?, opts?)`

File: `dom-native/src/ts-decorator-on-event.ts`

Bind methods declared on the class.

Behavior:

- `@onEvent` binds on the instance itself.
- If element has a `shadowRoot`, `@onEvent` binds on `shadowRoot` instead of host.
- `@onDoc` binds on `document`.
- `@onWin` binds on `window`.

Options supported by decorator metadata:

- `passive?: boolean`
- `capture?: boolean`
- `nextFrame?: boolean`

Inheritance behavior:

- Decorated methods are collected from subclass to parent class.
- If child and parent use the same method name, child wins, parent binding is skipped.

### `@onHub(hubName, topic, label?)`

File: `dom-native/src/ts-decorator-on-hub.ts`

Subscribes instance methods to hub events.

Behavior:

- Bound with component namespace and `ctx: this`.
- Inheritance behavior matches the event decorators, child method names override parent ones.
- Unsubscribes by namespace on disconnect.

## DOM event API

File: `dom-native/src/event.ts`

### `on(...)`

Supports:

- `on(els, types, listener, opts?)`
- `on(els, types, selector, listener, opts?)`

Details:

- `types` can be comma-separated.
- `els` can be a single target, node list, or array-like accepted by `asNodeArray`.
- If `selector` is provided, delegated event handling is used.
- Adds `evt.selectTarget` with the matched element.
- `opts.ctx` binds callback `this`.
- `opts.ns` stores namespace for later `off(..., {ns})`.
- `opts.nextFrame` defers `addEventListener`.
- `opts.silenceDisconnectedCtx` skips handler execution when `ctx` is an `HTMLElement` and no longer connected.

### `off(...)`

Supports:

- `off(els)`
- `off(els, type)`
- `off(els, type, selector)`
- `off(els, type, listener)`
- `off(els, type, selector, listener)`
- `off(els, {ns})`

Notes:

- Namespace removal is the most important cleanup path used by `BaseHTMLElement`.
- Non-matching removals log warnings instead of throwing.

### `trigger(els, type, evtInit?)`

Dispatches a `CustomEvent` with defaults:

- `bubbles: true`
- `cancelable: true`

### `OnEvent` type

Extended event shape used by `dom-native`:

- `selectTarget: HTMLElement`
- `detail`
- `target: HTMLElement`
- `currentTarget: HTMLElement`

Useful in TS for delegated events.

## DOM query and manipulation helpers

File: `dom-native/src/dom.ts`

### `first(...)`

Flexible query helper.

Forms:

- `first(baseEl)`
- `first(selector)`
- `first(selector1, selector2, ...)`
- `first(baseEl, selector)`
- `first(baseEl, selector1, selector2, ...)`

Behavior:

- With only an element, returns `firstElementChild`.
- With selectors, returns first match from document or base element.
- Multiple selectors return an array of results.

### `getFirst(...)`

Strict version of `first(...)`.

- Throws if base element is null.
- Throws if any requested element is not found.

### `all(...)`

Forms:

- `all(selector)`
- `all(baseEl, selector)`

Returns `HTMLElement[]`, not `NodeList`.

### `next(el, selector?)`
### `prev(el, selector?)`

Return next or previous matching sibling element.

### `closest(el, selector)`

Null-safe wrapper around `.closest(...)`.

### `append(refEl, newEl, position?)`

Positions:

- `"last"`, default
- `"first"`
- `"empty"`
- `"before"`
- `"after"`

Accepts `newEl` as:

- `HTMLElement`
- `HTMLElement[]`
- `DocumentFragment`
- `string`, treated as HTML and converted with `html(...)`

Return value:

- appended element, or appended element array when fragment/array input expands to many children.

### `cherryChild(el, ...tagNames)`

Fast direct-child tag picker.

Rules:

- only tag names
- order matters
- intended to be exhaustive

Throws if requested sequence cannot be satisfied.

### `scanChild(...)`

Deprecated alias for `cherryChild(...)`.

## DOM builders

File: `dom-native/src/dom-builders.ts`

### `elem(tagName, data?)`

Creates an element.

`data` behavior:

- normal keys become attributes
- boolean `true` becomes empty attribute
- boolean `false` becomes omitted
- special `$` key applies direct property assignment

Example:

- `elem('input', { type: 'text', disabled: true, $: { value: 'Hello' } })`

### `html(str)` or template-tag `html\`\``

Creates a `DocumentFragment` using a `<template>` element.

### `frag()`
### `frag(items, acc)`

Creates an empty fragment, or accumulates elements/fragments from a list.

If accumulator returns `null`, item is skipped.

## Hub, lightweight pub/sub

File: `dom-native/src/hub.ts`

### `hub(name)`

Returns a named singleton hub.

Each hub has:

- `sub(topics, handler, opts?)`
- `sub(topics, labels, handler, opts?)`
- `pub(topic, message)`
- `pub(topic, label, message)`
- `unsub({ns})`

### Topic and label model

- topics can be comma-separated
- labels can be comma-separated
- subscriptions may be topic-only or topic-plus-label

Publish rules:

- if publish includes labels, matching topic+label listeners fire first
- then topic-only listeners fire
- topic-only listeners receive one callback per published label

### Subscription options

- `ns?: string`
- `ctx?: any`

### Event info passed to handlers

`HubEventInfo`:

- `topic: string`
- `label: string`

### Binding dictionaries

Helpers support dictionary forms:

- `{ "hubName; topic[,topic][; label[,label]]": fn }`
- `{ hubName: { "topic[,topic][; label[,label]]": fn } }`
- arrays of the above

Helpers:

- `addHubEvents(target, source)`
- `bindHubEvents(bindings, opts?)`
- `unbindHubEvents(bindings, {ns})`

## DX, push/pull DOM data exchange

File: `dom-native/src/dx.ts`

Purpose:

- map JS objects into DOM fields, `push`
- extract JS objects from DOM fields, `pull`

Default selector:

- `.dx`

### `push(el, data)`
### `push(el, selector, data)`

Path resolution for each matching element:

- class like `dx-address-street` -> path `address.street`
- else `data-dx`
- else `name` attribute

Built-in pushers:

- `input[type='checkbox'], input[type='radio']`
- `input`
- `select`
- `textarea`
- `*`, uses `innerHTML`

Array handling:

- checkbox/radio arrays map by checked/value semantics
- non-checkbox array values are distributed by repeated matching field occurrence

### `pull(el, selector?)`

Builds an object from matching elements.

Built-in pullers:

- checkbox/radio
- input/select
- textarea
- fallback `*`, returns `innerHTML`

### Extensibility

- `pusher(selector, fn)`
- `puller(selector, fn)`

New handlers are prepended, so custom ones override defaults.

## Positioning

File: `dom-native/src/position.ts`

### `position(el, refEl, opts?)`
### `position(el, point, opts?)`

Positions an absolutely positioned element relative to a reference element or point.

`Pos` values:

- `TL`, `TC`, `TR`
- `CL`, `CC`, `CR`
- `BL`, `BC`, `BR`

Options:

- `pos?: Pos`, element anchor relative to reference
- `refPos?: Pos`, reference anchor
- `gap?: number`
- `vGap?: number`
- `hGap?: number`
- `x?: boolean | number`
- `y?: boolean | number`
- `constrain?: Window | HTMLElement | null`

Behavior:

- default is `{ pos: "TL", refPos: "BR", gap: 0, x: true, y: true }`
- centered axes do not apply generic `gap` unless overridden by `vGap` or `hGap`
- constraint defaults to window when omitted
- final `top` and `left` are adjusted for `offsetParent`

## CSS helpers

Exported from `css-object`, seen in examples.

Usage pattern:

- `const styles = css\`...\`;`
- `adoptStyleSheets(this, styles);`

Intent:

- create stylesheet objects usable with adopted style sheets
- fallback behavior exists for browsers without full support

## Escaping helpers

Exported from `escapes`:

- `escapeAttr`
- `escapeHtml`
- `xa`
- `xh`

Use when generating HTML strings from external data.

## Style and class helpers

Exported from `style`:

- `style(el, partialCssDeclarationLikeObject)`
- `className`
- `setClass`

Used often by draggable helpers.

## Misc utility

### `val`

Exported from `utils`.

Used as a nested property getter/setter, especially by DX helpers.

## Animation

Exported from `anim`.

### `anim(callback, duration, ease?)`

Convenience wrapper over `requestAnimationFrame`.

- callback receives normalized time `0..1`
- optional easing function transforms progress

## Draggable package

Main files:

- `dom-native-draggable/src/draggable.ts`
- `dom-native-draggable/src/flip.ts`

### `draggable(...)`

Forms:

- `draggable(rootEl, controller?)`
- `draggable(document, selector, controller?)`
- `draggable(rootEl, selector, controller?)`

Attaches pointerdown activation and manages a drag session.

### Drag controller

Important options:

- `pointerCapture?: HTMLElement`
- `data?: any`
- `drag?: 'ghost' | 'source' | 'none'`
- `constraints?: { x?, y?, container?, hitbox? }`
- `droppable?: boolean | string | ((target) => HTMLElement | null)`
- `dragover?: boolean`
- `ghost?: { deleteOnEnd?, followPointer?, create? }`
- `onCandidate?`
- event callbacks:
  - `onDragStart`
  - `onDrag`
  - `onDragEnd`
  - `onDragEnter`
  - `onDragOver`
  - `onDragLeave`
  - `onDrop`

### Drag event model

Custom event names:

- `DRAGSTART`
- `DRAG`
- `DRAGEND`
- `DRAGENTER`
- `DRAGOVER`
- `DRAGLEAVE`
- `DROP`

Event detail includes:

- `data`
- `source`
- `sourceOriginRect`
- `sourceOriginTransform`
- `ghost?`
- `ghostOriginRect?`
- `ghostOriginTransform?`
- `droppable?`
- `over`
- `originX`, `originY`
- `clientX`, `clientY`
- `pointerEvent`

Behavior notes:

- drag begins after threshold
- optional ghost element can be created
- drop target gets `drag-over` class while active
- source gets `drag-source`
- body gets `drag-cursor`
- event detail `data` can be mutated by handlers, and controller state is updated from it

### `capture(els)` in `flip.ts`

Simple FLIP helper.

Flow:

- call `capture(els)` before layout change
- returned `invert()` computes transforms from old rects to new rects
- returned `play(duration?)` animates transform back to zero and resolves when done

Good for list reordering animations.

## How examples use the library

Relevant demo files:

- `demo/src/demo-core/spec-basic.ts`
- `demo/src/demo-core/spec-event.ts`
- `demo/src/demo-core/spec-shadow-dom.ts`

### Basic custom element pattern

Example shows:

- subclass `BaseHTMLElement`
- set DOM in `init()`
- register with `customElements.define(...)` or `@customElement(...)`
- set post-append state before first paint, then render it in `preDisplay()`

### Event binding pattern

Examples show both:

- `@onEvent('pointerup', '.clickable')`
- `on(this, 'pointerup', '.clickable', handler)`

For shadow DOM components:

- `@onEvent(...)` binds to `shadowRoot` automatically
- manual `on(...)` should use `this.shadowRoot`

### Shadow DOM pattern

Examples show:

- attach shadow root in constructor
- use `css` + `adoptStyleSheets(...)`
- or inject `<style>` directly
- use `html(...)` fragment templates for reusable shadow content

## Best practices for LLM-generated code in this repo

- Prefer `BaseHTMLElement` for custom elements.
- Put one-time DOM creation in `init()`.
- Put synchronous state-to-DOM finishing in `preDisplay()`.
- Put async loading and delayed measurement work in `postDisplay()`.
- Always call `super.disconnectedCallback()` if overriding it.
- For root document/window listeners in components, prefer `@onDoc`, `@onWin`, `docEvents`, or `winEvents`.
- For delegated DOM listeners, use `on(..., selector, ...)` and `evt.selectTarget`.
- Use namespace-based cleanup with `off(..., {ns})`.
- Prefer `first`, `all`, `append`, `elem`, `html`, `frag` instead of raw repetitive DOM boilerplate when it improves clarity.
- Use `hub(...)` for simple pub/sub, not as a replacement for all state management.
- Use `push` and `pull` for form-like DOM data exchange.
- Use `position(...)` for overlays, popups, and anchored elements.
- In shadow DOM components, bind manual events on `shadowRoot`.
- If using inheritance with decorators, remember method-name override semantics.

## Important behavioral nuances

- `@customElement(...)` does not guard against duplicate registration.
- `preDisplay()` is currently called synchronously in `connectedCallback`, not in a queued frame.
- `postDisplay()` is called in one `requestAnimationFrame`, not double-RAF.
- Parent `document` and `window` bindings are deferred to next frame to avoid interacting with the triggering connect event.
- Parent event handlers are silenced when the component context is disconnected.
- Hub unsubscription is namespace-based, not per-method.
- `append(...)` accepts HTML strings and converts them to fragments.
- `html(...)` returns a `DocumentFragment`, not an element.
- `first(el)` with no selector means first child element, not query.
- `getFirst(...)` throws, `first(...)` returns `null`.
- `all(...)` always returns an array.
- `pull(...)` and `push(...)` infer object paths from `.dx-*`, `data-dx`, or `name`.

## Minimal examples

### Custom element

````ts
import { BaseHTMLElement, customElement } from "dom-native";

@customElement("hello-box")
class HelloBox extends BaseHTMLElement {
	init() {
		this.innerHTML = `<strong>Hello</strong>`;
	}
}
````

### Delegated event

````ts
import { on } from "dom-native";

on(containerEl, "click", ".item", (evt) => {
	evt.selectTarget.classList.add("active");
});
````

### Hub

````ts
import { hub } from "dom-native";

const appHub = hub("app");

appHub.sub("user-loaded", (data, info) => {
	console.log(info.topic, data);
});

appHub.pub("user-loaded", { id: 1 });
````

### Push and pull

````ts
import { push, pull } from "dom-native";

push(formEl, { firstName: "Ada", address: { city: "Paris" } });
const data = pull(formEl);
````

### Position

````ts
import { position } from "dom-native";

position(menuEl, buttonEl, { refPos: "BL", pos: "TL", gap: 8 });
````

## Summary

`dom-native` is a thin, opinionated utility layer over native browser APIs.

Its center of gravity is:

- native custom elements via `BaseHTMLElement`
- safe event binding and cleanup
- simple DOM utilities
- lightweight pub/sub
- direct DOM-first rendering patterns

For LLM code generation, the safest default is:

- create a custom element with `BaseHTMLElement`
- render in `init()`
- use `on` or decorators for events
- use `first` and `all` for queries
- use `off(..., {ns})` or component lifecycle cleanup for root listeners
- keep logic close to DOM structure and browser behavior

