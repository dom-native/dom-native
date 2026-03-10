import { customElement, html } from "dom-native";
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
							Object.entries(tests).forEach(([name, fn]) => {
								_beforeEach();
								const li = html(`<li><strong>${name}</strong> running</li>`).firstElementChild as HTMLLIElement;
								outputEl.appendChild(li);
								try {
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

