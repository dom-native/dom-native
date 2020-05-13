// (c) 2019 BriteSnow, inc - This code is licensed under MIT license (see LICENSE for details)

import { bindOnEvents, off, OnListenerBySelector } from './event';
import { bindHubEvents, HubBindings, unbindHubEvents } from './hub';
import { bindOnEventsDecorators, unbindOnEventsDecorators } from './ts-decorator-on-event';
import { bindOnHubDecorators, unbindOnHubDecorators } from './ts-decorator-on-hub';

// component unique sequence number to allow to have cheap UID for each component
let c_seq = 0;

/**
 * BaseHTMLElement that all custom elements from this application should inherit from. 
 * 
 * SubClass Usage:
 *   - `init()` to create/modify the innerHTML/children, bind events. Must call `super.init()`
 *   - `this.uid` is the unique id for this component instance, so, can use to bind parent element events for later cleanup.
 *   - `disconnectedCallback()` to unbind any events bound to the parent of the component (document event binding). Must call `super.disconnectedCallback()`
 * 
 * Important: 
 *   - SubClass should/must override `init()` but never call `init()` from anywhere. Only `BaseHTMLElement.connectedCallback()` implementation should call `init()`
 *   - All calls to custom element interface `disconnectedCallback()` `connectedCallback()` `attributeChangedCallback()` MUST call their `super...` method.
 * 
 */
export abstract class BaseHTMLElement extends HTMLElement {
	// unique sequenceId number for each instance. 
	readonly uid: string;
	protected readonly _nsObj: { ns: string };

	events?: OnListenerBySelector;

	docEvents?: OnListenerBySelector;

	winEvents?: OnListenerBySelector;

	hubEvents?: HubBindings;

	/** called in the first requestAnimationFrame (i.e., before the very first paint) */
	preDisplay?(): void;

	/** called in the after the first paint (i.e., requestAnimationFrame(requestAnimationFrame(..))) */
	postDisplay?(): void;

	private _init = false;
	protected get initialized() { return this._init }

	constructor() {
		super();
		this.uid = 'c_uid_' + c_seq++;
		this._nsObj = { ns: this.uid };
	}

	/** 
	 * Method to override to create child elements. Will be called only once by the BaseHTMLElement `connectedCallback()` implementation.
	 * 
	 * - Best Pratice: call `super.init()` when overriden. 
	 * - DO NOT call this method, this is called by BaseHTMLElement internal. 
	 * 
	 */
	init(): void { }

	/**
	 * Base implementation of `connectedCallback` that will call `this.init()` once. 
	 * 
	 * - MUST call `super.connectedCallback()` when overriden. 
	 */
	connectedCallback() {
		// TODO: Needs to handle the case where a DOM node is reattached from an events points of view. 

		if (!this._init) {
			// bind the this.events, this.docEvents, this.winEvents, this.hubEvents
			bindComponentEvents.call(this);

			// bind the @on... decorated methods
			bindOnEventsDecorators.call(this);
			bindOnHubDecorators.call(this);

			this.init();
			this._init = true;
		}

		// On each connectedCallback, when attached to the DOM, we call the eventual pre and post display methods. 
		if (this.preDisplay) {
			requestAnimationFrame(() => { this.preDisplay!() });
		}
		if (this.postDisplay) {
			requestAnimationFrame(() => { requestAnimationFrame(() => { this.postDisplay!() }) })
		}
	}

	/**
	 * Empty implementation to allow `super.disconnectedCallback()` best practices on sub classes
	 */
	disconnectedCallback() {
		// TODO: Needs to handle the case where a DOM node is reattached.
		// Event on this does not need to be removed (browser will take care of those, need to understand if they persist). 
		if (this.docEvents) {
			off(document, this._nsObj);
		}
		if (this.winEvents) {
			off(window, this._nsObj);
		}
		if (this.hubEvents) {
			unbindHubEvents(this.hubEvents, this._nsObj);
		}

		// unbind the @onDoc, @onWin
		unbindOnEventsDecorators.call(this);
		unbindOnHubDecorators.call(this);
	}

	/**
	 * Empty implement to allow `super.` best practices on sub classes.
	 */
	attributeChangedCallback(attrName: string, oldVal: any, newVal: any) { }

}

export function addDOMEvents(target: OnListenerBySelector | undefined, source: OnListenerBySelector): OnListenerBySelector {
	return Object.assign(target || {}, source);
}

export function addHubEvents(target: HubBindings | undefined, source: HubBindings) {
	const t: HubBindings = (target == null) ? [] : (target instanceof Array) ? target : [target];
	(source instanceof Array) ? t.push(...source) : t.push(source);
	return t;
}
//// Private utils

function bindComponentEvents(this: BaseHTMLElement) {
	// Note: ctx is to make sure the context of the function will be this object. 
	//       If arrow function, this won't have any effect but will be the expected behavior.
	const opts = { ns: this._nsObj.ns, ctx: this };
	if (this.events) {
		bindOnEvents(this, this.events, opts);
	}
	if (this.docEvents) {
		bindOnEvents(document, this.docEvents, opts);
	}
	if (this.winEvents) {
		bindOnEvents(window, this.winEvents, opts);
	}
	if (this.hubEvents) {
		bindHubEvents(this.hubEvents, opts)
	}
}