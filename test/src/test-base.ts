import { addHubEvents, addOnEvents, append, BaseHTMLElement, customElement, first, html, hub, on, onDoc, onEvent, onHub } from '#dom-native';
import { as_test_el, equal, first_test_el } from './utils';

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
		out.push('MyBaseComponent @onEvent whenClick');
	}

}

@customElement('my-component')
class MyComponent extends MyBaseComponent {

	events = addOnEvents(this.events, {
		'click': (evt) => {
			out.push('MyComponent this.events');
		}
	});

	hubEvents = addHubEvents(this.hubEvents, {
		'dataHub; topic1': (data: any, info: any) => {
			out.push('MyComponent dataHub; topic1');
		}
	});

	init() {
		super.init();
		this.innerHTML = 'hello from MyComponent';
		on(this, 'click', (evt) => {
			out.push('MyComponent init on');
		});
	}

	@onEvent('click')
	whenClick() {
		out.push('MyComponent @onEvent whenClick');
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
	const contentEl = first('.test-content')!;
	const [el] = append(contentEl, html('<simplest-component></simplest-component><simplest-component></simplest-component>'));
	el.click();
	equal(out, ['SimplestComponent @onEvent onClickEvent']);
}


export function testComponentEventBindings() {
	const contentEl = first('.test-content')!;
	contentEl.append(html('<my-component></my-component>'));

	first(contentEl, 'my-component')!.click();
	const expected = ['MyComponent this.events', 'MyBaseComponent @onEvent baseClick', 'MyComponent @onEvent whenClick', 'MyComponent init on'];
	equal(expected, out);
	contentEl.innerHTML = '';
}



export function testComponentDocEvent() {
	const contentEl = first('.test-content')!;
	const [docComp] = append(contentEl, `<doc-component></doc-component>`);

	// click on the parent of doc-component
	contentEl.click();
	equal(out, ['DocEventComponent @onDocEvent whenDocClick']);

	// reset out, remove doc-component, and click on contentEl to make sure event was removed
	out = [];
	contentEl.innerHTML = '';
	contentEl.click();
	equal(out, []);
}

export function testReattachedComponentDocEvent() {
	const contentEl = first('.test-content')!;
	const [docComp] = append(contentEl, `<doc-component></doc-component>`);
	docComp.remove();
	contentEl.append(docComp);

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
	const contentEl = first('.test-content')!;
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
	const contentEl = first('.test-content')!;
	append(contentEl, '<at-hub-component></at-hub-component>');

	hub('dataHub').pub('topic1', 'topic1 msg 1');
	equal(out, ['AtHubComponent onTopic1']);

	out = [];
	contentEl.innerHTML = '';
	hub('dataHub').pub('topic1', 'topic1 msg 1');
	equal(out, []); // should be empty, as the element was detached
}

export function testLifecycle() {
	const contentEl = first_test_el(".test-content-lifecycle");
	const fragment = html('<lifecycle-component></lifecycle-component>');

	const el = fragment.firstElementChild! as any;

	equal(el.constructor.name, 'HTMLElement'); // here the fliecycle is only a HTMLElement
	equal(el.info, undefined); // here, the property does not exist

	// Note: DocumentFragment or createElement do NOT instantiate the custom element class, just create a raw HTML element for the tag. 
	equal(as_test_el(contentEl).test_out, []);

	// We append it to the DOM
	contentEl.append(fragment);

	// now, the same el as above, has been upgraded to LifecycleComponent
	equal(el.constructor.name, 'LifecyleComponent'); // Now, correct class
	equal(el.info, 'some info'); // Correct property
	// Here, should NOT have the pre or post display, but contstrutor and init has been created, because animationFrames are not called yet
	equal(as_test_el(el).test_out, ["LifecycleComponent constructor", "LifecycleComponent init"]);

	// This request animationFrame will be called in the same frame as the preDisplay, but just after, so, we will have the preDisplay
	requestAnimationFrame(() => {
		equal(as_test_el(el).test_out, ["LifecycleComponent constructor", "LifecycleComponent init", "LifecycleComponent preDisplay true"]);
	});

	// This is the nextAnimationFrame, and then, we will have the postDisplay
	requestAnimationFrame(() => {
		requestAnimationFrame(() => {
			equal(as_test_el(el).test_out, ["LifecycleComponent constructor", "LifecycleComponent init", "LifecycleComponent preDisplay true", "LifecycleComponent postDisplay true"])
		})
	})

}

