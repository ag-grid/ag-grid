import type { BeanCollection, Context } from '../../context/context';
import type { AgColumn } from '../../entities/agColumn';
import { AgProvidedColumnGroup } from '../../entities/agProvidedColumnGroup';

interface WrapperEntry {
    wrapper: AgColumn | AgProvidedColumnGroup;
    depth: number;
    /** Build that last wrapped this col; `evict` drops entries whose token is stale. */
    buildToken: number;
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export class ColWrapperCache {
    private readonly entries = new Map<AgColumn, WrapperEntry>();
    private readonly context: Context;

    public constructor(beans: BeanCollection) {
        this.context = beans.context;
    }

    /** Return the cached wrapper for `(col, depth)`, or build one. Stamps `buildToken` so a later
     *  `evict(buildToken)` drops wrappers not refreshed this build. */
    public wrap(col: AgColumn, depth: number, buildToken: number): AgColumn | AgProvidedColumnGroup {
        const entries = this.entries;
        const cached = entries.get(col);
        if (cached?.depth === depth) {
            cached.buildToken = buildToken;
            return cached.wrapper;
        }
        // Depth changed (or first build): drop any stale chain. The leaf `col` survives the destroy.
        if (cached !== undefined) {
            destroyAutoWrapperChain(cached.wrapper);
        }

        // Depth 0 wraps to the column itself — no chain, so nothing to cache.
        if (depth === 0) {
            if (cached !== undefined) {
                entries.delete(col);
            }
            col.originalParent = null;
            return col;
        }

        // Wrap `col` in `depth` dummy `AgProvidedColumnGroup` nodes so the leaf aligns to tree depth.
        const colId = col.colId;
        const context = this.context;
        let wrapper: AgColumn | AgProvidedColumnGroup = col;
        for (let i = depth - 1; i >= 0; --i) {
            const autoGroup = new AgProvidedColumnGroup(null, 'FAKE_PATH_' + colId + '_' + i, true, i);
            context.createBean(autoGroup);
            autoGroup.children = [wrapper];
            wrapper.originalParent = autoGroup;
            wrapper = autoGroup;
        }
        wrapper.originalParent = null;
        entries.set(col, { wrapper, depth, buildToken });
        return wrapper;
    }

    /** Destroy and remove entries whose token doesn't match the current build. */
    public evict(buildToken: number): void {
        const entries = this.entries;
        if (entries.size === 0) {
            return;
        }
        entries.forEach((entry, col) => {
            if (entry.buildToken !== buildToken) {
                destroyAutoWrapperChain(entry.wrapper);
                entries.delete(col);
            }
        });
    }

    /** Destroy all cached wrapper chains and clear the cache. */
    public destroy(): void {
        const entries = this.entries;
        entries.forEach(destroyWrapperEntry);
        entries.clear();
    }
}

const destroyWrapperEntry = (entry: WrapperEntry): void => destroyAutoWrapperChain(entry.wrapper);

/** Idempotent destroy wrapper-group chain above an auto-col, stopping at the leaf (owned by its service). */
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
