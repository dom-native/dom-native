

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
 * e.g., `className(el, {prime: true, 'dark-mode': false} )`
 * 
 * - false | null means remove class name
 * - true | any defined object add class name
 * - undefined values will ignore the property name
 * 
 * @returns pathrough return
 * 
 * Examples: 
 *   - `className(el, {prime: true, 'dark-mode': false} )` add css class 'prime' and remove 'dark-mode'
 *   - `className(el, {prime: someNonNullObject, 'dark-mode': false})` same as above.
 *   - `className(els, {prime: someNonNullObject, 'dark-mode': false})` Will add/remove class for all of the elements.
 * 
 * @param el 
 * @param keyValues e.g. `{prime: true, 'dark-mode': fase, 'compact-view': someObj}`
 */
export function className<E extends HTMLElement | HTMLElement[] | null | undefined>(els: E, keyValues: { [name: string]: boolean | object | null | undefined }): E {

	if (els instanceof Array) {
		for (const el of els) {
			_setClassName(el, keyValues);
		}
	}
	else {
		_setClassName(els as HTMLElement, keyValues);
	}
	return els;
}

function _setClassName(el: HTMLElement, keyValues: { [name: string]: boolean | object | null | undefined }) {
	for (const name of Object.keys(keyValues)) {
		const val = keyValues[name];
		if (val === null || val === false) {
			el.classList.remove(name);
		} else if (val !== undefined) { // for now, do nothing if undefined
			el.classList.add(name);
		}
	}
}
//#endregion ---------- /className ----------