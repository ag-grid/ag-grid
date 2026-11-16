let nextInstanceId = 1;

/** Shared by every bean container: React keys a component tree on the id, so no two may repeat it. */
export function _nextContainerInstanceId(): number {
    return nextInstanceId++;
}
