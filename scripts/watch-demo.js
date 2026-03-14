import chokidar from "chokidar";
import { spawn } from "node:child_process";

const WATCH_ROOTS = [
	"demo/src",
	"dom-native/src",
	"dom-native-draggable/src",
	"dom-native-ui/src",
	"dom-native-ui/css",
	"dom-native-ui/assets",
];
const DEBOUNCE_MS = 300;

let debounceTimer = null;
let isBuilding = false;
let hasPendingBuild = false;
let isShuttingDown = false;
let activeBuild = null;

function runBuild() {
	return new Promise((resolve) => {
		const child = spawn("node", ["scripts/build-demo.js"], {
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

const watcher = chokidar.watch(WATCH_ROOTS, {
	ignoreInitial: true,
	persistent: true,
});

watcher.on("all", () => {
	scheduleBuild();
});

watcher.on("error", async () => {
	await shutdown(1);
});

async function shutdown(exitCode) {
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

	await watcher.close();
	process.exit(exitCode);
}

process.on("SIGINT", () => {
	void shutdown(130);
});

process.on("SIGTERM", () => {
	void shutdown(143);
});

void startBuild();
