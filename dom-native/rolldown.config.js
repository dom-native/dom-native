import { defineConfig } from "rolldown";

const input = new URL("./src/index.ts", import.meta.url).pathname;

export default defineConfig({
	input,
	platform: "browser",
	tsconfig: new URL("./tsconfig.json", import.meta.url).pathname,
	output: {
		file: new URL("./.dist-lib/dom-native.js", import.meta.url).pathname,
		format: "iife",
		name: "bundle",
		sourcemap: true,
	},
});

