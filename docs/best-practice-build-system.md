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
  - `build` - build js and css
  - `watch` - build once, then rebuild on changes

- Add these dev dependencies:
  - `rolldown`
  - `lightningcss`
  - `typescript`

## Example `package.json`

Use the following as a minimal starting point:

```json
{
  "name": "my-web-project",
  "private": true,
  "type": "module",
  "scripts": {
    "build": "node scripts/build.js",
    "watch": "node scripts/watch.js"
  },
  "devDependencies": {
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
- If decorators are used, include:
  - `"experimentalDecorators": true // for now, until rolldown support stage 3`
- Keep the setup generic and independent from any package-specific framework code.

## Notes

- This pattern works well for small to medium browser projects.
- For more advanced needs, aliases, multiple entry points, asset copying, and environment handling can be added later.
- The starting point should stay simple unless the project requirements clearly justify more complexity.
