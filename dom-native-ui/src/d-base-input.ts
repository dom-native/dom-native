import { elem, getAttr, html, on, setAttr } from 'dom-native';
import { BaseFieldElement } from './d-base-field.js';
import { svgSymbolEl } from './d-ico-symbol.js';

const SHADOW_CONTENT = html`
	<slot name="icon-lead"></slot>
	<slot name="icon-trail"></slot>
	<slot name="label"></slot>
	<slot name="label-trail"></slot>
	<slot name="text-trail"></slot>
	<div class="box" part="box"></div>
`;

/**
 * Base field element for d-input and d-text (text area)
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
export abstract class BaseInputElement extends BaseFieldElement {

	// --- Component Key Children (on demand for more DOM mutation resiliency)
	protected ctrlEl!: HTMLElement | HTMLInputElement | HTMLTextAreaElement;
	protected labelEl!: HTMLElement | null;
	protected labelTrailEl?: HTMLElement;

	// --- Input value are always text
	abstract get value(): string | null;
	abstract set value(val: string | null)

	constructor() {
		super();

		// Base shadow content
		const content = SHADOW_CONTENT.cloneNode(true);

		// -- Add the input control to the shadow dom
		const ctrlEl = this.createCtrlEl();
		setAttr(ctrlEl, { part: 'ctrl' });
		ctrlEl.classList.add('ctrl');
		// Carry over the attributes
		let [spellcheck, autocorrect, autocomplete] = getAttr(ctrlEl, "spellcheck", "autocorrect", "autocomplete")
		setAttr(ctrlEl, { spellcheck, autocorrect, autocomplete });
		this.ctrlEl = ctrlEl;

		content.appendChild(this.ctrlEl);

		// Forward d-input attributes to HTMLInputElement ctrl element
		const [readonly, disabled, placeholder] = getAttr(this, 'readonly', 'disabled', 'placeholder');
		if (isValueElement(this.ctrlEl)) {
			setAttr(this.ctrlEl, { readonly, disabled, placeholder });
		}

		// Build the shadow and append
		const shadow = this.attachShadow({ mode: 'open' });
		shadow.append(content);
	}

	//#region    ---------- Lifecycle ----------
	// Component initialization (will be called once by BaseHTMLElement on first connectedCallback)
	init() {
		super.init();

		// --- Add icon-lead if needed
		const icoLead = this.iconLead;
		if (icoLead) {
			this.classList.add("has-icon-lead");
			this.appendChild(svgSymbolEl(icoLead, { slot: "icon-lead" }));
		}

		// --- Add the icon-trail if needed
		const icoTrail = this.iconTrail;
		if (icoTrail) {
			this.classList.add("has-icon-trail");
			this.appendChild(svgSymbolEl(icoTrail, { slot: "icon-trail" }));
		}

		const [label, labelTrail, textTrail] = getAttr(this, 'label', 'label-trail', 'text-trail');

		// add the label-trail
		if (labelTrail) {
			this.appendChild(elem('label', { slot: 'label-trail', $: { textContent: labelTrail } }));
		}

		// add the label
		if (label) {
			this.appendChild(elem('label', { slot: 'label', $: { textContent: label } }));
		}

		// add the text-trail
		if (textTrail) {
			this.classList.add("has-text-trail");
			this.appendChild(elem('div', { slot: 'text-trail', $: { textContent: textTrail } }));
		}

		// --- Set the states
		const value = this.getInitialValue();
		this.noValue = (!value);
		this.value = value;

		// --- Bind internal component events
		on(this.ctrlEl, 'keyup, change, focusin, focusout', (evt) => {
			const m_input = this;

			switch (evt.type) {
				case 'keyup':
					// if exec, triggerCancel
					if (evt.key === 'Escape') {
						m_input.triggerCancel();
					}
					break;
				case 'focusin':
					this.dFocus = true;
					break;
				case 'focusout':
					this.dFocus = false;
					break;
				case 'change':
					// here we forward the value from the input to this component state value to make srue all get changed.
					if (isValueElement(this.ctrlEl)) {
						this.value = this.ctrlEl.value;
					} else {
						this.value = this.textContent;
					}

					break;
			}
		});

		// TODO: minor bug when user re-click on label when input is empty, it toggle focus off.
		on(this.shadowRoot, 'click', 'label', (evt) => {
			this.ctrlEl.focus();
		});
	}

	attributeChangedCallback(name: string, oldVal: any, newVal: any) {
		super.attributeChangedCallback(name, oldVal, newVal); // always

		if (this.initialized) {
			switch (name) {
				case 'readonly':
					if (isValueElement(this.ctrlEl)) {
						setAttr(this.ctrlEl, { readonly: newVal });
					}
					break;
				case 'disabled':
					if (isValueElement(this.ctrlEl)) {
						setAttr(this.ctrlEl, { disabled: newVal });
					}
					break;
				case 'placeholder':
					if (isValueElement(this.ctrlEl)) {
						setAttr(this.ctrlEl, { placeholder: newVal });
					} else {
						// TODO - check if
						this.value = this.value;
					}
					break;
			}
		}

	}
	//#endregion ---------- /Lifecycle ----------

	//#region    ---------- HTML Element Overrides ----------
	focus() {
		this.ctrlEl?.focus();
	}
	//#endregion ---------- /HTML Element Overrides ----------

	abstract createCtrlEl(): HTMLElement | HTMLInputElement | HTMLTextAreaElement
	abstract getInitialValue(): string | null
}

export function isValueElement(obj: HTMLElement | HTMLInputElement | HTMLTextAreaElement): obj is HTMLInputElement | HTMLTextAreaElement {
	return (obj instanceof HTMLInputElement || obj instanceof HTMLTextAreaElement);
}