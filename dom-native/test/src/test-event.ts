
import { BaseHTMLElement, customElement, elem, first, off, on, onEvent, OnEvent, trigger } from '#dom-native';
import { fail_test } from './runner';
import { equal } from './utils';

let out: string[] = [];
let container_el: HTMLElement;

function bind_do_ns_1_and_2() {
	on(container_el, "click", ".do-ns-1", function (evt) {
		out.push(".do-ns-1");
	}, { ns: "namespaceA" });

	on(container_el, "click", ".do-ns-2", function (evt) {
		out.push(".do-ns-2");
	}, { ns: "namespaceA" });
}
export function _init() {
	container_el = first(".container")!;
	let el = container_el;

	const doClickListener = function (evt: Event) {
		out.push("container click");
	};

	on(el, "click", doClickListener);

	const doSaveListener = function (evt: Event) {
		out.push(".do-save click");
		trigger(evt.target, "DOSAVE", { detail: "some stuff" });
	};

	on(el, "click", ".do-save", doSaveListener);

	on(el, "click", ".do-unbind-save", function (evt) {
		out.push(".do-unbind-save click");
		off(el, "click", ".do-save");
	});



	on(el, "click", ".do-unbind-ns", function (evt) {
		out.push(".do-unbind-ns");
		off(el, { ns: "namespaceA" });
	});

	on(el, "click", ".do-other", function (evt) {
		out.push(".do-other");
	});

	on(el, "DOSAVE", function (evt) {
		out.push("DOSAVE");
	});

	on(el, "click, noexist,,, custom1", ".do-multi", function (evt) {
		out.push(evt.type + ".do-multi");
	});

	on(el, "click", ".do-select", function (evt: Event & OnEvent) {
		out.push((<HTMLElement>evt.target)!.className);
		out.push((<HTMLElement>evt.currentTarget)!.className);
		out.push((<HTMLElement>evt.selectTarget)!.className);
	});

	on(el, "click", ".do-capture", function (evt: MouseEvent) {
		out.push('capture');
		evt.stopPropagation();
	}, { capture: true, passive: false });

	on(document, "CUSTOM_WITH_NS123", () => {
		out.push('CUSTOM_WITH_NS123');
	}, { ns: 'ns123' });
}

export function _beforeEach() {
	out = [];
}

export function onEventNextFrameOnFunction() {
	const ctnEl = first(".container");
	const el = elem("div", { class: "but", $: { textContent: "onEventNextFrameOnFunction" } });

	let val: string | null = null;

	on(el, "click", function () {
		val = "NEXT_FRAME";
	}, { nextFrame: true });
	el.click();
	ctnEl?.append(el);

	requestAnimationFrame(() => {
		// val should be new since it was next frame above
		// and no more click after the above creation frame
		if (val != null) {
			fail_test('onEventNextFrameOnFunction', 'nextFrame: true did not work, still got the event');
		}
	});
}

let nx_frame_component_val: number | null = null;

@customElement('nx-frame-component')
class NxFrameComponent extends BaseHTMLElement { // extends HTMLElement
	@onEvent("click", { nextFrame: true })
	onDocClick() {
		nx_frame_component_val = 1;
	}
}

export function onEventNextFrameOnDecorator() {
	const ctnEl = first(".container");
	const el = elem("nx-frame-component", { class: "but", $: { textContent: "onEventNextFrameOnDecorator" } });

	// Note - Here for the test, we can put it above to mimic the case when the click is real. 
	//        In real scenarios, it does not matter the order, it will get the value.
	ctnEl?.append(el);
	el.click();

	requestAnimationFrame(() => {
		if (nx_frame_component_val != null) {
			fail_test('onEventNextFrameOnDecorator', 'value = 1, but should remain null, as nextFrame: true. ');
		}
	});
}

export function docNs() {
	trigger(document, 'CUSTOM_WITH_NS123');
	equal(out, ["CUSTOM_WITH_NS123"]);
	out = [];
	off(document, { ns: 'ns123' });
	trigger(document, 'CUSTOM_WITH_NS123');
	equal(out, []);
}

// test event binding with custom event after
export function clickOnDoSave() {
	first(".do-save")!.click();
	// check size and last
	equal(out, ["container click", ".do-save click", "DOSAVE"]);
}

// unbind the save button (check result as well)
export function clickOnDoUnbindSave() {
	first(".do-unbind-save")!.click();
	// check size and last
	equal(out, ["container click", ".do-unbind-save click"]);
}

// check that the save button has been unbound
export function clickOnDoSaveAfterUnbind() {
	first(".do-unbind-save")!.click();
	out = [];
	first(".do-save")!.click();
	// check size and last
	equal(out, ["container click"]);
}

// check that binding with namespace worked, and then unbind (and check)
export function clickOnDoUnbindNS() {
	bind_do_ns_1_and_2();
	first(".do-ns-1")!.click();
	first(".do-ns-2")!.click();
	first(".do-unbind-ns")!.click();
	// check size and last
	equal(out, ["container click", ".do-ns-1",
		"container click", ".do-ns-2",
		"container click", ".do-unbind-ns"]);
}

// check that the unbinding by namespace worked
export function clickOnDoNs() {

	first(".do-unbind-ns")!.click();
	first(".do-ns-1")!.click();
	first(".do-ns-2")!.click();
	first(".do-other")!.click();

	equal(out, [
		"container click",
		".do-unbind-ns",
		"container click",
		"container click",
		"container click",
		".do-other"
	]);

}

// test at event.selectTarget is set correctly when event is triggered on the selected element
export function clickOnDoSelect() {
	first(".do-select")!.click();
	// main view event, event.target, event.currentTarget, event.selectTarget
	equal(out, ["container click", "but do-select", "container", "but do-select"]);
}

// test at the event.selectTarget when event occurs on one of the children
export function clickOnDoSelectSub() {
	first(".do-select-sub")!.click();

	// main view event, event.target, event.currentTarget, event.selectTarget
	equal(out, ["container click", "but do-select-sub", "container", "but do-select"]);
}

export function testMultiBinding() {
	const el = first(".do-multi")!;
	el.click();
	trigger(el, "custom1");

	equal(out, ["container click", "click.do-multi", "custom1.do-multi"]);
}

export function testCapture() {
	const el = first(".do-capture")!;
	el.click();
	el.click();
}