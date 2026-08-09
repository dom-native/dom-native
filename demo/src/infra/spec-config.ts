import { NAV as DEMO_CORE_NAV } from "../demo-core/nav.js";
import { NAV as DEMO_DND_NAV } from "../demo-dnd/nav.js";
import { NAV as DEMO_UI_NAV } from "../demo-ui/nav.js";
import { NAV as TEST_CORE_NAV } from "../test-core/nav.js";

export type DemoFamily = "dom-native" | "dnd" | "dom-native-ui";

export const DOM_NATIVE_FAMILY: DemoFamily = "dom-native";
export const DND_FAMILY: DemoFamily = "dnd";
export const DOM_NATIVE_UI_FAMILY: DemoFamily = "dom-native-ui";

export const DEFAULT_SPEC_BY_FAMILY: Record<DemoFamily, string> = {
	[DOM_NATIVE_FAMILY]: "basic",
	[DND_FAMILY]: "dnd-basic",
	[DOM_NATIVE_UI_FAMILY]: "d-input",
};

export const SPEC_NAMES_BY_FAMILY: Record<DemoFamily, string[]> = {
	[DOM_NATIVE_FAMILY]: [...DEMO_CORE_NAV],
	[DND_FAMILY]: [...DEMO_DND_NAV],
	[DOM_NATIVE_UI_FAMILY]: [...DEMO_UI_NAV],
};

export const VALID_SPECS_BY_FAMILY: Record<DemoFamily, Set<string>> = {
	[DOM_NATIVE_FAMILY]: new Set(SPEC_NAMES_BY_FAMILY[DOM_NATIVE_FAMILY]),
	[DND_FAMILY]: new Set(SPEC_NAMES_BY_FAMILY[DND_FAMILY]),
	[DOM_NATIVE_UI_FAMILY]: new Set(SPEC_NAMES_BY_FAMILY[DOM_NATIVE_UI_FAMILY]),
};

export const ALL_FAMILIES: DemoFamily[] = [DOM_NATIVE_FAMILY, DND_FAMILY, DOM_NATIVE_UI_FAMILY];

export const DOM_NATIVE_TEST_FAMILY = "dom-native-test" as const;
export const DOM_NATIVE_TEST_SPEC_NAMES = TEST_CORE_NAV;
export type DomNativeTestSpecName = (typeof DOM_NATIVE_TEST_SPEC_NAMES)[number];
export const DEFAULT_DOM_NATIVE_TEST_SPEC: DomNativeTestSpecName = "test-dom";
export const VALID_DOM_NATIVE_TEST_SPECS = new Set<string>(DOM_NATIVE_TEST_SPEC_NAMES as readonly string[]);
