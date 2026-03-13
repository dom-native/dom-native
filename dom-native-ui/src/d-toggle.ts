import { elem, first, getAttr, html, on, setAttr } from 'dom-native';
import { BaseFieldElement, DX_OPTIONS_NAMES } from './d-base-field.js';


const SHADOW_CONTENT = html`
		<slot name="label"></slot>
		<slot name="visual"></slot>
`;

/**
 * Base component for toggle like components 'd-check', 'd-radio'
 *
 * Attributes:
 *   - See BaseFieldElement.
 *   - label
 *   - `value?`: value of the component (when checked).
 *   - `checked?`: checked states of te component (on / off state of the individual element)
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

export abstract class BaseToggleElement extends BaseFieldElement {

	static get observedAttributes() { return BaseFieldElement.observedAttributes.concat(['checked']) }

	//// private elements
	protected labelEl!: HTMLElement;
	// protected ctrlEl!: HTMLElement;

	//// Properties (Attribute Reflective)
	get checked() { return this.hasAttribute('checked') }
	set checked(v: boolean) { setAttr(this, { checked: v }) }

	abstract renderVisualEl(): Element;
	abstract handleClick(): void;

	//// Property (Value)
	get value(): boolean | string | undefined {
		const attrValue = getAttr(this, 'value') as string | null;
		const checked = this.checked;

		if (checked) {
			return attrValue || true
		}
		// if not checked
		else {
			// Check if we have a unchecked-value 
			let uncheckedValue = getAttr(this, "unchecked-value");
			if (uncheckedValue) return uncheckedValue;

			// Otherwise check the dxOptions to decide if return false or undefined
			let dxOptions = this.dxOptions;
			let skipUnchecked = dxOptions?.[DX_OPTIONS_NAMES.PULL_SKIP_UNCHECKED] ?? false;
			if (skipUnchecked) {
				return undefined;
			} else {
				return false;
			}
		}
	}
	set value(v: boolean | string | undefined) {
		if (v === undefined) {
			return;
		}
		// if it is a boolean, then, just pass the value
		if (typeof v === 'boolean') {
			this.checked = v;
		}
		// otherwise, we assume we have attr
		else {
			const attrValue = getAttr(this, 'value');
			if (attrValue) {
				this.checked = (attrValue === v);
			}
			// Should not be in this state, we log for the component user to fix issue.
			else {
				console.log(`Warning - d-check - Tries to set a non boolean value '${v}' to checkElement.value which do not have a attribute value to match with. Skipping. `);
			}
		}
	}

	constructor() {
		super();

		const shadow = this.attachShadow({ mode: 'open' });
		shadow.append(SHADOW_CONTENT.cloneNode(true));
	}


	//#region    ---------- Lifecycle ---------- 
	// Component initialization (will be called once by BaseHTMLElement on first connectedCallback)
	init() {
		super.init();

		// The switch element have their on tabindex (as they do not wrap any native control)
		this.setAttribute('tabindex', '0');

		const label = getAttr(this, 'label');
		if (label != null) { // empty string will create an empty label
			let labelEl = elem('label', { slot: 'label', $: { textContent: label } });
			this.appendChild(labelEl);
		}

		this.appendChild(this.renderVisualEl());

		//// Bind internal component events
		on(this, 'pointerup', (evt) => {
			// handle click only if not disabled or not readonly
			// NOTE: JS logic can still change .checked property
			if (!this.disabled && !this.readonly) {
				this.handleClick();
			}
		});
	}

	attributeChangedCallback(name: string, oldVal: any, newVal: any) {
		super.attributeChangedCallback(name, oldVal, newVal); // always

		if (this.initialized) {
			switch (name) {
				case 'checked':
					if (oldVal !== newVal) {
						const visualEl = this.renderVisualEl();
						// If the renderer does not render something, means no need to update
						if (visualEl) {
							first(this, '[slot="visual"]')?.remove();
							this.appendChild(visualEl);
						}
						this.triggerChange();
					}
					break;
			}
		}

	}
	//#endregion ---------- /Lifecycle ---------- 

}
