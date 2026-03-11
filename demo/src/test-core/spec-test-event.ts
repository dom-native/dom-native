import { customElement, html } from "dom-native";
import { run_tests } from "../infra/runner.js";
import { SpecView } from "../infra/spec-view.js";
import { _beforeEach, _init, clickOnDoNs, clickOnDoSave, clickOnDoSaveAfterUnbind, clickOnDoSelect, clickOnDoSelectSub, clickOnDoUnbindNS, clickOnDoUnbindSave, docNs, onEventNextFrameOnDecorator, onEventNextFrameOnFunction, testCapture, testMultiBinding } from "./test-event-logic.js";

@customElement("spec-test-event")
export class SpecTestEvent extends SpecView {
	name = "test-event";
	doc = {
		title: "dom-native test-event",
		groups: [
			{
				items: [
					{
						title: "event tests runner",
						html: `
<div class="test-output">
  <h2>event tests</h2>
  <ul class="output"></ul>
</div>
<div class="test-content container">
  <button class="but do-save">Save</button>
  <button class="but do-unbind-save">Unbind Save</button>
  <button class="but do-ns-1">NS 1</button>
  <button class="but do-ns-2">NS 2</button>
  <button class="but do-unbind-ns">Unbind NS</button>
  <button class="but do-other">Other</button>
  <button class="but do-multi">Multi</button>
  <button class="but do-select"><span class="but do-select-sub">Select Sub</span></button>
  <button class="but do-capture">Capture</button>
</div>`,
						run: async (itemEl: HTMLElement) => {
							_init();
							const tests = {
								docNs,
								clickOnDoSave,
								clickOnDoUnbindSave,
								clickOnDoSaveAfterUnbind,
								clickOnDoUnbindNS,
								clickOnDoNs,
								clickOnDoSelect,
								clickOnDoSelectSub,
								testMultiBinding,
								testCapture,
								onEventNextFrameOnFunction,
								onEventNextFrameOnDecorator,
							};
							const outputEl = itemEl.querySelector(".output") as HTMLUListElement;
							await run_tests(outputEl, tests, {
								beforeEach: () => {
									_beforeEach();
								},
								createItemEl: (name: string) => {
									return html(`<li><strong>${name}</strong> running</li>`).firstElementChild as HTMLLIElement;
								},
								failInnerHTML: (name: string, ex: any) => {
									return `<strong>${name}</strong> FAILED ${ex}`;
								},
								successInnerHTML: (name: string) => {
									return `<strong>${name}</strong> OK`;
								},
							});
						},
					},
				],
			},
		],
	};
}
