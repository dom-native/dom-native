# DOM-Native Standard, Hub Events

## Overview

This document covers the `dom-native` hub system:

- Core functions
  - `hub(name)`
  - `sub(...)`, subscribe to topic and optional label-based pub/sub events
  - `pub(...)`, publish a hub event with or without labels
  - `unsub(...)`, remove subscriptions by namespace
  - `bindHubEvents(...)`, bind dictionary-based hub listeners in one call
- TS decorators
  - `@onHub(...)`, bind component methods to hub events with automatic cleanup

The hub is a lightweight topic and label-based pub/sub system.
It is commonly used for route events, model events, and other app-level notifications.

## Core hub types

Type signatures first, with one comment per signature, in one code block.

```ts
// A hub listener receives the published data and event info.
export type HubListener = (data: any, info: HubEventInfo) => void;

// Hub event metadata passed to listeners.
export interface HubEventInfo {
	topic: string;
	label: string;
}

// Public hub API for subscribe, publish, and namespace unsubscription.
export interface Hub {
	sub(topics: string, handler: HubListener, opts?: HubOptions): void;
	sub(topics: string, labels: string | undefined | null, handler: HubListener, opts?: HubOptions): void;
	pub(topic: string, message: any): void;
	pub(topic: string, label: string, message: any): void;
	unsub(ns: { ns: string }): void;
}

// Create or get a named singleton hub.
export function hub(name: string): Hub;
```

## Creating a hub

```ts
import { hub } from "dom-native";

const routeHub = hub("Route");
const modelHub = hub("modelHub");
```

`hub(name)` returns a named singleton.
Calling `hub("Route")` again returns the same hub.

## Subscribe

### Subscribe by topic

```ts
const routeHub = hub("Route");

routeHub.sub("change", (data, info) => {
	console.log(info.topic, data);
});
```

### Subscribe by topic and label

```ts
const modelHub = hub("modelHub");

modelHub.sub("agent", "update", (data, info) => {
	console.log(info.topic, info.label, data);
});
```

### Subscribe to multiple topics or labels

```ts
modelHub.sub("agent,conv", "create,update", (data, info) => {
	console.log(info.topic, info.label);
});
```

Topics and labels are comma-separated strings.

## Publish

### Publish without label

```ts
routeHub.pub("change", { path: "/agents" });
```

### Publish with label

```ts
modelHub.pub("agent", "update", { id: 42 });
```

## Unsubscribe by namespace

The main cleanup model is namespace-based.

```ts
const appHub = hub("app");

appHub.sub("change", handler, { ns: "my-view", ctx: this });
appHub.unsub({ ns: "my-view" });
```

## Publish behavior nuance

If a publish includes labels:

- matching topic+label listeners fire first
- then topic-only listeners fire
- topic-only listeners are called once per published label

That means labels are not just metadata, they affect routing behavior.

## Binding dictionaries

`dom-native` also supports dictionary-based hub binding.

```ts
import { bindHubEvents } from "dom-native";

bindHubEvents(
	{
		Route: {
			change: (data, info) => {
				console.log(info.topic, data);
			},
		},
	},
	{ ns: "sample" },
);
```

Useful shapes include:

- `{ "hubName; topic[; label]": fn }`
- `{ hubName: { "topic[; label]": fn } }`
- arrays of those forms

This is useful, but in components the decorator approach is usually clearer.

## @onHub(...)

Use `@onHub(hubName, topic, label?)` on `BaseHTMLElement` methods.

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

### With a label

```ts
@customElement("agent-view")
export class AgentView extends BaseHTMLElement {
	@onHub("modelHub", "agent", "update")
	onAgentUpdate(data: any, info: any) {
		this.refresh();
	}

	refresh() {
		// ...
	}
}
```

## Best practice

Use the same pattern seen in awesomeapp:

- let hub handlers stay thin
- call a focused `refresh()` or `refresh_view()`
- let `BaseHTMLElement` manage binding and cleanup

Example:

```ts
@onHub("Route", "change")
onRouteChange() {
	this.refresh_view();
}
```

This scales well because route changes, model changes, and user actions can converge on the same refresh logic.

## Important nuances

### Bound with component context

Decorator hub handlers are bound with:

- `ctx: this`
- the component namespace

So methods run on the instance and cleanup is automatic on disconnect.

### Unsubscription is namespace-based

Hub cleanup is not per method.
All subscriptions for the same component namespace are removed together.

### Inheritance uses method-name override semantics

If a child class defines a decorated hub method with the same method name as a parent class, the child binding wins.

## Recommended default

For application custom elements, prefer:

- `@onHub(...)` for component reactions to app or model state
- direct `hub(...).sub(...)` for non-component code
- thin handlers that call focused refresh methods

