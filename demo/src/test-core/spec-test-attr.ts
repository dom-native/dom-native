import { customElement, html } from "dom-native";
import { run_tests } from "../infra/runner.js";
import { SpecView } from "../infra/spec-view.js";
import { testGetSimple, testSetFalse, testSetMap, testSetNullInMap, testSetNum, testSetSimple, testSetTrue } from "./test-attr-logic.js";

@customElement("spec-test-attr")
export class SpecTestAttr extends SpecView {
	name = "test-attr";
	doc = {
		title: "dom-native test-attr",
		groups: [
			{
				items: [
					{
						title: "Attr tests runner",
						html: `
<div class="test-output">
  <h2>attr tests</h2>
  <ul id="output"></ul>
</div>`,
						run: (itemEl: HTMLElement) => {
							const tests = {
								testSetSimple,
								testGetSimple,
								testSetTrue,
								testSetFalse,
								testSetNum,
								testSetMap,
								testSetNullInMap,
							};
							const outputEl = itemEl.querySelector("#output") as HTMLUListElement;
							void run_tests(outputEl, tests, {
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

