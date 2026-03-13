import { customElement, elem, getAttr } from 'dom-native';
import { BaseInputElement } from './d-base-input.js';


/**
 * d-text custom element encapsulate a label/input field group ()`d-text > label, input`) structure. 
 * component styles are global but scoped via css naming (see d-text.pcss). 
 * 
 * Usage: `<d-text name="fieldNameA" value="value A"></d-text>`
 * See:  http://localhost:8080/_spec/controls
 * 
 * Attributes: 
 *   - See BaseFieldElement.
 *   - `password?`: set input as password
 * 
 * Properties: 
 *   - See BaseFieldElement.
 *   - `password: boolean`: reflective of attribute.
 * 
 * CSS:
 *   - See BaseFieldElement.
 * 
 * Content:
 *   - none
 * 
 * Events:
 *   - `CHANGE` see BaseFieldElement.
 * 
 */
@customElement("d-textarea")
export class DTextareaElement extends BaseInputElement {
	declare ctrlEl: HTMLTextAreaElement

	//// Property (Value)
	get value() { return this.ctrlEl.value };
	set value(val: any) { // today takes any, will get parsed by standard html input element .value

		const old = this.value;

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


	//#region    ---------- BaseInput Implementations ---------- 
	createCtrlEl(): HTMLTextAreaElement {
		// Build the component HTML
		return elem('textarea');
	}

	getInitialValue() {

		// --- First try to get it from the d-textarea content (first text node)
		for (let el of this.childNodes) {
			if (el.nodeType == Node.TEXT_NODE) {
				const content = el.textContent;
				// return only if the trim is not empty (but return the full value)
				if (content && content.trim().length > 0) {
					return content;
				}
			}
		}
		// otherwise, return the attribute value name "value" (could be null, which will be a no value)
		return getAttr(this, 'value');
	}
	//#endregion ---------- /BaseInput Implementations ----------
}

declare global {
	interface HTMLElementTagNameMap {
		'd-textarea': DTextareaElement;
	}
}