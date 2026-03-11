import { customElement, html } from "dom-native";
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
						run: (itemEl: HTMLElement) => {
							_init();
							const tests = {
								pubHub1Topic1,
								pubHub1Topic1Label1,
								unsubNs1,
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
