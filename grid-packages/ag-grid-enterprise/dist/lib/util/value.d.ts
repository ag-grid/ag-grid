export declare const isString: (v: any) => boolean;
export declare const isStringObject: (v: any) => boolean;
export declare const isDate: (v: any) => boolean;
export declare function isDiscrete(value: any): boolean;
export declare function isContinuous(value: any): boolean;
export declare function checkDatum<T>(value: T, isContinuousScale: boolean): T | string | undefined;
export declare const isNumber: (v: any) => boolean;
