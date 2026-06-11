import type { NamedBean } from '../../context/bean';
import { BeanStub } from '../../context/beanStub';
import type { BeanCollection } from '../../context/context';
import type { AgColumn } from '../../entities/agColumn';
import { AgColumnGroup } from '../../entities/agColumnGroup';
import type { AgProvidedColumnGroup } from '../../entities/agProvidedColumnGroup';
import type { ColumnPinnedType } from '../../interfaces/iColumn';
import type { ColumnModel } from '../columnModel';
import type { ColumnViewportService } from '../columnViewportService';
import type { GroupInstanceIdCreator } from '../groupInstanceIdCreator';
import { ColWrapperCache } from './colWrapperCache';

export class ColumnGroupService extends BeanStub implements NamedBean {
    beanName = 'colGroupSvc' as const;

    private colModel: ColumnModel;
    private colViewport: ColumnViewportService;

    /** Cache service-column wrappers (auto-group/selection/row-numbers) across `refreshCols` by `(col, depth)`. */
    public wrapperCache: ColWrapperCache;

    public wireBeans(beans: BeanCollection): void {
        this.colModel = beans.colModel;
        this.colViewport = beans.colViewport;
        this.wrapperCache = new ColWrapperCache(beans);
    }

    public override destroy(): void {
        this.wrapperCache.destroy();
        super.destroy();
    }

    /** Build one pinned section's displayed group tree from already-sorted `columns`.
     *  @param buildToken Stamp reused/created groups for `prune` to drop stale tail entries.
     *  @param isStandaloneStructure Build detached output (e.g. exports) without reuse, bean registration, or parent wiring. */
    public createGroups(
        columns: AgColumn[],
        idCreator: GroupInstanceIdCreator,
        pinned: ColumnPinnedType,
        buildToken: number = 1,
        isStandaloneStructure: boolean = false
    ): (AgColumn | AgColumnGroup)[] {
        const setParents = !isStandaloneStructure;
        const colViewport = this.colViewport;

        // Fast path: if the first leaf has `originalParent === null`, treat all leaves as ungrouped and return columns.
        if (columns.length === 0 || columns[0].originalParent === null) {
            if (setParents) {
                for (let i = 0, len = columns.length; i < len; ++i) {
                    const col = columns[i];
                    if (col.parent) {
                        col.parent = null;
                        colViewport.colsWithinViewportHash = '';
                    }
                }
            }
            return columns;
        }

        const topLevelResultCols: (AgColumn | AgColumnGroup)[] = [];
        let currentLevel: (AgColumn | AgColumnGroup)[] = columns;

        // Walk leaf -> root by collapsing adjacent runs with the same `originalParent` into top-level nodes or groups.
        while (currentLevel.length) {
            const itLen = currentLevel.length;
            const nextLevel: (AgColumn | AgColumnGroup)[] = [];
            let runStart = 0;
            let runParent = originalParentOf(currentLevel[0]);
            // Sentinel pass (`i <= itLen`) emits the final run without a per-level closure.
            for (let i = 1; i <= itLen; ++i) {
                const thisParent = i === itLen ? undefined : originalParentOf(currentLevel[i]);
                if (i < itLen && thisParent === runParent) {
                    continue;
                }

                if (runParent == null) {
                    // Top-level run: push and (when not standalone) clear stale parent inline.
                    for (let j = runStart; j < i; ++j) {
                        const node = currentLevel[j];
                        topLevelResultCols.push(node);
                        if (setParents && node.parent !== null) {
                            node.parent = null;
                            colViewport.colsWithinViewportHash = '';
                        }
                    }
                } else {
                    let newGroup: AgColumnGroup;
                    const groupId = runParent.groupId;
                    const instanceId = idCreator.getInstanceIdForKey(groupId);
                    // `idCreator` resets per refresh, so reused `instanceId` wrappers must have `pinned` refreshed.
                    const reuse = setParents ? runParent.displayInstances?.[instanceId] : undefined;
                    if (reuse && reuse.buildToken !== buildToken) {
                        reuse.buildToken = buildToken;
                        reuse.pinned = pinned;
                        reuse.parent = null;
                        reuse.children = null;
                        // reset to [] (not null) — an empty part keeps [] after recompute, matching released behaviour
                        reuse.displayedChildren = [];
                        newGroup = reuse;
                    } else {
                        newGroup = new AgColumnGroup(runParent, groupId, instanceId, pinned);
                        newGroup.buildToken = buildToken;
                        if (setParents) {
                            this.createBean(newGroup);
                            // Register this display instance in its dense `partId` slot (skip for standalone builds).
                            let instances = runParent.displayInstances;
                            if (instances === null) {
                                instances = [];
                                runParent.displayInstances = instances;
                            }
                            instances[instanceId] = newGroup;
                        }
                    }
                    let groupChildren = newGroup.children;
                    if (groupChildren === null) {
                        groupChildren = [];
                        newGroup.children = groupChildren;
                    }
                    for (let j = runStart; j < i; ++j) {
                        const node = currentLevel[j];
                        groupChildren.push(node);
                        if (setParents && node.parent !== newGroup) {
                            node.parent = newGroup;
                            colViewport.colsWithinViewportHash = '';
                        }
                    }
                    nextLevel.push(newGroup);
                }

                runStart = i;
                if (i < itLen) {
                    runParent = thisParent!;
                }
            }
            currentLevel = nextLevel;
        }

        return topLevelResultCols;
    }

    /** Finalise display instances by keeping groups stamped with `buildToken` and truncating stale tail entries. */
    public prune(buildToken: number): void {
        const allGroups = this.colModel.colsAllGroups;
        for (let i = 0, len = allGroups.length; i < len; ++i) {
            const instances = allGroups[i].displayInstances;
            if (!instances) {
                continue;
            }
            // Compact this refresh's live instances to the front; leftovers from larger prior builds form the stale tail.
            let live = 0;
            for (let j = 0, jLen = instances.length; j < jLen; ++j) {
                const group = instances[j];
                if (group.buildToken === buildToken) {
                    instances[live++] = group;
                }
            }
            instances.length = live;
        }
    }
}

/** Resolve `originalParent` from either `AgColumn` directly or `AgColumnGroup.providedColumnGroup`. */
const originalParentOf = (node: AgColumn | AgColumnGroup): AgProvidedColumnGroup | null =>
    (node.isColumn ? node : node.providedColumnGroup).originalParent;
