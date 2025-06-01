import type {
    ChangedPath,
    GroupingApproach,
    IChangedRowNodes,
    IsGroupOpenByDefaultParams,
    StageExecuteParams,
} from 'ag-grid-community';
import { RowNode, _ROW_ID_PREFIX_ROW_GROUP, _removeFromArray } from 'ag-grid-community';
import { BeanStub, _EmptyArray, _warn } from 'ag-grid-community';

import { setRowNodeGroup } from '../rowGrouping/rowGroupingUtils';
import type { GroupingRowNode, IRowGroupingStrategy } from '../rowHierarchy/rowHierarchyUtils';
import type { DataFieldGetter } from './fieldAccess';
import { makeFieldPathGetter } from './fieldAccess';

const FLAG_CHILDREN_CHANGED = 0x80000000;
const FLAG_CHANGED = 0x40000000;
const FLAG_FILLER_NODE = 0x20000000;
const FLAG_EXPANDED_INITIALIZED = 0x10000000;
const MASK_CHILDREN_LEN = 0x0fffffff; // This equates to 268,435,455 maximum children per parent, more than enough

/** Maximum number of duplicates to warn about per node, to avoid flooding the console */
const MAX_DUPLICATES_PER_PATH_TO_WARN = 16;

/** Path key separator used to flatten hierarchical paths. Includes uncommon and randomized characters to avoid collisions and abuse. */
const PATH_KEY_SEPARATOR = String.fromCharCode(31, 4096 + Math.random() * 61440, 4096 + Math.random() * 61440, 8291);

//
// This approach avoids complex incremental updates by using linear passes and a final traversal.
// We reduce memory allocations and footprint and we ensure consistent performance.
//
// All leaf nodes are scanned in input order, and the tree is built by setting the treeParent field.
// Then we execute a single traversal to set the level, expanded state, and allLeafChildren.
// This guarantees correct parent-child relationships without requiring sorting or post-processing.
//
// No new arrays are allocated for childrenAfterGroup or allLeafChildren — existing arrays are reused.
// The treeNodeFlags field encodes temporary state, child counters, and expanded status.
// The treeParent field tracks hierarchy changes and supports re-parenting (e.g., drag-and-drop).
// The childrenMapped field is repurposed as a temporary cache for flat string path keys for tree data by path.
//
// This model handles both full reloads and partial updates (such as subtree moves) uniformly,
// avoiding the need for complex data structures, delta tracking, or transaction staging,
// while providing reliable performance across large datasets.
//

export class TreeGroupStrategy<TData = any> extends BeanStub implements IRowGroupingStrategy<TData> {
    private groupColsIds: string = '';
    private groupColsChanged: boolean = true;
    private parentIdGetter: DataFieldGetter<TData, string> | null = null;
    private fillerNodesById: Map<string, GroupingRowNode<TData>> | null = null;
    private nodesToUnselect: GroupingRowNode<TData>[] | null = null;

    public override destroy(): void {
        super.destroy();
        this.groupColsIds = '';
        this.parentIdGetter = null;
        this.fillerNodesById = null!;
        this.nodesToUnselect = null;
    }

    public reset(): void {
        this.destroyFillerRows(true);
        this.deselectHiddenNodes(false);
        this.groupColsIds = '';
        this.groupColsChanged = true;
        this.parentIdGetter = null;
    }

    public execute(params: StageExecuteParams<TData>, approach: GroupingApproach) {
        const { changedRowNodes, changedPath, afterColumnsChanged } = params;
        this.checkGroupColsUpdated(afterColumnsChanged);

        const rootNode = params.rowNode as GroupingRowNode<TData>;

        const activeChangedPath = changedPath?.active ? changedPath : undefined;
        const fullReload = !changedRowNodes && !activeChangedPath;

        const hasUpdates = !!changedRowNodes && this.flagUpdatedNodes(changedRowNodes);
        if (fullReload || hasUpdates) {
            this.load(params, approach, fullReload);
        }

        const rootAllLeafChildren = rootNode.allLeafChildren!;
        const allLeafChildrenLen = rootAllLeafChildren.length;
        const fillerNodesById = this.fillerNodesById;

        let treeChanged = false;
        for (let i = 0; i < allLeafChildrenLen; ++i) {
            if (this.initRowParent(rootAllLeafChildren[i])) {
                treeChanged = true;
            }
        }
        if (fillerNodesById !== null) {
            for (const filler of fillerNodesById.values()) {
                if (this.initRowParent(filler)) {
                    treeChanged = true;
                }
            }
        }

        this.initRowChildrenSize(rootNode);
        for (let i = 0; i < allLeafChildrenLen; ++i) {
            this.initRowChildrenSize(rootAllLeafChildren[i]);
        }
        if (fillerNodesById !== null) {
            for (const filler of fillerNodesById.values()) {
                this.initRowChildrenSize(filler);
            }
        }

        let preprocessedCount = 0;
        for (let i = 0; i < allLeafChildrenLen; ++i) {
            preprocessedCount += this.preprocessRow(rootAllLeafChildren[i]);
        }

        this.deselectHiddenNodes(treeChanged || fullReload);

        const traverseCount = this.traverseRoot(rootNode, activeChangedPath);
        if (preprocessedCount > 0 && preprocessedCount !== traverseCount) {
            this.handleCycles(rootNode); // We have unprocessed nodes, this means we have at least one cycle to fix
            this.traverseRoot(rootNode, activeChangedPath); // Re-traverse the root
        }

        rootNode.treeNodeFlags = 0;
    }

    private flagUpdatedNodes(changedRowNodes: IChangedRowNodes<TData>): boolean {
        const { adds, updates, removals } = changedRowNodes;
        let hasUpdates = removals.size > 0;
        if (adds.size > 0) {
            hasUpdates = true;
            for (const node of adds) {
                (node as GroupingRowNode<TData>).treeNodeFlags |= FLAG_CHANGED;
            }
        }
        if (updates.size > 0) {
            hasUpdates = true;
            for (const node of updates) {
                (node as GroupingRowNode<TData>).treeNodeFlags |= FLAG_CHANGED;
            }
        }
        return hasUpdates;
    }

    private initRowParent(row: GroupingRowNode<TData>): boolean {
        const { parent: oldParent, treeParent: newParent } = row;
        if (oldParent === newParent) {
            if (newParent !== null) {
                ++newParent.treeNodeFlags; // Increment the number of children in the parent
            }
            return false;
        }
        if (newParent === null) {
            this.hideRow(row);
            return true;
        }
        row.parent = newParent;
        let parentFlags = (newParent.treeNodeFlags + 1) | FLAG_CHANGED; // Increment the number of children in the parent
        if (oldParent) {
            const oldParentFlags = oldParent.treeNodeFlags;
            if (
                (oldParentFlags & FLAG_EXPANDED_INITIALIZED) !== 0 &&
                (parentFlags & FLAG_EXPANDED_INITIALIZED) === 0 &&
                newParent.treeParent !== null &&
                !newParent.data
            ) {
                newParent.expanded = oldParent.expanded; // If parent is a new filler node, copy the expanded flag from old parent
                parentFlags |= FLAG_EXPANDED_INITIALIZED;
            }
            oldParent.treeNodeFlags = oldParentFlags | FLAG_CHANGED;
        }
        newParent.treeNodeFlags = parentFlags;
        return true;
    }

    private initRowChildrenSize(row: GroupingRowNode<TData>) {
        let { childrenAfterGroup, allLeafChildren, treeNodeFlags } = row;
        const oldLen = childrenAfterGroup?.length;
        const len = treeNodeFlags & MASK_CHILDREN_LEN;
        row.treeNodeFlags = (treeNodeFlags & ~MASK_CHILDREN_LEN) | ((oldLen || 0) !== len ? FLAG_CHILDREN_CHANGED : 0);
        if (len === 0 && row.level >= 0) {
            if (childrenAfterGroup !== _EmptyArray) {
                row.childrenAfterGroup = _EmptyArray;
                const sibling = row.sibling;
                if (sibling) sibling.childrenAfterGroup = _EmptyArray;
            }
        } else if (oldLen !== len || childrenAfterGroup === allLeafChildren) {
            if (!childrenAfterGroup || childrenAfterGroup === _EmptyArray || childrenAfterGroup === allLeafChildren) {
                row.childrenAfterGroup = childrenAfterGroup = new Array(len);
                const sibling = row.sibling;
                if (sibling) sibling.childrenAfterGroup = childrenAfterGroup;
            } else {
                childrenAfterGroup.length = len;
            }
        }
    }

    private preprocessRow(row: GroupingRowNode<TData>): number {
        const parent = row.treeParent;
        if (parent === null) {
            return 0; // Row is hidden
        }

        let count = 1;
        let parentFlags = parent.treeNodeFlags;
        if (!parent.data && (parentFlags & FLAG_FILLER_NODE) === 0 && parent.treeParent !== null) {
            parent.treeNodeFlags = parentFlags |= FLAG_FILLER_NODE | (row.treeNodeFlags & FLAG_CHANGED); // Mark as processed
            count += this.preprocessRow(parent); // Preprocess the filler row if it exists and is not already processed
        }

        // Write the row in the parent children array at the right incremental index
        const parentChildren = parent.childrenAfterGroup!;
        const indexInParent = parentFlags & MASK_CHILDREN_LEN;
        parentFlags = (parentFlags & ~MASK_CHILDREN_LEN) | (indexInParent + 1);
        if (parentFlags & FLAG_CHILDREN_CHANGED || parentChildren[indexInParent] !== row) {
            parentChildren[indexInParent] = row;
            parentFlags |= FLAG_CHILDREN_CHANGED;
        }
        parent.treeNodeFlags = parentFlags;

        if (!row.groupData || this.groupColsChanged) {
            row.treeNodeFlags |= FLAG_CHANGED;
            this.setGroupData(row, row.key!);
        }

        return count;
    }

    private traverseRoot(rootNode: GroupingRowNode<TData>, activeChangedPath: ChangedPath | undefined): number {
        let traverseCount = 0;
        const rootChildrenAfterGroup = rootNode.childrenAfterGroup!;
        for (let i = 0, len = rootChildrenAfterGroup.length; i < len; ++i) {
            traverseCount += this.traverse(rootChildrenAfterGroup[i], 0, false, activeChangedPath);
        }
        return traverseCount & ~FLAG_CHILDREN_CHANGED;
    }

    private traverse(
        row: GroupingRowNode<TData>,
        level: number,
        collapsed: boolean,
        activeChangedPath: ChangedPath | undefined
    ): number {
        const treeNodeFlags = row.treeNodeFlags;
        let changed = (treeNodeFlags & (FLAG_CHANGED | FLAG_CHILDREN_CHANGED)) !== 0;
        let result = 1;

        row.level = level++;
        row.treeNodeFlags = treeNodeFlags & FLAG_EXPANDED_INITIALIZED; // Keep only the expanded initialized flag

        const childrenAfterGroup = row.childrenAfterGroup!;
        const childrenAfterGroupLen = childrenAfterGroup.length;
        const group = childrenAfterGroupLen > 0;
        if (row.group !== group) {
            setRowNodeGroup(row, this.beans, group); // Internally calls updateHasChildren
            if (!group && !row.expanded) {
                row.treeNodeFlags &= ~FLAG_EXPANDED_INITIALIZED; // Reset the expanded initialized flag if no children
            }
            changed = true;
        } else if (row.hasChildren() !== group) {
            row.updateHasChildren();
            changed = true;
        }

        if (group && (treeNodeFlags & FLAG_EXPANDED_INITIALIZED) === 0) {
            row.treeNodeFlags |= FLAG_EXPANDED_INITIALIZED;
            row.expanded = this.getRowDefaultExpanded(row, level);
        }

        if (collapsed && row.rowIndex !== null) {
            row.clearRowTopAndRowIndex(); // Hidden.
        }

        collapsed ||= !row.expanded;

        let leafsLen = 0;
        let leafsChanged = (treeNodeFlags & FLAG_CHILDREN_CHANGED) !== 0;
        for (let i = 0; i < childrenAfterGroupLen; ++i) {
            const child = childrenAfterGroup[i];
            const childTraverseResult = this.traverse(child, level, collapsed, activeChangedPath);
            result += childTraverseResult;
            leafsChanged ||= (childTraverseResult & FLAG_CHILDREN_CHANGED) !== 0;
            leafsLen += child.allLeafChildren?.length || 0;
            if (child.data) ++leafsLen; // If not a filler node, count it
        }

        if (this.updateAllLeafChildren(row, leafsLen, leafsChanged)) {
            result |= FLAG_CHILDREN_CHANGED;
        }

        if (changed) {
            activeChangedPath?.addParentNode(row);
        }
        return result;
    }

    private updateAllLeafChildren(row: GroupingRowNode<TData>, len: number, changed: boolean): boolean {
        let leafs = row.allLeafChildren;
        let result = (leafs?.length || 0) !== len;
        if (len === 0) {
            if (leafs !== null) {
                row.allLeafChildren = null;
                const sibling = row.sibling;
                if (sibling) sibling.allLeafChildren = null;
            }
        } else if (result || changed) {
            if (!leafs) {
                row.allLeafChildren = leafs = new Array(len);
                const sibling = row.sibling;
                if (sibling) sibling.allLeafChildren = leafs;
            } else if (result) {
                leafs.length = len; // resize
            }
            const rows = row.childrenAfterGroup!;
            for (let i = 0, writeIdx = 0, childrenLen = rows.length; i < childrenLen; ++i) {
                const child = rows![i];
                if (child.data) {
                    if ((result ||= leafs[writeIdx] !== child)) leafs[writeIdx] = child;
                    ++writeIdx;
                }
                const childLeafs = child.allLeafChildren;
                if (childLeafs) {
                    for (let j = 0, len = childLeafs.length; j < len; ++j, ++writeIdx) {
                        const leaf = childLeafs![j];
                        if ((result ||= leafs[writeIdx] !== leaf)) leafs[writeIdx] = leaf;
                    }
                }
            }
        }
        return result;
    }

    private getRowDefaultExpanded(rowNode: GroupingRowNode<TData>, level: number): boolean {
        const gos = this.gos;
        const isGroupOpenByDefault = gos.getCallback('isGroupOpenByDefault');
        if (!isGroupOpenByDefault) {
            const groupDefaultExpanded = gos.get('groupDefaultExpanded');
            return groupDefaultExpanded === -1 || level < groupDefaultExpanded;
        }
        const { field, key, rowGroupColumn } = rowNode;
        const params = gos.addGridCommonParams<IsGroupOpenByDefaultParams>({
            rowNode,
            field: field!,
            key: key!,
            level,
            rowGroupColumn: rowGroupColumn!,
        });
        return isGroupOpenByDefault(params) == true;
    }

    /** Handle cycles in a tree. Is not optimal for performance but this is an edge case that shouldn't happen. */
    private handleCycles(rootNode: GroupingRowNode<TData>) {
        const marked = new Set<GroupingRowNode<TData>>();
        const mark = (row: GroupingRowNode<TData>): boolean => {
            if (marked.has(row)) return false;
            marked.add(row);
            row.childrenAfterGroup!.forEach(mark);
            return true;
        };
        mark(rootNode);
        const rootChildrenAfterGroup = rootNode.childrenAfterGroup!;
        rootChildrenAfterGroup.length = 0; // Clear the array to repopulate it
        for (const row of rootNode.allLeafChildren!) {
            const parent = row.treeParent;
            if (parent && mark(row)) {
                _removeFromArray(parent.childrenAfterGroup!, row); // Remove the row from the root children
                parent.treeNodeFlags |= FLAG_CHILDREN_CHANGED | FLAG_CHANGED;
                row.parent = rootNode; // Move the row to the root node
                rootChildrenAfterGroup.push(row);
                _warn(270, { id: row.id!, parentId: parent?.id ?? '' });
            } else if (parent === rootNode) {
                rootChildrenAfterGroup.push(row);
            }
        }
    }

    private setGroupData(row: RowNode, key: string): void {
        const groupData: Record<string, string> = {};
        const groupDisplayCols = this.beans.showRowGroupCols?.getShowRowGroupCols();
        row.groupData = groupData;
        if (groupDisplayCols) {
            for (const col of groupDisplayCols) {
                groupData[col.getColId()] = key;
            }
        }
    }

    /** Called when there is data to be loaded, or because full reload or because there are changed rows */
    private load(params: StageExecuteParams<TData>, approach: GroupingApproach, fullReload: boolean): void {
        if (approach === 'treeNested') {
            this.loadNested(params, fullReload);
        } else if (approach === 'treeSelfRef') {
            this.loadSelfRef(params, fullReload);
        } else {
            this.loadDataPath(params, fullReload);
        }
    }

    /** Load the tree structure for nested groups, aka children property */
    private loadNested({ rowNode: rootNode, changedRowNodes }: StageExecuteParams<TData>, fullReload: boolean): void {
        if (fullReload || !changedRowNodes) {
            const rootAllLeafChildren = rootNode.allLeafChildren!;
            for (let i = 0, len = rootAllLeafChildren.length; i < len; ++i) {
                const row = rootAllLeafChildren[i];
                const id = row.id!;
                if (row.key !== id) {
                    row.key = id;
                    row.groupData = null;
                }
            }
        } else {
            for (const row of changedRowNodes.adds) {
                row.key = row.id!;
            }
        }
    }

    /** Load the tree structure for self-referencing data, aka parentId field */
    private loadSelfRef({ rowNode: rootNode, changedRowNodes }: StageExecuteParams<TData>, fullReload: boolean): void {
        const rootAllLeafChildren: GroupingRowNode<TData>[] = rootNode.allLeafChildren!;
        const gos = this.gos;

        if (!gos.get('getRowId')) {
            for (let i = 0, len = rootAllLeafChildren.length; i < len; ++i) {
                rootAllLeafChildren[i].treeParent = null;
            }
            return; // Display an empty grid if getRowId missing
        }

        const rowModel = this.beans.rowModel;
        const removals = changedRowNodes?.removals;
        let parentIdGetter = this.parentIdGetter;
        const parentIdField = gos.get('treeDataParentIdField') || null;
        if (parentIdGetter?.path !== parentIdField) {
            this.parentIdGetter = parentIdGetter = makeFieldPathGetter(parentIdField);
            fullReload = true;
        }

        for (let i = 0, len = rootAllLeafChildren.length; i < len; ++i) {
            const row = rootAllLeafChildren[i];
            if (fullReload || row.treeNodeFlags & FLAG_CHANGED || removals?.has(row.treeParent!)) {
                let newParent: GroupingRowNode<TData> | null | undefined;
                const parentId = parentIdGetter(row.data);
                if (parentId !== null && parentId !== undefined) {
                    newParent = rowModel.getRowNode(parentId) as GroupingRowNode<TData>;
                    if (!newParent) {
                        _warn(271, { id: row.id!, parentId });
                    }
                }
                row.treeParent = newParent ?? rootNode;
                const id = row.id!;
                if (row.key !== id) {
                    row.key = id;
                    row.groupData = null;
                }
            } else {
                row.treeParent ??= rootNode;
            }
        }
    }

    /** Load the tree structure for data paths, aka getDataPath callback */
    private loadDataPath({ rowNode: rootNode }: StageExecuteParams<TData>, fullReload: boolean): void {
        const allLeafChildren: GroupingRowNode<TData>[] = rootNode.allLeafChildren!;
        const allLeafChildrenLen = allLeafChildren.length;
        const nodesByPath: NodesByPathMap<TData> = new Map<string, GroupingRowNode<TData>>();

        if (!fullReload) {
            for (let i = 0; i < allLeafChildrenLen; ++i) {
                const node = allLeafChildren[i];
                const treeParent = node.treeParent;
                if (treeParent !== null && (node.treeNodeFlags & FLAG_CHANGED) === 0) {
                    let pathKey = node.key!;
                    let current = treeParent;
                    while (current && current !== rootNode) {
                        pathKey = PATH_KEY_SEPARATOR + pathKey;
                        const cached = current.childrenMapped;
                        if (cached !== null) {
                            pathKey = cached + pathKey;
                            break;
                        }
                        pathKey = current.key! + pathKey;
                        current = current.treeParent!;
                    }

                    node.childrenMapped = pathKey as any; // Cache the path key for faster access
                    const existing = nodesByPath.get(pathKey);
                    if (existing === undefined) {
                        nodesByPath.set(pathKey, node);
                    } else {
                        addDuplicateNodeByPath(nodesByPath, pathKey, existing, node);
                    }
                }
            }
        }

        const getDataPath = this.gos.get('getDataPath');
        for (let i = 0; i < allLeafChildrenLen; ++i) {
            const node = allLeafChildren[i];
            if (fullReload || node.treeParent === null || (node.treeNodeFlags & FLAG_CHANGED) !== 0) {
                const path = getDataPath ? getDataPath(node.data!) : [node.id!];
                const pathLen = path?.length;
                if (!pathLen) {
                    _warn(185, { data: node.data });
                    continue;
                }
                const key = path[pathLen - 1];
                if (node.key !== key) {
                    node.key = key;
                    node.groupData = null;
                    node.treeNodeFlags |= FLAG_CHANGED;
                }
                const pathKey = path.join(PATH_KEY_SEPARATOR);
                node.childrenMapped = pathKey as any; // Cache the path key for faster access
                const existing = nodesByPath.get(pathKey);
                if (existing === undefined) {
                    nodesByPath.set(pathKey, node);
                } else {
                    addDuplicateNodeByPath(nodesByPath, pathKey, existing, node);
                }
            }
            node.treeParent = null; // Reset the treeParent to be set later
        }

        if (nodesByPath.dupPaths?.size) {
            this.warnDuplicatePaths(nodesByPath.dupPaths);
        }
        this.buildFromPaths(rootNode, nodesByPath);
        this.destroyFillerRows(false);
    }

    private buildFromPaths(rootNode: GroupingRowNode<TData>, nodesByPath: Map<string, GroupingRowNode<TData>>): void {
        const SEP_LEN = PATH_KEY_SEPARATOR.length;
        const segments = new Array<number>(32); // temporary array to hold the segment positions
        for (const node of nodesByPath.values()) {
            const pathKey = node.childrenMapped as unknown as string;
            node.childrenMapped = null;
            if (node.treeParent !== null) {
                continue; // Already processed
            }

            // Collect PATH_KEY_SEPARATOR positions, fast string split without allocations
            let segmentsLen = 0;
            let scanPos = 0;
            while (scanPos < pathKey.length) {
                const sepPos = pathKey.indexOf(PATH_KEY_SEPARATOR, scanPos);
                if (sepPos === -1) break;
                segments[segmentsLen++] = sepPos;
                scanPos = sepPos + SEP_LEN;
            }

            // Find deepest existing node walking backward
            let startLevel = 0;
            let treeParent = rootNode;
            for (let level = segmentsLen - 1; level >= 0; --level) {
                const subPathKey = pathKey.slice(0, segments[level]);
                const existing = nodesByPath.get(subPathKey);
                if (existing) {
                    treeParent = existing;
                    startLevel = level + 1;
                    break;
                }
            }

            // Walk forward to construct missing nodes
            for (let level = startLevel; level < segmentsLen; ++level) {
                const end = segments[level];
                const start = level === 0 ? 0 : segments[level - 1] + SEP_LEN;
                const subPath = pathKey.slice(0, end);
                let current = nodesByPath.get(subPath);
                if (current === undefined) {
                    current = this.getOrCreateFiller(treeParent, pathKey.slice(start, end), level);
                    nodesByPath.set(subPath, current);
                }
                current.treeParent = treeParent;
                treeParent = current;
            }

            node.treeParent = treeParent; // Link the final leaf node to the last parent
        }
    }

    private warnDuplicatePaths(duplicatePaths: Map<string, GroupingRowNode<TData>[]>): void {
        for (const duplicates of duplicatePaths.values()) {
            const row = duplicates.sort((a, b) => a.sourceRowIndex - b.sourceRowIndex)[0];
            _warn(186, { rowId: row.id, rowData: row.data, duplicateRowsData: duplicates.slice(1).map((x) => x.data) });
        }
    }

    private getOrCreateFiller(treeParent: GroupingRowNode<TData>, key: string, level: number): GroupingRowNode<TData> {
        let id = level + '-' + key;
        let current = treeParent;
        while (--level >= 0) {
            id = level + '-' + current.key + '-' + id;
            current = current.treeParent!;
        }
        id = _ROW_ID_PREFIX_ROW_GROUP + id;
        const fillerNodesById = (this.fillerNodesById ??= new Map());
        let node = fillerNodesById.get(id);
        if (node === undefined) {
            node = new RowNode<TData>(this.beans);
            node.id = id;
            node.key = key;
            node.group = true;
            node.leafGroup = false;
            node.rowGroupIndex = null;
            fillerNodesById.set(id, node);
        }
        node.treeNodeFlags |= FLAG_FILLER_NODE; // Mark as used filler node
        return node;
    }

    private destroyFillerRows(destroyAll: boolean): void {
        const fillerNodesById = this.fillerNodesById;
        if (fillerNodesById) {
            for (const node of fillerNodesById.values()) {
                if (destroyAll || (node.treeNodeFlags & FLAG_FILLER_NODE) === 0) {
                    // This filler node is unused
                    fillerNodesById.delete(node.id!);
                    if (node.isSelected()) {
                        (this.nodesToUnselect ??= []).push(node);
                    }
                    node.clearRowTopAndRowIndex();
                } else {
                    node.treeNodeFlags &= ~FLAG_FILLER_NODE; // Reset the flag
                }
                node.childrenMapped = null; // Clear the cached path key
            }
            if (fillerNodesById.size === 0) {
                this.fillerNodesById = null;
            }
        }
    }

    private deselectHiddenNodes(updated: boolean): void {
        const selectionSvc = this.beans.selectionSvc;
        const nodes = this.nodesToUnselect;
        const source = 'rowDataChanged';
        if (nodes) {
            this.nodesToUnselect = null; // Reset the array
            selectionSvc?.setNodesSelected({ newValue: false, nodes, suppressFinishActions: true, source });
        }
        if (nodes || updated) {
            // we do this regardless of nodes to unselect or not, as it's possible a new node was inserted,
            // so a parent that was previously selected (as all children were selected) should not be tri-state
            // (as new one unselected against all other selected children).
            selectionSvc?.updateGroupsFromChildrenSelections?.(source);
        }
        if (nodes) {
            const selectedNodes = selectionSvc?.getSelectedNodes() ?? null;
            this.eventSvc.dispatchEvent({ type: 'selectionChanged', source, selectedNodes, serverSideState: null });
        }
    }

    private hideRow(row: GroupingRowNode<TData>): void {
        if (row.isSelected()) {
            (this.nodesToUnselect ??= []).push(row); // Collect nodes to unselect
        }
        row.parent = null;
        row.group = false;
        row.groupData = null;
        row.treeNodeFlags = 0;
        row.allLeafChildren = null;
        row.childrenAfterGroup = _EmptyArray;
        const sibling = row.sibling;
        if (sibling) {
            sibling.allLeafChildren = null;
            sibling.childrenAfterGroup = _EmptyArray;
        }
        row.updateHasChildren();
        if (row.rowIndex !== null) {
            row.clearRowTopAndRowIndex();
        }
    }

    private checkGroupColsUpdated(afterColumnsChanged: boolean | undefined): void {
        this.groupColsChanged = false;
        if (afterColumnsChanged || !this.groupColsIds) {
            const cols = this.beans.showRowGroupCols?.getShowRowGroupCols() ?? _EmptyArray;
            let groupColsIds = '';
            for (let i = 0, len = cols.length; i < len; ++i) {
                groupColsIds += cols[i].getId() + PATH_KEY_SEPARATOR;
            }
            if (this.groupColsIds !== groupColsIds) {
                this.groupColsIds = groupColsIds;
                this.groupColsChanged = true;
            }
        }
    }
}

type NodesByPathMap<TData> = Map<string, GroupingRowNode<TData>> & { dupPaths?: Map<string, GroupingRowNode<TData>[]> };

const addDuplicateNodeByPath = <TData>(
    map: NodesByPathMap<TData>,
    pathKey: string,
    existing: GroupingRowNode<TData>,
    node: GroupingRowNode<TData>
): void => {
    if (existing === node) {
        return;
    }
    if (node.sourceRowIndex < existing.sourceRowIndex) {
        map.set(pathKey, node); // We choose the node with the lowest sourceRowIndex
        existing.childrenMapped = null;
    }
    const duplicates = map.dupPaths?.get(pathKey);
    if (!duplicates) {
        (map.dupPaths ??= new Map()).set(pathKey, [existing, node]);
    } else if (duplicates.length < MAX_DUPLICATES_PER_PATH_TO_WARN) {
        duplicates.push(node);
    }
};
