import { spawnSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

export function runCommand(command, args, options = {}) {
	const result = spawnSync(command, args, { stdio: "inherit", ...options });
	return result.status ?? 1;
}

export function copyFileIfExists(sourcePath, destinationPath) {
	if (!existsSync(sourcePath)) {
		return false;
	}

	mkdirSync(dirname(destinationPath), { recursive: true });
	copyFileSync(sourcePath, destinationPath);
	return true;
}

export function buildCommands(commands) {
	for (const [command, args] of commands) {
		const exitCode = runCommand(command, args);
		if (exitCode !== 0) {
			return exitCode;
		}
	}

	return 0;
}

