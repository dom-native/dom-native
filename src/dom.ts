import { asNodeArray } from './utils';

export type AppendPosition = "first" | "last" | "empty" | "before" | "after";

// --------- DOM Query Shortcuts --------- //

// Shortcut for .querySelector
// return the first element matching the selector from this el (or document if el is not given)
/** Shortchut to el.querySelector, but allow el to be null (in which case will return null) */
export function first(el: Document | HTMLElement | DocumentFragment | null | undefined, selector: string): HTMLElement | null;
export function first(selector: string): HTMLElement | null;
export function first(el: Document | HTMLElement | DocumentFragment | null | undefined): HTMLElement | null;
export function first(el_or_selector: Document | HTMLElement | DocumentFragment | string | null | undefined, selector?: string) {
	// We do not have a selector at all, then, this call is for firstElementChild
	if (!selector && typeof el_or_selector !== "string") {
		const el = el_or_selector as HTMLElement | DocumentFragment;
		// try to get 
		const firstElementChild = el.firstElementChild;

		// if firstElementChild is null/undefined, but we have a firstChild, it is perhaps because not supported
		if (!firstElementChild && el.firstChild) {

			// If the firstChild is of type Element, return it. 
			if (el.firstChild.nodeType === 1) {
				return el.firstChild;
			}
			// Otherwise, try to find the next element (using the next)
			else {
				// TODO: Needs to look at typing here, this is a ChildNode
				return next(el.firstChild);
			}
		}

		return firstElementChild as HTMLElement;
	}
	// otherwise, the call was either (selector) or (el, selector), so foward to the querySelector
	else {
		return _execQuerySelector(false, el_or_selector, selector);
	}

}

// TODO: might need to return readonly HTMLElement[] to be consistent with asNodeArray
/** Convenient and normalized API for .querySelectorAll. Return Array (and not node list) */
export function all(el: Document | HTMLElement | DocumentFragment | null | undefined, selector: string): HTMLElement[];
export function all(selector: string): HTMLElement[];
export function all(el: Document | HTMLElement | DocumentFragment | null | undefined | string, selector?: string) {
	const nodeList = _execQuerySelector(true, el, selector);
	return (nodeList != null) ? asNodeArray(nodeList) : [];
}

/**
 * Get the eventual next sibling of an HTMLElement given (optionally as selector)
 */
export function next(el: Node | null | undefined, selector?: string): HTMLElement | null {
	return _sibling(true, el, selector) as HTMLElement; // assume HTMLElement
}

/**
 * Get the eventual previous sibling
 */
export function prev(el: Node | null | undefined, selector?: string): HTMLElement | null {
	return _sibling(false, el, selector) as HTMLElement;  // assume HTMLElement
}

// By default use the document.closest (if not implemented, use the matches to mimic the logic) 
// return null if not found
export function closest(el: HTMLElement | null | undefined, selector: string): HTMLElement | null {
	return (el) ? el.closest(selector) as HTMLElement | null : null;
}
// --------- /DOM Query Shortcuts --------- //


//#region    ---------- DOM Manipulation ---------- 
export function append<T extends HTMLElement | HTMLElement[] | DocumentFragment | string>(this: any, refEl: HTMLElement | DocumentFragment, newEl: T, position?: AppendPosition): T extends HTMLElement ? HTMLElement : HTMLElement[];

export function append(this: any, refEl: HTMLElement | DocumentFragment, newEl: HTMLElement | HTMLElement[] | DocumentFragment | string, position?: AppendPosition): HTMLElement | HTMLElement[] {
	let parentEl: HTMLElement | DocumentFragment;
	let nextSibling: HTMLElement | null = null;

	let result: HTMLElement | HTMLElement[];

	// make newEl a document fragment if string passed
	if (typeof newEl === 'string') {
		newEl = frag(newEl);
	}

	// NOTE: need to do it before we append in the case for DocumentFragment case.
	// NOTE: we assume HTML element as per dom-native current approach.
	if (newEl instanceof Array) {
		result = newEl;
		// Create a document frag
		const fragment = document.createDocumentFragment();
		for (const elItem of newEl) {
			fragment.appendChild(elItem);
		}
		newEl = fragment;
	} else if (newEl instanceof DocumentFragment) {
		result = [...newEl.children] as HTMLElement[]; // take the liberty to assume HTMLElememt
	} else {
		result = newEl;
	}

	// default is "last"
	position = (position) ? position : "last";

	//// 1) We determine the parentEl
	if (position === "last" || position === "first" || position === "empty") {
		parentEl = refEl;
	} else if (position === "before" || position === "after") {
		parentEl = refEl.parentNode as HTMLElement;
		if (!parentEl) {
			throw new Error("dom-native ERROR - The referenceElement " + refEl + " does not have a parentNode. Cannot insert " + position);
		}
	}

	//// 2) We determine if we have a nextSibling or not
	// if "first", we try to see if there is a first child
	if (position === "first") {
		nextSibling = first(refEl); // if this is null, then, it will just do an appendChild
		// Note: this might be a text node but this is fine in this context.
	}
	// if "before", then, the refEl is the nextSibling
	else if (position === "before") {
		nextSibling = refEl as HTMLElement;
	}
	// if "after", try to find the next Sibling (if not found, it will be just a appendChild to add last)
	else if (position === "after") {
		nextSibling = next(refEl);
	}

	//// 3) We append the newEl
	// if we have a next sibling, we insert it before
	if (nextSibling) {
		parentEl!.insertBefore(newEl, nextSibling);
	}
	// otherwise, we just do a append last
	else {
		if (position === "empty") {
			// NOTE: the assumption here is that innerHTML will go faster than iterating through the lastChild, but for DocumentFragment, no choice
			if (parentEl! instanceof HTMLElement) {
				parentEl.innerHTML = '';
			} else if (parentEl! instanceof DocumentFragment) {
				while (parentEl.lastChild) {
					parentEl.removeChild(parentEl.lastChild);
				}
			}
		}
		parentEl!.appendChild(newEl);
	}

	return result;
}


/**
 * Returns a DocumentFragment for the html string. If html is null or undefined, returns an empty document fragment.
 * @param html the html string or null/undefined
 */
export function frag(html: string | null | undefined) {
	// make it null proof
	html = (html) ? html.trim() : null;

	const template = document.createElement("template");
	if (html) {
		template.innerHTML = html;
	}
	return template.content;
}
//#endregion ---------- /DOM Manipulation ---------- 


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


//#region    ---------- attr ---------- 
// conditional typing

type Val = string | null;
type NameValMap = { [name: string]: string | null | boolean };

/**
 * setAttribute DOM helper to Get and Set attribute to DOM HTMLElement(s).
 * 
 * Note: For setters, null and boolean-false value will remove the attribute, `true` will set empty string.
 * 
 * Examples:
 *
 *   Getters:
 *     - `attr(el, 'name')` returns `string | null`, Get of the attribute `name`
 *     - `attr(el, ['name', 'label'])` returns the attribute `[name, label]` (string | null)[]
 *     - `attr(els,'name')` returns `[name, name, ...]` for each attribute for all els. Item is null if no attribute with this anme.
 *     - `attr(els,['name', 'label'])` returns `[name,label][]` for each element.
 *
 *   Setters:
 *     - `attr(el, 'name', 'username')` Set attribute name. If value is null, then, remove will be applied. TODO: Might deprecate. But ok shorthand, and handle the null/remove case, and return el.
 *     - `attr(el, {name: 'username', placeholder: 'Enter username'})` Will set the attributes specified in the object to this element, and returl el,
 *     - `attr(els, {checked: true, readonly: ''})` Will set the attributes specified in the object for all of the elements, and return els.
 *
 * TODO: On 'set' should be a passtrough return (return null | undefined as well)
 */

export function attr(el: HTMLElement, name: string): string | null;
export function attr(els: HTMLElement[], name: string): (string | null)[];
export function attr(el: HTMLElement, names: string[]): (string | null)[];
export function attr(els: HTMLElement[], names: string[]): (string | null)[][];

export function attr(el: HTMLElement, nameValues: { [name: string]: string | null | boolean }): HTMLElement;
export function attr(els: HTMLElement[], nameValues: { [name: string]: string | null | boolean }): HTMLElement[];
export function attr(el: HTMLElement, name: string, val: string | null | boolean): HTMLElement;
export function attr(els: HTMLElement[], name: string, val: string | null | boolean): HTMLElement[];

// implementation
export function attr<E extends HTMLElement | HTMLElement[], A extends string | string[] | NameValMap>(els: E, arg: A, val?: string | null | boolean): Val | Val[] | Val[][] | E {

	// if we have a val, then, its a single attribute setting (on one or more element)
	if (val !== undefined) {
		if (typeof arg !== 'string') {
			throw new Error(`attr - attr(els, name, value) must have name as string and not: ${arg}`);
		}
		const name = arg as string;
		if (els instanceof Array) {
			for (const el of els) {
				_setAttribute(el, name, val);
			}
		} else {
			_setAttribute(els as HTMLElement, name, val);
		}
		return els;
	}
	// else, if arg is string or array, we assume its a getter (for now, assume the array is an array of string)
	else if (typeof arg === 'string' || arg instanceof Array) {
		return _attrGet(els, arg as (string | string[]));
	}
	// otherwise, it is a setter 
	else {
		return _attrSet(els, arg as NameValMap); // TODO
	}
}

export function _attrSet<E extends HTMLElement | HTMLElement[]>(els: E, arg: NameValMap): E {
	if (els instanceof Array) {
		for (const el of els) {
			_setAttributes(el, arg);
		}
	} else {
		_setAttributes(els as HTMLElement, arg);
	}
	return els;
}

function _setAttributes(el: HTMLElement, nameValueObject: NameValMap) {
	for (const name of Object.keys(nameValueObject)) {
		_setAttribute(el, name, nameValueObject[name]);
	}
}

function _setAttribute(el: HTMLElement, name: string, val: string | null | boolean) {
	// if it is a boolean, true will set the attribute empty, and false will set txtVal to null, which will remove it.
	const txtVal = (typeof val !== 'boolean') ? val : (val === true) ? '' : null;
	if (txtVal !== null) {
		el.setAttribute(name, txtVal);
	} else {
		el.removeAttribute(name);
	}
}

export function _attrGet<E extends HTMLElement | HTMLElement[], A extends string | string[]>(els: E, arg: A): Val | Val[] | Val[][] | E {
	// If HTMLElement[]
	if (els instanceof Array) {
		const ells = els as HTMLElement[];
		return ells.map(el => {
			const r = _getAttrEl(el as HTMLElement, arg as string);
			return r;
		});
	}
	// otherwise, assum HTMLElement
	else {
		const r = _getAttrEl(els as HTMLElement, arg);
		return r;
	}
}

export function _getAttrEl<N extends string | string[]>(el: HTMLElement, names: N):
	N extends string ? string | null : (string | null)[];
export function _getAttrEl(el: HTMLElement, names: string | string[]): any | (string | null) | (string | null)[] {
	if (names instanceof Array) {
		return names.map(n => { return el.getAttribute(n) });
	}
	// else singloe
	else {
		return el.getAttribute(names);
	}

}
//#endregion ---------- /attr ----------

//#region    ---------- elem ---------- 

/**
 * Shorthand for document.createElement(name)
 * @param name tag name 
 */
export function elem(name: string): HTMLElement;

/**
 * Create multiple HTMLElement via document.createElement
 * @param names tag names
 */
export function elem(...names: string[]): HTMLElement[];
export function elem(...names: string[]): HTMLElement | HTMLElement[] {
	if (names.length === 1) {
		return document.createElement(names[0]);
	} else {
		return names.map(n => { return document.createElement(n) });
	}
}
//#endregion ---------- /elem ----------

/**
 * Return the next or previous Element sibling
 * @param next
 * @param el
 * @param selector
 */
function _sibling(next: boolean, el: Node | undefined | null, selector?: string) {
	const sibling: 'nextSibling' | 'previousSibling' = (next) ? 'nextSibling' : 'previousSibling';

	let tmpEl = (el) ? el[sibling] : null;

	// use "!=" for null and undefined
	while (tmpEl != null && (<any>tmpEl) != document) {
		// only if node type is of Element, otherwise, 
		if (tmpEl.nodeType === 1 && (!selector || (<Element>tmpEl).matches(selector))) {
			return tmpEl as Element;
		}
		tmpEl = tmpEl[sibling];
	}
	return null;
}


// util: querySelector[All] wrapper
function _execQuerySelector(all: boolean, elOrSelector?: Document | HTMLElement | DocumentFragment | null | string, selector?: string) {
	let el: HTMLElement | Document | DocumentFragment | null = null;
	// if el is null or undefined, means we return nothing. 
	if (elOrSelector == null) {
		return null;
	}
	// if selector is undefined, it means we select from document and el is the document
	if (typeof selector === "undefined") {
		selector = elOrSelector as string;
		el = document;
	} else {
		el = elOrSelector as HTMLElement | DocumentFragment;
	}
	return (all) ? el.querySelectorAll(selector) : el.querySelector(selector);
}
