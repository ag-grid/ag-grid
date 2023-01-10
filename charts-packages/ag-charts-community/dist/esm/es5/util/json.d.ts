declare type LiteralProperties = 'shape' | 'data';
declare type SkippableProperties = 'axes' | 'series' | 'container' | 'customChartThemes';
declare type IsLiteralProperty<T, K extends keyof T> = K extends LiteralProperties ? true : T[K] extends Array<any> ? true : false;
declare type IsSkippableProperty<T, K extends keyof T> = K extends SkippableProperties ? true : false;
declare type DeepPartial<T> = {
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
export interface JsonMergeOptions {
    /**
     * Contains a list of properties where deep clones should be avoided
     */
    avoidDeepClone: string[];
}
/**
 * Merge together the provide JSON object structures, with the precedence of application running
 * from higher indexes to lower indexes.
 *
 * Deep-clones all objects to avoid mutation of the inputs changing the output object. For arrays,
 * just performs a deep-clone of the entire array, no merging of elements attempted.
 *
 * @param json all json objects to merge
 * @param opts merge options
 * @param opts.avoidDeepClone contains a list of properties where deep clones should be avoided
 *
 * @returns the combination of all of the json inputs
 */
export declare function jsonMerge<T>(json: T[], opts?: JsonMergeOptions): T;
/**
 * Recursively apply a JSON object into a class-hierarchy, optionally instantiating certain classes
 * by property name.
 *
 * @param target to apply source JSON properties into
 * @param source to be applied
 * @param params.path path for logging/error purposes, to aid with pinpointing problems
 * @param params.matcherPath path for pattern matching, to lookup allowedTypes override.
 * @param params.skip property names to skip from the source
 * @param params.constructors dictionary of property name to class constructors for properties that
 *                            require object construction
 * @param params.allowedTypes overrides by path for allowed property types
 */
export declare function jsonApply<Target, Source extends DeepPartial<Target>>(target: Target, source?: Source, params?: {
    path?: string;
    matcherPath?: string;
    skip?: string[];
    constructors?: Record<string, new () => any>;
    allowedTypes?: Record<string, ReturnType<typeof classify>[]>;
}): Target;
/**
 * Walk the given JSON object graphs, invoking the visit() callback for every object encountered.
 * Arrays are descended into without a callback, however their elements will have the visit()
 * callback invoked if they are objects.
 *
 * @param json to traverse
 * @param visit callback for each non-primitive and non-array object found
 * @param opts.skip property names to skip when walking
 * @param jsons to traverse in parallel
 */
export declare function jsonWalk(json: any, visit: (classification: Classification, node: any, ...otherNodes: any[]) => void, opts: {
    skip?: string[];
}, ...jsons: any[]): void;
declare type Classification = 'array' | 'object' | 'primitive';
/**
 * Classify the type of a value to assist with handling for merge purposes.
 */
declare function classify(value: any): 'array' | 'object' | 'function' | 'primitive' | 'class-instance' | null;
export {};
