import { customElement, html } from "dom-native";
import { run_tests } from "../infra/runner.js";
import { SpecView } from "../infra/spec-view.js";
import { _beforeEach, testElemSimple, testElemSimpleMultiple, testElemWithAttrAnd$PropsTextContent, testElemWithAttrs, testFragAray, testFragEmpty } from "./test-builder-logic.js";

@customElement("spec-test-builder")
export class SpecTestBuilder extends SpecView {
	name = "test-builder";
	doc = {
		title: "dom-native test-builder",
		groups: [
			{
				items: [
					{
						title: "Builder tests runner",
						html: `
<div class="test-output">
  <h2>builder tests</h2>
  <ul id="output"></ul>
</div>`,
						run: (itemEl: HTMLElement) => {
							const tests = {
								testElemSimple,
								testElemSimpleMultiple,
								testElemWithAttrs,
								testElemWithAttrAnd$PropsTextContent,
								testFragEmpty,
								testFragAray,
							};
							const outputEl = itemEl.querySelector("#output") as HTMLUListElement;
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

