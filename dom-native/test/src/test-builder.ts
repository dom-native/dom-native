import { elem, frag } from '#dom-native';
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

	[div, input] = [elem('div'), elem('input')];
	equal(div.tagName, "DIV");
	equal(input.tagName, "INPUT");
}

export function testElemWithAttrs() {
	let div: HTMLDivElement;
	let el = elem("div", { title: "test-title" });
	equal(el.tagName, "DIV");
	equal(el.getAttribute("title"), "test-title");
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

export function testFragEmpty() {
	let fr = frag();
	equal(fr.constructor.name, "DocumentFragment");
}

export function testFragAray() {
	let fr = frag(['div', 'span'], n => elem(n));
	equal(fr.constructor.name, "DocumentFragment");
	equal(fr.children[0].tagName, "DIV");
	equal(fr.children[1].tagName, "SPAN");
}

