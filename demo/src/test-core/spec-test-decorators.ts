import { customElement, html } from "dom-native";
import { run_tests } from "../infra/runner.js";
import { SpecView } from "../infra/spec-view.js";
import { _beforeEach, testOnEvent, testOnHub } from "./test-decorators-logic.js";

@customElement("spec-test-decorators")
export class SpecTestDecorators extends SpecView {
	name = "test-decorators";
	doc = {
		title: "dom-native test-decorators",
		groups: [
			{
				items: [
					{
						title: "decorators tests runner",
						html: `
<div class="test-output">
  <h2>decorators tests</h2>
  <ul class="output"></ul>
</div>
<div class="test-content container">
  <dev-el>aaa</dev-el>
  <dev-el2>bbb</dev-el2>
</div>`,
						run: (itemEl: HTMLElement) => {
							const tests = {
								testOnEvent,
								testOnHub,
							};
							const outputEl = itemEl.querySelector(".output") as HTMLUListElement;
							void run_tests(outputEl, tests, {
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
