// (c) 2019 BriteSnow, inc - This code is licensed under MIT license (see LICENSE for details)

import { bindOnEvents, off, OnListenerBySelector } from './event.js';
import { bindHubEvents, HubBindings, unbindHubEvents } from './hub.js';
import { bindOnElementEventsDecorators, bindOnParentEventsDecorators, hasParentEventsDecorators, unbindParentEventsDecorators } from './ts-decorator-on-event.js';
import { bindOnHubDecorators, hasHubEventDecorators, unbindOnHubDecorators } from './ts-decorator-on-hub.js';

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

	// lifecyle _init state
	private _init = false;
	// lifecycle internal state (to avoid double un/bindings)
	private _has_parent_events: boolean | undefined; // when undefined, needs to be determined
	private _parent_bindings_done = false;
	private _parent_unbindings_planned = false;
	private _hub_bindings_done = false;
	private _preDisplay_attached = false;
	private _postDisplay_attached = false;


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
		const opts = { ns: this._nsObj.ns, ctx: this };

		if (this._has_parent_events == null) {
			this._has_parent_events = this.docEvents != null || this.winEvents != null || hasParentEventsDecorators(this);
		}

		//// Bind the eventual parent events (document, windows)
		// Note: Parent events are silenced on when el is diconnected, and unbound when next frame still diconnected
		if (this._has_parent_events && !this._parent_bindings_done) {
			// bind the @docDoc event
			if (this.docEvents) bindOnEvents(document, this.docEvents, { ...opts, silenceDisconnectedCtx: true });
			// bind the @docWin event
			if (this.winEvents) bindOnEvents(window, this.winEvents, { ...opts, silenceDisconnectedCtx: true });
			bindOnParentEventsDecorators(this);
			this._parent_bindings_done = true;
		}



		//// Bind the hub if not already done
		// Note: Hub events are bound and unbound on each connect and disconnect. 
		//       (could use the parent event optimation later)
		if (!this._hub_bindings_done) {
			if (this.hubEvents) bindHubEvents(this.hubEvents, opts)
			bindOnHubDecorators.call(this);
			this._hub_bindings_done = true;
		}

		//// Peform the init
		if (!this._init) {

			if (this.events) bindOnEvents(this, this.events, opts);

			// bind the @onEvent decorated methods
			bindOnElementEventsDecorators(this);


			this.init();
			this._init = true;
		}

		//// Register the eventuall preDisplay / postDisplay
		// Note: Guard to prevent double registration on successivel connected/disconnected in the same render loop

		if (this.preDisplay && this._preDisplay_attached == false) {
			this._preDisplay_attached = true;
			requestAnimationFrame(() => {
				this.preDisplay!();
				this._preDisplay_attached = false;
			});
		}


		if (this.postDisplay && this._postDisplay_attached == false) {
			this._postDisplay_attached = true;
			requestAnimationFrame(() => {
				requestAnimationFrame(() => {
					this.postDisplay!();
					this._postDisplay_attached = false;
				})
			})
		}
	}

	/**
	 * Empty implementation to allow `super.disconnectedCallback()` best practices on sub classes
	 */
	disconnectedCallback() {

		// NOTE: Here we detached
		if (this._has_parent_events === true) {
			requestAnimationFrame(() => {
				if (!this.isConnected) {
					if (this.docEvents) {
						off(document, this._nsObj);
					}
					if (this.winEvents) {
						off(window, this._nsObj);
					}
					unbindParentEventsDecorators(this);
					this._parent_bindings_done = false;
				}
			});
		}

		if (this.hubEvents || hasHubEventDecorators(this)) {
			if (this.hubEvents != null) {
				unbindHubEvents(this.hubEvents, this._nsObj);
			}

			unbindOnHubDecorators.call(this);
			this._hub_bindings_done = false;
		}

	}

}

export function addDOMEvents(target: OnListenerBySelector | undefined, source: OnListenerBySelector): OnListenerBySelector {
	return Object.assign(target || {}, source);
}

export function addHubEvents(target: HubBindings | undefined, source: HubBindings) {
	const t: HubBindings = (target == null) ? [] : (target instanceof Array) ? target : [target];
	(source instanceof Array) ? t.push(...source) : t.push(source);
	return t;
}



