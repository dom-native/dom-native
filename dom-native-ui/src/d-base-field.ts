
// Making sure the ts helper for decorator is set
import { BaseHTMLElement, className, getAttr, on, puller, pusher, setAttr, trigger } from 'dom-native';

export const DX_OPTIONS_NAMES = {
	PULL_SKIP_UNCHECKED: "pull_skip_unchecked"
}


/**
 * Base component for any Field base custom component that provide a `.value` `.name` interface.
 * This will also automatically set the component as css class `dx` if it has a name,
 * so that by default they pushed/pulled by `mvdom push/pull` system.
 *
 * Attributes:
 *   - `readonly?`: set the component as readonly.
 *   - `disabled?`: set the component as disabled.
 *   - `name?`: reflective of 'name' property. If absent, `.no-name` css class.
 *   - `label?`: if absent, this css `.no-label` will be set.
 *   - `value?`: this is the initial value of the component. TODO: needs to unify when no value (right now .empty for input, .no-value for c-select)
 *   - `placeholder?`: placeholder text.
 *   - `autofocus?`: will do a focus on requestAnimationFrame (later might add timeout when attribute has numeric value)
 *
 * Properties:
 *   - `readonly: boolean`: reflective of attribute.
 * 	 - `disabled: boolean`: reflective of attribute.
 *   - `noValue: boolean`: reflective of css `no-value`.
 *   - `name?: string`: reflective of attribute.
 *   - `placeholder?: string`: reflective of attribute.
 *   - `label?: string`: Manged by subClass. (reflection up to subclasss).
 *   - `value?: any`: Managed by subClass. (reflection up to subclasss).
 *   - `noValue: boolean`: reflective of CSS Attribute `.no-label`.
 *
 * CSS:
 *  - `.no-value` when the field has no value (for now, managed by sub class)
 *  - `.no-label` when the field has no label.
 *  - `.dx` will be added when field component has a name.
 *
 * Content:
 *  - (subclass dependent)
 *
 * Events:
 *   - `CHANGE` Sub Class call `triggerChange()` which will trigger a `evt.detail: {name: string, value: string}`.
 *
 * Sub class MUST:
 *   - Sub classes MUST call `super.init()` in their `init()` implementation.
 *   - Manage value property
 *
 */
export abstract class BaseFieldElement extends BaseHTMLElement {


	private _eventReady = false;
	/**
	 * Determine if this field is event ready (can fire CHANGE and such events)
	 * This is next nextFrame of init so that does not trigger uncessary CHANGE event on DOM setup
	 */
	protected get eventReady() { return this._eventReady }

	static get observedAttributes(): string[] { return ['disabled', 'readonly', 'placeholder', 'ico-lead']; }

	//// Properties (Attribute Reflective)
	get readonly(): boolean { return this.hasAttribute('readonly') }
	set readonly(v: boolean) { setAttr(this, 'readonly', (v) ? '' : null) }

	get disabled(): boolean { return this.hasAttribute('disabled') }
	set disabled(v: boolean) { setAttr(this, 'disabled', (v) ? '' : null) }

	get dFocus(): boolean { return this.classList.contains('d-focus') }
	set dFocus(v: boolean) { className(this, { 'd-focus': v }) }

	get name() { return getAttr(this, 'name') }
	set name(v: string | null) { setAttr(this, 'name', v) }

	get placeholder() { return getAttr(this, 'placeholder') }
	set placeholder(v: string | null) { setAttr(this, 'placeholder', v) }

	get iconLead() { return getAttr(this, 'icon-lead') }

	get iconTrail() { return getAttr(this, 'icon-trail') }

	// Note: Making the return object type a little bit more flexible, as might be more data later.
	get dxOptions(): null | { [key: string]: any } {
		let [dx, dataDx] = getAttr(this, 'dx', 'data-dx');
		let dxStr = dx || dataDx;
		if (!dxStr) return null;
		let obj = dxStr.split(',').reduce((acc: any, item) => {
			acc[item] = true;
			return acc;
		}, {});
		return obj;
	}

	//// Properties (CSS Reflective)
	get noValue() { return this.classList.contains('no-value') }
	set noValue(v: boolean) { className(this, { 'no-value': v }) }

	//// Property (Value)
	abstract get value(): any
	abstract set value(val: any)

	//#region    ---------- Lifecycle ----------
	init() {
		super.init(); // best practice, even if it in this case, the parent.init() is blank.

		this.classList.add('d-field');

		// for now until @onEvents supports :host - @onEvent('focusin, focusout', ':host')
		on(this, 'focusin, focusout', evt => {
			switch (evt.type) {
				case 'focusin':
					this.dFocus = true;
					break;
				case 'focusout':
					this.dFocus = false;
					break;
			}
		})

		const [name, label] = getAttr(this, 'name', 'label');

		if (!label) {
			this.classList.add('no-label');
		}

		// by default if we have a 'name' attribute we add
		//   - The '.dx' to allow seamless mvdom push/pull
		//   - The '.c-field' which specifies that this component has name/value so that
		//     we can use the same `mvdom` pusher/puller for all
		if (name && name.length > 0) {
			this.classList.add('dx');
		}


		requestAnimationFrame(() => {
			this._eventReady = true;
		});

		let autofocus = getAttr(this, "autofocus");
		if (autofocus != null) {
			requestAnimationFrame(() => {
				this.focus();
			});
		}

	}


	// Called when an observed attribute has been added, removed, updated, or replaced
	attributeChangedCallback(attrName: string, oldVal: any, newVal: any) {

		switch (attrName) {
			case 'readonly':
				break;
			case 'disabled':
				break;
		}
	}
	//#endregion ---------- /Lifecycle ----------


	triggerChange() {
		// Will trigger only if the component has been initialized and event ready
		if (this.initialized && this.eventReady) {
			const value = this.value;
			const name = this.name;
			trigger(this, "CHANGE", { detail: { name, value } });
		}
	}

	triggerCancel() {
		// Will trigger only if the component has been initialized and event ready
		if (this.initialized && this.eventReady) {
			const value = this.value;
			const name = this.name;
			trigger(this, "CANCEL", { detail: { name, value } });
		}
	}

}


//#region    ---------- Register mvdom dx ----------
pusher('.d-field', function (this: BaseFieldElement, val: any) {
	this.value = val;
});
puller('.d-field', function (this: BaseFieldElement) {
	return this.value;
});
//#endregion ---------- /Register mvdom dx ----------