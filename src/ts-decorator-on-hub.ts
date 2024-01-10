import type { BaseHTMLElement } from './c-base.js';
import { hub } from './hub.js';

type OnHubEvent = { methodName: string, hubName: string, topic: string, label?: string };

type OnHubEventByFnName = Map<string, OnHubEvent>;
const _onHubEventsByConstructor: Map<Function, OnHubEventByFnName> = new Map();

type ComputedOnHubEvents = OnHubEvent[] | null;
const _computedOnHubEventByConstructor = new WeakMap<Function, ComputedOnHubEvents>();

const _methodAlreadyProcessed = new Set<Function>();


//#region    ---------- Public onEvent Decorator ---------- 
/**
 * `onHub` decorator to bind a hub event to this instance.
 */
export function onHub(hubName: string, topic: string, label?: string) {

	return function (originalMethod: any, context: ClassMethodDecoratorContext) {

		context.addInitializer(function () {

			// Note:
			//  We only get the class at this stage.
			//  The instance class (clazz below) will always be the leaf class.
			//  But the originalMethod will be the function at the right class hierarchy
			//  So, we can just have a global _methodAlreadyProcess Set to check if already processed. 
			if (_methodAlreadyProcessed.has(originalMethod)) {
				return;
			} else {
				_methodAlreadyProcessed.add(originalMethod);
			}

			// This will also be the instance class.
			const clazz: any = (this as any).constructor;

			// Method name
			let methodName = context.name as string;

			// get the onEvents array for this clazz
			let onEventByFnNameForClazz = _onHubEventsByConstructor.get(clazz);
			if (onEventByFnNameForClazz == null) {
				onEventByFnNameForClazz = new Map();
				_onHubEventsByConstructor.set(clazz, onEventByFnNameForClazz);
			}

			// create and push the event
			const onEvent: OnHubEvent = {
				methodName,
				hubName,
				topic,
				label
			};

			// Note: 
			//  The order of decorator method initializers is from the base method first, then progressing to the leaf.
			//  So, this will override the onEvent for the methodName and will be the leaf onEvent,
			//  as expected.
			onEventByFnNameForClazz.set(methodName, onEvent);

			// Note:
			//   We still employ the _onHubEventByConstructor trick to delay event registration,
			//   So that we can NOT registered base methods. 
		})


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
		const onHubEventByFnName = _onHubEventsByConstructor.get(clazz);
		if (onHubEventByFnName) {
			const onEvents = Array.from(onHubEventByFnName.values());
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