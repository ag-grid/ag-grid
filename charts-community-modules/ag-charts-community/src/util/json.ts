type LiteralProperties = 'shape' | 'data';
type SkippableProperties = 'axes' | 'series' | 'container' | 'customChartThemes';
type IsLiteralProperty<T, K extends keyof T> = K extends LiteralProperties
    ? true
    : T[K] extends Array<any>
    ? true
    : false;
type IsSkippableProperty<T, K extends keyof T> = K extends SkippableProperties ? true : false;

// Needs to be recursive when we move to TS 4.x+; only supports a maximum level of nesting right now.
type DeepPartial<T> = {
    [P1 in keyof T]?: IsSkippableProperty<T, P1> extends true
        ? any
        : IsLiteralProperty<T, P1> extends true
        ? T[P1]
        : {
              [P2 in keyof T[P1]]?: IsSkippableProperty<T[P1], P2> extends true
                  ? any
                  : IsLiteralProperty<T[P1], P2> extends true
                  ? T[P1][P2]
                  : {
                        [P3 in keyof T[P1][P2]]?: IsSkippableProperty<T[P1][P2], P3> extends true
                            ? any
                            : IsLiteralProperty<T[P1][P2], P3> extends true
                            ? T[P1][P2][P3]
                            : {
                                  [P4 in keyof T[P1][P2][P3]]?: IsSkippableProperty<T[P1][P2][P3], P4> extends true
                                      ? any
                                      : IsLiteralProperty<T[P1][P2][P3], P4> extends true
                                      ? T[P1][P2][P3][P4]
                                      : Partial<T[P1][P2][P3][P4]>;
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
export function jsonDiff<T extends any>(source: T, target: T): Partial<T> | null {
    const sourceType = classify(source);
    const targetType = classify(target);

    if (targetType === 'array') {
        const targetArray = target as any;
        if (sourceType !== 'array' || (source as any).length !== targetArray.length) {
            return [...targetArray] as any;
        }

        if (
            targetArray.some((targetElement: any, i: number) => jsonDiff((source as any)?.[i], targetElement) != null)
        ) {
            return [...targetArray] as any;
        }

        return null;
    }

    if (targetType === 'primitive') {
        if (sourceType !== 'primitive') {
            return { ...(target as any) };
        }

        if (source !== target) {
            return target;
        }

        return null;
    }

    const lhs = source || ({} as any);
    const rhs = target || ({} as any);

    const allProps = new Set([...Object.keys(lhs), ...Object.keys(rhs)]);

    let propsChangedCount = 0;
    const result: any = {};
    for (const prop of allProps) {
        // Cheap-and-easy equality check.
        if (lhs[prop] === rhs[prop]) {
            continue;
        }

        const take = (v: any) => {
            result[prop] = v;
            propsChangedCount++;
        };

        const lhsType = classify(lhs[prop]);
        const rhsType = classify(rhs[prop]);
        if (lhsType !== rhsType) {
            // Types changed, just take RHS.
            take(rhs[prop]);
            continue;
        }

        if (rhsType === 'primitive' || rhsType === null) {
            take(rhs[prop]);
            continue;
        }

        if (rhsType === 'array' && lhs[prop].length !== rhs[prop].length) {
            // Arrays are different sizes, so just take target array.
            take(rhs[prop]);
            continue;
        }

        if (rhsType === 'class-instance') {
            // Don't try to do anything tricky with array diffs!
            take(rhs[prop]);
            continue;
        }

        if (rhsType === 'function' && lhs[prop] !== rhs[prop]) {
            take(rhs[prop]);
            continue;
        }

        const diff = jsonDiff(lhs[prop], rhs[prop]);
        if (diff !== null) {
            take(diff);
        }
    }

    return propsChangedCount === 0 ? null : result;
}

/**
 * Special value used by `jsonMerge` to signal that a property should be removed from the merged
 * output.
 */
export const DELETE = Symbol('<delete-property>') as any;

const NOT_SPECIFIED = Symbol('<unspecified-property>') as any;

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
export function jsonMerge<T>(json: T[], opts?: JsonMergeOptions): T {
    const avoidDeepClone = opts?.avoidDeepClone || [];
    const jsonTypes = json.map((v) => classify(v));
    if (jsonTypes.some((v) => v === 'array')) {
        // Clone final array.
        const finalValue = json[json.length - 1];
        if (finalValue instanceof Array) {
            return finalValue.map((v) => {
                const type = classify(v);

                if (type === 'array') return jsonMerge([[], v], opts);
                if (type === 'object') return jsonMerge([{}, v], opts);

                return v;
            }) as any;
        }

        return finalValue;
    }

    const result: any = {};
    const props = new Set(json.map((v) => (v != null ? Object.keys(v) : [])).reduce((r, n) => r.concat(n), []));

    for (const nextProp of props) {
        const values = json
            .map((j) => (j != null && nextProp in j ? (j as any)[nextProp] : NOT_SPECIFIED))
            .filter((v) => v !== NOT_SPECIFIED);

        if (values.length === 0) {
            continue;
        }

        const lastValue = values[values.length - 1];
        if (lastValue === DELETE) {
            continue;
        }

        const types = values.map((v) => classify(v));
        const type = types[0];
        if (types.some((t) => t !== type)) {
            // Short-circuit if mismatching types.
            result[nextProp] = lastValue;
            continue;
        }

        if ((type === 'array' || type === 'object') && !avoidDeepClone.includes(nextProp)) {
            result[nextProp] = jsonMerge(values, opts);
        } else if (type === 'array') {
            // Arrays need to be shallow copied to avoid external mutation and allow jsonDiff to
            // detect changes.
            result[nextProp] = [...lastValue];
        } else {
            // Just directly assign/overwrite.
            result[nextProp] = lastValue;
        }
    }

    return result;
}

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
export function jsonApply<Target, Source extends DeepPartial<Target>>(
    target: Target,
    source?: Source,
    params: {
        path?: string;
        matcherPath?: string;
        skip?: string[];
        constructors?: Record<string, new () => any>;
        allowedTypes?: Record<string, ReturnType<typeof classify>[]>;
    } = {}
): Target {
    const {
        path = undefined,
        matcherPath = path ? path.replace(/(\[[0-9+]+\])/i, '[]') : undefined,
        skip = [],
        constructors = {},
        allowedTypes = {},
    } = params;

    if (target == null) {
        throw new Error(`AG Charts - target is uninitialised: ${path || '<root>'}`);
    }
    if (source == null) {
        return target;
    }

    const targetType = classify(target);
    for (const property in source) {
        const propertyMatcherPath = `${matcherPath ? matcherPath + '.' : ''}${property}`;
        if (skip.indexOf(propertyMatcherPath) >= 0) {
            continue;
        }

        const newValue = source[property];
        const propertyPath = `${path ? path + '.' : ''}${property}`;
        const targetAny = target as any;
        const targetClass = targetAny.constructor;
        const currentValue = targetAny[property];
        let ctr = constructors[property] ?? constructors[propertyMatcherPath];
        try {
            const currentValueType = classify(currentValue);
            const newValueType = classify(newValue);

            if (targetType === 'class-instance' && !(property in target || targetAny.hasOwnProperty(property))) {
                console.warn(
                    `AG Charts - unable to set [${propertyPath}] in ${targetClass?.name} - property is unknown`
                );
                continue;
            }

            const allowableTypes = allowedTypes[propertyMatcherPath] || [currentValueType];
            if (currentValueType === 'class-instance' && newValueType === 'object') {
                // Allowed, this is the common case! - do not error.
            } else if (currentValueType != null && newValueType != null && !allowableTypes.includes(newValueType)) {
                console.warn(
                    `AG Charts - unable to set [${propertyPath}] in ${targetClass?.name} - can't apply type of [${newValueType}], allowed types are: [${allowableTypes}]`
                );
                continue;
            }

            if (newValueType === 'array') {
                ctr = ctr ?? constructors[`${propertyMatcherPath}[]`];
                if (ctr != null) {
                    const newValueArray: any[] = newValue as any;
                    targetAny[property] = newValueArray.map((v) =>
                        jsonApply(new ctr(), v, {
                            ...params,
                            path: propertyPath,
                            matcherPath: propertyMatcherPath + '[]',
                        })
                    );
                } else {
                    targetAny[property] = newValue;
                }
            } else if (newValueType === 'class-instance') {
                targetAny[property] = newValue;
            } else if (newValueType === 'object') {
                if (currentValue != null) {
                    jsonApply(currentValue, newValue as any, {
                        ...params,
                        path: propertyPath,
                        matcherPath: propertyMatcherPath,
                    });
                } else if (ctr != null) {
                    targetAny[property] = jsonApply(new ctr(), newValue as any, {
                        ...params,
                        path: propertyPath,
                        matcherPath: propertyMatcherPath,
                    });
                } else {
                    targetAny[property] = newValue;
                }
            } else {
                targetAny[property] = newValue;
            }
        } catch (error) {
            const err = error as any;
            console.warn(
                `AG Charts - unable to set [${propertyPath}] in [${targetClass?.name}]; nested error is: ${err.message}`
            );
            continue;
        }
    }

    return target;
}

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
export function jsonWalk(
    json: any,
    visit: (classification: Classification, node: any, ...otherNodes: any[]) => void,
    opts: {
        skip?: string[];
    },
    ...jsons: any[]
) {
    const jsonType = classify(json);
    const skip = opts.skip || [];

    if (jsonType === 'array') {
        json.forEach((element: any, index: number) => {
            jsonWalk(element, visit, opts, ...jsons?.map((o) => o?.[index]));
        });
        return;
    } else if (jsonType !== 'object') {
        return;
    }

    visit(jsonType, json, ...jsons);
    for (const property in json) {
        if (skip.indexOf(property) >= 0) {
            continue;
        }

        const value = json[property];
        const otherValues = jsons?.map((o) => o?.[property]);
        const valueType = classify(value);

        if (valueType === 'object' || valueType === 'array') {
            jsonWalk(value, visit, opts, ...otherValues);
        }
    }
}

type Classification = 'array' | 'object' | 'primitive';
/**
 * Classify the type of a value to assist with handling for merge purposes.
 */
function classify(value: any): 'array' | 'object' | 'function' | 'primitive' | 'class-instance' | null {
    if (value == null) {
        return null;
    } else if (value instanceof HTMLElement) {
        return 'primitive';
    } else if (value instanceof Array) {
        return 'array';
    } else if (value instanceof Date) {
        return 'primitive';
    } else if (typeof value === 'object' && value.constructor === Object) {
        return 'object';
    } else if (typeof value === 'function') {
        return 'function';
    } else if (typeof value === 'object' && value.constructor != null) {
        return 'class-instance';
    }

    return 'primitive';
}
