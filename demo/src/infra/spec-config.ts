export type DemoFamily = "dom-native" | "draggable";

export const DOM_NATIVE_FAMILY: DemoFamily = "dom-native";
export const DRAGGABLE_FAMILY: DemoFamily = "draggable";

export const DEFAULT_SPEC_BY_FAMILY: Record<DemoFamily, string> = {
	[DOM_NATIVE_FAMILY]: "basic",
	[DRAGGABLE_FAMILY]: "dnd-simple",
};

export const SPEC_NAMES_BY_FAMILY: Record<DemoFamily, string[]> = {
	[DOM_NATIVE_FAMILY]: ["basic", "shadow-dom", "event", "position", "anim", "perf"],
	[DRAGGABLE_FAMILY]: ["dnd-simple", "dnd-basic", "dnd-nested", "flip", "sample-slider"],
};

export const VALID_SPECS_BY_FAMILY: Record<DemoFamily, Set<string>> = {
	[DOM_NATIVE_FAMILY]: new Set(SPEC_NAMES_BY_FAMILY[DOM_NATIVE_FAMILY]),
	[DRAGGABLE_FAMILY]: new Set(SPEC_NAMES_BY_FAMILY[DRAGGABLE_FAMILY]),
};

export const ALL_FAMILIES: DemoFamily[] = [DOM_NATIVE_FAMILY, DRAGGABLE_FAMILY];

export const DOM_NATIVE_TEST_FAMILY = "dom-native-test" as const;
export const DOM_NATIVE_TEST_SPEC_NAMES = ["test-dom", "test-position"] as const;
export type DomNativeTestSpecName = (typeof DOM_NATIVE_TEST_SPEC_NAMES)[number];
export const DEFAULT_DOM_NATIVE_TEST_SPEC: DomNativeTestSpecName = "test-dom";
export const VALID_DOM_NATIVE_TEST_SPECS = new Set<string>(DOM_NATIVE_TEST_SPEC_NAMES as readonly string[]);
