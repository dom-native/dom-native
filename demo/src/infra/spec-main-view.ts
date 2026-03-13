import { all, append, BaseHTMLElement, customElement, elem, first, onWin } from "dom-native";
import { split } from "utils-min";
import "./init-tslib.js";
import { type DemoFamily, DOM_NATIVE_FAMILY, DRAGGABLE_FAMILY, DEFAULT_SPEC_BY_FAMILY, SPEC_NAMES_BY_FAMILY, DOM_NATIVE_TEST_FAMILY, DOM_NATIVE_TEST_SPEC_NAMES, DEFAULT_DOM_NATIVE_TEST_SPEC, VALID_DOM_NATIVE_TEST_SPECS, DOM_NATIVE_UI_FAMILY } from "./spec-config.js";

@customElement("spec-main-view")
class SpecMainView extends BaseHTMLElement {
	init() {
		this.innerHTML = _render();
		this.refresh();
	}

	@onWin("hashchange")
	onHashChange() {
		this.refresh();
	}

	refresh() {
		const route = _normalizeRoute(window.location.hash);
		const canonicalHash = _toHash(route);
		if (window.location.hash !== canonicalHash) {
			window.location.hash = canonicalHash;
			return;
		}
		const { family, spec } = route;
		const specNames = family === DOM_NATIVE_TEST_FAMILY ? [...DOM_NATIVE_TEST_SPEC_NAMES] : SPEC_NAMES_BY_FAMILY[family];

		all(this, "nav a.sel").forEach((a) => a.classList.remove("sel"));
		all(this, "header > a.item.sel").forEach((a) => a.classList.remove("sel"));

		document.title = `Demo - ${spec}`;

		const navEl = first(this, "nav")!;
		navEl.innerHTML = specNames.map((name) => `<a href="#${family}/${name}">${name}</a>`).join("\n");

		const mainEl = first(this, "main")!;
		mainEl.innerHTML = "";
		const el = append(mainEl, elem(`spec-${spec}`));
		el.classList.add("spec-view");

		const tabEl = first(this, `header > a.item.${family}`);
		if (tabEl) {
			tabEl.classList.add("sel");
		}

		const select = `nav a[href="#${family}/${spec}"]`;
		const aEl = first(this, select);
		if (aEl) {
			aEl.classList.add("sel");
		} else {
			console.log(`WARNING - cannot find nav a for '${select}'`);
		}
	}
}

function _render() {
	return `
	<header>
		<h1>dom-native</h1>
		<span></span>
		<a class="item dom-native" href="#dom-native/${DEFAULT_SPEC_BY_FAMILY[DOM_NATIVE_FAMILY]}">dom-native</a>
		<a class="item draggable" href="#draggable/${DEFAULT_SPEC_BY_FAMILY[DRAGGABLE_FAMILY]}">draggable</a>
		<a class="item dom-native-ui" href="#dom-native-ui/${DEFAULT_SPEC_BY_FAMILY[DOM_NATIVE_UI_FAMILY]}">@dom-native/ui</a>
		<a class="item dom-native-test" href="#dom-native-test/${DEFAULT_DOM_NATIVE_TEST_SPEC}">dom-native-test</a>
	</header>
	<nav>
	</nav>
	<main>
	</main>
	<aside id='console'></aside>
	`;
}

function _normalizeRoute(hash: string): { family: DemoFamily | typeof DOM_NATIVE_TEST_FAMILY; spec: string } {
	const parsed = _parseRoute(hash);
	if (!parsed) {
		return _defaultRoute(DOM_NATIVE_FAMILY);
	}
	const { family, spec } = parsed;
	if (family === DOM_NATIVE_TEST_FAMILY) {
		if (!VALID_DOM_NATIVE_TEST_SPECS.has(spec)) {
			return _defaultRoute(DOM_NATIVE_TEST_FAMILY);
		}
		return parsed;
	}
	if (!SPEC_NAMES_BY_FAMILY[family].includes(spec)) {
		return _defaultRoute(DOM_NATIVE_FAMILY);
	}
	return parsed;
}

function _defaultRoute(family: DemoFamily | typeof DOM_NATIVE_TEST_FAMILY): { family: DemoFamily | typeof DOM_NATIVE_TEST_FAMILY; spec: string } {
	if (family === DOM_NATIVE_TEST_FAMILY) {
		return {
			family,
			spec: DEFAULT_DOM_NATIVE_TEST_SPEC,
		};
	}
	return {
		family,
		spec: DEFAULT_SPEC_BY_FAMILY[family],
	};
}

function _toHash(route: { family: DemoFamily | typeof DOM_NATIVE_TEST_FAMILY; spec: string }): string {
	return `#${route.family}/${route.spec}`;
}

function _parseRoute(hash: string): { family: DemoFamily | typeof DOM_NATIVE_TEST_FAMILY; spec: string } | null {
	if (!hash) {
		return null;
	}
	const cleanHash = hash.startsWith("#") ? hash.substring(1) : hash;
	const [familyRaw, specRaw] = split(cleanHash, "/");
	if (!familyRaw || !specRaw) {
		return null;
	}
	if (familyRaw !== DOM_NATIVE_FAMILY && familyRaw !== DRAGGABLE_FAMILY && familyRaw !== DOM_NATIVE_TEST_FAMILY && familyRaw !== DOM_NATIVE_UI_FAMILY) {
		return null;
	}
	return { family: familyRaw, spec: specRaw };
}
