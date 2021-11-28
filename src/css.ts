import { supportsAdoptingStyleSheets } from './support.js';

type ExtShadowRoot = ShadowRoot & { adoptedStyleSheets: CSSStyleSheet[] }

//#region    ---------- adoptStyle ---------- 
/** 
 * Adopt a cssObject on shadowRoot (use constructable stylesheets if browser support, or append(style) if not)
 * @param el - Host to a shadowRoot or the shadowRoot itself (throw exception if not supported)
 * @return el for chainability
 */
export function adoptStyleSheets(el: HTMLElement | ShadowRoot, cssObject: CSSObject | CSSObject[]) {
	const shadow = isShadowRoot(el) ? el : el.shadowRoot;
	if (shadow == null) {
		throw new Error('DOM-NATIVE ERROR - Cannot adoptStyleSheets of a non shadowRoot or an element that does not have a shadowRoot');
	}

	const cssObjects = (cssObject instanceof Array) ? cssObject : [cssObject]
	if (supportsAdoptingStyleSheets) {
		const extShadow = shadow as ExtShadowRoot;
		extShadow.adoptedStyleSheets = [...extShadow.adoptedStyleSheets, ...cssObjects.map(co => co.sheet!)];
	} else {
		shadow.append(...cssObjects.map(co => co.newStyle));
	}
	return el;
}

function isShadowRoot(el: HTMLElement | ShadowRoot): el is ShadowRoot {
	return ((<ShadowRoot>el).host != null && (<ShadowRoot>el).mode != null)
}

//#endregion ---------- /adoptStyle ---------- 


//#region    ---------- css ---------- 
const constructGuard = Symbol();

// private properties
const cssTextProp = Symbol();
const styleRefProp = Symbol();
const sheetProp = Symbol();


/**
 * 
 * CSSObject is the returned object from css tagged template or function call. It's immutable, and provides
 * getters to get style element from the cssText, or constructible CSSStyleSheet object (if supported by browser)
 * 
 * This can be used as a stand alone utility, or with the  adoptStyle()
 */
export class CSSObject {
	[cssTextProp]: string;
	[styleRefProp]: HTMLElement | undefined; // used as the first reference to create the clone from
	[sheetProp]: CSSStyleSheet | undefined;

	constructor(cssText: string, guard: symbol) {
		if (guard !== constructGuard) throw new Error('Use css tag or css() to build a CSSObject')
		this[cssTextProp] = cssText;
	}

	get text() { return this[cssTextProp] };

	/** 
	 * Returns a new style HTMLELement with the css text of this CSSObject 
	 * Note: (lazy created; cloned from reference style element ) 
	 **/
	get newStyle() {
		this[styleRefProp] ??= Object.assign(document.createElement('style'), { innerHTML: this[cssTextProp] });
		return this[styleRefProp]!.cloneNode(true) as HTMLElement;
	}

	/** 
	 * Returns the CSSStyleSheet (lazy created) 
	 * 
	 * NOTE: while the CSSObject.cssText is immutable, the returned sheet is not, and since it would not 
	 *            make sense to create a new sheet on each call (defeating its purpose), it is up to the user 
	 *            to have the appropriate strategy to mutate the returned sheet.
	 **/
	get sheet() {
		if (supportsAdoptingStyleSheets) {
			this[sheetProp] ??= new CSSStyleSheet();
			(<any>this[sheetProp]!).replaceSync(this[cssTextProp]); // supportsAdoptingStyleSheets make sure this function exist
			return this[sheetProp]!;
		} else {
			return null;
		}
	}

}


/**
 * Create an immutable CSSObject. Can be used as a function or tagged template
 * 
 * Note: Inspiration https://github.com/Polymer/lit-element/blob/master/src/lib/css-tag.ts, but quite different.
 */
export function css(str: string): CSSObject
export function css(strings: TemplateStringsArray, ...values: any[]): CSSObject;
export function css(strings: string | TemplateStringsArray, ...values: any[]) {
	let content: string | undefined;

	if (typeof strings === 'string') {
		content = strings.trim();
	} else {
		let r = '', i = 0, vl = values.length;
		for (; i < vl; i++) {
			const v = values[i];
			const vStr = (v instanceof CSSObject) ? v[cssTextProp] : v;
			r += strings[i] + vStr;
		}

		// add the last one
		r += strings[i];

		// make it null proof
		content = r;
	}

	return new CSSObject(content, constructGuard);
}
//#endregion ---------- /css ----------
