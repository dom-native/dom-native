import { adoptStyleSheets, all, css, customElement, setAttr } from 'dom-native';
import { svgSymbolEl } from './d-ico-symbol.js';
import { BaseToggleElement } from './d-toggle.js';

const _shadow_css = css`

	::slotted(svg.symbol) {
		fill: var(--d-field-choice-bdr);
	}
	
	.d-ipt{
		width: 1.5rem;
		height: 1.5rem;
	}

	.d-ipt svg.symbol {
		fill: var(--d-field-choice-bdr);
	}

	:host([checked]) ::slotted(svg.symbol) {
		fill: var(--d-field-choice-bdr-on);
	}

`;

/**
 * d-radio custom element encapsulate a checkbox true/false component with or without label concept.
 *
 * Usage: `<d-radio name="fieldA" value="val-1" checked></d-radio><d-radio name="fieldA" value="val-2" checked></d-radio>`
 * See:  https://ui.mvdom.io/#spec-d-radio
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

@customElement("d-radio")
export class DRadioElement extends BaseToggleElement {
	// allow to have only the first checked prop change managing the group
	ignoreGroup = false;

	get checked() { return this.hasAttribute('checked') }
	set checked(v: boolean) {
		if (!this.ignoreGroup) {
			const container = this.parentElement;
			if (container) {
				const radios = all(container, `d-radio[name=${this.name}]`) as DRadioElement[];
				for (const radio of radios) {
					if (radio != this && radio.checked) {
						radio.ignoreGroup = true;
						radio.checked = false;
						radio.ignoreGroup = false;
					}
				}
			}
		}

		setAttr(this, { checked: v });
	}


	get value() {
		if (this.checked) {
			return super.value;
		} else {
			return undefined;
		}
	}
	set value(v: any) { super.value = v };


	constructor() {
		super();
		adoptStyleSheets(this, _shadow_css);
	}


	//#region    ---------- base-toggle implementations ---------- 
	renderVisualEl(): Element {
		const icoName = (this.checked) ? 'd-ico-radio-on' : 'd-ico-radio-off';
		return svgSymbolEl(icoName, { slot: 'visual' });
	}

	handleClick(): void {
		// NOTE: For radio button, we change only if not checked already. 
		//       Can't uncheck a radio from click other than clicking of another radio with same name.
		if (!this.checked) {
			this.checked = !this.checked;
		}
	}
	//#endregion ---------- /base-toggle implementations ---------- 
}
declare global {
	interface HTMLElementTagNameMap {
		'd-radio': DRadioElement;
	}
}