import { _last } from '../../agStack/utils/array';
import { _exists } from '../../agStack/utils/generic';
import type { NamedBean } from '../../context/bean';
import { BeanStub } from '../../context/beanStub';
import type { AgColumn } from '../../entities/agColumn';
import { AgColumnGroup, createUniqueColumnGroupId, isColumnGroup } from '../../entities/agColumnGroup';
import { AgProvidedColumnGroup, isProvidedColumnGroup } from '../../entities/agProvidedColumnGroup';
import type { ColGroupDef } from '../../entities/colDef';
import type { ColumnEventType } from '../../events';
import type { ColumnPinnedType, HeaderColumnId } from '../../interfaces/iColumn';
import { _recursivelyCreateColumns, depthFirstOriginalTreeSearch } from '../columnFactoryUtils';
import type { IColumnKeyCreator } from '../columnKeyCreator';
import type { GroupInstanceIdCreator } from '../groupInstanceIdCreator';
import { ColWrapperCache } from './colWrapperCache';
import { createMergedColGroupDef } from './columnGroupUtils';

interface CreateGroupsParams {
    // all displayed columns sorted - this is the columns the grid should show
    columns: AgColumn[];
    // creates unique id's for the group
    idCreator: GroupInstanceIdCreator;
    // whether it's left, right or center col
    pinned: ColumnPinnedType;
    // we try to reuse old groups if we can, to allow gui to do animation
    oldDisplayedGroups?: (AgColumn | AgColumnGroup)[];
    // set `isStandaloneStructure` to true if this structure will not be used
    // by the grid UI. This is useful for export modules (gridSerializer).
    isStandaloneStructure?: boolean;
}

export class ColumnGroupService extends BeanStub implements NamedBean {
    beanName = 'colGroupSvc' as const;

    /** Wrapper cache for service cols (auto-group / selection / row-numbers). Survives across
     *  `refreshCols` so `(col, depth)`-stable wrappers aren't rebuilt on every refresh. */
    public serviceWrapperCache!: ColWrapperCache;

    public postConstruct(): void {
        this.serviceWrapperCache = new ColWrapperCache(this.beans);
    }

    public getColumnGroupState(): { groupId: string; open: boolean }[] {
        const columnGroupState: { groupId: string; open: boolean }[] = [];
        const gridBalancedTree = this.beans.colModel.getColTree();

        depthFirstOriginalTreeSearch(null, gridBalancedTree, (node) => {
            if (isProvidedColumnGroup(node)) {
                columnGroupState.push({
                    groupId: node.groupId,
                    open: node.expanded,
                });
            }
        });

        return columnGroupState;
    }

    public resetColumnGroupState(source: ColumnEventType): void {
        const primaryColumnTree = this.beans.colModel.getColDefColTree();
        if (!primaryColumnTree) {
            return;
        }

        const stateItems: { groupId: string; open: boolean | undefined }[] = [];

        depthFirstOriginalTreeSearch(null, primaryColumnTree, (child) => {
            if (isProvidedColumnGroup(child)) {
                const colGroupDef = child.getColGroupDef();
                const groupState = {
                    groupId: child.groupId,
                    open: !colGroupDef ? undefined : colGroupDef.openByDefault,
                };
                stateItems.push(groupState);
            }
        });

        this.setColumnGroupState(stateItems, source);
    }

    public setColumnGroupState(
        stateItems: { groupId: string; open: boolean | undefined }[],
        source: ColumnEventType
    ): void {
        const { colModel, colAnimation, visibleCols, eventSvc } = this.beans;
        const gridBalancedTree = colModel.getColTree();
        if (!gridBalancedTree.length) {
            return;
        }

        colAnimation?.start();

        // Build groupId → group map in one DFS pass; per-stateItem lookups are then O(1)
        // instead of walking the tree once per item (O(N×K) → O(N+K)).
        const groupMap = new Map<string, AgProvidedColumnGroup>();
        depthFirstOriginalTreeSearch(null, gridBalancedTree, (node) => {
            if (isProvidedColumnGroup(node)) {
                groupMap.set(node.groupId, node);
            }
        });

        const impactedGroups: AgProvidedColumnGroup[] = [];
        for (let i = 0, len = stateItems.length; i < len; ++i) {
            const stateItem = stateItems[i];
            const providedColumnGroup = groupMap.get(stateItem.groupId);
            if (!providedColumnGroup || providedColumnGroup.expanded === stateItem.open) {
                continue;
            }
            providedColumnGroup.setExpanded(stateItem.open);
            impactedGroups.push(providedColumnGroup);
        }

        visibleCols.refresh(source, true);

        const impactedLen = impactedGroups.length;
        if (impactedLen) {
            eventSvc.dispatchEvent({
                type: 'columnGroupOpened',
                columnGroup: impactedLen === 1 ? impactedGroups[0] : undefined,
                columnGroups: impactedGroups,
            });
        }

        colAnimation?.finish();
    }

    // called by headerRenderer - when a header is opened or closed
    public setColumnGroupOpened(
        key: AgProvidedColumnGroup | string | null,
        newValue: boolean,
        source: ColumnEventType
    ): void {
        let keyAsString: string;

        if (isProvidedColumnGroup(key)) {
            keyAsString = key.groupId;
        } else {
            keyAsString = key || '';
        }
        this.setColumnGroupState([{ groupId: keyAsString, open: newValue }], source);
    }

    public getProvidedColGroup(key: string): AgProvidedColumnGroup | null {
        return findProvidedColGroup(this.beans.colModel.getColTree(), key);
    }

    public getGroupAtDirection(columnGroup: AgColumnGroup, direction: 'After' | 'Before'): AgColumnGroup | null {
        // pick the last displayed column in this group
        const requiredLevel = columnGroup.providedColumnGroup.level + columnGroup.getPaddingLevel();
        const colGroupLeafColumns = columnGroup.getDisplayedLeafColumns();
        const col: AgColumn | null = direction === 'After' ? _last(colGroupLeafColumns) : colGroupLeafColumns[0];
        const getDisplayColMethod: 'getColAfter' | 'getColBefore' = `getCol${direction}` as any;

        while (true) {
            // keep moving to the next col, until we get to another group
            const column = this.beans.visibleCols[getDisplayColMethod](col);

            if (!column) {
                return null;
            }

            const groupPointer = this.getColGroupAtLevel(column, requiredLevel);

            if (groupPointer !== columnGroup) {
                return groupPointer;
            }
        }
    }

    public getColGroupAtLevel(column: AgColumn, level: number): AgColumnGroup | null {
        // get group at same level as the one we are looking for
        let groupPointer: AgColumnGroup = column.parent!;
        let originalGroupLevel: number;
        let groupPointerLevel: number;

        while (true) {
            originalGroupLevel = groupPointer.providedColumnGroup.level;
            groupPointerLevel = groupPointer.getPaddingLevel();

            if (originalGroupLevel + groupPointerLevel <= level) {
                break;
            }
            groupPointer = groupPointer.parent!;
        }

        return groupPointer;
    }

    public updateOpenClosedVisibility(): void {
        const nodes = this.beans.visibleCols.getTreeNodes();
        for (let i = 0, len = nodes.length; i < len; ++i) {
            const node = nodes[i];
            if (isColumnGroup(node)) {
                node.calculateDisplayedColumns();
            }
        }
    }

    /** Returns the group with matching colId and instanceId. If instanceId is missing, matches only on the colId. */
    public getColumnGroup(colId: string | AgColumnGroup, partId?: number): AgColumnGroup | null {
        if (!colId) {
            return null;
        }
        if (isColumnGroup(colId)) {
            return colId;
        }

        const checkPartId = typeof partId === 'number';
        const nodes = this.beans.visibleCols.getTreeNodes();
        for (let i = 0, len = nodes.length; i < len; ++i) {
            const node = nodes[i];
            if (!isColumnGroup(node)) {
                continue;
            }
            if (checkPartId ? colId === node.groupId && partId === node.partId : colId === node.groupId) {
                return node;
            }
        }
        return null;
    }

    public createColumnGroups(params: CreateGroupsParams): (AgColumn | AgColumnGroup)[] {
        const { columns, idCreator, pinned, oldDisplayedGroups, isStandaloneStructure } = params;
        const oldColumnsMapped = this.mapOldGroupsById(oldDisplayedGroups!);

        // Iterate leaf → root, building each level's groups by grouping adjacent runs of nodes
        // whose `originalParent` matches. Nodes with `originalParent == null` go straight to the
        // top-level result. Each completed level becomes the input for the next iteration.
        const topLevelResultCols: (AgColumn | AgColumnGroup)[] = [];
        let currentLevel: (AgColumn | AgColumnGroup)[] = columns;

        while (currentLevel.length) {
            const itLen = currentLevel.length;
            const nextLevel: (AgColumn | AgColumnGroup)[] = [];

            // Cache the run's shared parent — derived once per parent-change instead of re-resolved
            // from `currentLevel[lastIdx]` on every iteration.
            let runStart = 0;
            let runParent = originalParentOf(currentLevel[0]);

            // Closure created once per outer iteration (level), not per inner step.
            const emitRun = (to: number, parent: AgProvidedColumnGroup | null) => {
                if (parent == null) {
                    for (let i = runStart; i < to; ++i) {
                        topLevelResultCols.push(currentLevel[i]);
                    }
                    return;
                }
                const newGroup = this.createColumnGroup(
                    parent,
                    idCreator,
                    oldColumnsMapped,
                    pinned,
                    isStandaloneStructure
                );
                for (let i = runStart; i < to; ++i) {
                    newGroup.addChild(currentLevel[i]);
                }
                nextLevel.push(newGroup);
            };

            for (let i = 1; i < itLen; ++i) {
                const thisParent = originalParentOf(currentLevel[i]);
                if (thisParent !== runParent) {
                    emitRun(i, runParent);
                    runStart = i;
                    runParent = thisParent;
                }
            }
            emitRun(itLen, runParent);

            currentLevel = nextLevel;
        }

        if (!isStandaloneStructure) {
            this.setupParentsIntoCols(topLevelResultCols, null);
        }
        return topLevelResultCols;
    }

    public createProvidedColumnGroup(
        primaryColumns: boolean,
        colGroupDef: ColGroupDef,
        level: number,
        existingColumns: AgColumn[],
        columnKeyCreator: IColumnKeyCreator,
        existingGroups: AgProvidedColumnGroup[],
        source: ColumnEventType
    ): AgProvidedColumnGroup {
        const groupId = columnKeyCreator.getUniqueKey(colGroupDef.groupId || null, null);
        const colGroupDefMerged = createMergedColGroupDef(this.beans, colGroupDef, groupId);
        const providedGroup = new AgProvidedColumnGroup(colGroupDefMerged, groupId, false, level);
        this.createBean(providedGroup);
        const existingGroupAndIndex = this.findExistingGroup(colGroupDef, existingGroups);
        // make sure we remove, so if user provided duplicate id, then we don't have more than
        // one column instance for colDef with common id
        if (existingGroupAndIndex) {
            existingGroups.splice(existingGroupAndIndex.idx, 1);
        }

        const existingGroup = existingGroupAndIndex?.group;
        if (existingGroup) {
            providedGroup.setExpanded(existingGroup.isExpanded());
        }

        const children = _recursivelyCreateColumns(
            this.beans,
            colGroupDefMerged.children,
            level + 1,
            primaryColumns,
            existingColumns,
            columnKeyCreator,
            existingGroups,
            source
        );

        providedGroup.setChildren(children);

        return providedGroup;
    }

    public balanceColumnTree(
        unbalancedTree: (AgColumn | AgProvidedColumnGroup)[],
        currentDepth: number,
        columnDepth: number,
        columnKeyCreator: IColumnKeyCreator
    ): (AgColumn | AgProvidedColumnGroup)[] {
        const result: (AgColumn | AgProvidedColumnGroup)[] = [];
        const treeLen = unbalancedTree.length;
        const beans = this.beans;
        // Hoisted: scanning for any group is a per-tree property — answer doesn't change per child.
        let hasGroups = false;
        for (let i = 0; i < treeLen; ++i) {
            if (isProvidedColumnGroup(unbalancedTree[i])) {
                hasGroups = true;
                break;
            }
        }

        // go through each child, for groups, recurse a level deeper, for columns we pad.
        for (let i = 0; i < treeLen; ++i) {
            const child = unbalancedTree[i];
            if (isProvidedColumnGroup(child)) {
                child.setChildren(
                    this.balanceColumnTree(child.children, currentDepth + 1, columnDepth, columnKeyCreator)
                );
                result.push(child);
                continue;
            }

            // child is a column — pad with synthetic groups up to `columnDepth`. This loop runs
            // ZERO iterations when no padding is needed (`currentDepth >= columnDepth`).
            let firstPaddedGroup: AgProvidedColumnGroup | undefined;
            let currentPaddedGroup: AgProvidedColumnGroup | undefined;
            for (let j = currentDepth; j < columnDepth; ++j) {
                const newColId = columnKeyCreator.getUniqueKey(null, null);
                const colGroupDefMerged = createMergedColGroupDef(beans, null, newColId);
                const paddedGroup = new AgProvidedColumnGroup(colGroupDefMerged, newColId, true, j);
                this.createBean(paddedGroup);
                if (currentPaddedGroup) {
                    currentPaddedGroup.setChildren([paddedGroup]);
                }
                currentPaddedGroup = paddedGroup;
                if (!firstPaddedGroup) {
                    firstPaddedGroup = paddedGroup;
                }
            }

            // Likewise, this branch does not run when no padding was built above.
            if (firstPaddedGroup && currentPaddedGroup) {
                result.push(firstPaddedGroup);
                if (hasGroups) {
                    currentPaddedGroup.setChildren([child]);
                    continue;
                }
                // No mixed groups in this tree — adopt every leaf under the padding and exit.
                currentPaddedGroup.setChildren(unbalancedTree);
                break;
            }

            result.push(child);
        }

        return result;
    }

    public findDepth(balancedColumnTree: (AgColumn | AgProvidedColumnGroup)[]): number {
        let depth = 0;
        let pointer = balancedColumnTree;

        while (pointer?.[0] && isProvidedColumnGroup(pointer[0])) {
            depth++;
            pointer = pointer[0].children;
        }
        return depth;
    }

    public findMaxDepth(treeChildren: (AgColumn | AgProvidedColumnGroup)[], depth: number): number {
        let maxDepthThisLevel = depth;
        const nextDepth = depth + 1;
        for (let i = 0, len = treeChildren.length; i < len; ++i) {
            const child = treeChildren[i];
            if (isProvidedColumnGroup(child)) {
                const newDepth = this.findMaxDepth(child.children, nextDepth);
                if (maxDepthThisLevel < newDepth) {
                    maxDepthThisLevel = newDepth;
                }
            }
        }
        return maxDepthThisLevel;
    }

    private findExistingGroup(
        newGroupDef: ColGroupDef,
        existingGroups: AgProvidedColumnGroup[]
    ): { idx: number; group: AgProvidedColumnGroup } | undefined {
        const newGroupId = newGroupDef.groupId;
        if (newGroupId == null) {
            return undefined;
        }
        for (let i = 0, len = existingGroups.length; i < len; ++i) {
            const existingGroup = existingGroups[i];
            if (existingGroup.getColGroupDef() && existingGroup.groupId === newGroupId) {
                return { idx: i, group: existingGroup };
            }
        }
        return undefined;
    }

    private createColumnGroup(
        providedGroup: AgProvidedColumnGroup,
        groupInstanceIdCreator: GroupInstanceIdCreator,
        oldColumnsMapped: { [key: string]: AgColumnGroup },
        pinned: ColumnPinnedType,
        isStandaloneStructure?: boolean
    ): AgColumnGroup {
        const groupId = providedGroup.groupId;
        const instanceId = groupInstanceIdCreator.getInstanceIdForKey(groupId);
        const uniqueId = createUniqueColumnGroupId(groupId, instanceId);

        let columnGroup: AgColumnGroup | null = oldColumnsMapped[uniqueId];

        // if the user is setting new colDefs, it is possible that the id's overlap, and we
        // would have a false match from above. so we double check we are talking about the
        // same original column group.
        if (columnGroup && columnGroup.providedColumnGroup !== providedGroup) {
            columnGroup = null;
        }

        if (_exists(columnGroup)) {
            // clean out the old column group here, as we will be adding children into it again
            columnGroup.reset();
        } else {
            columnGroup = new AgColumnGroup(providedGroup, groupId, instanceId, pinned);
            if (!isStandaloneStructure) {
                this.createBean(columnGroup);
            }
        }

        return columnGroup;
    }

    // returns back a 2d map of ColumnGroup as follows: groupId -> instanceId -> ColumnGroup
    private mapOldGroupsById(displayedGroups: (AgColumn | AgColumnGroup)[]): {
        [uniqueId: string]: AgColumnGroup;
    } {
        const result: { [uniqueId: HeaderColumnId]: AgColumnGroup } = {};
        if (displayedGroups) {
            collectGroupsByUniqueId(displayedGroups, result);
        }
        return result;
    }

    private setupParentsIntoCols(
        columnsOrGroups: (AgColumn | AgColumnGroup)[] | null,
        parent: AgColumnGroup | null
    ): void {
        if (!columnsOrGroups) {
            return;
        }
        for (let i = 0, len = columnsOrGroups.length; i < len; ++i) {
            const columnsOrGroup = columnsOrGroups[i];
            if (columnsOrGroup.parent !== parent) {
                // parent has explicitly changed - force viewport headers now needed.
                this.beans.colViewport.colsWithinViewportHash = '';
            }
            columnsOrGroup.parent = parent;
            if (isColumnGroup(columnsOrGroup)) {
                this.setupParentsIntoCols(columnsOrGroup.children, columnsOrGroup);
            }
        }
    }
}

/** Early-exit DFS over the col tree; returns the first `AgProvidedColumnGroup` matching `key`,
 *  or `null`. Avoids the full-tree walk that the generic `depthFirstOriginalTreeSearch` does. */
const findProvidedColGroup = (
    tree: (AgColumn | AgProvidedColumnGroup)[],
    key: string
): AgProvidedColumnGroup | null => {
    for (let i = 0, len = tree.length; i < len; ++i) {
        const node = tree[i];
        if (isProvidedColumnGroup(node)) {
            if (node.groupId === key) {
                return node;
            }
            const found = findProvidedColGroup(node.children, key);
            if (found !== null) {
                return found;
            }
        }
    }
    return null;
};

/** Resolve a node's `originalParent`. For `AgColumnGroup`s, hop through `providedColumnGroup`
 *  first; for `AgColumn`s the field is on the column itself. */
const originalParentOf = (node: AgColumn | AgColumnGroup): AgProvidedColumnGroup | null =>
    (isColumnGroup(node) ? node.providedColumnGroup : node).originalParent;

/** Recursively collect every `AgColumnGroup` in `nodes` into `out`, keyed by its unique id. */
const collectGroupsByUniqueId = (
    nodes: (AgColumn | AgColumnGroup)[],
    out: { [uniqueId: HeaderColumnId]: AgColumnGroup }
): void => {
    for (let i = 0, len = nodes.length; i < len; ++i) {
        const node = nodes[i];
        if (isColumnGroup(node)) {
            out[node.getUniqueId()] = node;
            if (node.children) {
                collectGroupsByUniqueId(node.children, out);
            }
        }
    }
};
