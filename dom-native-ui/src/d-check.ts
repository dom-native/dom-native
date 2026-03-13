import { customElement } from 'dom-native';
import { svgSymbolEl } from './d-ico-symbol.js';
import { BaseToggleElement } from './d-toggle.js';


/**
 * d-check custom element encapsulate a checkbox true/false component with or without label concept.
 *
 * Usage: `<d-check name="fieldA" checked></d-check>`
 * See:  http://localhost:8080/_spec/controls
 * 
 * Attributes:
 *   - See BaseFieldElement.
 *   - label
 *   - `value?`: value of the component (when checked).
 *   - `checked?`: checked states of te component.
 *   
 * Properties:
 *   - See BaseFieldElement.
 *   - `value`: If checkbox checked true or 'value' attribute if present, otherwise, if not checked false.
 *   - `checked: boolean`: reflective of Attribute.
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

@customElement("d-check")
export class DCheckElement extends BaseToggleElement {

	//#region    ---------- base-toggle implementations ---------- 
	handleClick(): void {
		this.checked = !this.checked;
	}

	renderVisualEl(): Element {
		const icoName = (this.checked) ? 'd-ico-check-on' : 'd-ico-check-off';
		return svgSymbolEl(icoName, { slot: 'visual' });
	}
	//#region    ---------- /base-toggle implementations ---------- 
}
declare global {
	interface HTMLElementTagNameMap {
		'd-check': DCheckElement;
	}
}
