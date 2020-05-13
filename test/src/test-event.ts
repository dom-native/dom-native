
import { first, on, off, trigger, OnEvent } from '../../src/index';
import { equal } from './utils';

let out: string[] = [];


export function _init() {
	const el = first(".container");

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

	on(el, "click", ".do-ns-1", function (evt) {
		out.push(".do-ns-1");
	}, { ns: "namespaceA" });

	on(el, "click", ".do-ns-2", function (evt) {
		out.push(".do-ns-2");
	}, { ns: "namespaceA" });

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
	first(".do-save")!.click();
	// check size and last
	equal(out, ["container click"]);
}

// check that binding with namespace worked, and then unbind (and check)
export function clickOnDoUnbindNS() {
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
	first(".do-ns-1")!.click();
	first(".do-ns-2")!.click();
	first(".do-other")!.click();
	equal(out, ["container click", "container click", "container click", ".do-other"]);
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