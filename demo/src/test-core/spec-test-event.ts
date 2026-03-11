import { customElement, html } from "dom-native";
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
						run: (itemEl: HTMLElement) => {
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
							Object.entries(tests).forEach(([name, fn]) => {
								const li = html(`<li><strong>${name}</strong> running</li>`).firstElementChild as HTMLLIElement;
								outputEl.appendChild(li);
								try {
									_beforeEach();
									const ret = fn();
									Promise.resolve(ret).then(() => {
										li.innerHTML = `<strong>${name}</strong> OK`;
									}).catch((ex) => {
										li.innerHTML = `<strong>${name}</strong> FAILED ${ex}`;
										li.classList.add("fail");
									});
								} catch (ex) {
									li.innerHTML = `<strong>${name}</strong> FAILED ${ex}`;
									li.classList.add("fail");
								}
							});
						},
					},
				],
			},
		],
	};
}
