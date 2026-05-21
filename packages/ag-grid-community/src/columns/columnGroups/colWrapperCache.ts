import type { BeanCollection } from '../../context/context';
import type { AgColumn } from '../../entities/agColumn';
import { AgProvidedColumnGroup } from '../../entities/agProvidedColumnGroup';

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export class ColWrapperCache {
    private readonly entries = new Map<AgColumn, { wrapper: AgColumn | AgProvidedColumnGroup; depth: number }>();
    private readonly beans: BeanCollection;

    public constructor(beans: BeanCollection) {
        this.beans = beans;
    }

    /** Return the cached wrapper for `(col, depth)`, or build one. When `inUse` is provided
     *  the col is added so a later `evictStale(inUse)` drops entries that weren't touched. */
    public wrapOrReuse(col: AgColumn, depth: number, inUse?: Set<AgColumn>): AgColumn | AgProvidedColumnGroup {
        inUse?.add(col);
        const entries = this.entries;
        const cached = entries.get(col);
        if (cached?.depth === depth) {
            return cached.wrapper;
        }
        const wrapper = this.buildWrapper(col, depth);
        if (cached !== undefined) {
            destroyAutoWrapperChain(cached.wrapper);
        }
        entries.set(col, { wrapper, depth });
        return wrapper;
    }

    /** Destroy and remove entries whose col is not in `inUse`. No-op when sizes match
     *  (wrapping always adds the col to `inUse` first, so a size match implies membership match). */
    public evictStale(inUse: ReadonlySet<AgColumn>): void {
        const entries = this.entries;
        if (entries.size === 0 || entries.size === inUse.size) {
            return;
        }
        for (const [col, entry] of entries) {
            if (!inUse.has(col)) {
                destroyAutoWrapperChain(entry.wrapper);
                entries.delete(col);
            }
        }
    }

    /** Destroy all cached wrapper chains and clear the cache. */
    public destroyAll(): void {
        const entries = this.entries;
        for (const entry of entries.values()) {
            destroyAutoWrapperChain(entry.wrapper);
        }
        entries.clear();
    }

    /** Wrap `col` in `depth` levels of dummy `AgProvidedColumnGroup` nodes so the leaf aligns
     *  with the user tree's depth. Returns the top-most wrapper (or `col` itself at depth 0). */
    private buildWrapper(col: AgColumn, depth: number): AgColumn | AgProvidedColumnGroup {
        if (depth === 0) {
            col.originalParent = null;
            return col;
        }
        const colId = col.colId;
        const context = this.beans.context;
        let nextChild: AgColumn | AgProvidedColumnGroup = col;
        for (let i = depth - 1; i >= 0; --i) {
            const autoGroup = new AgProvidedColumnGroup(null, `FAKE_PATH_${colId}_${i}`, true, i);
            context.createBean(autoGroup);
            autoGroup.setChildren([nextChild]);
            nextChild.originalParent = autoGroup;
            nextChild = autoGroup;
        }
        return nextChild;
    }
}

/** Destroys the chain of `AgProvidedColumnGroup` wrappers above an auto-col, stopping at the
 *  leaf `AgColumn` (its lifecycle is owned by the producing service). Idempotent via
 *  `isAlive()` — safe even when the wrapper is also reached via tree-destroy. */
const destroyAutoWrapperChain = (top: AgColumn | AgProvidedColumnGroup): void => {
    let node: AgColumn | AgProvidedColumnGroup | null = top;
    while (node && !node.isColumn) {
        const child: AgColumn | AgProvidedColumnGroup | undefined = node.children[0];
        if (node.isAlive()) {
            node.destroy();
        }
        node = child ?? null;
    }
};
