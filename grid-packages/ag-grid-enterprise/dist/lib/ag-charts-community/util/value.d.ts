import type { PlainObject } from './types';
type StringObject = PlainObject & {
    toString: () => string;
};
type NumberObject = PlainObject & {
    valueOf: () => string;
};
export declare const isStringObject: (value: unknown) => value is StringObject;
export declare const isContinuous: (value: unknown) => value is number | Date | NumberObject;
export declare function checkDatum<T>(value: T, isContinuousScale: boolean): T | string | undefined;
/**
 * To enable duplicate categories, a category axis value on a datum from integrated charts is transformed into an
 * object with `getString()` and `id` properties. The string value can be non-unique so we must instead use the
 * unique id property.
 *
 * @see https://ag-grid.atlassian.net/browse/AG-10526
 */
export declare function transformIntegratedCategoryValue(value: unknown): any;
export {};
