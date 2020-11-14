// conditional typing
type AttrValType = string | null;
type NameValMap = { [name: string]: string | number | boolean | null };

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

export function attr(el: HTMLElement, nameValues: { [name: string]: string | number | boolean | null }): HTMLElement;
export function attr(els: HTMLElement[], nameValues: { [name: string]: string | number | boolean | null }): HTMLElement[];
export function attr(el: HTMLElement, name: string, val: string | number | boolean | null): HTMLElement;
export function attr(els: HTMLElement[], name: string, val: string | number | boolean | null): HTMLElement[];

// implementation
export function attr<E extends HTMLElement | HTMLElement[], A extends string | string[] | NameValMap>(els: E, arg: A, val?: string | number | boolean | null): AttrValType | AttrValType[] | AttrValType[][] | E {

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

function _setAttribute(el: HTMLElement, name: string, val: string | number | null | boolean) {
	// if it is a boolean, true will set the attribute empty, and false will set txtVal to null, which will remove it.
	let txtVal = (typeof val !== 'boolean') ? val : (val === true) ? '' : null;
	if (txtVal !== null) {
		if (typeof txtVal !== 'string') txtVal = '' + txtVal;
		el.setAttribute(name, txtVal);
	} else {
		el.removeAttribute(name);
	}
}

export function _attrGet<E extends HTMLElement | HTMLElement[], A extends string | string[]>(els: E, arg: A): AttrValType | AttrValType[] | AttrValType[][] | E {
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