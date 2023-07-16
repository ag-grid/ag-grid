export declare function memo<T, R>(params: T, fnGenerator: (params: T) => () => R): () => R;
