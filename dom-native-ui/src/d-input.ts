import { adoptStyleSheets, css, customElement, elem, getAttr } from 'dom-native';
import { BaseInputElement } from './d-base-input.js';

const _base_input_css = css`
	:host input, textarea {
		-webkit-appearance: none;
		-moz-appearance: none;
		padding-left: 0;
		padding-right: 0;		
	}
`;

/**
 * d-input custom element encapsulate a label/input field group ()`d-input > label, input`) structure. 
 * component styles are global but scoped via css naming (see d-input.pcss). 
 * 
 * Usage: `<d-input name="fieldNameA" value="value A"></d-input>`
 * See:  http://localhost:8080/_spec/controls
 * 
 * Attributes: 
 *   - See BaseFieldElement.
 *   - `password?`: set input as password
 * 
 * 
 * Properties: 
 *   - See BaseFieldElement.
 *   - `password: boolean`: reflective of attribute.
 * 
 * CSS:
 *   - See BaseFieldElement.
 * 
 * Parts:
 *   - label: The label element
 * 	 - label-trail: The eventual label trail element
 *   - text-trail: The eventual text trail element
 *   - ctrl: The control element (the html input element in this case)
 *   - icon-lead: The eventual icon lead element
 * 	 - icon-trail: The eventual icond trail lelement
 * 
 * Events:
 *   - `CHANGE` see BaseFieldElement.
 * 
 */
@customElement("d-input")
export class DInputElement extends BaseInputElement {
	declare ctrlEl: HTMLInputElement

	static get observedAttributes() { return BaseInputElement.observedAttributes.concat(['password']) }

	get value() {
		return this.ctrlEl.value;
	};
	set value(val: any) { // today takes any, will get parsed by standard html input element .value
		const old = this.ctrlEl.value;

		// set the value. Note that if the UI call this setter, will always be ===
		if (val !== old) {
			this.ctrlEl.value = val;
		}

		// get the value from input so that we use the html input parsing behavior
		const newVal = this.value;

		// update the empty state
		this.noValue = (!(newVal && newVal.length > 0));

		// Note: If the UI call this setter, will always be input value old/new will be always equals.
		//       however, it if is programmatic call, it might be different. so for now, we have to always trigger it. 
		//       TODO: need to find a way to trigger only on change.
		this.triggerChange();
	};

	constructor() {
		super();
		adoptStyleSheets(this, [_base_input_css]);
	}

	init() {
		super.init();
	}

	//#region    ---------- BaseInput Implementations ---------- 
	createCtrlEl(): HTMLInputElement {
		const type = this.hasAttribute('password') ? 'password' : 'text';
		return elem('input', { type });
	}

	getInitialValue() {
		return getAttr(this, 'value');
	}
	//#endregion ---------- /BaseInput Implementations ---------- 

}
declare global {
	interface HTMLElementTagNameMap {
		'd-input': DInputElement;
	}
}
