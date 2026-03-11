import { customElement, html } from "dom-native";
import { run_tests } from "../infra/runner.js";
import { SpecView } from "../infra/spec-view.js";
import { _beforeEach, _init, pubHub1Topic1, pubHub1Topic1Label1, unsubNs1 } from "./test-hub-logic.js";

@customElement("spec-test-hub")
export class SpecTestHub extends SpecView {
	name = "test-hub";
	doc = {
		title: "dom-native test-hub",
		groups: [
			{
				items: [
					{
						title: "hub tests runner",
						html: `
<div class="test-output">
  <h2>hub tests</h2>
  <ul class="output"></ul>
</div>`,
						run: async (itemEl: HTMLElement) => {
							_init();
							const tests = {
								pubHub1Topic1,
								pubHub1Topic1Label1,
								unsubNs1,
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
