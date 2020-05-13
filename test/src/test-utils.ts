
import { val } from '../../src/index';
import { equal } from './utils';



export function _init() {
	console.log('>>>>');
}

export function _beforeEach() {
}

export function testValGet() {
	const v = "YEAH!";
	const obj = { foo: { bar: { name: v } } };
	equal(val(obj, "foo.bar.name"), v);
	equal(val(obj, ["foo", "bar", "name"]), v);
}

export function testValSet() {
	const v = "YEAH!";
	const obj = { foo: { bar: {} } };
	val(obj, "foo.bar.name", v);
	console.log('>>>>');

	equal(val(obj, "foo.bar.name"), v);
	equal(val(obj, ["foo", "bar", "name"]), v);
}

export function testValSetWithMap() {
	const v = "YEAH!";
	const obj = new Map();
	const foo = new Map();
	const bar = {};
	obj.set("foo", foo);
	foo.set("bar", bar);

	val(obj, "foo.bar.name", v);

	equal(val(obj, "foo.bar.name"), v);
	equal(val(obj, ["foo", "bar", "name"]), v);
}
