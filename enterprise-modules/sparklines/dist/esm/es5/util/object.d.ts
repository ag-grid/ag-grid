/**
 * Creates a new object with a `parent` as its prototype
 * and copies properties from the `child` into it.
 * @param parent
 * @param child
 */
export declare function chainObjects<P extends object, C extends object>(parent: P, child: C): P & C;
