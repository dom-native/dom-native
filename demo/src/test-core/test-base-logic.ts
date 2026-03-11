import { addHubEvents, addOnEvents, append, BaseHTMLElement, customElement, first, html, hub, on, onDoc, onEvent, onHub } from 'dom-native';
import { equal } from './test-utils.js';

let out: string[] = [];

//#region    ---------- Test Components ----------
class SimplestComponent extends BaseHTMLElement {
	@onEvent('click')
	onClickEvent() {
		out.push('SimplestComponent @onEvent onClickEvent');
	}
}
customElements.define('simplest-component', SimplestComponent);


// to test life cycle
class LifecyleComponent extends BaseHTMLElement {

	get info() { return 'some info' };

	constructor() {
		super();
		as_test_el(this).test_out.push('LifecycleComponent constructor');
	}

	init() {
		super.init();
		as_test_el(this).test_out.push('LifecycleComponent init')
	}

	preDisplay(firstCall: boolean) {
		as_test_el(this).test_out.push(`LifecycleComponent preDisplay ${firstCall}`);
	}

	postDisplay(firstCall: boolean) {
		as_test_el(this).test_out.push(`LifecycleComponent postDisplay ${firstCall}`);
	}
}
customElements.define('lifecycle-component', LifecyleComponent);

class MyBaseComponent extends BaseHTMLElement {

	@onEvent('click')
	baseClick() {
		out.push('MyBaseComponent @onEvent baseClick');
	}

	@onEvent('click')
	whenClick() {
		out.push('MyBaseComponent @onEvent whenClick=');
	}

}

@customElement('my-component')
class MyComponent extends MyBaseComponent {

	constructor() {
		super();

		this.events = addOnEvents(this.events, {
			'click': (evt) => {
				out.push('MyComponent this.events');
			}
		});

		this.hubEvents = addHubEvents(this.hubEvents, {
			'dataHub; topic1': (data: any, info: any) => {
				out.push('MyComponent dataHub; topic1');
			}
		});
	}


	init() {
		super.init();
		this.innerHTML = 'hello from MyComponent';
		on(this, 'click', (evt) => {
			out.push('MyComponent init on');
		});
	}

	@onEvent('click')
	whenClick() {
		out.push('MyComponent onEvent whenClick');
	}

	@onHub('dataHub', 'topic2')
	whenTopic2(data: any) {
		out.push('MyComponent onHub whenTopic2 ' + data);
	}
}

class DocEventComponent extends BaseHTMLElement {

	@onDoc('click')
	whenDocClick() {
		out.push('DocEventComponent @onDocEvent whenDocClick');
	}

}
customElements.define('doc-component', DocEventComponent);


@customElement('at-hub-component')
class AtHubComponent extends BaseHTMLElement {
	@onHub('dataHub', 'topic1')
	onTopic1() {
		out.push('AtHubComponent onTopic1');
	}
}

//#endregion ---------- /Test Components ----------



export function _beforeEach() {
	out = [];
}


export function testSimplestComponent() {
	const contentEl = getRequiredTestElement('.test-content');
	const [el] = append(contentEl, html('<simplest-component></simplest-component><simplest-component></simplest-component>'));
	el.click();
	equal(out, ['SimplestComponent @onEvent onClickEvent']);
}


export function testComponentEventBindings() {
	const contentEl = getRequiredTestElement('.test-content');
	contentEl.append(html('<my-component></my-component>'));

	first(contentEl, 'my-component')!.click();
	equal(out, ['MyComponent this.events', 'MyComponent onEvent whenClick', 'MyBaseComponent @onEvent baseClick', 'MyComponent init on']);
	contentEl.innerHTML = '';
}


// NOTE: Important to be async, becuse of the wait animation frame
export async function testComponentDocEvent() {
	const contentEl = getRequiredTestElement('.test-content');
	const [docComp] = append(contentEl, `<doc-component>DOC_COMPONENT</doc-component>`);

	// IMPORTANT: need to do make sure it docComp get fully added to get the doc event.
	await new Promise(requestAnimationFrame);

	// click on the parent of doc-component
	contentEl.click();
	equal(out, ['DocEventComponent @onDocEvent whenDocClick']);

	// reset out, remove doc-component, and click on contentEl to make sure event was removed
	out = [];
	contentEl.innerHTML = '';
	contentEl.click();
	equal(out, []);
}

// NOTE: Important to be async, becuse of the wait animation frame
export async function testReattachedComponentDocEvent() {
	const contentEl = getRequiredTestElement('.test-content');
	const [docComp] = append(contentEl, `<doc-component></doc-component>`);
	docComp.remove();
	contentEl.append(docComp);

	// IMPORTANT: need to do make sure it docComp get fully added to get the doc event.
	await new Promise(requestAnimationFrame);

	// click on the parent of doc-component
	contentEl.click();
	equal(out, ['DocEventComponent @onDocEvent whenDocClick']);

	// reset out, remove doc-component, and click on contentEl to make sure event was removed
	out = [];
	contentEl.innerHTML = '';
	contentEl.click();
	equal(out, []);
}

export function testComponentHubEvents() {
	const contentEl = getRequiredTestElement('.test-content');
	contentEl.append(html('<my-component></my-component>'));

	// test listening
	hub('dataHub').pub('topic1', 'topic1 msg 1'); // bind with this.hubEvents = addHubEvents(...);
	hub('dataHub').pub('topic1', 'topic1 msg 2');
	hub('dataHub').pub('topic2', 'msg2'); // for the @onHub...
	equal(out, ["MyComponent dataHub; topic1", "MyComponent dataHub; topic1", "MyComponent onHub whenTopic2 msg2"]);

	// test unbind on remove
	out = [];
	contentEl.innerHTML = '';
	hub('dataHub').pub('topic1', 'topic1 msg 1');
	hub('dataHub').pub('topic1', 'topic1 msg 2');
	hub('dataHub').pub('topic2', 'msg2'); // for the @onHub...
	equal(out, []);
}

export function testAtHubEventsComponent() {
	const contentEl = getRequiredTestElement('.test-content');
	append(contentEl, '<at-hub-component></at-hub-component>');

	hub('dataHub').pub('topic1', 'topic1 msg 1');
	equal(out, ['AtHubComponent onTopic1']);

	out = [];
	contentEl.innerHTML = '';
	hub('dataHub').pub('topic1', 'topic1 msg 1');
	equal(out, []); // should be empty, as the element was detached
}

export async function testLifecycle() {
	const contentEl = getRequiredTestElement(".test-content-lifecycle");
	const fragment = html('<lifecycle-component></lifecycle-component>');

	const el = fragment.firstElementChild! as TestHTMLElement;

	equal(el.constructor.name, 'HTMLElement'); // here the fliecycle is only a HTMLElement
	equal((el as any).info, undefined); // here, the property does not exist

	// Note: DocumentFragment or createElement do NOT instantiate the custom element class, just create a raw HTML element for the tag.
	equal(contentEl.test_out, []);
	// We append it to the DOM
	contentEl.append(fragment);

	// now, the same el as above, has been upgraded to LifecycleComponent
	equal(el.constructor.name, 'LifecyleComponent'); // Now, correct class
	equal((el as any).info, 'some info'); // Correct property
	// Here, should have init and pre
	equal(as_test_el(el).test_out, ["LifecycleComponent constructor", "LifecycleComponent init", "LifecycleComponent preDisplay true"]);

	await nextFrame();
	equal(as_test_el(el).test_out, ["LifecycleComponent constructor", "LifecycleComponent init", "LifecycleComponent preDisplay true", "LifecycleComponent postDisplay true"])
}

type TestHTMLElement = HTMLElement & { test_out: string[] };

function as_test_el(el: HTMLElement & any): TestHTMLElement {
	if (!Array.isArray(el.test_out)) {
		el.test_out = []
	}
	return el as TestHTMLElement;
}

function getRequiredTestElement(selector: string): TestHTMLElement {
	const el = first(selector);
	if (!(el instanceof HTMLElement)) {
		throw new Error(`Missing required test element: ${selector}`);
	}
	return as_test_el(el);
}

function nextFrame(): Promise<void> {
	return new Promise((resolve) => {
		requestAnimationFrame(() => resolve());
	});
}

declare global {
	interface HTMLElementTagNameMap {
		'simplest-component': SimplestComponent;
		'lifecycle-component': LifecyleComponent;
		'my-component': MyComponent;
		'doc-component': DocEventComponent;
		'at-hub-component': AtHubComponent;
	}
}

