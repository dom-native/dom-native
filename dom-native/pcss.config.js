const prefixer = (await import('autoprefixer')).default;
const importer = (await import('postcss-import')).default;
const nested = (await import('postcss-nested')).default;

const plugins = [
	prefixer,
	importer,
	nested
];

// //  --config ./demo/ -o demo/dist/demo-bundle.css  demo/pcss/main.pcss
export default [{
	// required. Support single string, or array, will be processed in order
	input: ['demo/pcss/main.pcss'],

	// required. single css file supported for now. 
	output: 'demo/dist/demo-bundle.css',

	watchPath: ['./**/*.pcss'],

	// postcss processor arrays
	plugins
}]