import { html } from './dom-builders.js';
import { asNodeArray } from './utils.js';

export type AppendPosition = "first" | "last" | "empty" | "before" | "after";
type TagName = keyof HTMLElementTagNameMap;

type MaybeEl = Document | HTMLElement | DocumentFragment | null | undefined;

// #region    --- first
export function first(el: MaybeEl): HTMLElement | null; // Must be before others to take precedence

export function first<A extends TagName | String>(selector: A): A extends TagName ? HTMLElementTagNameMap[A] | null : HTMLElement | null;
export function first<A extends (TagName | String)[]>(...selector: A): { [K in keyof A]: A[K] extends TagName ? HTMLElementTagNameMap[A[K]] | null : HTMLElement | null };

export function first<A extends TagName | String>(el: MaybeEl, selector: A): A extends TagName ? HTMLElementTagNameMap[A] | null : HTMLElement | null;
export function first<A extends (TagName | String)[]>(el: MaybeEl, ...selector: A): { [K in keyof A]: A[K] extends TagName ? HTMLElementTagNameMap[A[K]] | null : HTMLElement | null };

export function first(el_or_selector: MaybeEl | string, ...selector: string[]): HTMLElement | null | (HTMLElement | null)[] {
	let el = el_or_selector;
	if (selector.length == 0) {
		return _first(el);
	} if (selector.length == 1) {
		return _first(el, selector[0]);
	} else {
		return selector.map(sel => _first(el, sel));
	}
}

export function _first(el_or_selector: MaybeEl | string, selector?: string): HTMLElement | null {
	// We do not have a selector at all, then, this call is for firstElementChild
	if (!selector && typeof el_or_selector !== "string" && el_or_selector != null) {
		const el = el_or_selector as Document | HTMLElement | DocumentFragment;
		return el.firstElementChild as HTMLElement | null;
	}
	// otherwise, the call was either (selector) or (el, selector), so foward to the querySelector
	else {
		return _execQuerySelector(false, el_or_selector, selector) as HTMLElement | null;
	}

}
// #endregion --- first

export function xp_first(el: MaybeEl): HTMLElement | null; // <-- This one does not work

export function xp_first<A extends TagName | String>(selector: A): A extends TagName ? HTMLElementTagNameMap[A] | null : HTMLElement | null;
export function xp_first<A extends (TagName | String)[]>(...selector: A): { [K in keyof A]: A[K] extends TagName ? HTMLElementTagNameMap[A[K]] | null : HTMLElement | null };

export function xp_first<A extends TagName | String>(el: MaybeEl, selector: A): A extends TagName ? HTMLElementTagNameMap[A] | null : HTMLElement | null;
export function xp_first<A extends (TagName | String)[]>(el: MaybeEl, ...selector: A): { [K in keyof A]: A[K] extends TagName ? HTMLElementTagNameMap[A[K]] | null : HTMLElement | null };

export function xp_first(el_or_selector: MaybeEl | string, ...selector: string[]): null | HTMLElement | (HTMLElement | null)[] {
	let selectors: string[];
	let el: Document | HTMLElement | DocumentFragment | null = null;
	if (typeof el_or_selector == "string") {
		selectors = [el_or_selector];
		el = document;
	} else {
		selectors = selector;
		el = el_or_selector ?? null;
	}

	if (selectors.length == 0) {
		return first(el);
	} if (selectors.length == 1) {
		return first(el, selectors[0]);
	} else {
		return selectors.map(sel => _first(el, sel));
	}
}

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

// #region    --- getChild
/**
 * Get the first direct child matching a tagName. If tagName match a HTMLElementTagNameMap, it will return appropriate type.
 * 
 * @throws Error no matching child.
 * 
 * Note: For a more flexible function that give full querySelector capability, use `all(el, _full_query_filter_string)`
 */
export function getChild<K extends keyof HTMLElementTagNameMap>(el: Document | HTMLElement | DocumentFragment, tagName: K): HTMLElementTagNameMap[K];
export function getChild(el: Document | HTMLElement | DocumentFragment, tagName: string): HTMLElement;
export function getChild(el: Document | HTMLElement | DocumentFragment, name: string): HTMLElement {
	name = name.toUpperCase();
	for (const child of el.children) {
		if (child.tagName === name) {
			return child as HTMLElement;
		}
	}
	throw new Error(`dom-native - getChild - No child found for selector ${name}`)
}
// #endregion --- getChild


// #region    --- getChildren
/** 
 * Cherry pick direct HTMlElement children in order of the names (can be partial, but all have to be present and match is done in orders) 
 * If name matches known tagName (in HTMLElementTagNameMap), then, the appropriate type will be returned.
 * 
 * @throws Error if one or more names do not match.
 * 
 * Note: For a more flexible function that give full querySelector capability, use `all(el, _full_query_filter_string)`
*/
export function getChildren<A extends (TagName | String)[]>(el: Document | HTMLElement | DocumentFragment, ...names: A): { [K in keyof A]: A[K] extends TagName ? HTMLElementTagNameMap[A[K]] : HTMLElement };
export function getChildren(el: Document | HTMLElement | DocumentFragment, ...names: string[]): HTMLElement | HTMLElement[] {
	const childrenCount = el.childElementCount;
	if (childrenCount < names.length) {
		throw new Error("dom-native - getChildren - node has less children than requested names");
	}
	const result: HTMLElement[] = [];
	let nameIdx = 0;
	for (const child of el.children) {
		let name = names[nameIdx].toUpperCase();
		if (child.tagName === name) {
			// Note: could do an instanceof HTMLElement (need measure perf impact vs value of the check)
			result.push(child as HTMLElement);
			nameIdx += 1;
		}
		if (nameIdx >= childrenCount || nameIdx >= names.length) {
			break;
		}
	}

	if (result.length < names.length) {
		throw new Error("dom-native - getChildren - node has less match children than requested");
	}

	return result;
}
// #endregion --- getChildren

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




