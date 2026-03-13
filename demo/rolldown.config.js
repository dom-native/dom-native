import { defineConfig } from "rolldown";

export default defineConfig({
	input: new URL("./src/main.ts", import.meta.url).pathname,
	platform: "browser",
	tsconfig: new URL("./tsconfig.json", import.meta.url).pathname,
	resolve: {
		alias: {
			"dom-native": new URL("../dom-native/src/index.ts", import.meta.url).pathname,
			"#dom-native": new URL("../dom-native/src/index.ts", import.meta.url).pathname,
			"@dom-native/draggable": new URL("../dom-native-draggable/src/index.ts", import.meta.url).pathname,
			"@dom-native/ui": new URL("../dom-native-ui/src/index.ts", import.meta.url).pathname,
		},
	},
	output: {
		file: new URL("./web-content/js/demo-bundle.js", import.meta.url).pathname,
		format: "iife",
		sourcemap: true,
	},
});
