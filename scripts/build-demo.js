import { spawnSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

const COMMANDS = [
	["rolldown", ["-c", "demo/rolldown.config.js"]],
	["node", ["demo/lightningcss.config.js"]],
];

const UI_SYMBOLS_SOURCE = "dom-native-ui/assets/symbols.svg";
const UI_SYMBOLS_DESTINATION = "demo/web-content/images/symbols.svg";

for (const [command, args] of COMMANDS) {
	const result = spawnSync(command, args, { stdio: "inherit" });
	if (result.status !== 0) {
		process.exit(result.status ?? 1);
	}
}

if (existsSync(UI_SYMBOLS_SOURCE)) {
	mkdirSync(dirname(UI_SYMBOLS_DESTINATION), { recursive: true });
	copyFileSync(UI_SYMBOLS_SOURCE, UI_SYMBOLS_DESTINATION);
}

