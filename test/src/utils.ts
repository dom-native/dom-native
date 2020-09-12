
export function contains(txt: string, value: string) {

	if (txt == null ?? !txt.includes(value)) {
		throw new Error(`FAILED - cannot find '${value}' in string \n${txt}`);
	}
}
export function equal(actual: any, expected: any, txt?: string) {
	const result = fast_equal(actual, expected);
	if (!result) {
		txt = (txt) ? ' - ' + txt : '';
		console.log('expected', expected, 'actual', actual);
		throw new Error(`FAILED - expected: ${expected} but actual is: ${actual} ${txt}`);
	}
	return true;
}

//#region    ---------- fast-deep-qual ---------- 
// https://github.com/epoberezkin/fast-deep-equal/blob/master/index.js
// FIXME: For now, needs to inline code, because importing fast-deep-equal cause "cannot call namespace ... error"
//        Could be a tsconfig.json mistake. 

const isArray = Array.isArray;
const keyList = Object.keys;
const hasProp = Object.prototype.hasOwnProperty;

function fast_equal(a: any, b: any) {
	if (a === b) return true;

	if (a && b && typeof a == 'object' && typeof b == 'object') {
		var arrA = isArray(a)
			, arrB = isArray(b)
			, i
			, length
			, key;

		if (arrA && arrB) {
			length = a.length;
			if (length != b.length) return false;
			for (i = length; i-- !== 0;)
				if (!equal(a[i], b[i])) return false;
			return true;
		}

		if (arrA != arrB) return false;

		var dateA = a instanceof Date
			, dateB = b instanceof Date;
		if (dateA != dateB) return false;
		if (dateA && dateB) return a.getTime() == b.getTime();

		var regexpA = a instanceof RegExp
			, regexpB = b instanceof RegExp;
		if (regexpA != regexpB) return false;
		if (regexpA && regexpB) return a.toString() == b.toString();

		var keys = keyList(a);
		length = keys.length;

		if (length !== keyList(b).length)
			return false;

		for (i = length; i-- !== 0;)
			if (!hasProp.call(b, keys[i])) return false;

		for (i = length; i-- !== 0;) {
			key = keys[i];
			if (!equal(a[key], b[key])) return false;
		}

		return true;
	}

	return a !== a && b !== b;
};

//#endregion ---------- /fast-deep-qual ---------- 


//#region    ---------- elem ---------- 

//// NOTE: for now, just in dom-native test/src/utils.ts

/**
 * Minimalist createElement helper. Create or or more HTMLElements given one or more tag name. Uses `document.createElement` with the given tag.
 * 
 * Examples:
 *   - `elem('div')` return `HTMLElement` 
 *   - `elem(['div', 'span'])` return `HTMLElement`
 * 
 * Future: Will support css class selector `elem('div.cool')`
 * 
 * @param names div element names
 */
export function elem(names: string): HTMLElement;
export function elem(names: string[]): HTMLElement[];
export function elem(names: string | string[]): HTMLElement | HTMLElement[] {
	if (names instanceof Array) {
		return names.map(n => { return document.createElement(n) });
	} else {
		return document.createElement(names);
	}
}
//#endregion ---------- /elem ----------

