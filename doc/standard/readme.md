# DOM-Native Standard

## Overview

`dom-native` is a DOM-first, Web Component-oriented utility library for building modern frontends with native browser primitives and TypeScript.
The key concept is that the browser and the DOM are the framework.

There are three key aspects of this library:

1) `BaseHTMLElement`, which inherits from the browser `HTMLElement` and adds convenient lifecycle hooks and event support, such as `init`, `preDisplay`, `postDisplay`, and the ability to listen to DOM events as well as `dom-native` hub events. Convenient TypeScript decorators are available, such as `@customElement("hello-view")`.

2) `on` event binding, which uses native event binding while adding delegated support and namespaced binding and unbinding.

3) `hub` capabilities, which allow you to create event buses for many kinds of events and provide a topic and label-based pub/sub model. This can be used for routing events, data events, and other application events.

```ts
import { BaseHTMLElement, customElement, html } from "dom-native";

const HTML = html`
<section class="hello-view">
	<h1>Hello</h1>
</section>
`;

@customElement("hello-view")
export class HelloView extends BaseHTMLElement {
	init() {
		const content = document.importNode(HTML, true);
		this.replaceChildren(content);
	}
}
```

This style favors native custom elements, explicit DOM updates, and small helper APIs over virtual DOM or framework-level abstractions.

- Keep the browser model central, `HTMLElement`, `customElements`, `DocumentFragment`, and DOM events are the foundation.
- Prefer clear one-time DOM setup in `init()`.
- Prefer focused refresh methods over broad rerender logic.
- Use `dom-native` helpers when they improve clarity, not as an abstraction layer for its own sake.
- Build small, composable custom elements that own a narrow DOM subtree.

## Base HTML Element

`BaseHTMLElement` is the standard base class for application custom elements.

- It can and should be annotated with `@customElement("profile-view")` to make it a native component, or you can use the standard `customElement.register(...)` after the class as well.
- It can use TypeScript decorators such as `@onEvent(...)`, `onDocEvent(...)`, and `onHubEvent(...)` on methods for DOM and hub events.
- It has a lifecycle:
  - `init` is called during `connectedCallback` and only once per instance.
    - Cache important child elements in private fields during `init()`.
  - Use `preDisplay()` for final synchronous DOM updates before paint.
  - Use `postDisplay()` for async loading, delayed refresh, or measurement work.
- If overriding `disconnectedCallback()`, always call `super.disconnectedCallback()`.

Here is an example with some best practices included.

```ts
import { BaseHTMLElement, customElement, first, html } from "dom-native";

// Best Practice: Create a reusable document fragment for this component
const HTML = html`
<section class="profile-view">
	<h2 class="title"></h2>
</section>
`;

@customElement("profile-view")
export class ProfileView extends BaseHTMLElement {
	#titleEl!: HTMLElement;

	init() {
		// Best Practice: Efficient and reliable way to clone the document fragment for this instance. 
		const content = document.importNode(HTML, true);
		this.#titleEl = first(content, ".title")!;
		
		// Best Practice:
		this.replaceChildren(content);
	}

	preDisplay() {
		this.#titleEl.textContent = "Profile";
	}
}
```

Here are some best practices:

- `init()`
  - clone fragment templates
  - query and cache key elements
  - attach the initial static structure
- `preDisplay()`
  - apply synchronous state already available
  - do small final DOM updates that should happen before paint
- `postDisplay()`
  - fetch data
  - call async services
  - trigger initial refresh methods

This keeps first paint predictable and reduces unnecessary DOM churn.

## Template Fragments

Use top-level `html\`...\`` fragments for reusable static markup.

```ts
import { html } from "dom-native";

const HTML = html`
<section class="settings-view">
	<header>
		<h2>Settings</h2>
	</header>
	<div class="content"></div>
</section>
`;
```

Declare static markup once at module scope, then clone it for each instance.

- `html(...)` returns a `DocumentFragment`, not an element.
- Treat the fragment as a template source.
- Clone with `document.importNode(HTML, true)` before use.
- Keep templates close to the component that owns them.
- Use this for mostly static structure, not frequently changing dynamic lists.

## Init Pattern

The standard setup pattern is clone, capture, and attach.

```ts
import { BaseHTMLElement, customElement, first, html } from "dom-native";

const HTML = html`
<section class="dashboard-view">
	<nav class="toolbar"></nav>
	<div class="content"></div>
</section>
`;

@customElement("dashboard-view")
export class DashboardView extends BaseHTMLElement {
	#toolbarEl!: HTMLElement;
	#contentEl!: HTMLElement;

	init() {
		const content = document.importNode(HTML, true);
		this.#toolbarEl = first(content, ".toolbar")!;
		this.#contentEl = first(content, ".content")!;
		this.replaceChildren(content);
	}
}
```

This is the default component setup pattern.

- Clone the module-level fragment once per instance.
- Query important nodes from the cloned fragment before insertion.
- Store those nodes in fields to avoid repeated lookups later.
- Attach the final cloned content with `replaceChildren(content)`.

## Key Element Caching

Cache key elements once in `init()`.

```ts
import { BaseHTMLElement, customElement, first, html } from "dom-native";

const HTML = html`
<section>
	<h2 class="title"></h2>
	<div class="body"></div>
	<footer class="footer"></footer>
</section>
`;

@customElement("article-view")
export class ArticleView extends BaseHTMLElement {
	#titleEl!: HTMLElement;
	#bodyEl!: HTMLElement;
	#footerEl!: HTMLElement;

	init() {
		const content = document.importNode(HTML, true);
		this.#titleEl = first(content, ".title")!;
		this.#bodyEl = first(content, ".body")!;
		this.#footerEl = first(content, ".footer")!;
		this.replaceChildren(content);
	}
}
```

Do not repeatedly query the same nodes from `this` during every refresh or event handler.

- Cache stable nodes once.
- Use private fields for internal DOM references.
- Prefer this especially for high-use containers, inputs, headers, and content regions.

## Refresh Methods

Keep event handlers and hub handlers thin, and move DOM logic into focused refresh methods.

```ts
import { BaseHTMLElement, customElement, html, onEvent } from "dom-native";

const HTML = html`
<section>
	<button class="reload">Reload</button>
	<div class="content"></div>
</section>
`;

@customElement("report-view")
export class ReportView extends BaseHTMLElement {
	init() {
		const content = document.importNode(HTML, true);
		this.replaceChildren(content);
	}

	@onEvent("pointerdown", ".reload")
	onReloadClick() {
		this.refresh();
	}

	refresh() {
		const contentEl = this.querySelector(".content");
		if (contentEl) {
			contentEl.textContent = "Updated";
		}
	}
}
```

This pattern scales well.

- Event handlers stay small and easy to read.
- Different triggers can reuse the same refresh method.
- Async and sync update paths stay localized.
- Tests and maintenance become easier because rendering logic has a single entry point.

## DOM Queries

Prefer `first`, `getFirst`, and `all` over repetitive raw query boilerplate.

```ts
import { all, first, getFirst } from "dom-native";

const panelEl = first(document.body, ".panel");
const titleEl = getFirst(document.body, ".panel-title");
const itemEls = all(document.body, ".panel .item");
```

Use the right helper for the situation.

- `first(...)` when `null` is acceptable.
- `getFirst(...)` when the element must exist.
- `all(...)` when you need an array of matches.
- Scope queries to a fragment or subtree whenever possible.

## Rendering with `replaceChildren`

Prefer targeted subtree replacement instead of broad string rerenders.

```ts
import { BaseHTMLElement, customElement, elem, html } from "dom-native";

const HTML = html`
<section>
	<div class="content"></div>
</section>
`;

@customElement("state-view")
export class StateView extends BaseHTMLElement {
	#contentEl!: HTMLElement;

	init() {
		const content = document.importNode(HTML, true);
		this.#contentEl = content.querySelector(".content")!;
		this.replaceChildren(content);
	}

	showEmpty() {
		this.#contentEl.replaceChildren("No data");
	}

	showChildView() {
		this.#contentEl.replaceChildren(elem("details-view"));
	}
}
```

This keeps updates explicit and local.

- Replace only the subtree that changed.
- Favor DOM node replacement over rebuilding the whole component.
- Use `replaceChildren(...)` when switching views, empty states, or dynamic sections.

## Dynamic Element Creation

Use `elem(...)` for dynamic runtime DOM creation.

```ts
import { elem } from "dom-native";

const buttonEl = elem("button", {
	class: "save",
	$: { textContent: "Save" },
});

const panelEl = elem("info-panel", {
	$: { _data: { panel_id: 12 } },
});
```

`elem(...)` is best for dynamic nodes.

- Standard keys become attributes.
- The `$` object assigns properties directly.
- Use `$` for `textContent`, custom element data payloads, and non-attribute state.
- Prefer `elem(...)` when runtime values drive the structure.

## Custom Element Data Payloads

For composed custom elements, a common pattern is to pass initialization data through a typed internal property.

```ts
import { BaseHTMLElement, customElement, elem } from "dom-native";

@customElement("item-view")
export class ItemView extends BaseHTMLElement {
	_data!: { item_id: number };

	get item_id() {
		return this._data.item_id;
	}
}

const el = elem("item-view", {
	$: { _data: { item_id: 42 } },
});
```

This is a simple and effective composition technique.

- Use when a child custom element needs structured startup data.
- Keep `_data` typed in the receiving component.
- Expose convenient getters for readability.
- Set `_data` through `elem(..., { $: { _data: ... } })`.

## Event Binding with Decorators

Use `@onEvent(...)` for delegated component-local interactions.

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
		const buttonEl = evt.selectTarget;
		buttonEl.classList.add("busy");
	}
}
```

Decorator-based delegated events are the preferred default inside components.

- Bind once on the component root.
- Use selectors to handle interactions from descendants.
- Read the matched delegated target with `evt.selectTarget`.
- Keep handlers small, and call refresh or action methods from them.

## Hub Events

Use `@onHub(...)` to react to application or model events.

```ts
import { BaseHTMLElement, customElement, onHub } from "dom-native";

@customElement("notifications-view")
export class NotificationsView extends BaseHTMLElement {
	@onHub("app", "notifications")
	onNotificationsChange() {
		this.refresh();
	}

	refresh() {
		this.textContent = "Notifications updated";
	}
}
```

Hub handlers should usually be thin.

- Subscribe with `@onHub(...)` when the component reacts to external state changes.
- Let the handler call a focused refresh method.
- Rely on `BaseHTMLElement` cleanup behavior for disconnect safety.
- Prefer hubs for simple app-level events, not for all state management.

## Lists with `frag`

Use `frag(items, acc)` for repeated child rendering.

```ts
import { BaseHTMLElement, customElement, elem, frag, html } from "dom-native";

const HTML = html`
<section>
	<ul class="items"></ul>
</section>
`;

@customElement("list-view")
export class ListView extends BaseHTMLElement {
	#itemsEl!: HTMLElement;

	init() {
		const content = document.importNode(HTML, true);
		this.#itemsEl = content.querySelector(".items")!;
		this.replaceChildren(content);
	}

	renderItems(items: { id: number; label: string }[]) {
		const content = frag(items, (item) =>
			elem("li", { $: { textContent: item.label } })
		);
		this.#itemsEl.replaceChildren(content);
	}
}
```

This is the standard pattern for simple list rendering.

- Fetch or receive the item array.
- Build a fragment from the list.
- Replace the destination subtree in one operation.
- Return `null` from the accumulator if an item should be skipped.

## Forms with `push` and `pull`

Use `push(...)` and `pull(...)` for form-like DOM data exchange.

```ts
import { pull, push } from "dom-native";

push(formEl, {
	name: "Ada",
	email: "ada@example.com",
});

const data = pull(formEl);
```

This pattern is especially useful for CRUD views.

- `push(...)` injects object values into matching fields.
- `pull(...)` extracts object values from the DOM.
- Property paths are inferred from `.dx-*`, `data-dx`, or `name`.
- Use this to keep forms simple and DOM-centered.

A common form structure:

```html
<form class="user-form">
	<input class="dx" name="name">
	<input class="dx" name="email">
</form>
```

## Query and Structure Helpers

Use helpers like `cherryChild(...)` when the fragment structure is fixed and exact.

```ts
import { BaseHTMLElement, cherryChild, customElement, html } from "dom-native";

const HTML = html`
<section>
	<header></header>
	<div></div>
	<footer></footer>
</section>
`;

@customElement("simple-layout")
export class SimpleLayout extends BaseHTMLElement {
	#headerEl!: HTMLElement;
	#bodyEl!: HTMLElement;
	#footerEl!: HTMLElement;

	init() {
		const content = document.importNode(HTML, true);
		[this.#headerEl, this.#bodyEl, this.#footerEl] = cherryChild(
			content,
			"header",
			"div",
			"footer",
		);
		this.replaceChildren(content);
	}
}
```

Use this only when the direct child structure is stable and intentional.

- It is compact and fast for small fixed templates.
- It should match the exact fragment structure.
- Prefer it for subcomponents with a tight, known template.

## Static vs Dynamic Builders

Use the right builder for the job.

```ts
import { elem, frag, html } from "dom-native";

const CARD_HTML = html`
<article class="card">
	<h3 class="title"></h3>
</article>
`;

const badgeEl = elem("span", {
	class: "badge",
	$: { textContent: "New" },
});

const listContent = frag(["A", "B"], (label) =>
	elem("li", { $: { textContent: label } })
);
```

A good default split is:

- `html\`...\`` for static reusable markup
- `elem(...)` for dynamic one-off nodes
- `frag(...)` for repeated list rendering

This keeps rendering intent obvious.

## Routing and View Switching

When view selection is route-driven, update only the target container.

```ts
import { BaseHTMLElement, customElement, elem, html } from "dom-native";

const HTML = html`
<main></main>
`;

@customElement("app-shell")
export class AppShell extends BaseHTMLElement {
	#mainEl!: HTMLElement;

	init() {
		const content = document.importNode(HTML, true);
		this.#mainEl = content.querySelector("main")!;
		this.replaceChildren(content);
	}

	showSection(section: "home" | "settings") {
		if (section === "home") {
			this.#mainEl.replaceChildren(elem("home-view"));
		} else {
			this.#mainEl.replaceChildren(elem("settings-view"));
		}
	}
}
```

For simple applications, route-driven subtree switching is often enough.

- Derive view state from route state.
- Replace only the main content region.
- Avoid over-abstracting with a large router-driven rendering framework unless needed.

## Recommended Component Recipe

A good default component recipe looks like this.

```ts
import { BaseHTMLElement, customElement, first, html, onEvent } from "dom-native";

const HTML = html`
<section class="sample-view">
	<button class="reload">Reload</button>
	<div class="content"></div>
</section>
`;

@customElement("sample-view")
export class SampleView extends BaseHTMLElement {
	#contentEl!: HTMLElement;

	init() {
		const content = document.importNode(HTML, true);
		this.#contentEl = first(content, ".content")!;
		this.replaceChildren(content);
	}

	async postDisplay() {
		await this.refresh();
	}

	@onEvent("pointerdown", ".reload")
	onReloadClick() {
		this.refresh();
	}

	async refresh() {
		this.#contentEl.textContent = "Loaded";
	}
}
```

Recommended implementation steps:

- Define a module-level `HTML` fragment.
- Clone and cache nodes in `init()`.
- Use `postDisplay()` for initial async loading.
- Keep interactions delegated with `@onEvent(...)`.
- Move rendering logic into one or more refresh methods.
- Update only the DOM subtree that changed.

## General Best Practices

- Prefer native custom elements and explicit DOM ownership.
- Keep component responsibilities narrow.
- Keep handlers thin and refresh methods focused.
- Query once, cache often.
- Use `replaceChildren(...)` for clear subtree updates.
- Use `html`, `elem`, and `frag` consistently by role.
- Use `push` and `pull` for forms instead of ad hoc field mapping.
- Use hubs for lightweight app events, not as a substitute for all architecture.
- Favor simple patterns that scale through consistency.
- Keep logic close to the DOM structure it controls.

## Summary

The `dom-native` standard is a disciplined DOM-first approach.

- Static structure is declared once.
- Components clone and cache structure in `init()`.
- Sync state is applied early, async work happens later.
- Events and hub subscriptions stay thin.
- Rendering is explicit, targeted, and easy to trace.

The result is code that stays close to browser behavior, remains easy to debug, and scales through simple, repeatable patterns.

