import type { GroupingApproach, IChangedRowNodes, IRowGroupingStrategy, StageExecuteParams } from 'ag-grid-community';
import { RowNode } from 'ag-grid-community';
import { BeanStub, _EmptyArray, _ROW_ID_PREFIX_ROW_GROUP, _warn } from 'ag-grid-community';

import { setRowNodeGroup } from '../rowGrouping/rowGroupingUtils';
import type { GroupingRowNode } from '../rowHierarchy/rowHierarchyUtils';
import type { DataFieldGetter } from './fieldAccess';
import { makeFieldPathGetter } from './fieldAccess';

/** Maximum number of duplicates to warn about per node, to avoid flooding the console */
const MAX_DUPLICATES_TO_WARN = 15;

const FLAG_CHANGED = 0x80000000;
const FLAG_CHILDREN_CHANGED = 0x40000000;
const FLAG_EXPANDED_INITIALIZED = 0x20000000;
const FLAG_FILLER_NODE = 0x10000000;
const MASK_CHILDREN_LENGTH = 0x0fffffff; // This equates to 268,435,455 maximum children per parent, more than enough

/**
 * Path key separator used internally to maintain a flat path dictionary to map a path to a node.
 * It contains special characters and two random characters hard to predict to reduce the risk of intentional abuse.
 */
const PATH_KEY_SEPARATOR = String.fromCharCode(31, 4096 + Math.random() * 61440, 4096 + Math.random() * 61440, 8291);
const PATH_KEY_SEPARATOR_LEN = PATH_KEY_SEPARATOR.length;

export class TreeGroupStrategy<TData = any> extends BeanStub implements IRowGroupingStrategy<TData> {
    private groupColsIds: string = '';
    private groupColsChanged: boolean = true;
    private parentIdGetter: DataFieldGetter<TData, string> | null = null;
    private fillerNodesById: Map<string, GroupingRowNode<TData>> | null = null;

    public override destroy(): void {
        super.destroy();
        this.groupColsIds = '';
        this.parentIdGetter = null;
        this.fillerNodesById = null!;
    }

    public reset(): void {
        this.groupColsIds = '';
        this.groupColsChanged = true;
        this.parentIdGetter = null;
        this.destroyFillerRows(true, false);
    }

    public execute(params: StageExecuteParams<TData>, approach: GroupingApproach) {
        // Instead of trying to optimize for immutable row update and transactions when a small portion of the tree changes
        // the decision here was to implement with linear loops, first process all nodes and then a tree traversal, reducing allocations to minimum.
        // This removes also the need of sorting or post sorting the nodes, as the tree traversal will always process the nodes in the right order.
        // We do not allocate new arrays for childrenAfterGroup and allLeafChildren, we just update the existing arrays.
        // This ensures a simpler code and less complexity, and also that enough speed for the vast majority of cases.
        // Consider that trying other approaches might be more complex and potentially not as fast, as the user can always move an entire subtree by changing a single parent.
        // To further reduce allocations, we use treeNodeFlags to store both temporary flags,
        // the expanded initialized state and the future children count between the first loop and the tree traversal.
        // This avoid the needs to create complex data structures to store temporary data or add more fields to the row nodes.
        // The property treeParent is used to store the parent node and detect updates in the tree structure during execution,
        // thus setting a treeParent and then executing a row grouping operation will work as expected, and this is used for managed drag and drop.
        // treeParent is also set by the tree data with children node manager to store the parent node during load or updates of the row data.

        const { changedRowNodes, changedPath, afterColumnsChanged } = params;
        const rootNode = params.rowNode as GroupingRowNode<TData>;
        const gos = this.gos;

        this.checkGroupColsUpdated(afterColumnsChanged);

        let fullReload = !changedRowNodes && !changedPath?.active;
        let rootChildrenAfterGroup = rootNode.childrenAfterGroup;
        const rootAllLeafChildren = rootNode.allLeafChildren!;
        if (!rootChildrenAfterGroup || rootChildrenAfterGroup === rootAllLeafChildren) {
            fullReload = true;
            rootNode.childrenAfterGroup = rootChildrenAfterGroup = [];
        }

        const hasUpdates = !!changedRowNodes && flagUpdatedNodes(changedRowNodes);
        const treePathApproach = approach === 'treePath';
        if (fullReload || hasUpdates) {
            if (treePathApproach) {
                this.loadDataPath(params, fullReload);
            } else if (approach === 'treeSelfRef') {
                this.loadSelfRef(params, fullReload);
            }
        }

        const fillerNodesById = this.fillerNodesById;
        const allLeafChildrenLen = rootAllLeafChildren.length;

        for (let i = 0; i < allLeafChildrenLen; ++i) {
            updateRowParent(rootAllLeafChildren[i]);
        }
        if (fillerNodesById !== null) {
            for (const filler of fillerNodesById.values()) {
                updateRowParent(filler);
            }
        }

        updateRowChildrenSize(rootNode);
        for (let i = 0; i < allLeafChildrenLen; ++i) {
            updateRowChildrenSize(rootAllLeafChildren[i]);
        }
        if (fillerNodesById !== null) {
            for (const filler of fillerNodesById.values()) {
                updateRowChildrenSize(filler);
            }
        }

        let preprocessedCount = 0;
        for (let i = 0; i < allLeafChildrenLen; ++i) {
            preprocessedCount += insertRowChildren(rootAllLeafChildren[i]);
        }

        const expandByDefault = gos.get('groupDefaultExpanded');
        const isGroupOpenByDefault = gos.getCallback('isGroupOpenByDefault');
        const activeChangedPath = changedPath?.active ? changedPath : undefined;

        let traverseCount = 0;
        const traverse = (row: GroupingRowNode<TData>, level: number): boolean => {
            ++traverseCount;

            let treeNodeFlags = row.treeNodeFlags;
            const childrenAfterGroup = row.childrenAfterGroup!;
            const childrenAfterGroupLen = childrenAfterGroup.length;

            const childrenChanged = (treeNodeFlags & FLAG_CHILDREN_CHANGED) !== 0;
            let changed = (treeNodeFlags & (FLAG_CHANGED | FLAG_CHILDREN_CHANGED)) !== 0;
            let allLeafChildrenChanged = childrenChanged;

            row.level = level++;
            row.treeNodeFlags = treeNodeFlags & FLAG_EXPANDED_INITIALIZED; // Keep only the expanded initialized flag

            let allLeafChildrenLen = 0;
            for (let j = 0; j < childrenAfterGroupLen; ++j) {
                const child = childrenAfterGroup[j];
                if (traverse(child, level)) {
                    allLeafChildrenChanged = true;
                }
                allLeafChildrenLen += child.allLeafChildren?.length ?? 0;
                if (child.data) {
                    ++allLeafChildrenLen; // If not a filler node, count it
                }
            }

            let allLeafChildren = row.allLeafChildren;
            if (allLeafChildren === childrenAfterGroup || allLeafChildren === undefined) {
                row.allLeafChildren = allLeafChildren = null;
            }
            if (allLeafChildrenChanged || (allLeafChildren?.length ?? 0) !== allLeafChildrenLen) {
                allLeafChildrenChanged = updateAllLeafChildren(row, allLeafChildren, allLeafChildrenLen);
            }

            if (!treePathApproach) {
                const id = row.id!;
                if (row.key !== id) {
                    row.key = id;
                    row.groupData = null;
                    changed = true;
                }
            }

            const oldGroup = row.group;
            const hasChildren = childrenAfterGroupLen > 0;
            if (oldGroup !== hasChildren) {
                changed = true;
                setRowNodeGroup(row, this.beans, hasChildren); // Internally calls updateHasChildren
                if (!hasChildren && !row.expanded) {
                    row.treeNodeFlags = treeNodeFlags &= ~FLAG_EXPANDED_INITIALIZED;
                }
            } else if (row.hasChildren() !== hasChildren) {
                changed = true;
                row.updateHasChildren();
            }

            if (!row.groupData || this.groupColsChanged) {
                changed = true;
                this.setGroupData(row, row.key!);
            }

            if (changed) {
                activeChangedPath?.addParentNode(row);
            }

            if (hasChildren && (treeNodeFlags & FLAG_EXPANDED_INITIALIZED) === 0) {
                row.treeNodeFlags |= FLAG_EXPANDED_INITIALIZED;
                row.expanded = isGroupOpenByDefault
                    ? isGroupOpenByDefault({
                          rowNode: row,
                          field: row.field!,
                          key: row.key!,
                          level: row.level,
                          rowGroupColumn: row.rowGroupColumn!,
                      }) == true
                    : expandByDefault === -1 || row.level < expandByDefault;
            }

            return allLeafChildrenChanged;
        };

        // Traverse the tree and update the children arrays length and the allLeafChildren array and propagate updates
        for (let i = 0, len = rootChildrenAfterGroup.length; i < len; ++i) {
            traverse(rootChildrenAfterGroup[i], 0);
        }
        rootNode.treeNodeFlags = 0;

        if (preprocessedCount > 0 && preprocessedCount !== traverseCount) {
            // We have unprocessed nodes, this means we have at least one cycle to fix
            handleCycles(rootNode, traverse);
        }
    }

    private setGroupData(row: RowNode, key: string): void {
        const groupData: Record<string, string> = {};
        row.groupData = groupData;
        const groupDisplayCols = this.beans.showRowGroupCols?.getShowRowGroupCols();
        if (groupDisplayCols) {
            for (const col of groupDisplayCols) {
                groupData[col.getColId()] = key;
            }
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

    private loadSelfRef({ rowNode, changedRowNodes }: StageExecuteParams<TData>, fullReload: boolean): void {
        const rootNode = rowNode as GroupingRowNode<TData>;
        const rootAllLeafChildren = rootNode.allLeafChildren!;
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
            } else {
                row.treeParent ??= rootNode;
            }
        }
    }

    private loadDataPath({ rowNode, changedRowNodes }: StageExecuteParams<TData>, fullReload: boolean): void {
        const rootNode = rowNode as GroupingRowNode<TData>;
        const allLeafChildren = rootNode.allLeafChildren!;
        const allLeafChildrenLen = allLeafChildren.length;
        const nodesByPath = new Map<string, GroupingRowNode<TData>>();

        if (!fullReload) {
            for (let i = 0; i < allLeafChildrenLen; ++i) {
                const node = allLeafChildren[i];
                let treeParent = node.treeParent;
                if (treeParent !== null && (node.treeNodeFlags & FLAG_CHANGED) === 0) {
                    let pathKey = node.key!;
                    while (treeParent && treeParent !== rootNode) {
                        pathKey = PATH_KEY_SEPARATOR + pathKey;
                        pathKey = treeParent.key! + pathKey;
                        treeParent = treeParent.treeParent;
                    }
                    addNodeByPath(nodesByPath, pathKey, node);
                }
            }
        }

        const getDataPath = this.gos.get('getDataPath');
        for (let i = 0; i < allLeafChildrenLen; ++i) {
            const node = allLeafChildren[i];
            if (fullReload || node.treeParent === null || node.treeNodeFlags & FLAG_CHANGED) {
                const path = getDataPath ? getDataPath(node.data!) : [node.id!];
                if (!path?.length) {
                    _warn(185, { data: node.data });
                    continue;
                }
                const key = path[path.length - 1];
                if (node.key !== key) {
                    node.key = key;
                    node.treeNodeFlags |= FLAG_CHANGED;
                    node.groupData = null;
                }
                addNodeByPath(nodesByPath, path.join(PATH_KEY_SEPARATOR), node);
            }
            node.treeParent = null; // Reset the treeParent to be set later
        }

        warnDuplicatePaths(nodesByPath);
        this.treeFromPaths(rootNode, nodesByPath);
        this.destroyFillerRows(false, !!changedRowNodes);
    }

    private treeFromPaths(rootNode: GroupingRowNode<TData>, nodesByPath: Map<string, GroupingRowNode<TData>>): void {
        const beans = this.beans;
        let fillerNodesById = this.fillerNodesById;
        for (const pathKey of nodesByPath.keys()) {
            const node = nodesByPath.get(pathKey)!;
            if (node.treeParent !== null) {
                continue; // Already processed
            }

            // First let's see if the parent is already in the map, if so we can use it directly
            const lastSep = pathKey.lastIndexOf(PATH_KEY_SEPARATOR);
            const parentNode = lastSep === -1 ? rootNode : nodesByPath.get(pathKey.slice(0, lastSep));
            if (parentNode !== undefined) {
                node.treeParent = parentNode;
                continue; // Parent already exists, faster code path
            }

            let level = 0;
            let pathKeyStart = 0;
            let treeParent: GroupingRowNode<TData> | null = rootNode;
            const pathKeyLen = pathKey.length;
            while (pathKeyStart < pathKeyLen) {
                const pathKeyPos = pathKey.indexOf(PATH_KEY_SEPARATOR, pathKeyStart);
                if (pathKeyPos === -1) {
                    break; // No more separators, we reached the leaf node
                }
                const subPathKey = pathKey.slice(0, pathKeyPos);
                let current = nodesByPath.get(subPathKey);
                if (!current) {
                    const leafKey = pathKey.slice(pathKeyStart, pathKeyPos);
                    const fillerId = makeFillerRowId(treeParent, leafKey, level);
                    current = (fillerNodesById ??= this.fillerNodesById = new Map()).get(fillerId);
                    if (!current) {
                        current = new RowNode<TData>(beans); // Create a new filler node
                        current.id = fillerId;
                        current.key = leafKey;
                        current.group = true;
                        current.leafGroup = false;
                        current.rowGroupIndex = null;
                        current.treeParent = treeParent;
                        fillerNodesById.set(fillerId, current);
                    }
                    current.treeNodeFlags |= FLAG_FILLER_NODE;
                    nodesByPath.set(subPathKey, current);
                }
                current.treeParent = treeParent;
                treeParent = current;
                pathKeyStart = pathKeyPos + PATH_KEY_SEPARATOR_LEN;
                ++level;
            }
            node.treeParent = treeParent;
        }
    }

    private destroyFillerRows(destroyAll: boolean, updated: boolean): void {
        let nodesToUnselect: GroupingRowNode<TData>[] | undefined;
        const fillerNodesById = this.fillerNodesById;
        if (fillerNodesById) {
            for (const node of fillerNodesById.values()) {
                if (destroyAll || (node.treeNodeFlags & FLAG_FILLER_NODE) === 0) {
                    // This filler node is unused
                    fillerNodesById.delete(node.id!);
                    if (node.isSelected()) {
                        (nodesToUnselect ??= []).push(node);
                    }
                    node.clearRowTopAndRowIndex();
                } else {
                    node.treeNodeFlags &= ~FLAG_FILLER_NODE; // Reset the flag
                }
            }
            if (fillerNodesById.size === 0) {
                this.fillerNodesById = null;
            }
        }
        if (destroyAll || updated || nodesToUnselect) {
            this.deselectNodes(nodesToUnselect);
        }
    }

    private deselectNodes(nodes: RowNode<TData>[] | undefined): void {
        const source = 'rowDataChanged';
        const selectionSvc = this.beans.selectionSvc;
        const selectionChanged = nodes?.length;
        if (selectionChanged) {
            selectionSvc?.setNodesSelected({ newValue: false, nodes, suppressFinishActions: true, source });
        }

        // we do this regardless of nodes to unselect or not, as it's possible
        // a new node was inserted, so a parent that was previously selected (as all
        // children were selected) should not be tri-state (as new one unselected against
        // all other selected children).
        selectionSvc?.updateGroupsFromChildrenSelections?.(source);

        if (selectionChanged) {
            this.eventSvc.dispatchEvent({
                type: 'selectionChanged',
                source: source,
                selectedNodes: selectionSvc?.getSelectedNodes() ?? null,
                serverSideState: null,
            });
        }
    }
}

const flagUpdatedNodes = <TData>(changedRowNodes: IChangedRowNodes<TData>): boolean => {
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
};

const updateRowParent = <TData>(row: GroupingRowNode<TData>): void => {
    const { parent: oldParent, treeParent } = row;
    if (treeParent === null) {
        return;
    }
    let parentFlags = treeParent.treeNodeFlags + 1; // Increment the number of children in the parent
    if (oldParent !== treeParent) {
        row.parent = treeParent;
        parentFlags |= FLAG_CHANGED;
        if (oldParent) {
            const oldParentFlags = oldParent.treeNodeFlags;
            if (
                (oldParentFlags & FLAG_EXPANDED_INITIALIZED) !== 0 &&
                (parentFlags & FLAG_EXPANDED_INITIALIZED) === 0 &&
                treeParent.treeParent !== null &&
                !treeParent.data
            ) {
                treeParent.expanded = oldParent.expanded; // If parent is a new filler node, copy the expanded flag from old parent
                parentFlags |= FLAG_EXPANDED_INITIALIZED;
            }
            oldParent.treeNodeFlags = oldParentFlags | FLAG_CHANGED;
        }
    }
    treeParent.treeNodeFlags = parentFlags;
};

const updateRowChildrenSize = <TData>(row: GroupingRowNode<TData>) => {
    let { treeNodeFlags, childrenAfterGroup } = row;
    const newSize = treeNodeFlags & MASK_CHILDREN_LENGTH;
    const oldSize = childrenAfterGroup?.length ?? 0;
    row.treeNodeFlags = (treeNodeFlags & ~MASK_CHILDREN_LENGTH) | (oldSize !== newSize ? FLAG_CHILDREN_CHANGED : 0);
    if (newSize === 0 && row.level >= 0) {
        if (childrenAfterGroup !== _EmptyArray) {
            row.childrenAfterGroup = _EmptyArray;
            const sibling = row.sibling;
            if (sibling) {
                sibling.childrenAfterGroup = _EmptyArray;
            }
        }
    } else if (oldSize !== newSize) {
        if (!childrenAfterGroup || childrenAfterGroup === _EmptyArray) {
            row.childrenAfterGroup = childrenAfterGroup = new Array(newSize);
            const sibling = row.sibling;
            if (sibling) {
                sibling.childrenAfterGroup = _EmptyArray;
            }
        } else {
            childrenAfterGroup.length = newSize;
        }
    }
};

const insertRowChildren = <TData>(row: GroupingRowNode<TData>): number => {
    const parent = row.treeParent;
    if (parent === null) {
        hideRow(row); // No parent, this row is hidden
        return 0;
    }

    let count = 1;
    let parentFlags = parent.treeNodeFlags;
    if (!parent.data && (parentFlags & FLAG_FILLER_NODE) === 0 && parent.treeParent !== null) {
        parent.treeNodeFlags = parentFlags |= FLAG_FILLER_NODE | (row.treeNodeFlags & FLAG_CHANGED); // Mark as processed
        count += insertRowChildren(parent); // Preprocess the filler row if it exists and is not already processed
    }

    // Write the row in the parent children array at the right incremental index
    const parentChildren = parent.childrenAfterGroup!;
    const indexInParent = parentFlags & MASK_CHILDREN_LENGTH;
    parentFlags = (parentFlags & ~MASK_CHILDREN_LENGTH) | (indexInParent + 1);
    if (parentFlags & FLAG_CHILDREN_CHANGED || parentChildren[indexInParent] !== row) {
        parentChildren[indexInParent] = row;
        parentFlags |= FLAG_CHILDREN_CHANGED;
    }
    parent.treeNodeFlags = parentFlags;
    return count;
};

const makeFillerRowId = (treeParent: GroupingRowNode<any>, leafKey: string, level: number): string => {
    let id = level + '-' + leafKey;
    let current = treeParent;
    while (--level >= 0) {
        id = level + '-' + current.key + '-' + id;
        current = current.treeParent!;
    }
    return _ROW_ID_PREFIX_ROW_GROUP + id;
};

type NodesByPathMap<TData> = Map<string, GroupingRowNode<TData>> & { dupPaths?: Map<string, GroupingRowNode<TData>[]> };

const addNodeByPath = <TData>(map: NodesByPathMap<TData>, pathKey: string, node: GroupingRowNode<TData>): void => {
    const existing = map.get(pathKey);
    if (existing === undefined) {
        map.set(pathKey, node);
        return;
    }
    if (node.sourceRowIndex < existing.sourceRowIndex) {
        map.set(pathKey, node); // We choose the node with the lowest sourceRowIndex
    }
    if (existing !== node) {
        const duplicates = map.dupPaths?.get(pathKey);
        if (!duplicates) {
            (map.dupPaths ??= new Map()).set(pathKey, [existing, node]);
        } else if (duplicates.length < MAX_DUPLICATES_TO_WARN) {
            duplicates.push(node);
        }
    }
};

const warnDuplicatePaths = <TData>({ dupPaths }: NodesByPathMap<TData>): void => {
    if (dupPaths) {
        for (const duplicates of dupPaths.values()) {
            const row = duplicates.sort((a, b) => a.sourceRowIndex - b.sourceRowIndex)[0];
            _warn(186, { rowId: row.id, rowData: row.data, duplicateRowsData: duplicates.slice(1).map((x) => x.data) }); // Duplicate path
        }
    }
};

const updateAllLeafChildren = <TData>(
    row: GroupingRowNode<TData>,
    allLeafChildren: GroupingRowNode<TData>[] | null | undefined,
    newAllLeafChildrenLen: number
): boolean => {
    if (newAllLeafChildrenLen === 0) {
        if (allLeafChildren) {
            row.allLeafChildren = null;
            if (row.sibling) {
                row.sibling.allLeafChildren = null;
            }
            return !!allLeafChildren?.length;
        }
        return false;
    }

    let changed = true;
    if (!allLeafChildren) {
        allLeafChildren = row.allLeafChildren = new Array(newAllLeafChildrenLen);
        if (row.sibling) {
            row.sibling.allLeafChildren = allLeafChildren;
        }
        changed = true;
    } else if (allLeafChildren.length !== newAllLeafChildrenLen) {
        allLeafChildren.length = newAllLeafChildrenLen;
        changed = true;
    }

    let writeIdx = 0;
    const childrenAfterGroup = row.childrenAfterGroup;
    if (childrenAfterGroup) {
        for (const child of childrenAfterGroup) {
            if (child.data) {
                changed ||= allLeafChildren[writeIdx] !== child;
                allLeafChildren[writeIdx++] = child;
            }
            const childLeafChildren = child.allLeafChildren;
            if (childLeafChildren) {
                for (const leaf of childLeafChildren) {
                    changed ||= allLeafChildren[writeIdx] !== leaf;
                    allLeafChildren[writeIdx++] = leaf;
                }
            }
        }
    }
    return changed;
};

const hideRow = <TData>(row: GroupingRowNode<TData>): void => {
    const oldParent = row.parent;
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
    if (oldParent !== null) {
        row.parent = null;
        if (oldParent !== undefined) {
            oldParent.treeNodeFlags |= FLAG_CHANGED;
        }
    }
};

const addProcessedNodes = <TData>(row: GroupingRowNode<TData>, set: Set<GroupingRowNode<TData>>): void => {
    if (!set.has(row)) {
        set.add(row);
        const childrenAfterGroup = (row.childrenAfterGroup ??= _EmptyArray);
        for (let i = 0, len = childrenAfterGroup.length; i < len; i++) {
            addProcessedNodes(childrenAfterGroup[i], set);
        }
    }
};

/** Handle cycles in a tree. Is not optimal for performance but this is an edge case that shouldn't happen. */
const handleCycles = <TData>(
    rootNode: GroupingRowNode<TData>,
    processNode: (row: GroupingRowNode<TData>, level: number) => void
) => {
    const processedNodes = new Set<GroupingRowNode<TData>>();
    const rootChildrenAfterGroup = rootNode.childrenAfterGroup!;
    addProcessedNodes(rootNode, processedNodes);
    rootChildrenAfterGroup.length = 0; // Clear the array to repopulate it
    for (const row of rootNode.allLeafChildren!) {
        const parent = row.parent;
        if (!processedNodes.has(row)) {
            _warn(270, { id: row.id!, parentId: parent?.id ?? '' });
            if (parent) {
                parent.treeNodeFlags |= FLAG_CHILDREN_CHANGED | FLAG_CHANGED;
                parent.childrenAfterGroup = parent.childrenAfterGroup?.filter((x) => x !== row) ?? _EmptyArray;
                if (parent.sibling) {
                    parent.sibling.childrenAfterGroup = parent.childrenAfterGroup;
                }
            }
            row.parent = rootNode;
            processNode(row, 0);
            addProcessedNodes(row, processedNodes);
            rootChildrenAfterGroup.push(row);
        } else if (parent === rootNode) {
            rootChildrenAfterGroup.push(row);
        }
    }
};
