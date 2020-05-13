import { hub } from './hub';
// import { BaseHTMLElement } from './c-base';

// TODO: needs to be in dom-native
interface HubInfo {
	topic: string,
	label?: string,
	ns?: string
}

type OnHubEvent = { methodName: string, hubName: string, topic: string, label?: string };

const onHubEventByConstructor: Map<Function, OnHubEvent[]> = new Map();


//#region    ---------- Public onEvent Decorator ---------- 
/**
 * `onHub` decorator to bind a hub event to this instance.
 */
export function onHub(hubName: string, topic: string, label?: string) {

	// target references the element's class. It will be the constructor function for a static method or the prototype of the class for an instance member
	return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
		const clazz = target.constructor;

		// get the onEvents array for this clazz
		let onEvents = onHubEventByConstructor.get(clazz);
		if (onEvents == null) {
			onEvents = [];
			onHubEventByConstructor.set(clazz, onEvents);
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

// For BaseHTMLElement
export function bindOnHubDecorators(this: any) {
	let clazz = this.constructor;
	const topClazz = clazz;

	// keep track of the function name that were bound, to not double bind overriden parents
	// This is the intuitive behavior, aligning with inheritance behavior.
	const fnNameBoundSet = new Set<string>();

	const opts = { ...this._nsObj, ctx: this };

	while (clazz !== HTMLElement) {
		const onEvents = onHubEventByConstructor.get(clazz);
		if (onEvents) {
			for (const onEvent of onEvents) {
				const fnName = onEvent.methodName;
				if (!fnNameBoundSet.has(fnName)) {
					const fn = (<any>this)[fnName];
					const h = hub(onEvent.hubName);
					h.sub(onEvent.topic, onEvent.label, fn, opts);
					// to not double bind same function name (aligning with inheritance behavior)
					fnNameBoundSet.add(fnName);
				}
			}
		}
		// clazz = (<any>clazz).__proto__;
		clazz = Object.getPrototypeOf(clazz);
	}

}

// only unbind docEvent and winEvent
export function unbindOnHubDecorators(this: any) {
	let clazz = this.constructor;

	// aligning with binding logic, super methods of same name is not double bound, so, not need to unbind. 
	const fnNameBoundSet = new Set<string>();

	// right now, we unbind by object namespace, so keep track of which hub was already unbound
	const unboundHubNames = new Set<string>();

	const nsObj = this._nsObj;

	while (clazz !== HTMLElement) {
		const onEvents = onHubEventByConstructor.get(clazz);
		if (onEvents) {
			for (const onEvent of onEvents) {
				const hubName = onEvent.hubName;
				const fnName = onEvent.methodName;

				if (!fnNameBoundSet.has(fnName) && !unboundHubNames.has(hubName)) {

					const h = hub(hubName);
					h.unsub(nsObj);

					// no need to double unbind hub
					unboundHubNames.add(hubName);
					// to not double bind same function name (aligning with inheritance behavior)
					fnNameBoundSet.add(fnName);
				}
			}
		}
		// clazz = (<any>clazz).__proto__;
		clazz = Object.getPrototypeOf(clazz);
	}

}