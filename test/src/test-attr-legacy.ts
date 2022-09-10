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



