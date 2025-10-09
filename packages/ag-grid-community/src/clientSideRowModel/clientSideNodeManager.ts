import { BeanStub } from '../context/beanStub';
import type { GetRowIdFunc } from '../entities/gridOptions';
import { RowNode } from '../entities/rowNode';
import { _getRowIdCallback } from '../gridOptionsUtils';
import type { RefreshModelParams } from '../interfaces/iClientSideRowModel';
import type { RowDataTransaction } from '../interfaces/rowDataTransaction';
import type { RowNodeTransaction } from '../interfaces/rowNodeTransaction';
import { _error, _warn } from '../validation/logging';
import type { ChangedRowNodes } from './changedRowNodes';

export class ClientSideNodeManager<TData = any> extends BeanStub {
    private nextId = 0;
    private allNodesMap: { [id: string]: RowNode<TData> } = {};

    public constructor(public readonly rootNode: RowNode<TData>) {
        super();
        initRootNode(rootNode);
    }

    public getRowNode(id: string): RowNode | undefined {
        return this.allNodesMap[id];
    }

    public setNewRowData(rowData: TData[]): void {
        const { selectionSvc, pinnedRowModel, groupStage } = this.beans;

        // - clears selection, done before we set row data to ensure it isn't readded via `selectionSvc.syncInOldRowNode`
        selectionSvc?.reset('rowDataChanged');

        if (pinnedRowModel?.isManual()) {
            pinnedRowModel.reset(); // only clear pinned rows if using manual pinning
        }

        this.dispatchRowDataUpdateStarted(rowData);

        // Clear internal maps
        this.allNodesMap = Object.create(null);
        this.nextId = 0;
        const rootNode = initRootNode(this.rootNode);

        const allLeafs = new Array<RowNode<TData>>(rowData.length);
        setAllLeafs(rootNode, allLeafs);

        let writeIdx = 0;
        const nestedDataGetter = groupStage?.getNestedDataGetter();
        const processedNested = nestedDataGetter ? new Set<TData>() : null;
        const processChildren = (parent: RowNode, childrenData: TData[]) => {
            const level = parent.level + 1;
            for (let i = 0, len = childrenData.length; i < len; ++i) {
                const data = childrenData[i];
                if (!data) continue;
                const node = this.createRowNode(data, level);
                node.sourceRowIndex = writeIdx;
                allLeafs[writeIdx++] = node;
                if (processedNested && !processedNested.has(data)) {
                    processedNested.add(data);
                    node.treeParent = parent;
                    const children = nestedDataGetter!(data);
                    if (children) {
                        processChildren(node, children);
                    }
                }
            }
        };

        processChildren(rootNode, rowData);
        allLeafs.length = writeIdx;
    }

    public setImmutableRowData(params: RefreshModelParams<TData>, rowData: TData[]): void {
        const { rootNode, gos } = this;
        this.dispatchRowDataUpdateStarted(rowData);
        const getRowIdFunc = _getRowIdCallback(gos)!;
        const changedRowNodes = params.changedRowNodes!;
        const { adds, updates } = changedRowNodes;
        const processedNodes = new Set<RowNode<TData>>();
        const nodesToUnselect: RowNode<TData>[] = [];
        const nestedDataGetter = this.beans.groupStage?.getNestedDataGetter();
        let reorder = gos.get('suppressMaintainUnsortedOrder') ? undefined : false;
        let prevIndex = -1;
        let treeUpdated = false;

        const updateNode = (node: RowNode<TData>, data: TData): void => {
            if (!reorder && reorder !== undefined) {
                const oldIndex = node.sourceRowIndex;
                reorder = oldIndex <= prevIndex; // A node was moved up, order changed
                prevIndex = oldIndex;
            }
            if (node.data !== data) {
                node.updateData(data);
                if (!adds.has(node)) {
                    updates.add(node);
                }
                if (!node.selectable && node.isSelected()) {
                    nodesToUnselect.push(node);
                }
            }
        };

        const processChildren = (parent: RowNode<TData>, childrenData: TData[], level: number): void => {
            for (let i = 0, len = childrenData.length; i < len; ++i) {
                const data = childrenData[i];
                if (!data) continue;
                let node = this.getRowNode(getRowIdFunc({ data, level }));
                if (node) {
                    updateNode(node, data);
                    treeUpdated ||= !!nestedDataGetter && node.treeParent !== parent;
                } else {
                    node = this.createRowNode(data, level);
                    adds.add(node);
                }
                if (!nestedDataGetter || processedNodes.has(node)) {
                    processedNodes.add(node);
                    continue;
                }
                processedNodes.add(node);
                node.treeParent = parent;
                const children = nestedDataGetter(data);
                if (children) {
                    processChildren(node, children, level + 1);
                }
            }
        };

        processChildren(rootNode, rowData, 0);

        const changed =
            this.deleteUnusedNodes(processedNodes, changedRowNodes, nodesToUnselect) || reorder || adds.size > 0;

        if (changed) {
            if (reorder === undefined) {
                updateRootLeafsKeepOrder(rootNode, processedNodes, changedRowNodes);
            } else if (updateRootLeafsOrdered(rootNode, processedNodes)) {
                changedRowNodes.reordered = true;
            }
        }

        if (changed || treeUpdated || updates.size) {
            params.rowDataUpdated = true;
            this.deselect(nodesToUnselect);
        }
    }

    private deleteUnusedNodes(
        processedNodes: Set<RowNode<TData>>,
        changedRowNodes: ChangedRowNodes<TData>,
        nodesToUnselect: RowNode<TData>[]
    ): boolean {
        let nodesRemoved = false;
        const allLeafs = this.rootNode.allLeafChildren!;
        for (let i = 0, len = allLeafs.length; i < len; i++) {
            const node = allLeafs[i];
            if (!processedNodes.has(node)) {
                nodesRemoved = true;
                changedRowNodes.remove(node);
                if (node.isSelected()) {
                    nodesToUnselect.push(node);
                }
                this.deleteNode(node);
            }
        }
        return nodesRemoved;
    }

    public updateRowData(
        rowDataTran: RowDataTransaction<TData>,
        changedRowNodes: ChangedRowNodes<TData>
    ): RowNodeTransaction<TData> {
        this.dispatchRowDataUpdateStarted(rowDataTran.add);
        if (this.beans.groupStage?.getNestedDataGetter()) {
            _warn(268); // transactions not supported with treeDataChildrenField
            return { remove: [], update: [], add: [] };
        }
        const nodesToUnselect: RowNode[] = [];
        const getRowIdFunc = _getRowIdCallback(this.gos);
        const remove = this.executeRemove(getRowIdFunc, rowDataTran, changedRowNodes, nodesToUnselect);
        const update = this.executeUpdate(getRowIdFunc, rowDataTran, changedRowNodes, nodesToUnselect);
        const add = this.executeAdd(rowDataTran, changedRowNodes);
        this.deselect(nodesToUnselect);
        return { remove, update, add };
    }

    private executeRemove(
        getRowIdFunc: GetRowIdFunc<TData> | undefined,
        { remove }: RowDataTransaction,
        changedRowNodes: ChangedRowNodes<TData>,
        nodesToUnselect: RowNode<TData>[]
    ): RowNode<TData>[] {
        const removeLen = remove?.length;
        if (!removeLen) {
            return [];
        }
        const removedSet = new Set<RowNode<TData>>();
        const removedResult = new Array<RowNode<TData>>(removeLen);
        let writeIdx = 0;
        for (let i = 0; i < removeLen; ++i) {
            const rowNode = this.lookupNode(getRowIdFunc, remove[i]);
            if (rowNode) {
                if (rowNode.isSelected()) {
                    nodesToUnselect.push(rowNode);
                }
                this.deleteNode(rowNode);
                changedRowNodes.remove(rowNode);
                removedResult[writeIdx++] = rowNode;
                removedSet.add(rowNode);
            }
        }
        removedResult.length = writeIdx;
        filterRemovedNodes(this.rootNode, removedSet);
        return removedResult;
    }

    private executeUpdate(
        getRowIdFunc: GetRowIdFunc<TData> | undefined,
        { update }: RowDataTransaction,
        { adds, updates }: ChangedRowNodes<TData>,
        nodesToUnselect: RowNode<TData>[]
    ): RowNode<TData>[] {
        const updateLen = update?.length;
        if (!updateLen) {
            return [];
        }
        const updateResult = new Array<RowNode<TData>>(updateLen);
        let writeIdx = 0;
        for (let i = 0; i < updateLen; i++) {
            const item = update[i];
            const rowNode = this.lookupNode(getRowIdFunc, item);
            if (rowNode) {
                rowNode.updateData(item);
                if (!rowNode.selectable && rowNode.isSelected()) {
                    nodesToUnselect.push(rowNode);
                }
                updateResult[writeIdx++] = rowNode;
                if (!adds.has(rowNode)) {
                    updates.add(rowNode);
                }
            }
        }
        updateResult.length = writeIdx;
        return updateResult;
    }

    private executeAdd(rowDataTran: RowDataTransaction, changedRowNodes: ChangedRowNodes<TData>): RowNode<TData>[] {
        const add = rowDataTran.add;
        if (!add?.length) {
            return [];
        }
        const rootNode = this.rootNode;
        const allLeafs = rootNode.allLeafChildren!;
        const allLeafsLen = allLeafs.length;
        const addLength = add.length;
        const newAllLeafs = new Array<RowNode<TData>>(allLeafsLen + addLength); // Preallocate new array
        const addIndex = this.sanitizeAddIndex(allLeafs, rowDataTran.addIndex);
        for (let i = 0; i < addIndex; ++i) {
            newAllLeafs[i] = allLeafs[i]; // Copy nodes before addIndex
        }
        const adds = changedRowNodes.adds;
        let writeIdx = addIndex;
        for (let i = 0; i < addLength; i++) {
            const node = this.createRowNode(add[i], 0);
            adds.add(node);
            node.sourceRowIndex = writeIdx;
            newAllLeafs[writeIdx++] = node; // Insert new nodes
        }
        if (addIndex < allLeafsLen) {
            changedRowNodes.reordered = true; // Inserting in the middle, order changed
            for (let i = addIndex; i < allLeafsLen; i++) {
                const node = allLeafs[i];
                node.sourceRowIndex = writeIdx;
                newAllLeafs[writeIdx++] = node; // Copy nodes after addIndex
            }
        }
        setAllLeafs(rootNode, newAllLeafs);
        return newAllLeafs.slice(addIndex, addIndex + addLength);
    }

    private dispatchRowDataUpdateStarted(data?: TData[] | null): void {
        this.eventSvc.dispatchEvent({ type: 'rowDataUpdateStarted', firstRowData: data?.length ? data[0] : null });
    }

    private deselect(nodes: RowNode<TData>[]): void {
        const source = 'rowDataChanged';
        const selectionSvc = this.beans.selectionSvc;
        if (nodes.length) {
            selectionSvc?.setNodesSelected({ newValue: false, nodes, suppressFinishActions: true, source });
        }
        // Always update parent group selection from children: a newly inserted child can
        // change a previously all-selected parent to not fully selected.
        selectionSvc?.updateGroupsFromChildrenSelections?.(source);
        if (nodes.length) {
            this.eventSvc.dispatchEvent({
                type: 'selectionChanged',
                source,
                selectedNodes: selectionSvc?.getSelectedNodes() ?? null,
                serverSideState: null,
            });
        }
    }

    private createRowNode(data: TData, level: number): RowNode<TData> {
        const node = new RowNode<TData>(this.beans);
        node.parent = this.rootNode;
        node.level = level;
        node.group = false;
        node.expanded = false;
        node.setDataAndId(data, String(this.nextId++));
        const id = node.id!;
        const allNodesMap = this.allNodesMap;
        if (allNodesMap[id]) {
            _warn(2, { nodeId: id });
        }
        allNodesMap[id] = node;
        return node;
    }

    /** Called when a node needs to be deleted */
    private deleteNode(node: RowNode<TData>): void {
        node.clearRowTopAndRowIndex(); // so row renderer knows to fade row out (and not reposition it)
        const id = node.id!;
        const allNodesMap = this.allNodesMap;
        if (allNodesMap[id] === node) {
            delete allNodesMap[id];
        }
        const pinnedSibling = node.pinnedSibling;
        if (pinnedSibling) {
            this.beans.pinnedRowModel?.pinRow(pinnedSibling, null);
        }
    }

    private lookupNode(getRowIdFunc: ((data: any) => string) | undefined, data: TData): RowNode<TData> | null {
        if (!getRowIdFunc) {
            return lookupNodeByData(this.rootNode.allLeafChildren, data);
        }
        const id = getRowIdFunc({ data, level: 0 });
        const rowNode = this.allNodesMap[id];
        if (!rowNode) {
            _error(4, { id });
            return null;
        }
        return rowNode;
    }

    private sanitizeAddIndex(allLeafs: RowNode<TData>[], addIndex: number | null | undefined): number {
        const allLeafsLen = allLeafs.length;
        if (typeof addIndex !== 'number') {
            return allLeafsLen; // Append
        }
        if (addIndex < 0 || addIndex >= allLeafsLen || Number.isNaN(addIndex)) {
            return allLeafsLen; // Append. Also for negative values, as it was historically the behavior.
        }
        // Ensure index is a whole number and not a floating point.
        // Use case: the user want to add a row in the middle, doing addIndex = array.length / 2.
        // If the array has an odd number of elements, the addIndex need to be rounded up.
        // Consider that array.slice does round up internally, but we are setting this value to node.sourceRowIndex.
        addIndex = Math.ceil(addIndex);
        const gos = this.gos;
        if (addIndex > 0 && gos.get('treeData') && gos.get('getDataPath')) {
            addIndex = adjustAddIndexForDataPath(allLeafs, addIndex); // AG-6231 workaround
        }
        return addIndex;
    }
}

/** Adjusts addIndex for treeData scenarios (AG-6231 workaround). Returns the corrected addIndex value.*/
const adjustAddIndexForDataPath = <TData>(allLeafs: RowNode<TData>[], addIndex: number): number => {
    for (let i = 0, len = allLeafs.length; i < len; i++) {
        const node = allLeafs[i];
        if (node?.rowIndex == addIndex - 1) {
            return i + 1;
        }
    }
    return addIndex;
};

const initRootNode = <TData = any>(rootNode: RowNode<TData>): RowNode<TData> => {
    rootNode.group = true;
    rootNode.level = -1;
    rootNode.id = 'ROOT_NODE_ID';
    setAllLeafs(rootNode, []);
    const childrenAfterGroup: RowNode<TData>[] = [];
    const childrenAfterSort: RowNode<TData>[] = [];
    const childrenAfterAggFilter: RowNode<TData>[] = [];
    const childrenAfterFilter: RowNode<TData>[] = [];
    rootNode.childrenAfterGroup = childrenAfterGroup;
    rootNode.childrenAfterSort = childrenAfterSort;
    rootNode.childrenAfterAggFilter = childrenAfterAggFilter;
    rootNode.childrenAfterFilter = childrenAfterFilter;
    const sibling = rootNode.sibling;
    if (sibling) {
        sibling.childrenAfterGroup = childrenAfterGroup;
        sibling.childrenAfterSort = childrenAfterSort;
        sibling.childrenAfterAggFilter = childrenAfterAggFilter;
        sibling.childrenAfterFilter = childrenAfterFilter;
        sibling.childrenMapped = rootNode.childrenMapped;
    }
    rootNode.updateHasChildren();
    return rootNode;
};

/**
 * Finds a row node in the given array whose data matches the provided data object.
 * Returns the node if found, otherwise undefined.
 */
const lookupNodeByData = <TData>(nodes: RowNode<TData>[] | null | undefined, data: TData): RowNode<TData> | null => {
    if (nodes) {
        for (let i = 0, len = nodes.length; i < len; i++) {
            const node = nodes[i];
            if (node.data === data) {
                return node;
            }
        }
    }
    _error(5, { data });
    return null;
};

const setAllLeafs = <TData>(node: RowNode<TData>, allLeafs: RowNode<TData>[]): void => {
    node.allLeafChildren = allLeafs;
    const sibling = node.sibling;
    if (sibling) {
        sibling.allLeafChildren = allLeafs;
    }
};

const updateRootLeafsOrdered = <TData>(rootNode: RowNode<TData>, processedNodes: Set<RowNode<TData>>): boolean => {
    const newAllLeafs = new Array<RowNode<TData>>(processedNodes.size); // Preallocate
    setAllLeafs(rootNode, newAllLeafs);
    let writeIdx = 0;
    let added = false;
    let reordered = false;
    for (const node of processedNodes) {
        const sourceRowIndex = node.sourceRowIndex;
        if (sourceRowIndex === writeIdx) {
            reordered ||= added; // Nodes inserted in the middle, order changed
        } else {
            if (sourceRowIndex >= 0) {
                reordered = true;
            } else {
                added = true; // Keep track we have added nodes from now on
            }
            node.sourceRowIndex = writeIdx;
        }
        newAllLeafs[writeIdx++] = node;
    }
    return reordered;
};

const updateRootLeafsKeepOrder = <TData>(
    rootNode: RowNode<TData>,
    processedNodes: Set<RowNode<TData>>,
    changedRowNodes: ChangedRowNodes<TData>
): void => {
    const oldAllLeafs = rootNode.allLeafChildren!;
    const newAllLeafs = new Array<RowNode<TData>>(processedNodes.size); // Preallocate
    setAllLeafs(rootNode, newAllLeafs);
    let writeIdx = 0;
    const removals = changedRowNodes.removals;
    for (let i = 0, len = oldAllLeafs.length; i < len; ++i) {
        const node = oldAllLeafs[i];
        if (!removals.has(node)) {
            node.sourceRowIndex = writeIdx;
            newAllLeafs[writeIdx++] = node; // First append all the old children that weren't removed
        }
    }
    for (const node of changedRowNodes.adds) {
        if (node.sourceRowIndex < 0) {
            node.sourceRowIndex = writeIdx;
            newAllLeafs[writeIdx++] = node; // Now append all the new children
        }
    }
    newAllLeafs.length = writeIdx;
};

const filterRemovedNodes = <TData>(rootNode: RowNode<TData>, removedSet: ReadonlySet<RowNode<TData>>): void => {
    const allLeafs = rootNode.allLeafChildren;
    const allLeafsLen = allLeafs?.length;
    const removeSize = removedSet.size;
    if (!allLeafsLen || !removeSize) {
        return;
    }
    const newAllLeafs = new Array<RowNode<TData>>(allLeafsLen - removeSize);
    let writeIdx = 0;
    for (let readIdx = 0; readIdx < allLeafsLen; ++readIdx) {
        const node = allLeafs[readIdx];
        if (!removedSet.has(node)) {
            node.sourceRowIndex = writeIdx;
            newAllLeafs[writeIdx++] = node;
        }
    }
    if (writeIdx !== allLeafsLen) {
        newAllLeafs.length = writeIdx;
        setAllLeafs(rootNode, newAllLeafs);
    }
};
