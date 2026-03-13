import { all, customElement, first, getAttr, on } from 'dom-native';
import { BaseFieldElement } from './d-base-field.js';

/**
 * COMPONENT NOT SUPPORTED YET. Just placeholder code. 
 * 
 * d-options custom element encapsulate a label/input field group ()`c-input > label, input`) structure.
 * component styles are global but scoped via css naming (see c-input.pcss).
 *
 * Usage: `<d-options name="state" options="1:Open, 0:Close, 2 : Both" value="0"></d-options>`
 * See:  http://localhost:8080/_spec/controls
 * 
 * Attributes:
 *   - See BaseFieldElement.
 *   - `value?`: See BaseFieldElement. String matching the "value" part of value. TODO: need to make reflective.
 *   - `options`: possible options with format [value: label, value: label] (0: cat, 1: dog). 
 *             'value' act as a key, can be be any string (value and label will be trimmed)
 *             e.g., options='0: cat, 1: dog, 2: lion'
 * 
 * Properties:
 *   - See BaseFieldElement.
 *   - `value`: Return the current value selected ('0' or '1' or '2' from the above example)
 * 
 * CSS:
 *   - See BaseFieldElement.
 * 
 * Content:
 *   - TBD
 * 
 * Events:
 *   - `CHANGE` see BaseFieldElement.
 */

@customElement('d-options')
export class DOptionElement extends BaseFieldElement {

	//// Poperty (Value)
	get value(): string | null {
		const selEl = first(this, '.d-ipt > div.sel');
		return (selEl) ? selEl.getAttribute('data-val') : null;
	}

	set value(val: string | null) {
		// stringify
		val = (typeof val !== 'string' && val != null) ? '' + val : val;
		const old = this.value;

		const items = all(this, '.d-ipt > div');

		for (const item of items) {

			if (item.getAttribute('data-val') === val) {
				item.classList.add('sel');
			} else {
				item.classList.remove('sel');
			}
		}

		if (val !== old) {
			this.triggerChange();
		}
	}

	//#region    ---------- Lifecycle ---------- 
	// Component initialization (will be called once by BaseHTMLElement on first connectedCallback)
	init() {
		super.init();

		const [options, value] = getAttr(this, 'options', 'value');

		//// Build the component HTML
		let html = '<div class="d-ipt">';
		if (options) {
			for (const line of options.split(',')) {
				let [val, label] = line.split(':');
				val = val.trim();
				label = label.trim();
				const sel = (value == val) ? 'sel' : '';
				html += `  <div class="${sel}" data-val="${val}">${label}</div>\n`;
			}
			html += '</div>';
			this.innerHTML = html;
		}

		//// Bind the internal component events
		on(this, 'click', '.d-ipt > div', (evt) => {
			const clickedItem = evt.selectTarget;
			const val = clickedItem.getAttribute('data-val');
			this.value = val;
			this.triggerChange();
		});
	}
	//#endregion ---------- /Lifecycle ---------- 

}
declare global {
	interface HTMLElementTagNameMap {
		'd-option': DOptionElement;
	}
}