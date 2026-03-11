import { customElement, html } from "dom-native";
import { run_tests } from "../infra/runner.js";
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
								testLifecycle, //TODO: need to fix that.
							};
							const outputEl = itemEl.querySelector("#output") as HTMLUListElement;
							const testContentEl = itemEl.querySelector(".test-content") as HTMLElement;
							const lifecycleEl = itemEl.querySelector(".test-content-lifecycle") as HTMLElement & { test_out: string[] };
							lifecycleEl.test_out = [];
							(testContentEl as HTMLElement & { test_out?: string[] }).test_out = [];
							await run_tests(outputEl, tests, {
								beforeEach: async () => {
									await _beforeEach();
									testContentEl.innerHTML = "";
									lifecycleEl.innerHTML = "";
									lifecycleEl.test_out = [];
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

