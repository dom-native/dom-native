import { off, on, OnEventListener, OnEventOptions } from './event.js';
// import { BaseHTMLElement } from './c-base';

// target === null means the instance object. 

type OnDOMEvent = {
	target: Window | Document | null, // if null, the target should be the el
	type: string,
	name: string, // function name
	selector: string | null
};

const _onEventsByConstructor: Map<Function, OnDOMEvent[]> = new Map();

// Optimization - keep the list of activable OnDomEvent[] per constructor (for on element, win, and doc)
// Note: null for "computed but nothing found"
type ComputedOnDOMEvents = {
	elOnDOMEvents: OnDOMEvent[] | null,
	docOnDOMEvents: OnDOMEvent[] | null,
	winOnDOMEvents: OnDOMEvent[] | null,
}
const _computedOnDOMEventsByConstructor = new WeakMap<Function, ComputedOnDOMEvents>();


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

// the decorator function
function _onDOMEvent(evtTarget: Window | Document | null, type: string, selector?: string) {
	// target references the element's class. It will be the constructor function for a static method or the prototype of the class for an instance member
	return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
		const fn: OnEventListener = descriptor.value;

		const clazz = target.constructor;

		// get the onEvents array for this clazz
		let onEvents = _onEventsByConstructor.get(clazz);
		if (onEvents == null) {
			onEvents = [];
			_onEventsByConstructor.set(clazz, onEvents);
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

/** Bind the element OnDOMEvent registred in the decorator _onDOMEvent  */
export function bindOnElementEventsDecorators(el: any) {
	const clazz = el.constructor;

	const computedOnDOMEvents = getComputeOnDOMEvents(clazz);

	if (computedOnDOMEvents != null) {
		const { elOnDOMEvents } = computedOnDOMEvents;
		if (elOnDOMEvents !== null) {
			const eventOpts = { ...el._nsObj, ctx: el };
			for (const onEvent of elOnDOMEvents) {
				const target = (el.shadowRoot) ? el.shadowRoot : el;
				const fn = (<any>el)[onEvent.name];
				on(target, onEvent.type, onEvent.selector, fn, eventOpts);
			}
		}
	}
}

export function bindOnParentEventsDecorators(el: any) {
	const clazz = el.constructor;

	const computedOnDOMEvents = getComputeOnDOMEvents(clazz);

	const { docOnDOMEvents, winOnDOMEvents } = computedOnDOMEvents;

	const eventOpts: OnEventOptions = { ...el._nsObj, ctx: el, silenceDisconnectedCtx: true };
	if (docOnDOMEvents !== null) {
		for (const onEvent of docOnDOMEvents) {
			const fn = (<any>el)[onEvent.name];
			on(onEvent.target, onEvent.type, onEvent.selector, fn, eventOpts);
		}
	}

	if (winOnDOMEvents !== null) {
		for (const onEvent of winOnDOMEvents) {
			const fn = (<any>el)[onEvent.name];
			on(onEvent.target, onEvent.type, onEvent.selector, fn, eventOpts);
		}
	}
}


// Return (and Compute if needed) the ComputedOnDOMEvents for a topClazz and store it in the 
// Note: At this point, the parent classes will be process but their ComputedOnDOMEvents won't be computed.
//       This could be a further optimization at some point, but not sure it will give big gain, since now this logic
//       happen only one for the first instantiation of the class type object.
function getComputeOnDOMEvents(clazz: Function): ComputedOnDOMEvents {

	const alreadyComputed = _computedOnDOMEventsByConstructor.get(clazz);
	if (alreadyComputed) {
		return alreadyComputed;
	}

	const topClazz = clazz;

	const elOnDOMEvents: OnDOMEvent[] = [];
	const docOnDOMEvents: OnDOMEvent[] = [];
	const winOnDOMEvents: OnDOMEvent[] = [];

	// keep track of the function name that were bound, to not double bind overriden parents
	// This is the intuitive behavior, aligning with inheritance behavior.
	const fnNameBoundSet = new Set<string>();

	//// Compute the ComputedOnDOMEvents
	do {
		const onEvents = _onEventsByConstructor.get(clazz);
		if (onEvents) {
			for (const onEvent of onEvents) {
				const target = onEvent.target;
				const fnName = onEvent.name;

				// to not double bind same function name (aligning with inheritance behavior)
				if (!fnNameBoundSet.has(fnName)) {
					fnNameBoundSet.add(fnName);

					if (target === window) {
						winOnDOMEvents.push(onEvent);
					} else if (target === document) {
						docOnDOMEvents.push(onEvent);
					} else {
						elOnDOMEvents.push(onEvent);
					}
				}
			}
		}

		// get the parent class
		// clazz = (<any>clazz).__proto__;
		clazz = Object.getPrototypeOf(clazz);

	} while (clazz !== HTMLElement)

	const computedOnDOMEvents: ComputedOnDOMEvents = {
		elOnDOMEvents: elOnDOMEvents.length > 0 ? elOnDOMEvents : null,
		docOnDOMEvents: docOnDOMEvents.length > 0 ? docOnDOMEvents : null,
		winOnDOMEvents: winOnDOMEvents.length > 0 ? winOnDOMEvents : null,
	}
	_computedOnDOMEventsByConstructor.set(topClazz, computedOnDOMEvents);

	return computedOnDOMEvents;
}

export function hasParentEventsDecorators(el: any) {
	const clazz = el.constructor;

	const computed = getComputeOnDOMEvents(clazz);
	return (computed.docOnDOMEvents != null || computed.winOnDOMEvents != null);
}

// only unbind docEvent and winEvent
export function unbindParentEventsDecorators(el: any) {
	const clazz = el.constructor;
	const computed = getComputeOnDOMEvents(clazz);

	if (computed.docOnDOMEvents != null) {
		off(document, el._nsObj);
	}
	if (computed.winOnDOMEvents != null) {
		off(window, el._nsObj);
	}
}