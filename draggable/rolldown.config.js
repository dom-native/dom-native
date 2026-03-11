import { defineConfig } from "rolldown";

export default defineConfig({
	input: new URL("./src/index.ts", import.meta.url).pathname,
	output: {
		file: new URL("./.dist-lib/dom-native-draggable.js", import.meta.url).pathname,
		format: "iife",
		name: "bundle",
		sourcemap: true,
	},
});
