import type { BaseHTMLElement } from './c-base.js';
import { hub } from './hub.js';

type OnHubEvent = { methodName: string, hubName: string, topic: string, label?: string };

const _onHubEventByConstructor: Map<Function, OnHubEvent[]> = new Map();

type ComputedOnHubEvents = OnHubEvent[] | null;
const _computedOnHubEventByConstructor = new WeakMap<Function, ComputedOnHubEvents>();

//#region    ---------- Public onEvent Decorator ---------- 
/**
 * `onHub` decorator to bind a hub event to this instance.
 */
export function onHub(hubName: string, topic: string, label?: string) {

	// target references the element's class. It will be the constructor function for a static method or the prototype of the class for an instance member
	return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
		const clazz = target.constructor;

		// get the onEvents array for this clazz
		let onEvents = _onHubEventByConstructor.get(clazz);
		if (onEvents == null) {
			onEvents = [];
			_onHubEventByConstructor.set(clazz, onEvents);
		}

		// create and push the event
		const onEvent: OnHubEvent = {
			methodName: propertyKey,
			hubName,
			topic,
			label
		};
		onEvents.push(onEvent);
	}
}
//#endregion ---------- /Public onEvent Decorator ---------- 

export function hasHubEventDecorators(el: HTMLElement) {
	return getComputedOnHubEvents(el.constructor) != null;
}


// For BaseHTMLElement
export function bindOnHubDecorators(this: BaseHTMLElement) {
	let clazz = this.constructor;

	const computed = getComputedOnHubEvents(clazz);

	if (computed != null) {
		const opts = { ...this._nsObj, ctx: this };
		for (const onEvent of computed) {
			const fnName = onEvent.methodName;
			const fn = (<any>this)[fnName];
			const h = hub(onEvent.hubName);
			h.sub(onEvent.topic, onEvent.label, fn, opts);
		}
	}
}

// only unbind docEvent and winEvent
export function unbindOnHubDecorators(this: any) {
	let clazz = this.constructor;

	const computed = getComputedOnHubEvents(clazz);

	const nsObj = this._nsObj;

	if (computed != null) {
		for (const onEvent of computed) {
			const { hubName, methodName } = onEvent;
			const h = hub(hubName);
			h.unsub(nsObj);
		}
	}

}


function getComputedOnHubEvents(clazz: Function): ComputedOnHubEvents {
	const topClazz = clazz;
	const topClazzHubEvents: OnHubEvent[] = [];

	// keep track of the function name that were bound, to not double bind overriden parents
	// This is the intuitive behavior, aligning with inheritance behavior.
	const fnNameBoundSet = new Set<string>();

	do {
		const onEvents = _onHubEventByConstructor.get(clazz);
		if (onEvents) {
			for (const onEvent of onEvents) {
				const fnName = onEvent.methodName;
				if (!fnNameBoundSet.has(fnName)) {
					topClazzHubEvents.push(onEvent);
					fnNameBoundSet.add(fnName);
				}
			}
		}
		// clazz = (<any>clazz).__proto__;
		clazz = Object.getPrototypeOf(clazz);
	} while (clazz != HTMLElement)


	const computed: ComputedOnHubEvents = topClazzHubEvents.length > 0 ? topClazzHubEvents : null;
	_computedOnHubEventByConstructor.set(topClazz, computed);
	return computed;
}