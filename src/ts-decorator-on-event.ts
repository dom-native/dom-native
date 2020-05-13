import { off, on, OnEventListener } from './event';
// import { BaseHTMLElement } from './c-base';

// target === null means the instance object. 

type OnDOMEvent = { target: Window | Document | null, name: string, type: string, selector: string | null };

const onEventsByConstructor: Map<Function, OnDOMEvent[]> = new Map();

// Keep track of which leaf Constructor has windows event
// NOTE: this has to be initialize at the  bindOnDecorators phase, because at the _onDOMEvent, we do not know all the class inheritance yet.
// The good news is that it has to be done once. So, undefined means not sure, true, means there is at least once, and false means we already looked and nothing. 
const hasOnWinEvent: Map<Function, boolean> = new Map();
const hasOnDocEvent: Map<Function, boolean> = new Map();

//#region    ---------- Public onEvent Decorator ---------- 
export function onEvent(type: string, selector?: string) {
	return _onDOMEvent(null, type, selector);
}
export function onDoc(type: string, selector?: string) {
	return _onDOMEvent(document, type, selector);
}
export function onWin(type: string, selector?: string) {
	return _onDOMEvent(window, type, selector);
}
//#endregion ---------- /Public onEvent Decorator ---------- 

function _onDOMEvent(evtTarget: Window | Document | null, type: string, selector?: string) {
	// target references the element's class. It will be the constructor function for a static method or the prototype of the class for an instance member
	return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
		const fn: OnEventListener = descriptor.value;

		const clazz = target.constructor;

		// get the onEvents array for this clazz
		let onEvents = onEventsByConstructor.get(clazz);
		if (onEvents == null) {
			onEvents = [];
			onEventsByConstructor.set(clazz, onEvents);
		}

		// create and push the event
		const onEvent: OnDOMEvent = {
			target: evtTarget,
			name: propertyKey,
			type: type,
			selector: selector || null
		};
		onEvents.push(onEvent);

	}
}

// For BaseHTMLElement
export function bindOnEventsDecorators(this: any) {
	let clazz = this.constructor;
	const topClazz = clazz;

	// Determine if we need to set if this class has a doc or win event (this allow to do it only once per leaf class)
	let setHasDocEvent = !hasOnDocEvent.has(topClazz);
	let setHasWinEvent = !hasOnWinEvent.has(topClazz);


	// keep track of the function name that were bound, to not double bind overriden parents
	// This is the intuitive behavior, aligning with inheritance behavior.
	const fnNameBoundSet = new Set<string>();

	const opts = { ...this._nsObj, ctx: this };

	while (clazz !== HTMLElement) {
		const onEvents = onEventsByConstructor.get(clazz);
		if (onEvents) {
			for (const onEvent of onEvents) {
				const fnName = onEvent.name;
				if (!fnNameBoundSet.has(fnName)) {
					const fn = (<any>this)[fnName];

					if (setHasDocEvent && onEvent.target === document) {
						hasOnDocEvent.set(topClazz, true);
						setHasDocEvent = false;
					}
					if (setHasWinEvent && onEvent.target === window) {
						hasOnWinEvent.set(topClazz, true);
						setHasWinEvent = false;
					}
					const target = onEvent.target || this;
					on(target, onEvent.type, onEvent.selector, fn, opts);


					// to not double bind same function name (aligning with inheritance behavior)
					fnNameBoundSet.add(fnName);
				}
			}
		}
		// clazz = (<any>clazz).__proto__;
		clazz = Object.getPrototypeOf(clazz);
	}

	//// set the hasWinEvent and hasDocEvent to false if they have not been set yet but should be. 
	if (setHasDocEvent) {
		hasOnDocEvent.set(topClazz, false);
	}
	if (setHasWinEvent) {
		hasOnWinEvent.set(topClazz, false);
	}

}

// only unbind docEvent and winEvent
export function unbindOnEventsDecorators(this: any) {
	const clazz = this.constructor;

	if (hasOnDocEvent.get(clazz)) {
		off(document, this._nsObj);
	}
	if (hasOnWinEvent.get(clazz)) {
		off(window, this._nsObj);
	}
}