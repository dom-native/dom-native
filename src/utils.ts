

// --------- Object Utils --------- //


// return true if the value is null, undefined, empty array, empty string, or empty object
export function isEmpty(v: any) {
	const tof = typeof v;
	if (v == null) {
		return true;
	}

	if (v instanceof Array || tof === 'string') {
		return (v.length === 0) ? true : false;
	}

	if (tof === 'object') {
		// apparently 10x faster than Object.keys
		for (const x in v) { return false; }
		return true;
	}

	return false;
}

// TODO: need to document
export function val(rootObj: any, pathToValue: null | undefined | string | string[], value?: any): any {
	const setMode = (typeof value !== "undefined");

	if (!rootObj) {
		return rootObj;
	}
	// for now, return the rootObj if the pathToValue is empty or null or undefined
	if (!pathToValue) {
		return rootObj;
	}
	// if the pathToValue is already an array, do not parse it (this allow to support '.' in prop names)
	const names = (pathToValue instanceof Array) ? pathToValue : pathToValue.split(".");

	let name, currentNode = rootObj, currentIsMap, nextNode;

	let i = 0, l = names.length, lIdx = l - 1;
	for (i; i < l; i++) {
		name = names[i];

		currentIsMap = (currentNode instanceof Map);
		nextNode = currentIsMap ? currentNode.get(name) : currentNode[name];

		if (setMode) {
			// if last index, set the value
			if (i === lIdx) {
				if (currentIsMap) {
					currentNode.set(name, value);
				} else {
					currentNode[name] = value;
				}
				currentNode = value;
			} else {
				if (typeof nextNode === "undefined") {
					nextNode = {};
				}
				currentNode[name] = nextNode;
				currentNode = nextNode;
			}
		} else {
			currentNode = nextNode;
			if (typeof currentNode === "undefined") {
				currentNode = undefined;
				break;
			}
		}
	}
	if (setMode) {
		return rootObj;
	} else {
		return currentNode;
	}
}

// Convert an indexed object to a pure array in the most efficient way (to-date)
// See: https://jsperf.com/convert-nodelist-to-array, https://jsperf.com/array-from-to-nodelist
export function listAsArray(list: any) {
	const arr = new Array(list.length);
	for (let i = list.length - 1; i >= 0; i--) {
		arr[i] = list[i];
	}
	return arr;
}
// --------- /Object Utils --------- //

// --------- ensureType --------- //
export function ensureObject(obj: any, propName: any): { [key: string]: any } {
	return _ensure(obj, propName);
}
// Make sure that this obj[propName] is a js Map and returns it. 
// Otherwise, create a new one, set it, and return it.
export function ensureMap(obj: any, propName: any): Map<any, any> {
	return _ensure(obj, propName, Map);
}

// Make sure that this obj[propName] is a js Set and returns it. 
// Otherwise, create a new one, set it, and return it.
export function ensureSet(obj: any, propName: any): Set<any> {
	return _ensure(obj, propName, Set);
}

// same as ensureMap but for array
export function ensureArray(obj: any, propName: any): any[] {
	return _ensure(obj, propName, Array);
}

function _ensure(obj: any, propName: any, type?: any): any {
	const isMap = (obj instanceof Map);
	let v = (isMap) ? obj.get(propName) : obj[propName];
	if (v == null) {
		v = (type == null) ? {} : (type === Array) ? [] : (new type);
		if (isMap) {
			obj.set(propName, v);
		} else {
			obj[propName] = v;
		}
	}
	return v;
}

// --------- /ensureType --------- //


// --------- asType --------- //
type AnyButArray = object | number | string | boolean;
/**
 * @param a 
 * @deprecated To not use as is for now. Just kept it for 0.7.x backward compatibility but types are probably wrong. 
 */
export function asArray<T extends AnyButArray>(a: T | Array<T>): Array<T>;
// Return an array from a value object. If value is null/undefined, return empty array. 
// If value is null or undefined, return empty array
// If the value is an array it is returned as is
// If the value is a object with forEach/length will return a new array for these values
// Otherwise return single value array
export function asArray(value: any) {
	if (value != null) {
		if (value instanceof Array) {
			return value;
		}
		// If it is a nodeList, copy the elements into a real array
		else if (value.constructor && value.constructor.name === "NodeList") {
			return Array.prototype.slice.call(value);
		}
		// if it is a function arguments
		else if (value.toString() === "[object Arguments]") {
			return Array.prototype.slice.call(value);
		}
		// otherwise we add value
		else {
			return [value];
		}
	}
	// otherwise, return an empty array
	return [];
}

const emptyArray = Object.freeze([]);

/**
 * Returns a readonly Node array from EventTarget, NodeList, Node[], or empty readonly array for null and undefined. 
 */
export function asNodeArray(value: EventTarget | NodeList | Node[] | null | undefined): readonly Node[] {
	if (value != null) {
		if (value instanceof Array) {
			return value;
		}
		// If it is a nodeList, copy the elements into a real array
		else if (value.constructor && value.constructor.name === "NodeList") {
			return Array.prototype.slice.call(value);
		}
		// FIXME: Needs to handle the document fragment case. 
		// otherwise we add value
		else {
			return [value as Node]; // Note: here we assume it the evenTarget is a node
		}
	}
	// otherwise, return an empty array (readonly, so that we can )
	return emptyArray;
}
// --------- /asType --------- //

// --------- String Utils --------- //
export function splitAndTrim(str: string, sep: string): string[] {
	if (str == null) {
		return [];
	}
	if (str.indexOf(sep) === -1) {
		return [str.trim()];
	}
	return str.split(sep).map(trim);
}

function trim(str: string): string {
	return str.trim();
}
// --------- /String Utils --------- //

const _printOnceDone: { [msg: string]: boolean } = {};
export function printOnce(msg: any) {
	if (!_printOnceDone[msg]) {
		console.log(msg);
		_printOnceDone[msg] = true;
	}
}
