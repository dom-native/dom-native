import { customElement, html } from "dom-native";
import { run_tests } from "../infra/runner.js";
import { SpecView } from "../infra/spec-view.js";
import { testAll, testAppendAndHtml, testAppendElReturnValue, testAppendEmpty, testAppendHtmlReturnValue, testClosest, testFirst, testFirstElement, testFirstFromHtml, testFirstMultiple, testFirstWithType, testGetFirstException, testGetFirstSuccess, testNext, testPrev, testScanChild, testScanChildMany, thisAppendToHtml } from "./test-dom-logic.js";

@customElement("spec-test-dom")
export class SpecTestDom extends SpecView {
	name = "test-dom";
	doc = {
		title: "dom-native test-dom",
		groups: [
			{
				items: [
					{
						title: "DOM tests runner",
						html: `
<div class="test-output">
  <h2>dom tests</h2>
  <ul id="output"></ul>
</div>
<div class="test-content container">
  test-content text
  <div class="rect el-a">A</div>
  <div class="rect el-b">B 1</div>
  <div class="rect el-b">B 2</div>
  <div class="rect el-c">C 1</div>
  <div class="rect el-c">C 2</div>
  <div class="rect el-c">C 3</div>
  <div class="rect el-d container">
    D
    <div class="rect sm el-d foo">D.foo 1</div>
    <div class="rect sm el-d foo">D.foo 2</div>
    <div class="rect sm el-d bar">D.bar 3</div>
  </div>
  <div class="rect el-f container">
    F
    <div class="rect sm">FFF</div>
  </div>
  <div class="rect el-g">
    <div></div>
    <c-test class="some"></c-test>
    <span></span>
    <unknown-comp></unknown-comp>
    <div></div>
  </div>
</div>`,
						run: (itemEl: HTMLElement) => {
							const tests = {
								testFirst,
								testFirstElement,
								testFirstMultiple,
								testGetFirstSuccess,
								testGetFirstException,
								testAll,
								testClosest,
								testNext,
								testPrev,
								testAppendAndHtml,
								testAppendEmpty,
								testFirstFromHtml,
								thisAppendToHtml,
								testAppendElReturnValue,
								testAppendHtmlReturnValue,
								testFirstWithType,
								testScanChild,
								testScanChildMany,
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

