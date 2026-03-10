import { bundle } from "lightningcss";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

const cssInputPath = new URL("./src/css/main.css", import.meta.url).pathname;
const cssOutputPath = new URL("./web-content/css/demo-bundle.css", import.meta.url).pathname;
const cssOutputDir = dirname(cssOutputPath);

console.log("[demo] Building CSS with lightningcss...");

let { code, map } = bundle({
	filename: cssInputPath,
	map: true,
});

mkdirSync(cssOutputDir, { recursive: true });
writeFileSync(cssOutputPath, code);
console.log(`[demo] Generated CSS: ${cssOutputPath}`);

