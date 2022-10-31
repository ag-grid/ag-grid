import { GridOptions } from "./entities/gridOptions";
import { AgGridCommon } from "./interfaces/iCommon";
declare type GridOptionKey = keyof GridOptions;
declare type GetKeys<T, U> = {
    [K in keyof T]: U extends T[K] ? K : (T[K] extends U | undefined ? K : never);
}[keyof T];
/**
 *  Get the GridProperties that are of type `any`.
 *  Works by finding the properties that can extend a non existing string.
 *  This will only be the properties of type `any`.
 */
declare type AnyGridOptions = {
    [K in keyof GridOptions]: GridOptions[K] extends 'NO_MATCH' ? K : never;
}[keyof GridOptions];
/**
 * Get all the GridOptions properties of the provided type.
 * Will also include `any` properties.
 */
declare type KeysLike<U> = Exclude<GetKeys<GridOptions, U>, undefined>;
/**
 * Get all the GridOption properties that strictly contain the provided type.
 * Does not include `any` properties.
 */
declare type KeysOfType<U> = Exclude<GetKeys<GridOptions, U>, AnyGridOptions>;
declare type CallbackKeys = KeysOfType<(any: AgGridCommon<any>) => any>;
/** All function properties excluding those explicity match the common callback interface. */
declare type FunctionKeys = Exclude<KeysLike<Function>, CallbackKeys>;
/**
 * These keys are used for validating properties supplied on a gridOptions object, and for code generation.
 * If you change the properties on the gridOptions interface, you *must* update this file as well to be consistent.
 */
export declare class PropertyKeys {
    static STRING_PROPERTIES: KeysOfType<string>[];
    static OBJECT_PROPERTIES: KeysLike<object | HTMLElement>[];
    static ARRAY_PROPERTIES: KeysOfType<any[]>[];
    static NUMBER_PROPERTIES: KeysOfType<number>[];
    static BOOLEAN_PROPERTIES: KeysOfType<boolean>[];
    /** You do not need to include event callbacks in this list, as they are generated automatically. */
    static FUNCTIONAL_PROPERTIES: FunctionKeys[];
    static CALLBACK_PROPERTIES: CallbackKeys[];
    static FUNCTION_PROPERTIES: GridOptionKey[];
    static ALL_PROPERTIES: GridOptionKey[];
    /**
     * Used when performing property checks. This avoids noise caused when using frameworks, which can add their own
     * framework-specific properties to colDefs, gridOptions etc.
     */
    static FRAMEWORK_PROPERTIES: string[];
}
export {};
