import chokidar from "chokidar";
import { spawn, spawnSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

const COMMANDS = [
	["rolldown", ["-c", "demo/rolldown.config.js"]],
	["node", ["demo/lightningcss.config.js"]],
];

const UI_SYMBOLS_SOURCE = "dom-native-ui/assets/symbols.svg";
const UI_SYMBOLS_DESTINATION = "demo/web-content/images/symbols.svg";

const WATCH_ROOTS = [
	"demo/src",
	"dom-native/src",
	"dom-native-draggable/src",
	"dom-native-ui/src",
	"dom-native-ui/css",
	"dom-native-ui/assets",
];
const DEBOUNCE_MS = 300;
const WATCH_FLAG = "-w";
const isWatchMode = process.argv.includes(WATCH_FLAG);

let debounceTimer = null;
let isBuilding = false;
let hasPendingBuild = false;
let isShuttingDown = false;
let activeBuild = null;

function runBuildOnce() {
	for (const [command, args] of COMMANDS) {
		const result = spawnSync(command, args, { stdio: "inherit" });
		if (result.status !== 0) {
			return result.status ?? 1;
		}
	}

	if (existsSync(UI_SYMBOLS_SOURCE)) {
		mkdirSync(dirname(UI_SYMBOLS_DESTINATION), { recursive: true });
		copyFileSync(UI_SYMBOLS_SOURCE, UI_SYMBOLS_DESTINATION);
	}

	return 0;
}

function runBuild() {
	if (!isWatchMode) {
		return Promise.resolve(runBuildOnce());
	}

	return new Promise((resolve) => {
		const child = spawn("node", ["scripts/demo-build.js"], {
			stdio: "inherit",
		});

		activeBuild = child;

		child.on("exit", (code, signal) => {
			activeBuild = null;

			if (signal) {
				resolve(1);
				return;
			}

			resolve(code ?? 1);
		});
	});
}

async function startBuild() {
	if (isShuttingDown) {
		return;
	}

	if (isBuilding) {
		hasPendingBuild = true;
		return;
	}

	isBuilding = true;

	try {
		const exitCode = await runBuild();
		if (exitCode !== 0) {
			await shutdown(exitCode);
			return;
		}
	} finally {
		isBuilding = false;
	}

	if (hasPendingBuild && !isShuttingDown) {
		hasPendingBuild = false;
		await startBuild();
	}
}

function scheduleBuild() {
	if (isShuttingDown) {
		return;
	}

	clearTimeout(debounceTimer);
	debounceTimer = setTimeout(() => {
		debounceTimer = null;
		void startBuild();
	}, DEBOUNCE_MS);
}

async function runWatchMode() {
	const watcher = chokidar.watch(WATCH_ROOTS, {
		ignoreInitial: true,
		persistent: true,
	});

	watcher.on("all", () => {
		scheduleBuild();
	});

	watcher.on("error", async () => {
		await shutdown(1, watcher);
	});

	process.on("SIGINT", () => {
		void shutdown(130, watcher);
	});

	process.on("SIGTERM", () => {
		void shutdown(143, watcher);
	});

	await startBuild();
}

async function shutdown(exitCode, watcher) {
	if (isShuttingDown) {
		return;
	}

	isShuttingDown = true;

	if (debounceTimer) {
		clearTimeout(debounceTimer);
		debounceTimer = null;
	}

	if (activeBuild && !activeBuild.killed) {
		activeBuild.kill("SIGTERM");
	}

	if (watcher) {
		await watcher.close();
	}

	process.exit(exitCode);
}

if (isWatchMode) {
	void runWatchMode();
} else {
	process.exit(runBuildOnce());
}

