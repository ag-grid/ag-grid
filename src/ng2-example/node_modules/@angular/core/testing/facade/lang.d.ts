
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
export interface BrowserNodeGlobal {
    Object: typeof Object;
    Array: typeof Array;
    Map: typeof Map;
    Set: typeof Set;
    Date: DateConstructor;
    RegExp: RegExpConstructor;
    JSON: typeof JSON;
    Math: any;
    assert(condition: any): void;
    Reflect: any;
    getAngularTestability: Function;
    getAllAngularTestabilities: Function;
    getAllAngularRootElements: Function;
    frameworkStabilizers: Array<Function>;
    setTimeout: Function;
    clearTimeout: Function;
    setInterval: Function;
    clearInterval: Function;
    encodeURI: Function;
}
export declare function scheduleMicroTask(fn: Function): void;
declare const _global: BrowserNodeGlobal;
export { _global as global };
export declare function getTypeNameForDebugging(type: any): string;
export declare function isPresent(obj: any): boolean;
export declare function isBlank(obj: any): boolean;
export declare function isStrictStringMap(obj: any): boolean;
export declare function isDate(obj: any): obj is Date;
export declare function stringify(token: any): string;
export declare class NumberWrapper {
    static parseIntAutoRadix(text: string): number;
    static parseInt(text: string, radix: number): number;
    static isNumeric(value: any): boolean;
}
export declare function looseIdentical(a: any, b: any): boolean;
export declare function isJsObject(o: any): boolean;
export declare function print(obj: Error | Object): void;
export declare function warn(obj: Error | Object): void;
export declare function setValueOnPath(global: any, path: string, value: any): void;
export declare function getSymbolIterator(): string | symbol;
export declare function isPrimitive(obj: any): boolean;
export declare function escapeRegExp(s: string): string;
