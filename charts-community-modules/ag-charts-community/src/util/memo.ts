const memorizedFns = new Map<Function, Map<string, Function>>();

export function memo<T, R>(params: T, fnGenerator: (params: T) => () => R): () => R {
    const serialisedParams = JSON.stringify(params, null, 0);

    if (!memorizedFns.has(fnGenerator)) {
        memorizedFns.set(fnGenerator, new Map());
    }
    if (!memorizedFns.get(fnGenerator)?.has(serialisedParams)) {
        memorizedFns.get(fnGenerator)?.set(serialisedParams, fnGenerator(params));
    }

    return memorizedFns.get(fnGenerator)?.get(serialisedParams) as () => R;
}
