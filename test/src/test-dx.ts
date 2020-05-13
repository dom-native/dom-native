import { equal } from './utils';
import { first, pull, push, all, frag } from '../../src';

let outs = [];

const expectedStringify = '{"a":"a-val","b":"b-val","c1":"c1-val","c3":["c3-val-a","c3-val-b"],' +
	'"c4":"c4-val-a","c5":true,"r1":"r1-val-a","r2":"r2-val-a","d":"d-val","e":"e-val"}';

export function _init() {
}

export function _beforeEach() {
	outs = [];
}

export function basidPull() {
	const data = pull(first(".form.test-pull")!);

	equal(JSON.stringify(data), expectedStringify);
}

export function basicPush() {
	const formEl = first(".form")!;
	const data = pull(formEl);

	// clean the form
	all(".form .dx").forEach(function (_el) {
		const el = _el as HTMLElement & { checked: any, value: any };
		if (el.matches("input[type='checkbox'], input[type='radio']")) {
			el.checked = null;
		} else if (el.matches("input")) {
			el.value = null;
		} else {
			el.innerHTML = "";
		}
	});

	// pull the empty form, and change it matches.
	const expectedEmptyFormStringify = '{"a":"","b":"","d":"","e":""}';
	equal(JSON.stringify(pull(formEl)), expectedEmptyFormStringify);

	// push the orginal data, and then, pull and make sure it matches
	push(formEl, data);
	equal(JSON.stringify(pull(formEl)), expectedStringify);
}

export function selectorPull() {
	const el = first(".custom-form")!;

	// test the pull on the .edit .dx
	const editData = pull(el, ".edit .dx");
	equal(editData, { firstName: "firstName1", lastName: "lastName1" });

	// test the pull on the .view .dx
	const viewData = pull(el, ".view .dx");
	equal(viewData, { firstName: "aaa", lastName: "bbb" });
}

export function selectorPush() {
	const el = first(".custom-form")!;

	// NOTE: This test assume the test data properties are in the same order
	//       as the dom element, as the equal just use a stringify to compare object

	// test the push on the .edit .dx
	const editData = { firstName: "firstName2", lastName: "lastName2" };
	push(el, ".edit .dx", editData);


	// test the push on the .view .dx
	const viewData = { firstName: "ccc", lastName: "ddd" };
	push(el, ".view .dx", viewData);

	equal(pull(el, ".edit .dx"), editData);
	equal(pull(el, ".view .dx"), viewData);
}

export function testEmptyProperties() {
	const el = first(".empty-props")!;

	push(el, { a: null, b: null, c: undefined });

	const data = pull(el);
	equal(data, { a: "", b: "", c: "c1", d: "d1" });
}

export function testPushPullOnFrag() {
	const content = frag('<input class="dx" name="name1" />');
	push(content, { name1: 'val1' });
	const result = pull(content);
}