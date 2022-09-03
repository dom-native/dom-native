import { elem } from '#dom-native';
import { equal } from './utils';


let out: string[] = [];

export function _beforeEach() {
	out = [];
}

export function testElemSimple() {
	let el: HTMLDivElement = elem("div");
	equal(el.tagName, "DIV");
	equal(el.textContent, "");
	equal(0, el.getAttributeNames().length);
}


export function testElemSimpleMultiple() {
	let div: HTMLDivElement;
	let input: HTMLInputElement;

	[div, input] = elem("div", "input");
	equal(div.tagName, "DIV");
	equal(input.tagName, "INPUT");
}

export function testElemWithAttrs() {
	let div: HTMLDivElement;
	let el = elem("div", { title: "test-title" });
	equal(el.tagName, "DIV");
	equal(el.getAttribute("title"), "test-title");
}

export function testElemWithAttrAnd_TextContent() {
	let div: HTMLDivElement;
	let el = elem("div", { title: "test-title", _textContent: "test-textContent" });
	equal(el.tagName, "DIV");
	equal(el.getAttribute("title"), "test-title");
	equal(el.textContent, "test-textContent");
}

type ElemProps = {
	$props?: object,
} & {
	[k: string]: string | boolean | object
}

export function testElemWithAttrAnd$PropsTextContent() {
	let div: HTMLDivElement;

	let el = elem("div", { title: "test-title", $: { textContent: "test-textContent" } });
	equal(el.tagName, "DIV");
	equal(el.getAttribute("title"), "test-title");
	equal(el.textContent, "test-textContent");
}



