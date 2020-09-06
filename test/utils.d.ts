export declare function isEmpty(v: any): boolean;
export declare function val(rootObj: any, pathToValue: null | undefined | string | string[], value?: any): any;
export declare function listAsArray(list: any): any[];
export declare function ensureObject(obj: any, propName: any): {
    [key: string]: any;
};
export declare function ensureMap(obj: any, propName: any): Map<any, any>;
export declare function ensureSet(obj: any, propName: any): Set<any>;
export declare function ensureArray(obj: any, propName: any): any[];
declare type AnyButArray = object | number | string | boolean;
/**
 * @param a
 * @deprecated To not use as is for now. Just kept it for 0.7.x backward compatibility but types are probably wrong.
 */
export declare function asArray<T extends AnyButArray>(a: T | Array<T>): Array<T>;
/**
 * Returns a readonly Node array from EventTarget, NodeList, Node[], or empty readonly array for null and undefined.
 */
export declare function asNodeArray(value: EventTarget | NodeList | Node[] | null | undefined): readonly Node[];
export declare function splitAndTrim(str: string, sep: string): string[];
export declare function printOnce(msg: any): void;
export {};
