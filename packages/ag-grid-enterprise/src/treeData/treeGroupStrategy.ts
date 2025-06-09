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

// The approach used here avoids complex incremental updates by using linear passes and a final traversal.
// We reduce memory allocations and footprint and we ensure consistent performance without keeping additional per node map.
//
// All leaf nodes are scanned in input order, and the tree is built by setting the treeParent field.
// Then we execute a single traversal to set the level, expanded state, and allLeafChildren.
// This guarantees correct parent-child relationships without requiring sorting or post-processing.
//
// No new arrays are allocated for childrenAfterGroup or allLeafChildren — existing arrays are reused.
// The treeNodeFlags field encodes temporary state, child counters, and expanded status.
// The treeParent field tracks hierarchy changes and supports re-parenting (e.g., drag-and-drop).
// Setting a node treeParent to a desired node and then executing grouping without full reload will generate a valid tree.
//
// This model handles both full reloads and partial updates (such as subtree moves) uniformly,
// avoiding the need for complex data structures, delta tracking, or transaction staging,
// while providing reliable performance across large datasets.

const FLAG_CHILDREN_CHANGED = 0x80000000;
const FLAG_CHANGED = 0x40000000;

/** Toggling this flag is used to mark a filler node as used or already processed */
const FLAG_MARKED_FILLER = 0x20000000;

/** This is the only flag that stays in the node, to indicate that the expanded state was initialized */
const FLAG_EXPANDED_INITIALIZED = 0x10000000;

/** Mask used to keep track of the number of children in a node */
const MASK_CHILDREN_LEN = 0x0fffffff; // This equates to 268,435,455 maximum children per parent, more than enough

/** Path key separator used to flatten hierarchical paths. Includes uncommon and randomized characters to avoid collisions and abuse. */
const PATH_KEY_SEPARATOR = String.fromCharCode(31, 4096 + Math.random() * 61440, 4096 + Math.random() * 61440, 8291);

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
        this.destroyFillerRows();
        this.deselectHiddenNodes(false);
        this.groupColsIds = '';
        this.groupColsChanged = true;
        this.parentIdGetter = null;
    }

    public getNode(id: string): RowNode<TData> | undefined {
        return this.fillerNodesById?.get(id);
    }

    public execute(params: StageExecuteParams<TData>, approach: GroupingApproach): boolean {
        const { changedRowNodes, changedPath, afterColumnsChanged } = params;
        this.checkGroupColsUpdated(afterColumnsChanged);

        const rootNode = params.rowNode as GroupingRowNode<TData>;

        const activeChangedPath = changedPath?.active ? changedPath : undefined;
        const fullReload = !changedRowNodes && !activeChangedPath;

        const hasUpdates = !!changedRowNodes && this.flagUpdatedNodes(changedRowNodes);
        if (fullReload || hasUpdates) {
            if (approach === 'treeNested') {
                this.loadNested(params, fullReload);
            } else if (approach === 'treeSelfRef') {
                this.loadSelfRef(params, fullReload);
            } else {
                this.loadDataPath(params, fullReload);
            }
        }

        const parentsChanged = this.initRowsParents(rootNode);

        this.destroyFillerRows();

        this.initRowsChildrenSize(rootNode);

        let preprocessedCount = this.preprocessRows(rootNode);
        const treeChanged = parentsChanged || (preprocessedCount & FLAG_CHILDREN_CHANGED) !== 0;
        preprocessedCount &= ~FLAG_CHILDREN_CHANGED;

        const traverseCount = this.traverseRoot(rootNode, activeChangedPath);
        if (preprocessedCount > 0 && preprocessedCount !== traverseCount) {
            this.handleCycles(rootNode); // We have unprocessed nodes, this means we have at least one cycle to fix
            this.traverseRoot(rootNode, activeChangedPath); // Re-traverse the root
        }

        rootNode.treeNodeFlags = 0;

        this.deselectHiddenNodes(parentsChanged || fullReload);

        return treeChanged;
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

    private initRowsParents(rootNode: GroupingRowNode<TData>): boolean {
        const rootAllLeafChildren = rootNode.allLeafChildren!;
        const allLeafChildrenLen = rootAllLeafChildren.length;
        let treeChanged = false;
        for (let i = 0; i < allLeafChildrenLen; ++i) {
            let current = rootAllLeafChildren[i];
            while (true) {
                const oldParent = current.parent;
                const parent = current.treeParent;
                if (parent === null) {
                    if (oldParent) {
                        treeChanged = true;
                        this.hideRow(current); // Hide the row if it has no parent
                    }
                    break; // No more parents to process, we are at the root
                }

                let parentFlags = parent.treeNodeFlags + 1; // Increment the number of children in the parent
                if (oldParent !== parent) {
                    treeChanged = true;
                    parentFlags |= FLAG_CHANGED;
                    current.parent = parent;
                    if (oldParent) {
                        const oldParentFlags = oldParent.treeNodeFlags;
                        if (
                            (oldParentFlags & FLAG_EXPANDED_INITIALIZED) !== 0 &&
                            (parentFlags & FLAG_EXPANDED_INITIALIZED) === 0 &&
                            parent.treeParent !== null &&
                            !parent.data
                        ) {
                            parent.expanded = oldParent.expanded; // If parent is a new filler node, copy the expanded flag from old parent
                            parentFlags |= FLAG_EXPANDED_INITIALIZED;
                        }
                        oldParent.treeNodeFlags = oldParentFlags | FLAG_CHANGED;
                    }
                }

                if (parent.data || (parent.treeNodeFlags & FLAG_MARKED_FILLER) !== 0 || parent.treeParent === null) {
                    parent.treeNodeFlags = parentFlags;
                    break; // Continue up only if parent is a non-processed filler
                }
                parent.treeNodeFlags = parentFlags | FLAG_MARKED_FILLER | (current.treeNodeFlags & FLAG_CHANGED); // Mark filler as processed
                current = parent;
            }
        }
        return treeChanged;
    }

    private destroyFillerRows(): void {
        const fillerNodesById = this.fillerNodesById;
        if (fillerNodesById) {
            for (const node of fillerNodesById.values()) {
                if (node.treeParent === null || (node.treeNodeFlags & MASK_CHILDREN_LEN) === 0) {
                    fillerNodesById.delete(node.id!); // This filler node is unused
                    this.hideRow(node);
                }
            }
            if (fillerNodesById.size === 0) {
                this.fillerNodesById = null;
            }
        }
    }

    private initRowsChildrenSize(rootNode: GroupingRowNode<TData>) {
        this.initRowChildrenSize(rootNode);
        const rootAllLeafChildren = rootNode.allLeafChildren!;
        const allLeafChildrenLen = rootAllLeafChildren.length;
        for (let i = 0; i < allLeafChildrenLen; ++i) {
            this.initRowChildrenSize(rootAllLeafChildren[i]);
        }

        const fillerNodesById = this.fillerNodesById;
        if (fillerNodesById !== null) {
            for (const filler of fillerNodesById.values()) {
                this.initRowChildrenSize(filler);
            }
        }
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

    private preprocessRows(rootNode: GroupingRowNode<TData>): number {
        const rootAllLeafChildren = rootNode.allLeafChildren!;
        const allLeafChildrenLen = rootAllLeafChildren.length;
        const groupColsChanged = this.groupColsChanged;
        let preprocessedCount = 0;
        let treeChanged = false;
        for (let i = 0; i < allLeafChildrenLen; ++i) {
            let current = rootAllLeafChildren[i];
            while (true) {
                const parent: GroupingRowNode<TData> | null = current.treeParent;
                if (parent === null) {
                    break;
                }
                ++preprocessedCount;

                let parentFlags = parent.treeNodeFlags;
                const parentChildren = parent.childrenAfterGroup!;
                const indexInParent = parentFlags & MASK_CHILDREN_LEN;
                parentFlags = (parentFlags & ~MASK_CHILDREN_LEN) | (indexInParent + 1);
                if (parentFlags & FLAG_CHILDREN_CHANGED || parentChildren[indexInParent] !== current) {
                    parentFlags |= FLAG_CHILDREN_CHANGED;
                    parentChildren[indexInParent] = current; // insert into parent.childrenAfterGroup[]
                    treeChanged = true;
                }
                parent.treeNodeFlags = parentFlags;

                if (!current.groupData || groupColsChanged) {
                    current.treeNodeFlags |= FLAG_CHANGED;
                    this.setGroupData(current, current.key!);
                }

                if (parent.data || (parent.treeNodeFlags & FLAG_MARKED_FILLER) === 0 || parent.treeParent === null) {
                    break; // Continue up only if parent is a non-processed filler
                }
                parent.treeNodeFlags = (parentFlags & ~FLAG_MARKED_FILLER) | (current.treeNodeFlags & FLAG_CHANGED); // Mark filler as processed
                current = parent;
            }
        }
        return preprocessedCount | (treeChanged ? FLAG_CHILDREN_CHANGED : 0);
    }

    private traverseRoot(rootNode: GroupingRowNode<TData>, activeChangedPath: ChangedPath | undefined): number {
        let traverseCount = 0;
        const rootChildrenAfterGroup = rootNode.childrenAfterGroup!;
        for (let i = 0, len = rootChildrenAfterGroup.length; i < len; ++i) {
            traverseCount += this.traverse(rootChildrenAfterGroup[i], 0, false, activeChangedPath);
        }
        return traverseCount & ~FLAG_CHILDREN_CHANGED;
    }

    /**
     * After all the rows are initialized and treeParent is set and childrenAfterGroup is filled,
     * we traverse the tree to finalize it
     * @returns the number of leaf nodes processed, which is used to detect cycles in the tree, and a flag set if leaf children were changed.
     */
    private traverse(
        row: GroupingRowNode<TData>,
        level: number,
        collapsed: boolean,
        activeChangedPath: ChangedPath | undefined
    ): number {
        const children = row.childrenAfterGroup!;
        const len = children.length;
        let flags = row.treeNodeFlags;

        row.treeNodeFlags = flags & FLAG_EXPANDED_INITIALIZED;
        row.level = level++;

        // Update group state and children markers
        if (row.group !== !!len) {
            setRowNodeGroup(row, this.beans, !!len);
            if (!len && !row.expanded) {
                row.treeNodeFlags &= ~FLAG_EXPANDED_INITIALIZED;
            }
            flags |= FLAG_CHANGED;
        } else if (row.hasChildren() !== !!len) {
            row.updateHasChildren();
            flags |= FLAG_CHANGED;
        }

        if ((flags & (FLAG_CHANGED | FLAG_CHILDREN_CHANGED)) !== 0) {
            activeChangedPath?.addParentNode(row);
        }

        if (len && (flags & FLAG_EXPANDED_INITIALIZED) === 0) {
            row.treeNodeFlags |= FLAG_EXPANDED_INITIALIZED;
            row.expanded = this.getRowDefaultExpanded(row, level); // Initialize the expanded state
        }

        if (collapsed && row.rowIndex !== null) {
            row.clearRowTopAndRowIndex(); // Mark row hidden if collapsed
        }
        collapsed ||= row.expanded === false;

        flags &= FLAG_CHILDREN_CHANGED;
        let leafsLen = 0;
        for (let i = 0; i < len; ++i) {
            const child = children[i];
            const childFlags = this.traverse(child, level, collapsed, activeChangedPath);
            // Accumulates traversed nodes count and propagates children changed flag
            flags = (flags + (childFlags & ~FLAG_CHILDREN_CHANGED)) | (childFlags & FLAG_CHILDREN_CHANGED);
            leafsLen += (child.allLeafChildren?.length || 0) + (child.data ? 1 : 0);
        }

        if (this.updateAllLeafChildren(row, leafsLen, (flags & FLAG_CHILDREN_CHANGED) !== 0)) {
            return (flags | FLAG_CHILDREN_CHANGED) + 1;
        }
        return (flags & ~FLAG_CHILDREN_CHANGED) + 1;
    }

    private updateAllLeafChildren(row: GroupingRowNode<TData>, len: number, maybeChanged: boolean): boolean {
        let leafs = row.allLeafChildren;
        let trulyChanged = (leafs?.length || 0) !== len;
        if (len === 0) {
            if (leafs !== null) {
                row.allLeafChildren = null;
                const sibling = row.sibling;
                if (sibling) sibling.allLeafChildren = null;
            }
        } else if (trulyChanged || maybeChanged) {
            if (!leafs) {
                row.allLeafChildren = leafs = new Array(len);
                const sibling = row.sibling;
                if (sibling) sibling.allLeafChildren = leafs;
            } else if (trulyChanged) {
                leafs.length = len; // resize
            }
            const rows = row.childrenAfterGroup!;
            for (let i = 0, writeIdx = 0, childrenLen = rows.length; i < childrenLen; ++i) {
                const child = rows![i];
                if (child.data) {
                    if ((trulyChanged ||= leafs[writeIdx] !== child)) leafs[writeIdx] = child;
                    ++writeIdx;
                }
                const childLeafs = child.allLeafChildren;
                if (childLeafs) {
                    for (let j = 0, len = childLeafs.length; j < len; ++j, ++writeIdx) {
                        const leaf = childLeafs![j];
                        if ((trulyChanged ||= leafs[writeIdx] !== leaf)) leafs[writeIdx] = leaf;
                    }
                }
            }
        }
        return trulyChanged;
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

    /** Handle cycles in a tree. Is not optimal for performance but this is an edge case that shouldn't happen as is a warning. */
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
                parent.treeNodeFlags |= FLAG_CHILDREN_CHANGED | FLAG_CHANGED;
                row.parent = rootNode; // Move the row to the root node
                _removeFromArray(parent.childrenAfterGroup!, row); // Remove the row from the root children
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

    /** Load the tree structure for nested groups, aka children property */
    private loadNested({ rowNode: rootNode, changedRowNodes }: StageExecuteParams<TData>, fullReload: boolean): void {
        if (!fullReload && changedRowNodes) {
            for (const row of changedRowNodes.adds) {
                row.key = row.id!; // Just set the key = id in the new nodes
            }
            return;
        }

        const rootAllLeafChildren = rootNode.allLeafChildren!;
        for (let i = 0, len = rootAllLeafChildren.length; i < len; ++i) {
            const row = rootAllLeafChildren[i];
            const id = row.id!;
            if (row.key !== id) {
                row.key = id;
                row.groupData = null;
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

    private loadFlattened(rootNode: GroupingRowNode<TData>): void {
        const allLeafChildren: GroupingRowNode<TData>[] = rootNode.allLeafChildren!;
        for (let i = 0, len = allLeafChildren.length; i < len; ++i) {
            const row = allLeafChildren[i];
            row.treeParent = rootNode; // Display all rows as children of the root node
            const id = row.id!;
            if (row.key !== id) {
                row.key = id;
                row.groupData = null;
            }
        }
    }

    /** Load the tree structure for data paths, aka getDataPath callback */
    private loadDataPath({ rowNode: rootNode }: StageExecuteParams<TData>, fullReload: boolean): void {
        const getDataPath = this.gos.get('getDataPath');
        if (!getDataPath) {
            this.loadFlattened(rootNode);
            return;
        }

        const nodesByPath = new Map<string, GroupingRowNode<TData>>();
        const paths = new Map<GroupingRowNode, string>();

        let dupPaths: DuplicatePathsMap<TData> | undefined;
        if (!fullReload) {
            dupPaths = this.loadExistingDataPath(rootNode, nodesByPath, paths);
        }

        const allLeafChildren: GroupingRowNode<TData>[] = rootNode.allLeafChildren!;
        for (let i = 0, len = allLeafChildren.length; i < len; ++i) {
            const node = allLeafChildren[i];
            if (!fullReload && node.treeParent !== null && (node.treeNodeFlags & FLAG_CHANGED) === 0) {
                continue;
            }
            const path = getDataPath(node.data!);
            const pathLen = path?.length;
            if (!pathLen) {
                _warn(185, { data: node.data });
                continue;
            }
            const key = path[pathLen - 1];
            if (node.key !== key) {
                node.key = key;
                node.groupData = null;
            }
            const pathKey = path.join(PATH_KEY_SEPARATOR);
            paths.set(node, pathKey); // Cache the path key for faster access
            const existing = nodesByPath.get(pathKey);
            if (existing === undefined) {
                nodesByPath.set(pathKey, node);
            } else if (existing !== node) {
                dupPaths = this.duplicatedPath(nodesByPath, dupPaths, existing, node, pathKey);
            }
        }

        if (dupPaths) {
            this.processDuplicatePaths(dupPaths, paths);
        }
        this.buildFromPaths(rootNode, nodesByPath, paths);
    }

    private loadExistingDataPath(
        rootNode: GroupingRowNode<TData>,
        nodesByPath: Map<string, GroupingRowNode<TData>>,
        paths: Map<GroupingRowNode, string>
    ): DuplicatePathsMap<TData> | undefined {
        let dupPaths: Map<string, GroupingRowNode<TData>[]> | undefined;
        const allLeafChildren: GroupingRowNode<TData>[] = rootNode.allLeafChildren!;
        for (let i = 0, len = allLeafChildren.length; i < len; ++i) {
            const node = allLeafChildren[i];
            const treeParent = node.treeParent;
            if (treeParent === null || (node.treeNodeFlags & FLAG_CHANGED) !== 0) {
                continue;
            }
            let pathKey = node.key!;
            let current = treeParent;
            while (current && current !== rootNode && current !== node) {
                pathKey = PATH_KEY_SEPARATOR + pathKey;
                const existingPathKey = paths.get(current);
                if (existingPathKey !== undefined) {
                    pathKey = existingPathKey + pathKey;
                    break; // We found the path key in the parent as it was already processed
                }
                pathKey = current.key! + pathKey;
                current = current.treeParent!;
            }
            if (current !== node) {
                paths.set(node, pathKey);
                const existing = nodesByPath.get(pathKey);
                if (existing === undefined) {
                    nodesByPath.set(pathKey, node);
                } else if (existing !== node) {
                    dupPaths = this.duplicatedPath(nodesByPath, dupPaths, existing, node, pathKey);
                }
            }
        }
        return dupPaths;
    }

    private duplicatedPath<TData>(
        nodesByPath: Map<string, GroupingRowNode<TData>>,
        dupPaths: DuplicatePathsMap<TData> | undefined,
        existing: GroupingRowNode<TData>,
        node: GroupingRowNode<TData>,
        pathKey: string
    ): DuplicatePathsMap<TData> | undefined {
        if (node.sourceRowIndex < existing.sourceRowIndex) {
            nodesByPath.set(pathKey, node); // choose the node with the lowest sourceRowIndex
        }
        const duplicates = (dupPaths ??= new Map()).get(pathKey);
        if (duplicates === undefined) {
            dupPaths.set(pathKey, [existing, node]);
        } else {
            duplicates.push(node);
        }
        return dupPaths;
    }

    private buildFromPaths(
        rootNode: GroupingRowNode<TData>,
        nodesByPath: Map<string, GroupingRowNode<TData>>,
        paths: Map<GroupingRowNode, string>
    ): void {
        const SEP = PATH_KEY_SEPARATOR;
        const SEP_LEN = PATH_KEY_SEPARATOR.length;
        const segments = new Array<number>(32); // temporary array to hold the segment positions

        // Rebuild from scratch the tree structure from the path keys.
        // This approach is generally less expensive, than keeping and maintaining a map of children for each node.
        // Also, the presence of map of children per node would make some drag and drop operation impossible or very hard to maintain,
        // think about same key or empty filler nodes. We want to still allow an unconstrained drag and drop of nodes in the tree,
        // String slice is highly optimized in modern JS engines, as it will be just a view of the original string and has low GC pressure.
        const allLeafChildren = rootNode.allLeafChildren!;
        for (let i = 0, len = allLeafChildren.length; i < len; ++i) {
            const node = allLeafChildren[i];
            const pathKey = paths.get(node);
            if (pathKey === undefined) {
                continue; // Already processed or duplicated path
            }

            // Collect separators positions, fast string split without allocations
            let segmentsLen = 0;
            let scanPos = 0;
            while (scanPos < pathKey.length) {
                const sepPos = pathKey.indexOf(SEP, scanPos);
                if (sepPos === -1) break; // No more separators found
                segments[segmentsLen++] = sepPos;
                scanPos = sepPos + SEP_LEN;
            }

            // Find deepest existing node walking backward.
            let startLevel = 0;
            let treeParent = rootNode;
            for (let level = segmentsLen - 1; level >= 0; --level) {
                const existing = nodesByPath.get(pathKey.slice(0, segments[level]));
                if (existing) {
                    treeParent = existing;
                    startLevel = level + 1;
                    break; // Found an existing node, we can start from here
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
                } else {
                    current.treeParent = treeParent;
                }
                treeParent = current;
            }

            node.treeParent = treeParent;
        }
    }

    private processDuplicatePaths(
        duplicatePaths: Map<string, GroupingRowNode<TData>[]>,
        paths: Map<GroupingRowNode, string>
    ): void {
        for (const duplicates of duplicatePaths.values()) {
            duplicates.sort(compareSourceRowIndex);
            const len = duplicates.length;
            const duplicateRowsData = new Array(len - 1);
            for (let i = 1; i < len; ++i) {
                const node = duplicates[i];
                paths.delete(node);
                node.treeParent = null;
                duplicateRowsData[i - 1] = node.data;
            }
            const first = duplicates[0];
            _warn(186, { rowId: first.id, rowData: first.data, duplicateRowsData });
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
            node.treeParent = treeParent;
            fillerNodesById.set(id, node);
        }
        return node;
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
        row.treeParent = null;
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

const compareSourceRowIndex = <TData>(a: RowNode<TData>, b: RowNode<TData>): number =>
    a.sourceRowIndex - b.sourceRowIndex;

type DuplicatePathsMap<TData> = Map<string, GroupingRowNode<TData>[]>;
