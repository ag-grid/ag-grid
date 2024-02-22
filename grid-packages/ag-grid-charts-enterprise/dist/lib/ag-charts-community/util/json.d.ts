import type { DeepPartial } from './types';
/**
 * Performs a recursive JSON-diff between a source and target JSON structure.
 *
 * On a per-property basis, takes the target property value where:
 * - types are different.
 * - type is primitive.
 * - type is array and length or content have changed.
 *
 * @param source starting point for diff
 * @param target target for diff vs. source
 *
 * @returns `null` if no differences, or an object with the subset of properties that have changed.
 */
export declare function jsonDiff<T extends unknown>(source: T, target: T): Partial<T> | null;
/**
 * Recursively clones of primitives and objects.
 *
 * @param source object | array
 * @param options
 *
 * @return deep clone of source
 */
export declare function deepClone<T>(source: T, options?: {
    shallow?: string[];
}): T;
/**
 * Clones of primitives and objects.
 *
 * @param source any value
 *
 * @return shallow clone of source
 */
export declare function shallowClone<T>(source: T): T;
/**
 * Walk the given JSON object graphs, invoking the visit() callback for every object encountered.
 * Arrays are descended into without a callback, however their elements will have the visit()
 * callback invoked if they are objects.
 *
 * @param json to traverse
 * @param visit callback for each non-primitive and non-array object found
 * @param opts
 * @param opts.skip property names to skip when walking
 * @param jsons to traverse in parallel
 */
export declare function jsonWalk<T>(json: T, visit: (...nodes: T[]) => void, opts?: {
    skip?: string[];
}, ...jsons: T[]): void;
export type JsonApplyParams = {
    constructors?: Record<string, new () => any>;
    constructedArrays?: WeakMap<Array<any>, new () => any>;
    allowedTypes?: Record<string, ReturnType<typeof classify>[]>;
};
/**
 * Recursively apply a JSON object into a class-hierarchy, optionally instantiating certain classes
 * by property name.
 *
 * @param target to apply source JSON properties into
 * @param source to be applied
 * @param params
 * @param params.path path for logging/error purposes, to aid with pinpointing problems
 * @param params.matcherPath path for pattern matching, to lookup allowedTypes override.
 * @param params.skip property names to skip from the source
 * @param params.constructors dictionary of property name to class constructors for properties that
 *                            require object construction
 * @param params.constructedArrays map stores arrays which items should be initialised
 *                                 using a class constructor
 * @param params.allowedTypes overrides by path for allowed property types
 */
export declare function jsonApply<Target extends object, Source extends DeepPartial<Target>>(target: Target, source?: Source, params?: {
    path?: string;
    matcherPath?: string;
    skip?: string[];
    idx?: number;
} & JsonApplyParams): Target;
type Classification = RestrictedClassification | 'function' | 'class-instance';
type RestrictedClassification = 'array' | 'object' | 'primitive';
/**
 * Classify the type of value to assist with handling for merge purposes.
 */
declare function classify(value: any): Classification | null;
export {};
