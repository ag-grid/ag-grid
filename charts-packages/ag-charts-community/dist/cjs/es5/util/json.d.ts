declare type LiteralProperties = 'shape' | 'data';
declare type SkippableProperties = 'axes' | 'series' | 'container' | 'customChartThemes';
declare type IsLiteralProperty<T, K extends keyof T> = K extends LiteralProperties ? true : T[K] extends Array<infer E> ? true : false;
declare type IsSkippableProperty<T, K extends keyof T> = K extends SkippableProperties ? true : false;
export declare type DeepPartial<T> = {
    [P1 in keyof T]?: IsSkippableProperty<T, P1> extends true ? any : IsLiteralProperty<T, P1> extends true ? T[P1] : {
        [P2 in keyof T[P1]]?: IsSkippableProperty<T[P1], P2> extends true ? any : IsLiteralProperty<T[P1], P2> extends true ? T[P1][P2] : {
            [P3 in keyof T[P1][P2]]?: IsSkippableProperty<T[P1][P2], P3> extends true ? any : IsLiteralProperty<T[P1][P2], P3> extends true ? T[P1][P2][P3] : {
                [P4 in keyof T[P1][P2][P3]]?: IsSkippableProperty<T[P1][P2][P3], P4> extends true ? any : IsLiteralProperty<T[P1][P2][P3], P4> extends true ? T[P1][P2][P3][P4] : Partial<T[P1][P2][P3][P4]>;
            };
        };
    };
};
/**
 * Performs a JSON-diff between a source and target JSON structure.
 *
 * On a per property basis, takes the target property value where:
 * - types are different.
 * - type is primitive.
 * - type is array and length or content have changed.
 *
 * Recurses for object types.
 *
 * @param source starting point for diff
 * @param target target for diff vs. source
 *
 * @returns `null` if no differences, or an object with the subset of properties that have changed.
 */
export declare function jsonDiff<T extends any>(source: T, target: T): Partial<T> | null;
/**
 * Special value used by `jsonMerge` to signal that a property should be removed from the merged
 * output.
 */
export declare const DELETE: any;
/**
 * Merge together the provide JSON object structures, with the precedence of application running
 * from higher indexes to lower indexes.
 *
 * Deep-clones all objects to avoid mutation of the inputs changing the output object. For arrays,
 * just performs a deep-clone of the entire array, no merging of elements attempted.
 *
 * @param json all json objects to merge
 *
 * @returns the combination of all of the json inputs
 */
export declare function jsonMerge<T>(...json: T[]): T;
/**
 * Recursively apply a JSON object into a class-hierarchy, optionally instantiating certain classes
 * by property name.
 *
 * @param target to apply source JSON properties into
 * @param source to be applied
 * @param params.path path for logging/error purposes, to aid with pinpointing problems
 * @param params.skip property names to skip from the source
 * @param params.constructors dictionary of property name to class constructors for properties that
 *                            require object construction
 */
export declare function jsonApply<Target, Source extends DeepPartial<Target>>(target: Target, source?: Source, params?: {
    path?: string;
    skip?: (keyof Source)[];
    constructors?: Record<string, new () => any>;
}): Target;
export {};
