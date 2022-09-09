
import { all, append, BaseHTMLElement, closest, customElement, first, getChild, getChildren, getFirst, html, next, prev } from '#dom-native';
import { equal } from './utils';



export function testFirst() {
	equal("A", first(".el-a")!.innerHTML);
}

export function testFirstElement() {
	const testContentEl = first(".test-content");
	equal("A", first(testContentEl)!.innerHTML);

	const from_doc_single: CTest | null = first("c-test");
	equal(from_doc_single?.tagName, "C-TEST");

	const first_child: HTMLElement | null = first(document);
	equal(first_child?.tagName, "HTML");
}


export function testFirstMultiple() {

	const from_doc_multiple = first("c-test", ".el-g", "no-div");
	equal(from_doc_multiple[0]!.tagName, "C-TEST");
	equal(from_doc_multiple[1]!.tagName, "DIV");
	equal(from_doc_multiple[2], null);

	const cel = first(".el-g");
	const multiple = first(cel, "div", "c-test", "crazy-d");
	equal(multiple[0]!.tagName, "DIV");
	equal(multiple[1]!.tagName, "C-TEST");
	equal(multiple[2], null);

}

export function testGetFirstSuccess() {

	const first_child: HTMLElement = getFirst(document);
	equal(first_child?.tagName, "HTML");

	const from_doc_single: CTest = getFirst("c-test");
	equal(from_doc_single?.tagName, "C-TEST");

	const from_doc_multiple = getFirst("c-test", ".el-g");
	equal(from_doc_multiple[0].tagName, "C-TEST");
	equal(from_doc_multiple[1].tagName, "DIV");


	const cel = getFirst(".el-g");
	const multiple = getFirst(cel, "div", "c-test");
	equal(multiple[0].tagName, "DIV");
	equal(multiple[1].tagName, "C-TEST");
}

export function testGetFirstException() {
	try {
		const from_doc_multiple = getFirst("c-test", ".el-g", "no-div");
	} catch (ex) {
		return; // all good, should have gotten and exception
	}

	throw new Error(`call getFirst("c-test", ".el-g", "no-div") should have thrown exception`);
}


export function testAll() {
	console.log();
	// should have 3 Ds
	equal(all(".el-d").length, 4);
	// 3 sub el-d.el-d
	equal(all(first(".el-d"), ".el-d").length, 3);
	// the el-d.el-d.fo0
	equal(all(first(".el-d"), ".el-d.foo").length, 2);
	equal(first(first(".el-d"), ".el-d.foo")!.textContent, "D.foo 1");
}

export function testClosest() {
	const barEl = first(".bar");

	// should be same node
	equal(closest(barEl, ".el-d"), barEl);

	// should be the first container from this node the D container
	equal(closest(barEl, ".container")!.childNodes[0].textContent!.trim(), 'D');
}

export function testNext() {
	const firstEl = first(".rect.el-a");

	// test just next one
	let nextEl: HTMLElement | null = next(firstEl, ".rect")!;
	equal(nextEl.innerHTML, "B 1");

	// test couple ahead
	nextEl = next(firstEl, ".rect.el-c")!;
	equal(nextEl.innerHTML, "C 1");

	let lastEl: HTMLElement | null = next(firstEl, ".rect.el-g")!;
	equal(lastEl.classList.toString(), "rect el-g");

	nextEl = next(lastEl, ".rect");
	equal(nextEl, null);

	// test with null el
	equal(next(null, ".rect"), null);
}

export function testPrev() {
	let lastEl = first(".rect.el-d");

	// test just prev one
	let prevEl: HTMLElement | null = prev(lastEl, ".rect")!;
	equal(prevEl.innerHTML, "C 3");

	let firstEl = first(".rect.el-a");
	prevEl = prev(firstEl, ".rect");
	equal(prevEl, null);

	// test with null el
	equal(prev(null, ".rect"), null);
}

export function testAppendAndHtml() {

	const testContentEl = first(".test-content")!;


	const eContainerEl = append(testContentEl, createEl("el-e container", "container text"));
	const elA = append(eContainerEl, html("<div class='rect el-e sm'>A</div>")); //createEl("el-3 sm a","A")
	const elB = append(eContainerEl, createEl("el-e sm b", "B"), "first");
	const elC = append(elB, createEl("el-e sm c", "C"), "before");
	const elD = append(elC, createEl("el-e sm d", "D"), "after");
	const elE = append(eContainerEl, createEl("el-e sm E", "E"), "last");

	append(eContainerEl, html("<div class='rect el-e sm'>F</div> TTT <div class='rect el-e sm'>G</div>"));

	const out = [];
	const nodes = eContainerEl.childNodes;
	for (const node of nodes) {
		if (node instanceof HTMLElement) {
			out.push(node.innerText);
		} else {
			out.push(node.nodeValue);
		}

	}
	equal(out, ["container text", "C", "D", "B", "A", "E", "F", " TTT ", "G"]);
}

export function testAppendEmpty() {
	const testContentEl = first(".container.el-f")!;
	append(testContentEl, html("<div>NEW EL</div>EE"), "empty");
	const txt = testContentEl.innerText.replace(/\s/g, "_");
	equal("NEW_EL_EE", txt);
}

export function testFirstFromHtml() {
	let el;
	const fragment = html('<div class="first"> <span class="second"></span></div>');

	el = first(fragment)!;
	equal("first", el.getAttribute("class"));

	el = first(fragment, ".second")!;
	equal("second", el.getAttribute("class"));
}

export function thisAppendToHtml() {
	const fragment = html('<div class="first"> <span class="second"></span></div>');
	append(fragment, html('<div class="other">one</div><div class="other">two</div>'));
	append(fragment, html('<div class="last">three</div>'), "first");

	// .last should be first
	equal('last', first(fragment)!.getAttribute('class'));
	equal('one', all(fragment, '.other')[0].innerText);
}

export function testAppendElReturnValue() {
	const testContentEl = first(".test-content")!;
	const elToAdd = createEl('rect test-append-el-return-value', 'test-append-el-return-value content');
	const returnEl = append(testContentEl, elToAdd);
	equal(returnEl.classList.contains('test-append-el-return-value'), true);
}

export function testAppendHtmlReturnValue() {
	const testContentEl = first(".test-content")!;

	// add documentFragment
	const elToAdd = html('<div class="rect test-append-html-return-value">test-append-html-return-value content</div>');
	const [returnEl] = append(testContentEl, elToAdd);
	equal(returnEl.classList.contains('test-append-html-return-value'), true);

	// add html string
	const [returnEl2] = append(returnEl!, '<div class="rect test-append-html-return-value-2">test-append-html-return-value-2 content</div>', 'before');
	equal(returnEl2.classList.contains('test-append-html-return-value-2'), true);

	// add empty html string
	const [returnEl3] = append(testContentEl, '');
	equal(returnEl3, undefined);

	// test conditional typing
	const elToAdd4: DocumentFragment | HTMLElement = createElOrHtml('<div class="rect test-append-html-return-value-4">test-append-html-return-value-4 content</div>');
	if (elToAdd4 instanceof HTMLElement || elToAdd4 instanceof DocumentFragment) {
		const returnEl4 = append(returnEl!, elToAdd4, 'after');
	}

}

export function testFirstWithType() {
	let ctest: CTest | null = first(document, 'c-test');
	// NOTE - this is just a type test, so, if it compiles, all good. 
}

export function testGetChid() {
	let container = first(document, 'div.el-g')!;
	let ctest: CTest = getChild(container, 'c-test');
	let unknown = getChild(container, 'unknown-comp');
	let span: HTMLSpanElement = getChild(container, 'span');
	equal(ctest.tagName, 'C-TEST');
	equal(unknown.tagName, 'UNKNOWN-COMP');
	equal(span.tagName, 'SPAN');
	// NOTE - this is just a type test, so, if it compiles, all good. 
}


export function testGetChildren() {
	let container = first(document, 'div.el-g')!;
	let [ctest, span, unknown] = getChildren(container, 'c-test', 'span', 'unknown-comp');
	// NOTE - this is just a type test, so, if it compiles, all good. 
	equal(ctest.tagName, 'C-TEST');
	equal(span.tagName, 'SPAN');
	equal(unknown.tagName, 'UNKNOWN-COMP');
}

// to mimic union type
function createElOrHtml(html_str: string): DocumentFragment | HTMLElement {
	return html(html_str);
}

function createEl(classNames: string, text: string) {
	const el = document.createElement("div");
	el.setAttribute("class", "rect " + classNames);
	el.innerText = text;
	return el;
}

@customElement('c-test')
class CTest extends BaseHTMLElement { // extends HTMLElement

	init() {
		this.append(html`<p>c-test</p>`);
	}

}

// Augment the global TagName space to match runtime
declare global {
	interface HTMLElementTagNameMap {
		'c-test': CTest;
	}
}
