import { attr, elem, getAttr } from '#dom-native';
import { equal } from './utils';


const V1 = 'test val 1';
const V2 = 'test val 2';

export function testSetAndGetAttrElWithObj() {
	const el = elem('div');

	let elReturned = attr(el, { name: V1, value: V2 });
	let result = getAttr(elReturned, 'name', 'value');
	equal(result, [V1, V2]);
}

export function testSetAndGetElSingleNameValue() {
	const el = elem('div');

	let elReturned = attr(el, 'name', V1);
	let result = getAttr(elReturned, 'name');
	equal(result, V1);
}


export function testSetBoolean() {
	const el = elem('div');
	let elReturned = attr(el, 'placeholder', true);
	equal(getAttr(elReturned, 'placeholder'), '');
}

export function testSetNumber() {
	let elReturned = attr(elem('div'), 'num', 1);
	equal(getAttr(elReturned, 'num'), '1');
}

export function testLegacySetElsSingleNameValue() {
	const els = elem('div', 'div');

	let elReturned = attr(els, 'name', V1);
	let result = attr(elReturned, 'name');
	equal(result, [V1, V1]);
}

export function testLegacySetElsGetElsWithObj() {
	const els = elem('div', 'div');

	let elReturned = attr(els, { name: V1, value: V2 });
	let result = attr(elReturned, ['name', 'value']);
	equal(result, [[V1, V2], [V1, V2]]);
}

export function testLegacyGetElWithName() {
	// setup the el
	const el = elem('div');
	el.setAttribute('name', V1);

	// test the get name attribute
	let result = attr(el, 'name');
	equal(result, V1);

	// test the get name attribute
	result = attr(el, 'no-exist');
	equal(result, null);
}

export function testLegacyGetAttrElsWithName() {
	const els = elem('div', 'div').map(el => { el.setAttribute('name', V1); return el; });

	let result = attr(els, 'name');
	equal(result, [V1, V1]);

	result = attr(els, 'no-exist');
	equal(result, [null, null]);
}

export function testLegacyGetAttrElWithNames() {
	// setup the el
	const el = elem('div');
	el.setAttribute('name', V1);
	el.setAttribute('value', V2);

	// test the get name attribute
	let result = attr(el, ['name', 'value']);
	equal(result, [V1, V2]);

	// test the get name attribute
	result = attr(el, ['name', 'value', 'no-exist']);
	equal(result, [V1, V2, null]);
}

export function testLegacyGetElsWithNames() {
	const els = elem('div', 'div').map(el => {
		el.setAttribute('name', V1);
		el.setAttribute('value', V2);
		return el;
	});

	// test the get name attribute
	let result = attr(els, ['name', 'value']);
	equal(result, [[V1, V2], [V1, V2]]);

	// test the get name attribute
	result = attr(els, ['name', 'value', 'no-exist']);
	equal(result, [[V1, V2, null], [V1, V2, null]]);
}
