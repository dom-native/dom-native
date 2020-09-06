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



// By default use the document.closest (if not implemented, use the matches to mimic the logic) 
// return null if not found
// TODO: support shadow-dom piercing
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
