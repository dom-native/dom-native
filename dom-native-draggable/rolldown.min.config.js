import { defineConfig } from "rolldown";

const input = new URL("./src/index.ts", import.meta.url).pathname;

export default defineConfig({
	input,
	output: {
		file: new URL("./.dist-lib/dom-native-draggable.min.js", import.meta.url).pathname,
		format: "iife",
		name: "bundle",
		sourcemap: true,
		minify: true,
	},
});

