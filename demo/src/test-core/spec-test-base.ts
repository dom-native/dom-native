import { customElement, html } from "dom-native";
import { SpecView } from "../infra/spec-view.js";
import { _beforeEach, testAtHubEventsComponent, testComponentDocEvent, testComponentEventBindings, testComponentHubEvents, testLifecycle, testReattachedComponentDocEvent, testSimplestComponent } from "./test-base-logic.js";

@customElement("spec-test-base")
export class SpecTestBase extends SpecView {
	name = "test-base";
	doc = {
		title: "dom-native test-base",
		groups: [
			{
				items: [
					{
						title: "Base tests runner",
						html: `
<div class="test-output">
  <h2>base tests</h2>
  <ul id="output"></ul>
</div>
<div class="test-content"></div>
<div class="test-content-lifecycle"></div>`,
						run: async (itemEl: HTMLElement) => {
							const tests = {
								testSimplestComponent,
								testComponentEventBindings,
								testComponentHubEvents,
								testAtHubEventsComponent,
								testComponentDocEvent,
								testReattachedComponentDocEvent,
								// testLifecycle, //TODO: need to fix that.
							};
							const outputEl = itemEl.querySelector("#output") as HTMLUListElement;
							const testContentEl = itemEl.querySelector(".test-content") as HTMLElement;
							const lifecycleEl = itemEl.querySelector(".test-content-lifecycle") as HTMLElement & { test_out: string[] };
							lifecycleEl.test_out = [];
							(testContentEl as HTMLElement & { test_out?: string[] }).test_out = [];
							Object.entries(tests).forEach(async ([name, fn]) => {
								_beforeEach();
								testContentEl.innerHTML = "";
								lifecycleEl.innerHTML = "";
								lifecycleEl.test_out = [];
								const li = html(`<li><strong>${name}</strong> running</li>`).firstElementChild as HTMLLIElement;
								outputEl.appendChild(li);
								try {
									const ret = await fn();
									li.innerHTML = `<strong>${name}</strong> OK`;
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

