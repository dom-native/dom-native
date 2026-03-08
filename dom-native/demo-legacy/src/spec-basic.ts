import { BaseHTMLElement, customElement } from "#dom-native";
import { CodeDoc, SpecView } from "@dom-native/demo-infra";
import { code_simpleElement, code_simpleElement2 } from "./_codes.js";

@customElement("spec-basic")
export class SpecBasicView extends SpecView {
	name = "spec-basic";
	doc = spec_doc;
}

//#region    ---------- code: simpleElement ----------
// BaseHTMLElement is a simple class extending DOM HTMLElement
//                 with minimum but expressive lifecycle with
//                 init, preDisplay, postDisplay, and event bindings
class SimpleElement extends BaseHTMLElement {
	// will be called only once, on first connectedCallback
	init() {
		this.innerHTML = "!!! Hello from SimpleElement !!!";
	}
}
customElements.define("simple-element", SimpleElement);
//#endregion ---------- /code: simpleElement ----------

//#region    ---------- code: simpleElement2 --------
@customElement("simple-element-2") // dom-native provide this ts decorator
class SimpleElement2 extends BaseHTMLElement {
	private _mode?: "warning" | "info";
	set mode(m: "warning" | "info") {
		this._mode = m;
		this.style.background = m == "warning" ? "yellow" : m == "info" ? "#DDDDFF" : "#FFF";
	}

	init() {
		this.innerHTML = "Simple @customElement decorator";
	}

	// before the first paint (allows to further intialize the element with eventual data added after the parentEl.append )
	preDisplay() {
		this.innerHTML += " - mode: " + this._mode;
	}
}
//#endregion ---------- /code: simpleElement2 --------

function basicLifeCycle(rootEl: HTMLElement) {
	// create the "blank" simple-element-2
	const el = document.createElement("simple-element-2") as SimpleElement2;
	el.classList.add("box");
	// NOTE: At this point, SimpleElement2 is NOT yet instantiated
	//
	rootEl.append(el);
	// NOTE: since rootEl is attached to the document, the DOM will instantiate SimpleElement2 class and
	//       attach it to the el above (process called "upgrade"), and call the  connectedCallback
	//       dom-native BaseHTMLElement overrides connectedCallback to call init() (only the first time)
	//
	// NOTE: el is now  SimpleElement2, so does have .mode setter
	el.mode = "info";
	//
	// NOTE: After this function, assuming no more code in this loop, the DOM will render and
	//       the preDisplay() (if defined) will be called, before the first paint, as it was registered as requestAnimationFrame
	//       by dom-native BaseHTMLElement class.
	//       This technic allows to set element data after they are added but before they are painted
}

const spec_doc: CodeDoc = {
	title: "dom-native basic",
	jsPrefix: ``,
	groups: [
		{
			items: [
				{
					title: "Simple Element",
					html: `
<div class="root-el">
  <simple-element class="box"></simple-element>
</div>
			`,
					ts: code_simpleElement,
				},
				{
					title: "Basic HTMLElement lifecycle with preDisplay",
					html: `
<div class="root-el">
</div>
			`,
					ts: code_simpleElement2,
					js: basicLifeCycle,
				},
			],
		},
	],
};
