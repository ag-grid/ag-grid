import type {
    BeanCollection,
    GroupingApproach,
    IChangedRowNodes,
    IRowGroupingStrategy,
    StageExecuteParams,
} from 'ag-grid-community';
import { RowNode } from 'ag-grid-community';
import { BeanStub, _EmptyArray, _ROW_ID_PREFIX_ROW_GROUP, _warn } from 'ag-grid-community';

import { setRowNodeGroup } from '../rowGrouping/rowGroupingUtils';
import type { GroupingRowNode } from '../rowHierarchy/rowHierarchyUtils';
import type { DataFieldGetter } from './fieldAccess';
import { makeFieldPathGetter } from './fieldAccess';

const FLAG_CHANGED = 0x80000000;
const FLAG_CHILDREN_CHANGED = 0x40000000;
const FLAG_EXPANDED_INITIALIZED = 0x20000000;
const FLAG_FILLER_NODE = 0x10000000;
const MASK_CHILDREN_LENGTH = 0x0fffffff; // This equates to 268,435,455 maximum children per parent, more than enough

/**
 * Path key separator used internally to maintain a flat path dictionary to map a path to a node.
 * It contains special characters and two random characters hard to predict to reduce the risk of intentional abuse.
 */
const PATH_KEY_SEPARATOR = String.fromCharCode(31, Math.random() * 65536, 8291, 4096 + Math.random() * 61440);
const PATH_KEY_SEPARATOR_LEN = PATH_KEY_SEPARATOR.length;

export class TreeGroupStrategy<TData = any> extends BeanStub implements IRowGroupingStrategy<TData> {
    private groupColsIds: string | null = null;
    private parentIdGetter: DataFieldGetter<TData, string> | null = null;
    private fillerNodesById: Map<string, GroupingRowNode<TData>> | null = null;

    public override destroy(): void {
        super.destroy();
        this.groupColsIds = null;
        this.parentIdGetter = null;
        this.fillerNodesById = null!;
    }

    public reset(): void {
        this.groupColsIds = null;
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

        let fullReload = !changedRowNodes && !changedPath?.active;
        let rootChildrenAfterGroup = rootNode.childrenAfterGroup;
        const rootAllLeafChildren = rootNode.allLeafChildren!;
        if (!rootChildrenAfterGroup || rootChildrenAfterGroup === rootAllLeafChildren) {
            fullReload = true;
            rootNode.childrenAfterGroup = rootChildrenAfterGroup = [];
        }

        let groupDisplayColIdsChanged = false;
        if (afterColumnsChanged || this.groupColsIds === null) {
            groupDisplayColIdsChanged = this.updateGroupDisplayColsIds();
        }

        const hasUpdates = !!changedRowNodes && flagUpdatedNodes(changedRowNodes);

        const treePathApproach = approach === 'treePath';
        const renderEmpty = approach === 'treeSelfRef' && !gos.get('getRowId'); // If getRowId is not provided, we make an empty tree
        let preprocessedCount = 0;
        if (!renderEmpty) {
            if (fullReload || hasUpdates) {
                if (treePathApproach) {
                    this.loadDataPath(params, fullReload);
                } else if (approach === 'treeSelfRef') {
                    this.loadSelfRef(params, fullReload);
                }
            }

            // Loop all the nodes, and put the children in the right place, updating the parent and the children arrays
            for (let i = 0, len = rootAllLeafChildren.length; i < len; ++i) {
                preprocessedCount += preprocessRow(rootAllLeafChildren[i]);
            }
        }

        rootChildrenAfterGroup.length = rootNode.treeNodeFlags & MASK_CHILDREN_LENGTH;
        rootNode.treeNodeFlags = 0;

        const expandByDefault = gos.get('groupDefaultExpanded');
        const activeChangedPath = changedPath?.active ? changedPath : undefined;
        const isGroupOpenByDefault = gos.getCallback('isGroupOpenByDefault');

        let traverseCount = 0;
        const traverse = (row: GroupingRowNode<TData>, level: number): boolean => {
            ++traverseCount;

            let treeNodeFlags = row.treeNodeFlags;
            const childrenAfterGroup = (row.childrenAfterGroup ??= _EmptyArray);
            const childrenAfterGroupLen = treeNodeFlags & MASK_CHILDREN_LENGTH;

            let childrenChanged = (treeNodeFlags & FLAG_CHILDREN_CHANGED) !== 0;

            if (childrenAfterGroup.length !== childrenAfterGroupLen) {
                childrenAfterGroup.length = childrenAfterGroupLen;
                childrenChanged = true;
            }

            let changed = childrenChanged || (treeNodeFlags & FLAG_CHANGED) !== 0;
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
                allLeafChildren = row.allLeafChildren = null;
            }
            if (allLeafChildrenChanged || (allLeafChildren?.length ?? 0) !== allLeafChildrenLen) {
                allLeafChildrenChanged = updateAllLeafChildren(row, allLeafChildren, allLeafChildrenLen);
            }

            if (!treePathApproach) {
                const id = row.id!;
                if (row.key !== id) {
                    row.key = id;
                    row.groupData = null;
                }
            }

            if (groupDisplayColIdsChanged || !row.groupData) {
                changed = true;
                this.setGroupData(row, row.key!);
            }

            const oldGroup = row.group;
            const hasChildren = childrenAfterGroupLen > 0;
            if (oldGroup !== hasChildren) {
                changed = true;
                setRowNodeGroup(row, this.beans, hasChildren); // Internally calls updateHasChildren
                if (!hasChildren && !row.expanded) {
                    treeNodeFlags = row.treeNodeFlags &= ~FLAG_EXPANDED_INITIALIZED;
                }
            } else if (row.hasChildren() !== hasChildren) {
                changed = true;
                row.updateHasChildren();
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

            if (childrenChanged || allLeafChildrenChanged || fullReload) {
                updateRowArrays(row, childrenAfterGroup);
            }

            if (changed) {
                activeChangedPath?.addParentNode(row);
            }

            return allLeafChildrenChanged;
        };

        //  Traverse the tree and update the children arrays length and the allLeafChildren array and propagate updates
        for (let i = 0, len = rootChildrenAfterGroup.length; i < len; ++i) {
            traverse(rootChildrenAfterGroup[i], 0);
        }

        if (fullReload) {
            updateRootArrays(rootNode, rootChildrenAfterGroup);
        }

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

    private updateGroupDisplayColsIds(): boolean {
        const cols = this.beans.showRowGroupCols?.getShowRowGroupCols();
        const colsLen = cols?.length;
        const oldGroupColsIds = this.groupColsIds;
        let groupColsIds: string | null = oldGroupColsIds !== null ? '' : null;
        if (colsLen) {
            groupColsIds = cols[0].getId();
            for (let i = 1; i < colsLen; ++i) {
                groupColsIds += PATH_KEY_SEPARATOR;
                groupColsIds += cols[i].getId();
            }
        }
        if (oldGroupColsIds === groupColsIds) {
            return false; // No change
        }
        this.groupColsIds = groupColsIds;
        return true;
    }

    private loadSelfRef({ rowNode, changedRowNodes }: StageExecuteParams<TData>, fullReload: boolean): void {
        const rootNode = rowNode as GroupingRowNode<TData>;
        const rootAllLeafChildren = rootNode.allLeafChildren!;
        const rowModel = this.beans.rowModel;
        const removals = changedRowNodes?.removals;

        let parentIdGetter = this.parentIdGetter;
        const parentIdField = this.gos.get('treeDataParentIdField') || null;
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
        let duplicatePaths: Map<string, GroupingRowNode<TData>[]> | undefined;

        const setNode = (pathKey: string, node: GroupingRowNode<TData>): void => {
            const existing = nodesByPath.get(pathKey);
            if (existing === undefined) {
                nodesByPath.set(pathKey, node);
                return;
            }
            if (node.sourceRowIndex < existing.sourceRowIndex) {
                nodesByPath.set(pathKey, node); // We choose the node with the lowest sourceRowIndex
            }
            if (existing !== node) {
                const duplicates = duplicatePaths?.get(pathKey);
                if (!duplicates) {
                    (duplicatePaths ??= new Map()).set(pathKey, [existing, node]);
                } else if (duplicates.length < 50) {
                    duplicates.push(node); // Don't log more than 50 duplicates
                }
            }
        };

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
                    setNode(pathKey, node);
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
                setNode(path.join(PATH_KEY_SEPARATOR), node);
            }
            node.treeParent = null; // Reset the treeParent to be set later
        }

        if (duplicatePaths) {
            duplicatePathWarn(duplicatePaths);
        }
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
                continue; // Parent already exists, fast path
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
                    if (fillerNodesById === null) {
                        this.fillerNodesById = fillerNodesById = new Map<string, GroupingRowNode<TData>>();
                    } else {
                        current = fillerNodesById.get(fillerId);
                    }
                    if (!current) {
                        current = newFillerRow(beans, fillerId, leafKey, treeParent);
                        fillerNodesById.set(fillerId, current);
                    }
                    current.treeNodeFlags |= FLAG_FILLER_NODE;
                    nodesByPath.set(subPathKey, current);
                }
                current.treeParent = treeParent;
                treeParent = current;
                ++level;
                pathKeyStart = pathKeyPos + PATH_KEY_SEPARATOR_LEN;
            }
            node.treeParent = treeParent;
        }
    }

    private destroyFillerRows(destroyAll: boolean, updated: boolean): void {
        const fillerNodesById = this.fillerNodesById;
        if (!fillerNodesById) {
            return;
        }
        let nodesToUnselect: GroupingRowNode<TData>[] | undefined;
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

const preprocessRow = <TData>(row: GroupingRowNode<TData>): number => {
    const { parent: oldParent, treeParent: newParent } = row;
    if (newParent === null) {
        hideRow(row);
        return 0;
    }

    let count = 1;
    let parentFlags = newParent.treeNodeFlags;
    if (!newParent.data && (parentFlags & FLAG_FILLER_NODE) === 0 && newParent.treeParent !== null) {
        parentFlags |= FLAG_FILLER_NODE | (row.treeNodeFlags & FLAG_CHANGED); // Mark as processed
        count += preprocessRow(newParent); // Preprocess the filler row if it exists and is not already processed
    }

    let parentChildren = (newParent.childrenAfterGroup ??= _EmptyArray);
    const indexInParent = parentFlags & MASK_CHILDREN_LENGTH;
    parentFlags = (parentFlags & ~MASK_CHILDREN_LENGTH) | (indexInParent + 1);

    if (parentChildren.length <= indexInParent || parentChildren[indexInParent] !== row) {
        if (parentChildren === _EmptyArray) {
            newParent.childrenAfterGroup = parentChildren = [];
        }
        parentChildren[indexInParent] = row;
        parentFlags |= FLAG_CHILDREN_CHANGED;
    }
    if (oldParent !== newParent) {
        row.parent = newParent;
        parentFlags |= FLAG_CHANGED;
        if (oldParent) {
            const oldParentFlags = oldParent.treeNodeFlags | FLAG_CHANGED;
            if (
                (oldParentFlags & FLAG_EXPANDED_INITIALIZED) !== 0 &&
                (parentFlags & FLAG_EXPANDED_INITIALIZED) === 0 &&
                newParent.treeParent !== null &&
                !newParent.data
            ) {
                newParent.expanded = oldParent.expanded; // If parent is a new filler node, copy the expanded flag from old parent
                parentFlags |= FLAG_EXPANDED_INITIALIZED;
            }
            oldParent.treeNodeFlags = oldParentFlags;
        }
    }
    newParent.treeNodeFlags = parentFlags;

    return count;
};

const hideRow = <TData>(row: GroupingRowNode<TData>): void => {
    const oldParent = row.parent;
    row.treeNodeFlags = 0;
    row.childrenAfterGroup = _EmptyArray;
    row.allLeafChildren = null;
    row.group = false;
    row.updateHasChildren();
    if (oldParent !== null) {
        row.parent = null;
        if (oldParent !== undefined) {
            oldParent.treeNodeFlags |= FLAG_CHANGED;
        }
    }
};

/** Handle cycles in a tree. Is not optimal for performance but this is an edge case that shouldn't happen. */
const handleCycles = <TData>(
    rootNode: GroupingRowNode<TData>,
    processNode: (row: GroupingRowNode<TData>, level: number) => void
) => {
    const processedNodes = new Set<GroupingRowNode<TData>>();

    const addProcessedNodes = (row: GroupingRowNode<TData>): void => {
        processedNodes.add(row);
        const childrenAfterGroup = row.childrenAfterGroup ?? _EmptyArray;
        for (let i = 0, len = childrenAfterGroup.length; i < len; i++) {
            const node = childrenAfterGroup[i];
            if (!processedNodes.has(node)) {
                addProcessedNodes(childrenAfterGroup[i]);
            }
        }
    };

    const rootChildrenAfterGroup = rootNode.childrenAfterGroup!;
    addProcessedNodes(rootNode);
    rootChildrenAfterGroup.length = 0;
    let warned = false;
    for (const row of rootNode.allLeafChildren!) {
        if (!processedNodes.has(row)) {
            const parent = row.parent;
            warned = true;
            _warn(270, { id: row.id!, parentId: parent?.id ?? '' });
            if (parent) {
                parent.childrenAfterGroup = parent.childrenAfterGroup?.filter((x) => x !== row) ?? _EmptyArray;
                parent.treeNodeFlags = (parent.treeNodeFlags - 1) | FLAG_CHILDREN_CHANGED | FLAG_CHANGED;
            }
            row.parent = rootNode;
            processNode(row, 0);
            addProcessedNodes(row);
            rootChildrenAfterGroup.push(row);
        } else if (row.parent === rootNode) {
            rootChildrenAfterGroup.push(row);
        }
    }
    if (!warned) {
        _warn(270, { id: '', parentId: '' });
    }
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

const newFillerRow = <TData>(
    beans: BeanCollection,
    id: string,
    key: string,
    parent: GroupingRowNode<TData>
): GroupingRowNode<TData> => {
    const filler: GroupingRowNode<TData> = new RowNode<TData>(beans);
    filler.id = id;
    filler.key = key;
    filler.group = true;
    filler.field = null;
    filler.leafGroup = false;
    filler.rowGroupIndex = null;
    filler.allChildrenCount = null;
    filler.treeParent = parent;
    return filler;
};

const duplicatePathWarn = <TData>(map: Map<string, GroupingRowNode<TData>[]>): void => {
    const compareSourceRowIndex = <TData>(a: GroupingRowNode<TData>, b: GroupingRowNode<TData>): number =>
        a.sourceRowIndex - b.sourceRowIndex;

    for (const array of map.values()) {
        array.sort(compareSourceRowIndex);
        const row = array[0];
        const length = array.length;
        const duplicateRowsData = new Array(array.length - 1);
        for (let i = 1; i < length; i++) {
            duplicateRowsData[i - 1] = array[i].data;
        }
        _warn(186, { rowId: row.id, rowData: row.data, duplicateRowsData }); // Duplicate path
    }
};

const updateRootArrays = <TData>(root: GroupingRowNode<TData>, childrenAfterGroup: GroupingRowNode<TData>[]) => {
    root.childrenAfterFilter = childrenAfterGroup;
    root.childrenAfterAggFilter = childrenAfterGroup;
    root.childrenAfterSort = childrenAfterGroup;
    const sibling = root.sibling;
    if (sibling) {
        sibling.childrenAfterGroup = root.childrenAfterGroup;
        sibling.childrenAfterAggFilter = root.childrenAfterAggFilter;
        sibling.childrenAfterSort = root.childrenAfterSort;
    }
};

const updateRowArrays = <TData>(row: GroupingRowNode<TData>, childrenAfterGroup: GroupingRowNode<TData>[]) => {
    row.allLeafChildren ??= null;
    row.childrenAfterFilter ??= childrenAfterGroup;
    row.childrenAfterAggFilter ??= childrenAfterGroup;
    row.childrenAfterSort ??= childrenAfterGroup;
    const sibling = row.sibling;
    if (sibling) {
        sibling.allLeafChildren = row.allLeafChildren;
        sibling.childrenAfterGroup = row.childrenAfterGroup;
        sibling.childrenAfterAggFilter = row.childrenAfterAggFilter;
        sibling.childrenAfterFilter = row.childrenAfterFilter;
        sibling.childrenAfterSort = row.childrenAfterSort;
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
            return !!allLeafChildren?.length;
        }
        return false;
    }

    let changed = false;
    if (!allLeafChildren) {
        allLeafChildren = row.allLeafChildren = new Array(newAllLeafChildrenLen);
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
