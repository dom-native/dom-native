# Web Build Best Practices

This guide defines a generic build setup for browser applications using TypeScript 7 with `rolldown` and CSS with `lightningcss`.

## Install TypeScript 7

Install TypeScript 7 before configuring the rest of the build:

```sh
npm install --save-dev typescript@7
```

The package configurations in this repository use TypeScript `^7.0.0`. TypeScript 7 removes the old `moduleResolution` compiler option, so leave `"moduleResolution": "node"` out of `tsconfig.json`.

## Project Structure

- `package.json`
- `tsconfig.json`
- `rolldown.config.js`
- `lightningcss.config.js`
- `scripts/`
- `src/main.ts`
- `css/main.css`
- `web-content/`
  - `index.html`
  - `js/` (generated)
  - `css/` (generated)

## Goals

- Bundle `src/main.ts` into `web-content/js/bundle.js`.
- Bundle `css/main.css` into `web-content/css/bundle.css`.
- Maintain a simple structure for easy scaffolding.

Exclude generated files in `.gitignore`:

```gitignore
web-content/css/*
web-content/js/*
```

## Package Configuration

Add these dependencies and scripts to `package.json`:

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
    "chokidar": "^5.0.0",
    "lightningcss": "^1.33.0",
    "rolldown": "^1.2.0",
    "typescript": "^7.0.0"
  }
}
```

## Rolldown Config

- Use ESM configuration with `"type": "module"`.
- Configure `platform: "browser"`.
- Reference `tsconfig.json` explicitly.
- Emit sourcemaps for debugging.

```js
import { defineConfig } from "rolldown";

const input = new URL("./src/main.ts", import.meta.url).pathname;

export default defineConfig({
  input,
  platform: "browser",
  tsconfig: new URL("./tsconfig.json", import.meta.url).pathname,
  output: {
    file: new URL("./web-content/js/bundle.js", import.meta.url).pathname,
    format: "iife",
    name: "bundle",
    sourcemap: true,
  },
});
```

## TypeScript Settings

- Use modern targets like `ES2022`.
- Enable `strict` mode and sourcemaps.
- TypeScript 7 no longer uses `moduleResolution: "node"`; omit it from `tsconfig.json`.
- Set `rootDir`, `outDir`, and `declaration` for package builds and generated type declarations.
- Set `experimentalDecorators: true` until stage 3 decorators are fully supported by rolldown.

```jsonc
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",

    "rootDir": "./src/",
    "outDir": "./dist/" /* Redirect output structure to the directory. */,

    "allowJs": false,
    "checkJs": false,
    "strict": true,

    "removeComments": false,
    "sourceMap": true,

    "declaration": true,
    "esModuleInterop": true,
    "experimentalDecorators": true, // for now, until rolldown support stage 3
  },

  "include": ["./src/**/*.ts"],
  "exclude": ["node_modules"],

  "rolldownOptions": {
    "platform": "browser",
  },
}
```

## Lightning CSS Config

- Use a Node script for bundling.
- Resolve input and output paths from `import.meta.url`.
- Ensure output directories exist before writing.

```js
import { bundle } from "lightningcss";
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

## Build and Watch Scripts

Use `scripts/build.js` as the entry point for both one-time builds and watch mode.

### `scripts/build-utils.js`

```js
import { spawnSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

export function runCommand(command, args, options = {}) {
  const result = spawnSync(command, args, { stdio: "inherit", ...options });
  return result.status ?? 1;
}

export function copyFileIfExists(sourcePath, destinationPath) {
  if (!existsSync(sourcePath)) return false;
  mkdirSync(dirname(destinationPath), { recursive: true });
  copyFileSync(sourcePath, destinationPath);
  return true;
}

export function buildCommands(commands) {
  for (const [command, args] of commands) {
    const exitCode = runCommand(command, args);
    if (exitCode !== 0) return exitCode;
  }
  return 0;
}
```

### `scripts/build.js`

```js
import { spawn } from "node:child_process";
import chokidar from "chokidar";
import { buildCommands, copyFileIfExists, runCommand } from "./build-utils.js";

const ROLLDOWN_CONFIG = "rolldown.config.js";
const LIGHTNINGCSS_CONFIG = "lightningcss.config.js";
const CSS_WATCH_ROOTS = ["css"];
const DEBOUNCE_MS = 300;
const isWatching = process.argv.includes("-w") || process.argv.includes("--watch");

function runBuildOnce() {
  return buildCommands([
    ["rolldown", ["-c", ROLLDOWN_CONFIG]],
    ["node", [LIGHTNINGCSS_CONFIG]],
  ]);
}

function buildCss() {
  runCommand("node", [LIGHTNINGCSS_CONFIG]);
}

function runWatchMode() {
  // Initial CSS build (rolldown will do its own initial build via -w)
  buildCss();

  // Delegate JS/TS watching to rolldown's native watch mode
  const rolldownProc = spawn("rolldown", ["-c", ROLLDOWN_CONFIG, "-w"], { stdio: "inherit" });

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

if (isWatching) runWatchMode();
else process.exit(runBuildOnce());
```

### Asset Copy Support

Extend the build script to copy assets, such as SVG symbol files, during the build and watch processes.

```js
const ASSET_WATCH_ROOTS = ["path/to/assets"];

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

## Example Implementation

### `src/main.ts`

```ts
const app = document.querySelector(".app");
if (app) app.textContent = "Hello from TypeScript";
```

### `css/main.css`

```css
body {
  margin: 0;
  font-family: sans-serif;
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
    <title>Web App</title>
    <link rel="stylesheet" href="./css/bundle.css" />
    <script src="./js/bundle.js"></script>
  </head>
  <body></body>
</html>
```

## Commands

- One-time build: `npm run build`
- Watch mode: `npm run watch`

## Summary

| Concern | One-time build                   | Watch mode                          |
| :------ | :------------------------------- | :---------------------------------- |
| JS/TS   | `rolldown -c rolldown.config.js` | `rolldown -c rolldown.config.js -w` |
| CSS     | `node lightningcss.config.js`    | chokidar on `css/`                  |
| Assets  | `copyFileIfExists()`             | chokidar on assets                  |
| Exit    | `process.exit(exitCode)`         | Runs until interrupted              |

## Project Creation Checklist

- Create folders: `src/`, `css/`, `web-content/js/`, `web-content/css/`.
- Create configuration files: `package.json`, `tsconfig.json`, `rolldown.config.js`, `lightningcss.config.js`.
- Create build scripts: `scripts/build.js`, `scripts/build-utils.js`.
- Create source files: `src/main.ts`, `css/main.css`, `web-content/index.html`.
- Configure output paths to `web-content/js/bundle.js` and `web-content/css/bundle.css`.
- Reference bundled files in `index.html`.
- Add `build` and `watch` npm scripts.
- Enable `experimentalDecorators` if needed.

## Notes

- This setup is suitable for small to medium browser projects.
- Complexity such as aliases or environment handling can be added as requirements evolve.
