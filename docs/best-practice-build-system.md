# Web Build Best Practices

## Purpose

- This guide defines a simple, generic build setup for a browser app or site using:
  - TypeScript bundled with `rolldown`
  - CSS bundled with `lightningcss`

## Recommended Project Structure

- `package.json`
- `tsconfig.json`
- `rolldown.config.js`
- `lightningcss.config.js`
- `scripts/`
- `src/`
  - `main.ts`
- `css/`
  - `main.css`
- `web-content/`
  - `images/`
  - `index.html`

## Build Goals

- Bundle `src/main.ts` into:
  - `web-content/js/bundle.js`
- Bundle `css/main.css` into:
  - `web-content/css/bundle.css`
- Keep `web-content/index.html` as the browser entry page.
- Keep the structure simple and easy to scaffold.

In the .gitignore make sure to exclude

```gitignore
web-content/css/*
web-content/js/*
```

`web-content/index.html` and `web-content/images/...` should be accepted. 


## Default `package.json` Additions

- Add these scripts:
  - `build` - build js and css (one-time)
  - `watch` - build once, then rebuild on changes (uses rolldown native watch + chokidar for CSS/assets)

- Add these dev dependencies:
  - `rolldown`
  - `lightningcss`
  - `typescript`
  - `chokidar` (for watch mode)

## Example `package.json`

Use the following as a minimal starting point:

```json
{
  "name": "my-web-project",
  "private": true,
  "type": "module",
  "scripts": {
    "build": "node scripts/build.js",
    "watch": "node scripts/build.js -w"
  },
  "devDependencies": {
    "chokidar": "^4.0.0",
    "lightningcss": "^1.32.0",
    "rolldown": "^1.0.0-rc.8",
    "typescript": "^5.6.3"
  }
}
```

## Rolldown for TypeScript

### Role

- `rolldown` bundles the browser JavaScript entry.
- Standard entry:
  - `src/main.ts`
- Standard output:
  - `web-content/js/bundle.js`

### Best Practices

- Use ESM config with `"type": "module"` in `package.json`.
- Keep a single clear browser entry point.
- Point `tsconfig` explicitly from the rolldown config.
- Emit a sourcemap for easier debugging.
- Use `platform: "browser"` for browser apps.
- Prefer a direct output file path for simple setups.

### Example `rolldown.config.js`

```js
import { defineConfig } from "rolldown";

export default defineConfig({
	input: new URL("./src/main.ts", import.meta.url).pathname,
	platform: "browser",
	tsconfig: new URL("./tsconfig.json", import.meta.url).pathname,
	output: {
		file: new URL("./web-content/js/bundle.js", import.meta.url).pathname,
		format: "iife",
		sourcemap: true,
	},
});
```    

## TypeScript Config

### Role

- `tsconfig.json` defines the compiler settings used by rolldown.
- For a browser build, keep it modern and strict.

### Best Practices

- Use modern targets such as `ES2022`.
- Keep `strict: true`.
- Enable sourcemaps.
- Use `moduleResolution: "node"` for a simple setup.
- Keep `include` focused on the source tree.
- If you rely on TypeScript decorators today, keep `experimentalDecorators: true`.
- This remains important while rolldown does not yet support stage 3 decorators end-to-end.

### Example `tsconfig.json`

```json
{
	"compilerOptions": {
		"target": "ES2022",
		"module": "ES2022",
		"moduleResolution": "node",
		"outDir": "./dist/", /* Redirect output structure to the directory. */
		"allowJs": false,
		"checkJs": false,
		"strict": true,
		"removeComments": false,
		"sourceMap": true,
		"esModuleInterop": true,
		"experimentalDecorators": true // for now, until rolldown support stage 3
	},
	"include": [
		"./src/**/*.ts"
	],
	"exclude": [
		"node_modules"
	]
}
```

## Lightning CSS for CSS Bundling

### Role

- `lightningcss` bundles the CSS entry.
- Standard entry:
  - `css/main.css`
- Standard output:
  - `web-content/css/bundle.css`

### Best Practices

- Use a small Node config script for CSS build steps.
- Resolve input and output paths from `import.meta.url`.
- Ensure the output directory exists before writing.
- Enable sourcemap generation during development-oriented builds.
- Keep CSS entry imports inside `css/main.css`.

### Example `lightningcss.config.js`

```js
import { bundleAsync } from "lightningcss";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

const cssInputPath = new URL("./css/main.css", import.meta.url).pathname;
const cssOutputPath = new URL("./web-content/css/bundle.css", import.meta.url).pathname;
const cssOutputDir = dirname(cssOutputPath);

console.log("[web] Building CSS with lightningcss...");

let { code, map } = bundle({
	filename: cssInputPath,
	map: true,
	resolver: {
		// https by default external
		resolve(specifier, from) {
			if (/^https?:/.test(specifier)) {
				return { external: specifier };
			}
			return resolve(dirname(from), specifier);
		},
	},	
});

mkdirSync(cssOutputDir, { recursive: true });
writeFileSync(cssOutputPath, code);
console.log(`[web] Generated CSS: ${cssOutputPath}`);
```

## Build Script

### Role

- `scripts/build.js` is the single entry point for both one-time build and watch mode.
- When invoked with `-w` or `--watch`, it enters watch mode.
- Otherwise, it performs a one-time build and exits with the appropriate exit code.

### Best Practices

- Keep a single `scripts/build.js` that handles both build and watch via a `-w` flag.
- Extract reusable helpers (command runner, file copy) into a separate `scripts/build-utils.js`.
- For watch mode:
  - Delegate JS/TS watching to rolldown's native `-w` flag (spawned as a child process).
  - Use `chokidar` to watch CSS source directories and rebuild CSS on change.
  - Use `chokidar` to watch asset directories and re-copy on change.
  - Debounce rapid file changes to avoid redundant rebuilds.
  - Handle `SIGINT` / `SIGTERM` for clean shutdown of all watchers and child processes.
- For one-time build:
  - Run rolldown, then lightningcss, then copy assets.
  - Exit with a non-zero code if any step fails.

### Example `scripts/build-utils.js`

```js
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
```

### Example `scripts/build.js`

```js
import { spawn } from "node:child_process";
import chokidar from "chokidar";
import { buildCommands, copyFileIfExists, runCommand } from "./build-utils.js";

const ROLLDOWN_CONFIG = "rolldown.config.js";
const LIGHTNINGCSS_CONFIG = "lightningcss.config.js";

const CSS_WATCH_ROOTS = [
	"css",
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

	return 0;
}

function buildCss() {
	runCommand("node", [LIGHTNINGCSS_CONFIG]);
}

function runWatchMode() {
	// Initial CSS build (rolldown will do its own initial build via -w)
	buildCss();

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

	// Clean shutdown
	const shutdown = () => {
		rolldownProc.kill();
		cssWatcher.close();
	};
	process.on("SIGINT", shutdown);
	process.on("SIGTERM", shutdown);
}

if (isWatching) {
	runWatchMode();
} else {
	process.exit(runBuildOnce());
}
```

### Adding Asset Copy Support

When the project needs to copy assets (e.g., SVG symbol files) during build and watch, extend the build script:

- Define source/destination constants for assets.
- Add a `copyAssets()` helper that calls `copyFileIfExists`.
- Call `copyAssets()` in both `runBuildOnce()` and `runWatchMode()`.
- In watch mode, add a separate chokidar watcher on the asset directories with its own debounce timer.

```js
const ASSET_WATCH_ROOTS = [
	"path/to/assets",
];

function copyAssets() {
	copyFileIfExists("path/to/source.svg", "web-content/images/source.svg");
}

// In runWatchMode(), after CSS watcher:
let assetTimer = null;
const assetWatcher = chokidar.watch(ASSET_WATCH_ROOTS, { ignoreInitial: true });
assetWatcher.on("all", () => {
	clearTimeout(assetTimer);
	assetTimer = setTimeout(copyAssets, DEBOUNCE_MS);
});
```

## Minimal Source File Examples

### `src/main.ts`

```ts
const app = document.querySelector(".app");

if (app) {
	app.textContent = "Hello from TypeScript";
}
```

### `css/main.css`

```css
body {
	margin: 0;
	font-family: Arial, sans-serif;
}

.app {
	padding: 24px;
}
```

### `web-content/index.html`

```html
<!doctype html>
<html lang="en">
<head>
	<meta charset="utf-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<title>Web App</title>
	<link rel="stylesheet" href="./css/bundle.css" />
</head>
<body>
	<div class="app">Loading...</div>
	<script src="./js/bundle.js"></script>
</body>
</html>
```

## Recommended Build Commands

- One-time build:
  - `npm run build`

- Watch mode:
  - `npm run watch`

## Build Script Summary

| Concern         | One-time build                    | Watch mode                                    |
| --------------- | --------------------------------- | --------------------------------------------- |
| JS/TS           | `rolldown -c rolldown.config.js`  | `rolldown -c rolldown.config.js -w` (spawned) |
| CSS             | `node lightningcss.config.js`     | chokidar on `css/` directories                |
| Assets          | `copyFileIfExists()`              | chokidar on asset directories                 |
| Exit            | `process.exit(exitCode)`          | Runs until `SIGINT` / `SIGTERM`               |

## LLM Project Creation Checklist

When creating a new project from scratch, make sure to:

- Create the folders:
  - `src/`
  - `css/`
  - `web-content/`
  - `web-content/js/`
  - `web-content/css/`
- Create these files:
  - `package.json`
  - `tsconfig.json`
  - `rolldown.config.js`
  - `lightningcss.config.js`
  - `scripts/build.js`
  - `scripts/build-utils.js`
  - `src/main.ts`
  - `css/main.css`
  - `web-content/index.html`
- Wire the output paths exactly as:
  - `web-content/js/bundle.js`
  - `web-content/css/bundle.css`
- Ensure `index.html` references:
  - `./js/bundle.js`
  - `./css/bundle.css`
- Add npm scripts for both build and watch flows.
  - `build` should run `node scripts/build.js`
  - `watch` should run `node scripts/build.js -w`
- If decorators are used, include:
  - `"experimentalDecorators": true // for now, until rolldown support stage 3`
- Keep the setup generic and independent from any package-specific framework code.

## Notes

- This pattern works well for small to medium browser projects.
- For more advanced needs, aliases, multiple entry points, asset copying, and environment handling can be added later.
- The starting point should stay simple unless the project requirements clearly justify more complexity.
