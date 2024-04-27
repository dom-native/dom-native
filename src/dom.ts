import { html } from './dom-builders.js';
import { asNodeArray } from './utils.js';

export type AppendPosition = "first" | "last" | "empty" | "before" | "after";
type TagName = keyof HTMLElementTagNameMap;

type MaybeEl = Document | HTMLElement | DocumentFragment | null | undefined;
type El = Document | HTMLElement | DocumentFragment;


function process_arg_el_selectors(el_or_selectors: MaybeEl | string | string[], maybe_selectors: string[]): [MaybeEl, string[]] {
	let selectors: string[];
	let el: MaybeEl;
	if (typeof el_or_selectors == "string") {
		maybe_selectors.unshift(el_or_selectors);
		selectors = maybe_selectors
		el = document;
	} else if (Array.isArray(el_or_selectors)) {
		selectors = el_or_selectors;
		el = document;
	} else {
		selectors = maybe_selectors;
		el = el_or_selectors;
	}
	return [el, selectors];
}

// #region    --- first
/**
 * Returns the firstElementChild (as HTMLElement) or null if el is null or nothing. 
 * 
 * @param baseEl The eventual base el (document will be the base el if undefined or null)
 */
export function first(baseEl: MaybeEl): HTMLElement | null; // Must be before others to take precedence
/**
 * Returns the first element match element for a given selector (from the document). 
 * Returns null if not found
 */
export function first<A extends TagName | String>(selector: A): A extends TagName ? HTMLElementTagNameMap[A] | null : HTMLElement | null;
/**
 * Will run first(...) for each selector and return the array of (HTMLElement | null)[]
 */
export function first<A extends (TagName | String)[]>(...selector: A): { [K in keyof A]: A[K] extends TagName ? HTMLElementTagNameMap[A[K]] | null : HTMLElement | null };
/**
 * Returns the first element match element for a given selector from the baseEl.
 * 
 * Returns null if not found
 */
export function first<A extends TagName | String>(baseEl: MaybeEl, selector: A): A extends TagName ? HTMLElementTagNameMap[A] | null : HTMLElement | null;
/**
 * Will run first(baseEl, ...) for each selector and return the array of (HTMLElement | null)[]
 */
export function first<A extends (TagName | String)[]>(baseEl: MaybeEl, ...selector: A): { [K in keyof A]: A[K] extends TagName ? HTMLElementTagNameMap[A[K]] | null : HTMLElement | null };

export function first(el_or_selectors: MaybeEl | string | string[], ...maybe_selectors: string[]): HTMLElement | null | (HTMLElement | null)[] {
	let [el, selectors] = process_arg_el_selectors(el_or_selectors, maybe_selectors);
	const l = selectors.length;
	if (l == 0 || l == 1) {
		return _first(el, selectors[0]);
	} else {
		return selectors.map(sel => _first(el, sel));
	}
}

/** 
 * Strict version of 'first(el)'.
 * Get the first child element of el. 
 * 
 * @throws Error if el is null or if no firstElementChild
 */
export function getFirst(el: El): HTMLElement;
/**
 * Strict version of 'first(selector)'
 * 
 * @throws Error if not found.
 */
export function getFirst<A extends TagName | String>(selector: A): A extends TagName ? HTMLElementTagNameMap[A] : HTMLElement;
/**
 * Strict version of 'first(selector1, selector2, ...)'
 * 
 * @throws Error if any of the selector does not match an Element.
 */
export function getFirst<A extends (TagName | String)[]>(...selectors: A): { [K in keyof A]: A[K] extends TagName ? HTMLElementTagNameMap[A[K]] : HTMLElement };
/**
 * Strict version of 'first(el, selector)'
 * 
 * @throws Error el is null or if no match.
 */
export function getFirst<A extends TagName | String>(el: El, selector: A): A extends TagName ? HTMLElementTagNameMap[A] : HTMLElement;
/**
 * Strict version of 'first(el, selector1, selector2)'
 * 
 * @throws Error el is null or if no match.
 */
export function getFirst<A extends (TagName | String)[]>(el: El, ...selectors: A): { [K in keyof A]: A[K] extends TagName ? HTMLElementTagNameMap[A[K]] : HTMLElement };

export function getFirst(el_or_selectors: El | string | string[], ...maybe_selectors: string[]): HTMLElement | HTMLElement[] {
	let [el, selectors] = process_arg_el_selectors(el_or_selectors, maybe_selectors);

	if (el == null) throw new Error("dom-native - getFirst - requires el to not be null");

	const l = selectors.length;
	if (l == 0 || l == 1) {
		const res = _first(el, selectors[0]);
		if (res == null) throw new Error("dom-native - getFirst - element not found");
		return res;
	} else {
		const res: HTMLElement[] = [];
		for (const sel of selectors) {
			const iel = _first(el, sel);
			if (iel == null) throw new Error(`dom-native - getFirst - element for selector '${sel}' not found`);
			res.push(iel);
		}
		return res;
	}

}

export function _first(el: MaybeEl, selector?: string): HTMLElement | null {
	if (el == null) { return null }

	// We do not have a selector at all, then, this call is for firstElementChild
	if (selector == null) {
		return el.firstElementChild as HTMLElement | null;
	}
	// otherwise, the call was either (selector) or (el, selector), so foward to the querySelector
	else {
		return _execQuerySelector(false, el, selector) as HTMLElement | null;
	}

}
// #endregion --- first



// #region    --- all
// TODO: might need to return readonly HTMLElement[] to be consistent with asNodeArray
/** 
 * Convenient and normalized API for .querySelectorAll. Return Array (and not node list) 
*/
export function all(el: Document | HTMLElement | DocumentFragment | null | undefined, selector: string): HTMLElement[];
export function all(selector: string): HTMLElement[];
export function all(el: Document | HTMLElement | DocumentFragment | null | undefined | string, selector?: string) {
	const nodeList = _execQuerySelector(true, el, selector);
	return (nodeList != null) ? asNodeArray(nodeList) : [];
}
// #endregion --- all

// #region    --- cherryChild

/**
 * Fast and narrow way to cherry pick the first direct child (or children) matching a tagName(s). 
 * 
 * For performance purpose, this is a very strict api, with the following rules: 
 * 
 * - only tag name.
 * - tagNames must be in order of the matching children.
 * - must be exhaustive.
 * 
 * If need more flexible, use `first` or `getFirst`.
 * 
 * If tagName match a HTMLElementTagNameMap, it will return appropriate type.
 * 
 * @throws Error if any rules above it not met
 * 
 * Note: For a more flexible function that give full querySelector capability, use `first, getFirst, all`
 */
export function cherryChild<A extends TagName | String>(el: El, tagName: A): A extends TagName ? HTMLElementTagNameMap[A] : HTMLElement;
export function cherryChild<A extends (TagName | String)[]>(el: El, ...tagNames: A): { [K in keyof A]: A[K] extends TagName ? HTMLElementTagNameMap[A[K]] : HTMLElement };

// export function cherryChild<A extends (TagName | String)[]>(el: Document | HTMLElement | DocumentFragment, ...tagNames: A): { [K in keyof A]: A[K] extends TagName ? HTMLElementTagNameMap[A[K]] : HTMLElement };

export function cherryChild(el: Document | HTMLElement | DocumentFragment, ...tagNames: string[]): HTMLElement | HTMLElement[] {
	if (el == null) { throw new Error(`dom-native - scanChild - requires el to not be null`) };
	const tagNamesLength = tagNames.length;
	const single = tagNamesLength == 1;

	// Note: Not sure this speed anything up.
	// const childrenCount = el.childElementCount;
	// if (childrenCount < tagNames.length) {
	// 	throw new Error("dom-native - scanChildren - node has less children than requested names");
	// }

	const result: HTMLElement[] | null = (single) ? null : [];
	let nameIdx = 0;
	for (const child of el.children) {
		let name = tagNames[nameIdx].toUpperCase();
		if (child.tagName === name) {
			// return early if we have only one
			if (tagNamesLength == 1) return child as HTMLElement;

			// otherwise, add it to the result array
			result!.push(child as HTMLElement);
			nameIdx += 1;
		}
		if (nameIdx >= tagNamesLength) {
			break;
		}
	}

	if (result!.length < tagNamesLength) {
		throw new Error("dom-native - scanChildren - node has less match children than requested");
	}

	return result!;
}
// #endregion --- scanChild

// #region    --- scanChild

// DEPRECATED use cherryChild(...)

/** @deprecated use cherryChild */
export function scanChild<A extends TagName | String>(el: El, tagName: A): A extends TagName ? HTMLElementTagNameMap[A] : HTMLElement;
/** @deprecated use cherryChild */
export function scanChild<A extends (TagName | String)[]>(el: El, ...tagNames: A): { [K in keyof A]: A[K] extends TagName ? HTMLElementTagNameMap[A[K]] : HTMLElement };
/** @deprecated use cherryChild */
export function scanChild(el: Document | HTMLElement | DocumentFragment, ...tagNames: string[]): HTMLElement | HTMLElement[] {
	return cherryChild(el, ...tagNames);
}

// #endregion --- scanChild


// #region    --- next & prev
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
// #endregion --- next & prev



// util: querySelector[All] wrapper
function _execQuerySelector(all: false, elOrSelector?: Document | HTMLElement | DocumentFragment | null | string, selector?: string): Element | null;
function _execQuerySelector(all: true, elOrSelector?: Document | HTMLElement | DocumentFragment | null | string, selector?: string): NodeListOf<Element> | null;
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


// #region    --- closest

/**
 * call el.closest, but allow el to be null (return null in this case)
 */
export function closest(el: HTMLElement | null | undefined, selector: string): HTMLElement | null {
	return (el) ? el.closest(selector) as HTMLElement | null : null;
}
// #endregion --- closest


// #region    --- append
export function append<T extends HTMLElement | HTMLElement[] | DocumentFragment | string>(this: any, refEl: HTMLElement | DocumentFragment, newEl: T, position?: AppendPosition): T extends HTMLElement ? HTMLElement : HTMLElement[];

export function append(this: any, refEl: HTMLElement | DocumentFragment, newEl: HTMLElement | HTMLElement[] | DocumentFragment | string, position?: AppendPosition): HTMLElement | HTMLElement[] {
	let parentEl: HTMLElement | DocumentFragment;
	let nextSibling: HTMLElement | null = null;

	let result: HTMLElement | HTMLElement[];

	// make newEl a document fragment if string passed
	if (typeof newEl === 'string') {
		newEl = html(newEl);
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

// #endregion --- append




