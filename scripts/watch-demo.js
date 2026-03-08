import { spawn, spawnSync } from "node:child_process";

const cssBuild = spawnSync("node", ["demo/lightningcss.config.js"], { stdio: "inherit", shell: true });
if (cssBuild.status !== 0) {
	process.exit(cssBuild.status ?? 1);
}

const cssWatcher = spawn("npx", ["lightningcss", "demo/src/css/main.css", "-o", "demo/web-content/css/demo-bundle.css", "--watch"], {
	stdio: "inherit",
	shell: true,
});

const jsWatcher = spawn("rolldown", ["-c", "demo/rolldown.config.js", "--watch"], {
	stdio: "inherit",
	shell: true,
});

const children = [cssWatcher, jsWatcher];

function shutdown(signal) {
	for (const child of children) {
		if (!child.killed) {
			child.kill(signal);
		}
	}
}

process.on("SIGINT", () => {
	shutdown("SIGINT");
	process.exit(130);
});

process.on("SIGTERM", () => {
	shutdown("SIGTERM");
	process.exit(143);
});

for (const child of children) {
	child.on("exit", (code) => {
		if (code && code !== 0) {
			shutdown("SIGTERM");
			process.exit(code);
		}
	});
}

