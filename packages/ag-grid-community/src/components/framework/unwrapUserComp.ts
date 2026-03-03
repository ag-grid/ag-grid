/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _unwrapUserComp<T>(comp: T): T {
    const compAsAny = comp as any;
    const isProxy = compAsAny?.getFrameworkComponentInstance != null;
    return isProxy ? compAsAny.getFrameworkComponentInstance() : comp;
}
