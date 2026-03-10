import { elem, setAttr } from '#dom-native';
import { equal } from './utils';


const V1 = 'test val 1';
const V2 = 'test val 2';

export function testSetSimple() {
	const el = elem('div');

	const returnedEl = setAttr(el, "test_01", "test_val_01");

	equal(returnedEl.getAttribute("test_01"), "test_val_01");
}

export function testGetSimple() {
	const el = elem('div');
	el.setAttribute("test_01", "test_val_01")

	equal(el.getAttribute("test_01"), "test_val_01");
}


export function testSetTrue() {
	const el = elem('div');

	const returnedEl = setAttr(el, "test_01", true);

	equal(el.getAttribute("test_01"), "");
}

export function testSetFalse() {
	const el = elem('div');

	const returnedEl = setAttr(el, "test_01", false);

	equal(el.getAttribute("test_01"), null);
}

export function testSetNum() {
	const el = elem('div');

	const returnedEl = setAttr(el, "test_01", 1);

	equal(el.getAttribute("test_01"), "1");
}

export function testSetMap() {
	const el = elem('div');

	setAttr(el, {
		test_01: 1,
		test_02: "test_val_02"
	});

	equal(el.getAttribute("test_01"), "1");
	equal(el.getAttribute("test_02"), "test_val_02");
}

export function testSetNullInMap() {
	const el = elem('div');
	el.setAttribute("test_03", "test_val_03");

	setAttr(el, {
		test_01: 1,
		test_02: "test_val_02",
		test_03: false
	});

	equal(el.getAttribute("test_01"), "1");
	equal(el.getAttribute("test_02"), "test_val_02");
	equal(el.getAttribute("test_03"), null);
}