import type { JsonApplyParams } from '../util/json';
export declare const JSON_APPLY_PLUGINS: JsonApplyParams;
export declare function assignJsonApplyConstructedArray(array: any[], ctor: new () => any): void;
export declare function getJsonApplyOptions(): {
    constructors: {
        [x: string]: new () => any;
    };
    constructedArrays: WeakMap<any[], new () => any> | undefined;
    allowedTypes: {
        [x: string]: (("function" | ("object" | "array" | "primitive") | "class-instance") | null)[];
    };
};
