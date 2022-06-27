// conditional typing
type AttrValType = string | null;
type NameValMap = { [name: string]: string | number | boolean | null };

// v0.10.x deprecation notice (will be removed at 0.11)
const DEPRECATION_ATTR_AS_GET_MESSAGE = "dom-native deprecation - attr(...) as getter is being deprecated for clarity. Use `getAttr` to get attributes, and `setAttr` or `attr` to set attributes."
let deprecation_attr_as_get_notification = false;

const DEPRECATION_ATTR_AS_SET_MESSAGE = "dom-native deprecation - attr(el, ...) as setter is being deprecated for simplicity. Use setAttr(el, ...)."
let deprecation_attr_as_set_notification = false;

const DEPRECATION_ATTR_ELS_NAME_MESSAGE = "dom-native deprecation - attr(els, name, value) as setter is being deprecated for simplicity. Use els.map(el => setAttr(el, ...))."
let deprecation_attr_els_name_notification = false;

const DEPRECATION_ATTR_ELS_OBJ_MESSAGE = "dom-native deprecation - attr(els, object) as setter is being deprecated for simplicity. Use els.map(el => setAttr(el, ...))."
let deprecation_attr_els_obj_notification = false;


// -- attr getters - DEPRECATING (attr is not reserved only for setting attribute. Now getAttr is to get attributes)
/** @deprecated - use `getAttr(el, name)` */
export function attr(el: HTMLElement, name: string): string | null;
/** @deprecated - use `els.map(el => getAttr(el, name))` */
export function attr(els: HTMLElement[], name: string): (string | null)[];
/** @deprecated - use `getAttr(el, names)` */
export function attr(el: HTMLElement, names: string[]): (string | null)[];
/** @deprecated - use `els.map(el => getAttr(el, names))` */
export function attr(els: HTMLElement[], names: string[]): (string | null)[][];


/**
 * Set or remove an attribute value by name on a element. 
 * If value type is text or number, string value is set. If null or false, attribute is removed. If true, attribute is set to empty string.
 * @return The Element given
 * @deprecated - use `setAttr(le, name, val)`
 */
export function attr(el: HTMLElement, name: string, val: string | number | boolean | null): HTMLElement;

/**
 * Set or remove a set of attribute name:value for a given el. 
 * If value type is text or number, string value is set. If null or false, attribute is removed. If true, attribute is set to empty string.
 * @return The Element given
 * @deprecated - use `setAttr(le, name, nameValues)`
 */
export function attr(el: HTMLElement, nameValues: { [name: string]: string | number | boolean | null }): HTMLElement;

/**
 * Set or remove an attribute value by name for all element els. 
 * @param val - If text or number, string value is set. If null or false, attribute is removed. If true, attribute is set to empty string.
 * @return The Elements given
 * @deprecated Use els.map(el => setAttr(el, ...))
 */
export function attr(els: HTMLElement[], name: string, val: string | number | boolean | null): HTMLElement[];

/**
 * Set or remove a set of attribute name:value for a list of els.
 * If value type is text or number, string value is set. If null or false, attribute is removed. If true, attribute is set to empty string.
 * @return The Elements given
 * @deprecated Use els.map(el => setAttr(el, ...))
 */
export function attr(els: HTMLElement[], nameValues: { [name: string]: string | number | boolean | null }): HTMLElement[];

// implementation
export function attr<E extends HTMLElement | HTMLElement[], A extends string | string[] | NameValMap>(els: E, arg: A, val?: string | number | boolean | null): AttrValType | AttrValType[] | AttrValType[][] | E {

	// if we have a val, then, its a single attribute setting (on one or more element)
	if (val !== undefined) {
		if (typeof arg !== 'string') {
			throw new Error(`attr - attr(els, name, value) must have name as string and not: ${arg}`);
		}
		const name = arg as string;
		if (els instanceof Array) {
			if (!deprecation_attr_els_name_notification) {
				console.log(DEPRECATION_ATTR_ELS_NAME_MESSAGE);
				deprecation_attr_els_name_notification = true;
			}
			for (const el of els) {
				_setAttribute(el, name, val);
			}
		} else {
			if (!deprecation_attr_as_set_notification) {
				console.log(DEPRECATION_ATTR_AS_SET_MESSAGE);
				deprecation_attr_as_set_notification = true;
			}
			_setAttribute(els as HTMLElement, name, val);
		}
		return els;
	}
	// TO DEPRECATE: else, if arg is string or array, we assume its a getter (for now, assume the array is an array of string)
	else if (typeof arg === 'string' || arg instanceof Array) {
		if (!deprecation_attr_as_get_notification) {
			console.log(DEPRECATION_ATTR_AS_GET_MESSAGE);
			deprecation_attr_as_get_notification = true;
		}
		return _attrGet(els, arg as (string | string[]));
	}
	// TO DEPRECATE: Should use els.map(el => attr(el, ...))
	else {
		if (!deprecation_attr_els_obj_notification) {
			console.log(DEPRECATION_ATTR_ELS_OBJ_MESSAGE);
			deprecation_attr_els_obj_notification = true;
		}
		return _attrSet(els, arg as NameValMap);
	}
}

// TODO (nice to have): Find a way to alias `attr` with typescript to `setAttr` for symetry with `getAttr` 

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



// To support from deprecrated attr
//   - `attr(el, 'name')` returns `string | null`, Get of the attribute `name`
//   - `attr(el, ['name', 'label'])` returns the attribute `[name, label]` (string | null)[]
//   - `attr(els,'name')` returns `[name, name, ...]` for each attribute for all els. Item is null if no attribute with this anme.
//   - `attr(els,['name', 'label'])` returns `[name,label][]` for each element.


function _attrGet<E extends HTMLElement | HTMLElement[], A extends string | string[]>(els: E, arg: A): AttrValType | AttrValType[] | AttrValType[][] | E {
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

function _getAttrEl<N extends string | string[]>(el: HTMLElement, names: N):
	N extends string ? string | null : (string | null)[];

function _getAttrEl(el: HTMLElement, names: string | string[]): any | (string | null) | (string | null)[] {
	if (names instanceof Array) {
		return names.map(n => { return el.getAttribute(n) });
	}
	// else singloe
	else {
		return el.getAttribute(names);
	}

}
