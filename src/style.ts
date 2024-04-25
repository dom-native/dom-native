

//#region    ---------- style ---------- 
/** Conditional typing override for  */
export function style<T extends HTMLElement | HTMLElement[] | null | undefined>(el: T, style: Partial<CSSStyleDeclaration>): T;

// NOTE: If the implementation style... does not return 'T | null' then, the `return null;` says that does not match T (the guard seems to not work).
//       The trick is to override the definition with above, and it work. 
export function style<T extends HTMLElement | HTMLElement[] | null>(el: T, style: Partial<CSSStyleDeclaration>): T {
	if (el == null) return el;

	// TODO: Would be nice to make this more typed, however function constraints and assignment below matches.

	if (el instanceof HTMLElement) {
		_styleEl(el, style);
	} else if (el instanceof Array) {
		for (const elItem of el) {
			_styleEl(elItem, style);
		}
	}
	return el;
}

function _styleEl(el: HTMLElement, style: Partial<CSSStyleDeclaration>) {
	for (const name of Object.keys(style)) {
		(<any>el.style)[name] = (<any>style)[name];
	}
}
//#endregion ---------- /style ----------


//#region    ---------- className ---------- 

/**
 * Minimilist DOM css class name helper. Add or Remove class name based on object property value. 
 * 
 * e.g., `setClass(el, {prime: true, 'dark-mode': false} )`
 * 
 * - false | null means remove class name
 * - true | any defined object add class name
 * - undefined values will ignore the property name
 * 
 * @returns pathrough return
 * 
 * Examples: 
 *   - `setClass(el, {prime: true, 'dark-mode': false} )` add css class 'prime' and remove 'dark-mode'
 *   - `setClass(el.children, {prime: someNonNullObject, 'dark-mode': false})` same as above.
 *   - `setClass(els, {prime: someNonNullObject, 'dark-mode': false})` Will add/remove class for all of the elements.
 * 
 * @param el 
 * @param keyValues e.g. `{prime: true, 'dark-mode': fase, 'compact-view': someObj}`
 */
export function setClass<E extends Element | Element[] | HTMLCollection | null | undefined>(els: E, keyValues: { [name: string]: boolean | object | null | undefined }): E {
	if (els == null) return els;

	let els_: Element[] | Element;

	if (els instanceof HTMLCollection) {
		els_ = Array.from(els);
	} else {
		els_ = els;
	}

	if (els_ instanceof Array) {
		for (const el of els_) {
			_setClass(el, keyValues);
		}
	}
	else {
		_setClass(els_ as Element, keyValues);
	}

	return els;
}

function _setClass(el: Element, keyValues: { [name: string]: boolean | object | null | undefined }) {
	for (const name of Object.keys(keyValues)) {
		const val = keyValues[name];
		if (val === null || val === false) {
			el.classList.remove(name);
		} else if (val !== undefined) { // for now, do nothing if undefined
			el.classList.add(name);
		}
	}
}

/**
 *  * @deprecated use `setClass`
 */
export function className<E extends Element | Element[] | HTMLCollection | null | undefined>(els: E, keyValues: { [name: string]: boolean | object | null | undefined }): E {
	return setClass(els, keyValues);
}

//#endregion ---------- /className ----------