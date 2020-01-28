/**
 * Creates a new object with a `parent` as its prototype
 * and copies properties from the `child` into it.
 * @param parent
 * @param child
 */
export function chainObjects<P extends object, C extends object>(parent: P, child: C): P & C {
    const obj = Object.create(parent) as P;
    for (const prop in child) {
        if (child.hasOwnProperty(prop)) {
            (obj as any)[prop] = child[prop];
        }
    }
    return obj as P & C;
}
