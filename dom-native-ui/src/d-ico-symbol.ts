import { BaseHTMLElement, customElement, html } from 'dom-native';
import { BaseFieldElement } from './d-base-field.js';
const { entries } = Object;

/** Public api to generage a symbol svg reference */
export function svgSymbolEl(name: string, attrs?: { [k: string]: string }): Element {
	const el = html`<svg class="symbol ${name}">
  <use xlink:href="#${name}"></use>
</svg>
	`.firstElementChild!;

	if (typeof attrs == 'object') {
		for (const [k, v] of entries(attrs)) {
			el.setAttribute(k, v);
		}
	}

	return el;
}


//#region    ---------- d-symbol ---------- 
/**
 * Component that display an svg symbol, but does not have the 'icon' semantic. 
 * Full name of the symbol needs to be given. 
 * Will add the symbol name as css class.
 * 
 * Usage: `<d-symbol name='ico-user'></d-symbol>`
 * 
 * Attributes: 
 *   - name:
 * 
 * Properties:
 *   - none
 * 
 * Content:
 *   - symbol name
 * 
 */
@customElement('d-symbol')
class SymbolElement extends BaseHTMLElement {
	static get observedAttributes() { return BaseFieldElement.observedAttributes.concat(['name']) }

	get name() { return this.getAttribute('name') ?? '' }

	//#region    ---------- Lifecycle ---------- 
	init() {
		super.init();
		this.refresh();
	}

	attributeChangedCallback(attrName: string, oldVal: any, newVal: any) {

		switch (attrName) {
			case 'name':
				// Note: change only if needed, otherwise, refreshing on mouseover for example, could impact click bindings.
				if (oldVal !== newVal) {
					this.classList.remove(oldVal);
					this.refresh();
				}
				break;
		}
	}
	//#endregion ---------- /Lifecycle ---------- 

	refresh() {
		const name = this.name;
		if (name) {
			this.classList.add(name);
			this.replaceChildren(svgSymbolEl(name));
		}
	}
}
//#endregion ---------- /d-symbol ----------

//#region    ---------- d-ico ---------- 
/**
 * Component that display an icon icon stored in the symbols svg. 
 * 'ico-[name]' will be added as component class name and used for the symbol name. 
 * 
 * Usage: `<d-ico name="user"></d-ico>`  
 * TODO: need to implement `<d-ico name="user"></d-ico>` (can change name)
 * 
 * Attributes: 
 *   -  name?: 
 * 
 * 
 * Properties: none
 * 
 */
@customElement('d-ico')
export class IcoElement extends SymbolElement {
	// NOTE: Unfortunately, TS 5.x decorator seems to remove support for static intialization
	//       e.g., when doing a IcoElement.prefix in the get name() we get undefined. 
	//       So, disabling feature for now. TS 5.x decorator more important than static initialization.
	// static prefix = '';

	get name() { return super.name }

}
//#endregion ---------- /d-ico ----------



