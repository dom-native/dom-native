

// --------- Rollup Plugins --------- //
declare module 'rollup-plugin-commonjs' {
	function fn(data?: any): any
	export = fn;
}

declare module 'rollup-plugin-node-resolve' {
	function fn(data?: any): any
	export = fn;
}

declare module 'rollup-plugin-multi-entry' {
	function fn(data?: any): any
	export = fn;
}

declare module 'rollup-plugin-typescript2' {
	function fn(data?: any): any
	export = fn;
}
// --------- /Rollup Plugins --------- //
