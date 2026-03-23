import { spawn } from "node:child_process";
import chokidar from "chokidar";
import { buildCommands, copyFileIfExists, runCommand } from "./build-utils.js";

const ROLLDOWN_CONFIG = "demo/rolldown.config.js";
const LIGHTNINGCSS_CONFIG = "demo/lightningcss.config.js";

const UI_SYMBOLS_SOURCE = "dom-native-ui/assets/symbols.svg";
const UI_SYMBOLS_DESTINATION = "demo/web-content/images/symbols.svg";

const CSS_WATCH_ROOTS = [
	"demo/css",
	"dom-native-ui/css",
];

const ASSET_WATCH_ROOTS = [
	"dom-native-ui/assets",
];

const DEBOUNCE_MS = 300;
const isWatching = process.argv.includes("-w") || process.argv.includes("--watch");

function runBuildOnce() {
	const exitCode = buildCommands([
		["rolldown", ["-c", ROLLDOWN_CONFIG]],
		["node", [LIGHTNINGCSS_CONFIG]],
	]);
	if (exitCode !== 0) {
		return exitCode;
	}

	copyFileIfExists(UI_SYMBOLS_SOURCE, UI_SYMBOLS_DESTINATION);
	return 0;
}

function buildCss() {
	runCommand("node", [LIGHTNINGCSS_CONFIG]);
}

function copyAssets() {
	copyFileIfExists(UI_SYMBOLS_SOURCE, UI_SYMBOLS_DESTINATION);
}

function runWatchMode() {
	// Initial full build (CSS + assets; rolldown will do its own initial build via -w)
	buildCss();
	copyAssets();

	// Delegate JS/TS watching to rolldown's native watch mode
	const rolldownProc = spawn("rolldown", ["-c", ROLLDOWN_CONFIG, "-w"], {
		stdio: "inherit",
	});

	// Watch CSS sources with chokidar, rebuild CSS on change
	let cssTimer = null;
	const cssWatcher = chokidar.watch(CSS_WATCH_ROOTS, { ignoreInitial: true });
	cssWatcher.on("all", () => {
		clearTimeout(cssTimer);
		cssTimer = setTimeout(buildCss, DEBOUNCE_MS);
	});

	// Watch asset sources with chokidar, re-copy on change
	let assetTimer = null;
	const assetWatcher = chokidar.watch(ASSET_WATCH_ROOTS, { ignoreInitial: true });
	assetWatcher.on("all", () => {
		clearTimeout(assetTimer);
		assetTimer = setTimeout(copyAssets, DEBOUNCE_MS);
	});

	// Clean shutdown
	const shutdown = () => {
		rolldownProc.kill();
		cssWatcher.close();
		assetWatcher.close();
	};
	process.on("SIGINT", shutdown);
	process.on("SIGTERM", shutdown);
}

if (isWatching) {
	runWatchMode();
} else {
	process.exit(runBuildOnce());
}

