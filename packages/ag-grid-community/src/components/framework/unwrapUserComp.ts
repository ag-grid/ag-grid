export function _unwrapUserComp<T>(comp: T): T {
    const compAsAny = comp as any;
    const isProxy = compAsAny?.getFrameworkComponentInstance != null;
    return isProxy ? compAsAny.getFrameworkComponentInstance() : comp;
}
