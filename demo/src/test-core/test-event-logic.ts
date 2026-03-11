import { BaseHTMLElement, customElement, elem, first, off, on, onEvent, trigger } from 'dom-native';
import type { OnEvent } from 'dom-native';
import { equal } from './test-utils.js';

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

	const doClickListener = function (evt: Event) {
		out.push("container click");
	};

	on(container_el, "click", doClickListener);

	const doSaveListener = function (evt: Event) {
		out.push(".do-save click");
		trigger(evt.target as EventTarget, "DOSAVE", { detail: "some stuff" });
	};

	on(container_el, "click", ".do-save", doSaveListener);

	on(container_el, "click", ".do-unbind-save", function (evt) {
		out.push(".do-unbind-save click");
		off(container_el, "click", ".do-save");
	});



	on(container_el, "click", ".do-unbind-ns", function (evt) {
		out.push(".do-unbind-ns");
		off(container_el, { ns: "namespaceA" });
	});

	on(container_el, "click", ".do-other", function (evt) {
		out.push(".do-other");
	});

	on(container_el, "DOSAVE", function (evt) {
		out.push("DOSAVE");
	});

	on(container_el, "click, noexist,,, custom1", ".do-multi", function (evt) {
		out.push(evt.type + ".do-multi");
	});

	on(container_el, "click", ".do-select", function (evt: Event & OnEvent) {
		out.push((evt.target as HTMLElement)!.className);
		out.push((evt.currentTarget as HTMLElement)!.className);
		out.push((evt.selectTarget as HTMLElement)!.className);
	});

	on(container_el, "click", ".do-capture", function (evt: MouseEvent) {
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

	return new Promise<void>((resolve, reject) => {
		requestAnimationFrame(() => {
			// val should be new since it was next frame above
			// and no more click after the above creation frame
			if (val != null) {
				reject(new Error('onEventNextFrameOnFunction nextFrame: true did not work, still got the event'));
				return;
			}
			resolve();
		});
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

	return new Promise<void>((resolve, reject) => {
		requestAnimationFrame(() => {
			if (nx_frame_component_val != null) {
				reject(new Error('value = 1, but should remain null, as nextFrame: true. '));
				return;
			}
			resolve();
		});
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
	equal(out, ["container click", "but do-select", "test-content container", "but do-select"]);
}

// test at the event.selectTarget when event occurs on one of the children
export function clickOnDoSelectSub() {
	first(".do-select-sub")!.click();

	// main view event, event.target, event.currentTarget, event.selectTarget
	equal(out, ["container click", "but do-select-sub", "test-content container", "but do-select"]);
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
	equal(out, ['capture', 'capture']);
}
