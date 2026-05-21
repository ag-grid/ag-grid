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
import { createMergedColGroupDef } from './columnGroupUtils';

/** Prefix for synthetic `AgProvidedColumnGroup` IDs created by `wrapAutoColInBalancedTree` to pad
 *  auto-generated columns up to the user-tree depth. */
const BALANCED_TREE_WRAPPER_ID_PREFIX = 'FAKE_PATH_';

export interface CreateGroupsParams {
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

        const impactedGroups: AgProvidedColumnGroup[] = [];

        for (const stateItem of stateItems) {
            const groupKey = stateItem.groupId;
            const newValue = stateItem.open;
            const providedColumnGroup = this.getProvidedColGroup(groupKey);

            if (!providedColumnGroup) {
                continue;
            }
            if (providedColumnGroup.expanded === newValue) {
                continue;
            }

            providedColumnGroup.setExpanded(newValue);
            impactedGroups.push(providedColumnGroup);
        }

        visibleCols.refresh(source, true);

        if (impactedGroups.length) {
            eventSvc.dispatchEvent({
                type: 'columnGroupOpened',
                columnGroup: impactedGroups.length === 1 ? impactedGroups[0] : undefined,
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
        let res: AgProvidedColumnGroup | null = null;

        depthFirstOriginalTreeSearch(null, this.beans.colModel.getColTree(), (node) => {
            if (isProvidedColumnGroup(node)) {
                if (node.groupId === key) {
                    res = node;
                }
            }
        });

        return res;
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

        /**
         * The following logic starts at the leaf level of columns, iterating through them to build their parent
         * groups when the parents match.
         *
         * The created groups are then added to an array, and similarly iterated on until we reach the top level.
         *
         * When row groups have no original parent, it's added to the result.
         */
        const topLevelResultCols: (AgColumn | AgColumnGroup)[] = [];

        // this is an array of cols or col groups at one level of depth, starting from leaf and ending at root
        let groupsOrColsAtCurrentLevel: (AgColumn | AgColumnGroup)[] = columns;
        while (groupsOrColsAtCurrentLevel.length) {
            // store what's currently iterating so the function can build the next level of col groups
            const currentlyIterating = groupsOrColsAtCurrentLevel;
            groupsOrColsAtCurrentLevel = [];

            // store the index of the last row which was different from the previous row, this is used as a slice
            // index for finding the children to group together
            let lastGroupedColIdx = 0;

            // create a group of children from lastGroupedColIdx to the provided `to` parameter
            const createGroupToIndex = (to: number) => {
                const from = lastGroupedColIdx;
                lastGroupedColIdx = to;

                const previousNode = currentlyIterating[from];
                const previousNodeProvided = isColumnGroup(previousNode)
                    ? previousNode.providedColumnGroup
                    : previousNode;
                const previousNodeParent = previousNodeProvided.originalParent;

                if (previousNodeParent == null) {
                    // if the last node was different, and had a null parent, then we add all the nodes to the final
                    // results)
                    for (let i = from; i < to; i++) {
                        topLevelResultCols.push(currentlyIterating[i]);
                    }
                    return;
                }

                // the parent differs from the previous node, so we create a group from the previous node
                // and add all to the result array, except the current node.
                const newGroup = this.createColumnGroup(
                    previousNodeParent,
                    idCreator,
                    oldColumnsMapped,
                    pinned,
                    isStandaloneStructure
                );

                for (let i = from; i < to; i++) {
                    newGroup.addChild(currentlyIterating[i]);
                }
                groupsOrColsAtCurrentLevel.push(newGroup);
            };

            for (let i = 1; i < currentlyIterating.length; i++) {
                const thisNode = currentlyIterating[i];
                const thisNodeProvided = isColumnGroup(thisNode) ? thisNode.providedColumnGroup : thisNode;
                const thisNodeParent = thisNodeProvided.originalParent;

                const previousNode = currentlyIterating[lastGroupedColIdx];
                const previousNodeProvided = isColumnGroup(previousNode)
                    ? previousNode.providedColumnGroup
                    : previousNode;
                const previousNodeParent = previousNodeProvided.originalParent;

                if (thisNodeParent !== previousNodeParent) {
                    createGroupToIndex(i);
                }
            }

            if (lastGroupedColIdx < currentlyIterating.length) {
                createGroupToIndex(currentlyIterating.length);
            }
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

        // go through each child, for groups, recurse a level deeper,
        // for columns we need to pad
        for (let i = 0; i < unbalancedTree.length; i++) {
            const child = unbalancedTree[i];
            if (isProvidedColumnGroup(child)) {
                // child is a group, all we do is go to the next level of recursion
                const originalGroup = child;
                const newChildren = this.balanceColumnTree(
                    originalGroup.children,
                    currentDepth + 1,
                    columnDepth,
                    columnKeyCreator
                );
                originalGroup.setChildren(newChildren);
                result.push(originalGroup);
            } else {
                // child is a column - so here we add in the padded column groups if needed
                let firstPaddedGroup: AgProvidedColumnGroup | undefined;
                let currentPaddedGroup: AgProvidedColumnGroup | undefined;

                // this for loop will NOT run any loops if no padded column groups are needed
                for (let j = currentDepth; j < columnDepth; j++) {
                    const newColId = columnKeyCreator.getUniqueKey(null, null);
                    const colGroupDefMerged = createMergedColGroupDef(this.beans, null, newColId);

                    const paddedGroup = new AgProvidedColumnGroup(colGroupDefMerged, newColId, true, j);
                    this.createBean(paddedGroup);

                    if (currentPaddedGroup) {
                        currentPaddedGroup.setChildren([paddedGroup]);
                    }

                    currentPaddedGroup = paddedGroup;

                    if (!firstPaddedGroup) {
                        firstPaddedGroup = currentPaddedGroup;
                    }
                }

                // likewise this if statement will not run if no padded groups
                if (firstPaddedGroup && currentPaddedGroup) {
                    result.push(firstPaddedGroup);
                    const hasGroups = unbalancedTree.some((leaf) => isProvidedColumnGroup(leaf));

                    if (hasGroups) {
                        currentPaddedGroup.setChildren([child]);
                        continue;
                    } else {
                        currentPaddedGroup.setChildren(unbalancedTree);
                        break;
                    }
                }

                result.push(child);
            }
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

        for (let i = 0; i < treeChildren.length; i++) {
            const abstractColumn = treeChildren[i];
            if (isProvidedColumnGroup(abstractColumn)) {
                const originalGroup = abstractColumn;
                const newDepth = this.findMaxDepth(originalGroup.children, depth + 1);
                if (maxDepthThisLevel < newDepth) {
                    maxDepthThisLevel = newDepth;
                }
            }
        }

        return maxDepthThisLevel;
    }

    /** Wrap `col` in `depth` levels of dummy `AgProvidedColumnGroup` nodes so the leaf aligns with
     *  the user tree's depth. Returns the top-most wrapper (or `col` itself when `depth === 0`). */
    public wrapAutoColInBalancedTree(col: AgColumn, depth: number): AgColumn | AgProvidedColumnGroup {
        if (depth === 0) {
            col.originalParent = null;
            return col;
        }
        const colId = col.colId;
        let nextChild: AgColumn | AgProvidedColumnGroup = col;
        for (let i = depth - 1; i >= 0; --i) {
            const autoGroup = new AgProvidedColumnGroup(
                null,
                `${BALANCED_TREE_WRAPPER_ID_PREFIX}${colId}_${i}`,
                true,
                i
            );
            this.createBean(autoGroup);
            autoGroup.setChildren([nextChild]);
            nextChild.originalParent = autoGroup;
            nextChild = autoGroup;
        }
        return nextChild;
    }

    /** Wrapper cache for service cols (auto-group / selection / row-numbers). Survives across
     *  `refreshCols` so `(col, depth)`-stable wrappers aren't rebuilt on every refresh. */
    private readonly serviceColWrapperCache = new Map<
        AgColumn,
        { wrapper: AgColumn | AgProvidedColumnGroup; depth: number }
    >();

    /** Returns the cached wrapper for `col` at `depth`, or builds one. `inUse` is the pass's
     *  live-set — caller calls `evictStaleServiceWrappers(inUse)` after to drop unused entries. */
    public wrapServiceColCached(col: AgColumn, depth: number, inUse: Set<AgColumn>): AgColumn | AgProvidedColumnGroup {
        inUse.add(col);
        const cache = this.serviceColWrapperCache;
        const cached = cache.get(col);
        if (cached?.depth === depth) {
            return cached.wrapper;
        }
        const wrapper = this.wrapAutoColInBalancedTree(col, depth);
        if (cached !== undefined) {
            destroyAutoWrapperChain(cached.wrapper);
        }
        cache.set(col, { wrapper, depth });
        return wrapper;
    }

    /** Destroy wrapper chains for service cols not in `inUse`. Leaf cols are owned by producers
     *  (auto/sel/rowNum services) — only the wrapper groups are destroyed here. */
    public evictStaleServiceWrappers(inUse: Set<AgColumn>): void {
        const cache = this.serviceColWrapperCache;
        if (cache.size === 0 || cache.size === inUse.size) {
            return;
        }
        for (const [col, entry] of cache) {
            if (!inUse.has(col)) {
                destroyAutoWrapperChain(entry.wrapper);
                cache.delete(col);
            }
        }
    }

    /** Destroys all cached service-col wrappers. Called by ColumnModel on grid teardown. */
    public destroyAllServiceColWrappers(): void {
        const cache = this.serviceColWrapperCache;
        for (const entry of cache.values()) {
            destroyAutoWrapperChain(entry.wrapper);
        }
        cache.clear();
    }

    private findExistingGroup(
        newGroupDef: ColGroupDef,
        existingGroups: AgProvidedColumnGroup[]
    ): { idx: number; group: AgProvidedColumnGroup } | undefined {
        const newHasId = newGroupDef.groupId != null;
        if (!newHasId) {
            return undefined;
        }

        for (let i = 0; i < existingGroups.length; i++) {
            const existingGroup = existingGroups[i];
            const existingDef = existingGroup.getColGroupDef();
            if (!existingDef) {
                continue;
            }

            if (existingGroup.groupId === newGroupDef.groupId) {
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

        const recursive = (columnsOrGroups: (AgColumn | AgColumnGroup)[] | null) => {
            for (const columnOrGroup of columnsOrGroups!) {
                if (isColumnGroup(columnOrGroup)) {
                    const columnGroup = columnOrGroup;
                    result[columnOrGroup.getUniqueId()] = columnGroup;
                    recursive(columnGroup.children);
                }
            }
        };

        if (displayedGroups) {
            recursive(displayedGroups);
        }

        return result;
    }

    private setupParentsIntoCols(
        columnsOrGroups: (AgColumn | AgColumnGroup)[] | null,
        parent: AgColumnGroup | null
    ): void {
        for (const columnsOrGroup of columnsOrGroups ?? []) {
            if (columnsOrGroup.parent !== parent) {
                // parent has explicitly changed - force viewport headers now needed.
                this.beans.colViewport.colsWithinViewportHash = '';
            }
            columnsOrGroup.parent = parent;
            if (isColumnGroup(columnsOrGroup)) {
                const columnGroup = columnsOrGroup;
                this.setupParentsIntoCols(columnGroup.children, columnGroup);
            }
        }
    }
}

/** Destroys the chain of `AgProvidedColumnGroup` wrappers above an auto-col, stopping at the
 *  leaf `AgColumn` (its lifecycle is owned by the producing service, not by colGroupSvc). */
function destroyAutoWrapperChain(top: AgColumn | AgProvidedColumnGroup): void {
    let node: AgColumn | AgProvidedColumnGroup | null = top;
    while (node && !node.isColumn) {
        const wrapper = node as AgProvidedColumnGroup;
        const child: AgColumn | AgProvidedColumnGroup | undefined = wrapper.children[0];
        if (wrapper.isAlive()) {
            wrapper.destroy();
        }
        node = child ?? null;
    }
}
