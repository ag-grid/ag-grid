import { JsonApplyParams } from '../util/json';
export declare const JSON_APPLY_PLUGINS: JsonApplyParams;
export declare function getJsonApplyOptions(): {
    constructors: {
        [x: string]: new () => any;
    };
    allowedTypes: {
        [x: string]: ("object" | "function" | "array" | "primitive" | "class-instance" | null)[];
    };
};
//# sourceMappingURL=chartOptions.d.ts.map