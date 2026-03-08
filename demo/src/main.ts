import "./demo-core";
import "./demo-draggable";
import { hub } from "dom-native";
import { type DemoFamily, DOM_NATIVE_FAMILY, DRAGGABLE_FAMILY, DEFAULT_SPEC_BY_FAMILY, VALID_SPECS_BY_FAMILY } from "./infra/spec-config.js";

const routerHub = hub("router-hub");
routerHub.sub("navigate", (route: string) => {
	console.log("->> on navigate", route);
	// const canonicalHash = _normalizeToCanonicalHash(route);
	// NOTE: disable for now
	// if (window.location.hash !== canonicalHash) {
	// 	window.location.hash = canonicalHash;
	// }
});

window.addEventListener("hashchange", () => {
	_applyCanonicalHash(window.location.hash);
});

_applyCanonicalHash(window.location.hash);

function _applyCanonicalHash(hash: string) {
	const canonicalHash = _normalizeToCanonicalHash(hash);
	if (window.location.hash !== canonicalHash) {
		window.location.hash = canonicalHash;
		return;
	}
	routerHub.pub("route-changed", _parseCanonicalHash(canonicalHash));
}

function _normalizeToCanonicalHash(hash: string) {
	const parsed = _parseRawHash(hash);
	if (!parsed) {
		return _defaultHashForFamily(DOM_NATIVE_FAMILY);
	}
	const { family, spec } = parsed;
	const validSpecs = VALID_SPECS_BY_FAMILY[family];
	if (!validSpecs.has(spec)) {
		return _defaultHashForFamily(DOM_NATIVE_FAMILY);
	}
	return `#${family}/${spec}`;
}

function _defaultHashForFamily(family: DemoFamily) {
	return `#${family}/${DEFAULT_SPEC_BY_FAMILY[family]}`;
}

function _parseCanonicalHash(hash: string) {
	const cleanHash = hash.startsWith("#") ? hash.substring(1) : hash;
	const [family, spec] = cleanHash.split("/");
	return { family, spec };
}

function _parseRawHash(hash: string): { family: DemoFamily; spec: string } | null {
	if (!hash) {
		return null;
	}
	const cleanHash = hash.startsWith("#") ? hash.substring(1) : hash;
	const [familyRaw, specRaw] = cleanHash.split("/");
	if (!familyRaw || !specRaw) {
		return null;
	}
	if (familyRaw !== DOM_NATIVE_FAMILY && familyRaw !== DRAGGABLE_FAMILY) {
		return null;
	}
	return { family: familyRaw, spec: specRaw };
}
