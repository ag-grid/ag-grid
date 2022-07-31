export declare function isNumber(value: any): boolean;
export declare function isNumberObject(value: any): boolean;
export declare function isNumeric(value: any): boolean;
export declare function isDate(value: any): boolean;
export declare function isString(value: any): boolean;
export declare function isStringObject(value: any): boolean;
export declare function isDiscrete(value: any): boolean;
export declare function isContinuous(value: any): boolean;
export declare function checkDatum<T>(value: T, isContinuousScale: boolean): T | string | undefined;
