import { customElement, html } from "dom-native";
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
						run: (itemEl: HTMLElement) => {
							_init();
							const tests = {
								testValGet,
								testValSet,
								testValSetWithMap,
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
