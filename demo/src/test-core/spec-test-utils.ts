import { customElement, html } from "dom-native";
import { run_tests } from "../infra/runner.js";
import { SpecView } from "../infra/spec-view.js";
import { _beforeEach, _init, testValGet, testValSet, testValSetWithMap } from "./test-utils-logic.js";

@customElement("spec-test-utils")
export class SpecTestUtils extends SpecView {
	name = "test-utils";
	doc = {
		title: "dom-native test-utils",
		groups: [
			{
				items: [
					{
						title: "utils tests runner",
						html: `
<div class="test-output">
  <h2>utils tests</h2>
  <ul class="output"></ul>
</div>`,
						run: async (itemEl: HTMLElement) => {
							_init();
							const tests = {
								testValGet,
								testValSet,
								testValSetWithMap,
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
