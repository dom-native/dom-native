import { off, on, OnEventListener, OnEventOptions } from './event.js';
// import { BaseHTMLElement } from './c-base';

// target === null means the instance object. 
type OnDOMEventOptions = {
	passive?: boolean, // default false
	capture?: boolean, // default false
	/** 
	 * If true, event will be bound at next frame 
	 * (i.e., requestAnimationFrame) 
	 * Default false
	 **/
	nextFrame?: boolean,
}

type OnDOMEvent = {
	target: Window | Document | null, // if null, the target should be the el
	type: string,
	name: string, // function name
	selector: string | null,
	opts?: OnDOMEventOptions
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
export function onEvent(type: string, selector_or_opts?: string | OnDOMEventOptions, opts?: OnDOMEventOptions) {
	return _onDOMEvent(null, type, selector_or_opts, opts);
}
export function onDoc(type: string, selector_or_opts?: string | OnDOMEventOptions, opts?: OnDOMEventOptions) {
	return _onDOMEvent(document, type, selector_or_opts, opts);
}
export function onWin(type: string, selector_or_opts?: string | OnDOMEventOptions, opts?: OnDOMEventOptions) {
	return _onDOMEvent(window, type, selector_or_opts, opts);
}
//#endregion ---------- /Public onEvent Decorator ---------- 

// the decorator function
function _onDOMEvent(evtTarget: Window | Document | null, type: string, selector_or_opts?: string | OnDOMEventOptions, opts?: OnDOMEventOptions) {
	let selector = (typeof selector_or_opts == 'string') ? selector_or_opts : null;
	opts = (selector === null) ? selector_or_opts as OnDOMEventOptions | undefined : opts;

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
			selector: selector,
			opts
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
				_bindOn(target, onEvent, fn, eventOpts);
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
			_bindOn(onEvent.target!, onEvent, fn, eventOpts);
		}
	}

	if (winOnDOMEvents !== null) {
		for (const onEvent of winOnDOMEvents) {
			const fn = (<any>el)[onEvent.name];
			_bindOn(onEvent.target!, onEvent, fn, eventOpts);
		}
	}
}

// Private bindOn. Here the target should be resolved before, won't take the onEvent.target
function _bindOn(target: Document | Window | Element, onEvent: OnDOMEvent, fn: any, baseEventOpts: OnEventOptions) {
	let opts = baseEventOpts;
	if (onEvent.opts) {
		opts = { ...baseEventOpts, ...onEvent.opts };
	}
	on(target, onEvent.type, onEvent.selector, fn, opts);
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

	// Keep track of the `function_name` already bound by children classes to avoid double bind for the name function name.
	// This is the intuitive behavior, aligning with inheritance behavior.
	// This works because we are walking the hierarchy tree from child to parent.
	const childrenBoundFnNames = new Set<string>();

	// --- Compute the ComputedOnDOMEvents
	do {
		const onEvents = _onEventsByConstructor.get(clazz);
		if (onEvents) {
			const clazzBoundFnNames = new Set<string>();

			for (const onEvent of onEvents) {
				const target = onEvent.target;
				const fnName = onEvent.name;

				// bind only if this function name was not already bound by a children
				if (!childrenBoundFnNames.has(fnName)) {
					// get the appropriate onDOMEvents list to push this event given the target
					let onDOMEvents;
					if (target === window) {
						onDOMEvents = winOnDOMEvents;
					} else if (target === document) {
						onDOMEvents = docOnDOMEvents;
					} else {
						onDOMEvents = elOnDOMEvents;
					}

					onDOMEvents.push(onEvent);

					// add the name to this class boundFnNames to be added to the childrenBoundFnNames later
					clazzBoundFnNames.add(fnName);
				}

			} // for onEvent of onEvents

			// add this class bound fnNames to the childrenBoudFnNames for next parent class resolution
			for (const fnName of clazzBoundFnNames) {
				childrenBoundFnNames.add(fnName);
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