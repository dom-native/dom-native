import { first, frag, hub, on, addOnEvents, addHubEvents, BaseHTMLElement, customElement, onDoc, onEvent, onHub } from '../../src/index';
import { equal } from './utils';

let out: string[] = [];

//#region    ---------- Test Components ---------- 

// to test life cycle
class LifecyleComponent extends BaseHTMLElement {

	get info() { return 'some info' };


	constructor() {
		super();
		out.push('LifecycleComponent constructor');
	}

	init() {
		super.init();
		out.push('LifecycleComponent init');
	}

	preDisplay() {
		out.push('LifecycleComponent preDisplay');
	}

	postDisplay() {
		out.push('LifecycleComponent postDisplay');
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

	events = addOnEvents(this.events, {
		'click': (evt) => {
			out.push('MyComponent this.events');
		}
	});

	hubEvents = addHubEvents(this.hubEvents, {
		'dataHub; topic1': (data: any, info: any) => {
			out.push('MyComponent dataHub; topic1');
		}
	})

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

//#endregion ---------- /Test Components ---------- 



export function _beforeEach() {
	out = [];
}

export function testComponentEventBindings() {
	const contentEl = first('.test-content')!;
	contentEl.append(frag('<my-component></my-component>'));

	first(contentEl, 'my-component')!.click();
	equal(out, ['MyComponent this.events', 'MyComponent onEvent whenClick', 'MyBaseComponent @onEvent baseClick', 'MyComponent init on']);
	contentEl.innerHTML = '';
}

export function testComponentDocEvent() {
	const contentEl = first('.test-content')!;
	contentEl.append(frag('<doc-component></doc-component>'));

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
	contentEl.append(frag('<my-component></my-component>'));

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

export function testLifecycle() {
	const contentEl = first('.test-content')!;
	const fragment = frag('<lifecycle-component></lifecycle-component>');

	const el = fragment.firstElementChild! as any;

	equal(el.constructor.name, 'HTMLElement'); // here the fliecycle is only a HTMLElement
	equal(el.info, undefined); // here, the property does not exist

	// Note: DocumentFragment or createElement do NOT instantiate the custom element class, just create a raw HTML element for the tag. 
	equal(out, []);

	// We append it to the DOM
	contentEl.append(fragment);

	// now, the same el as above, has been upgraded to LifecycleComponent
	equal(el.constructor.name, 'LifecyleComponent'); // Now, correct class
	equal(el.info, 'some info'); // Correct property

	// Here, should NOT have the pre or post display, but contstrutor and init has been created, because animationFrames are not called yet
	equal(out, ["LifecycleComponent constructor", "LifecycleComponent init"]);

	// This request animationFrame will be called in the same frame as the preDisplay, but just after, so, we will have the preDisplay
	requestAnimationFrame(() => {
		equal(out, ["LifecycleComponent constructor", "LifecycleComponent init", "LifecycleComponent preDisplay"]);
	});

	// This is the nextAnimationFrame, and then, we will have the postDisplay
	requestAnimationFrame(() => {
		requestAnimationFrame(() => {
			equal(out, ["LifecycleComponent constructor", "LifecycleComponent init", "LifecycleComponent preDisplay", "LifecycleComponent postDisplay"])
		})
	})

}