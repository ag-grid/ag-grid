import type { JsonApplyParams } from '../util/json';
export declare const JSON_APPLY_PLUGINS: JsonApplyParams;
export declare function assignJsonApplyConstructedArray(array: any[], ctor: new () => any): void;
export declare function getJsonApplyOptions(): {
    constructors: {
        [x: string]: new () => any;
    };
    constructedArrays: WeakMap<any[], new () => any> | undefined;
    allowedTypes: {
        [x: string]: ("object" | "function" | "array" | "primitive" | "class-instance" | null)[];
    };
};
//# sourceMappingURL=chartOptions.d.ts.map