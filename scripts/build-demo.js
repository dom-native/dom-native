import { spawnSync } from "node:child_process";

const COMMANDS = [
	["rolldown", ["-c", "demo/rolldown.config.js"]],
	["node", ["demo/lightningcss.config.js"]],
];

for (const [command, args] of COMMANDS) {
	const result = spawnSync(command, args, { stdio: "inherit" });
	if (result.status !== 0) {
		process.exit(result.status ?? 1);
	}
}

