import { BeanStub } from '../context/beanStub';
import type { GetRowIdFunc, GridOptions } from '../entities/gridOptions';
import { RowNode } from '../entities/rowNode';
import { _getRowIdCallback } from '../gridOptionsUtils';
import type { RefreshModelParams } from '../interfaces/iClientSideRowModel';
import type { RowDataTransaction } from '../interfaces/rowDataTransaction';
import type { RowNodeTransaction } from '../interfaces/rowNodeTransaction';
import { _error, _warn } from '../validation/logging';
import type { ChangedRowNodes } from './changedRowNodes';

export interface ClientSideNodeManagerUpdateRowDataResult<TData = any> {
    changedRowNodes: ChangedRowNodes<TData>;

    /** The RowNodeTransaction containing all the removals, updates and additions */
    rowNodeTransaction: RowNodeTransaction<TData>;

    /** True if at least one row was inserted (and not just appended) */
    rowsInserted: boolean;
}

const ROOT_NODE_ID = 'ROOT_NODE_ID';

export class ClientSideNodeManager<TData = any> extends BeanStub {
    private nextId = 0;
    protected allNodesMap: { [id: string]: RowNode<TData> } = {};

    public rootNode: RowNode<TData>;

    public constructor(rootNode: RowNode<TData>) {
        super();
        this.rootNode = rootNode;
    }

    public onPropChange(changedProps: ReadonlySet<keyof GridOptions>): boolean {
        return changedProps.has('treeData') && changedProps.has('rowData') && this.gos.get('treeData');
    }

    public getRowNode(id: string): RowNode | undefined {
        return this.allNodesMap[id];
    }

    public extractRowData(
        rowNodes: RowNode<TData>[] | null | undefined = this.rootNode.allLeafChildren
    ): TData[] | null | undefined {
        if (!rowNodes) {
            return rowNodes;
        }
        const len = rowNodes.length;
        const result = new Array<TData>(len);
        for (let i = 0; i < len; ++i) {
            result[i] = rowNodes[i].data!;
        }
        return result;
    }

    public setNewRowData(rowData: TData[]): void {
        const rootNode = this.rootNode;

        this.dispatchRowDataUpdateStartedEvent(rowData);

        rootNode.childrenAfterFilter = null;
        rootNode.childrenAfterGroup = null;
        rootNode.childrenAfterAggFilter = null;
        rootNode.childrenAfterSort = null;
        rootNode.childrenMapped = null;
        rootNode.updateHasChildren();

        // Clear internal maps

        this.nextId = 0;
        this.allNodesMap = {};
        rootNode.allLeafChildren = this.loadNewRowData(rowData);
        initRootSibling(rootNode);
    }

    protected loadNewRowData(rowData: TData[]): RowNode[] {
        const len = rowData.length;
        const result = new Array<RowNode<TData>>(len);
        for (let i = 0, len = rowData.length; i < len; i++) {
            const node = this.createRowNode(rowData[i]);
            node.sourceRowIndex = i;
            result[i] = node;
        }
        return result;
    }

    public setImmutableRowData(params: RefreshModelParams<TData>, rowData: TData[]): void {
        this.dispatchRowDataUpdateStartedEvent(rowData);
        const getRowIdFunc = _getRowIdCallback(this.gos)!;
        const reorder = !this.gos.get('suppressMaintainUnsortedOrder');
        const processedNodes = new Set<RowNode<TData>>();
        const rootNode = this.rootNode;
        const nodesToUnselect: RowNode<TData>[] = [];
        const changedRowNodes = params.changedRowNodes!;
        const { adds, updates } = changedRowNodes;

        let nodesAdded = false;
        let dataUpdated = false;
        let orderChanged = false;
        for (let i = 0, prevSourceRowIndex = -1, len = rowData.length; i < len; i++) {
            const data = rowData[i];
            let node = this.getRowNode(getRowIdFunc({ data, level: 0 }));
            if (!node) {
                nodesAdded = true;
                node = this.createRowNode(data);
                adds.add(node);
                processedNodes.add(node);
                continue;
            }
            processedNodes.add(node);
            if (reorder) {
                const sourceRowIndex = node.sourceRowIndex;
                orderChanged ||=
                    nodesAdded || // A node was inserted not at the end
                    sourceRowIndex <= prevSourceRowIndex; // A node was moved up, so order changed
                prevSourceRowIndex = sourceRowIndex;
            }
            if (node.data === data) {
                continue; // no change
            }
            dataUpdated = true;
            node.updateData(data);
            if (adds.has(node)) {
                continue; // already marked as added
            }
            updates.add(node);
            if (!node.selectable && node.isSelected()) {
                nodesToUnselect.push(node);
            }
        }

        // Destroy the remaining unprocessed node and collect the removed that were selected.
        let nodesChanged = nodesAdded || orderChanged;
        if (this.removeUnprocessed(rootNode.allLeafChildren!, processedNodes, nodesToUnselect, changedRowNodes)) {
            nodesChanged = true;
        }

        if (nodesChanged) {
            if (this.updateLeafs(rootNode, processedNodes, reorder, changedRowNodes)) {
                params.rowNodesOrderChanged = true;
            }
        }

        if (nodesChanged || dataUpdated) {
            params.rowDataUpdated = true;
            this.deselect(nodesToUnselect);
        }
    }

    protected removeUnprocessed(
        allLeafChildren: RowNode<TData>[],
        processedNodes: Set<RowNode<TData>>,
        nodesToUnselect: RowNode<TData>[],
        changedRowNodes: ChangedRowNodes<TData>
    ): boolean {
        let nodesRemoved = false;
        for (let i = 0, len = allLeafChildren.length; i < len; i++) {
            const node = allLeafChildren[i];
            if (processedNodes.has(node)) {
                continue;
            }
            nodesRemoved = true;
            this.deleteNode(node);
            changedRowNodes.remove(node);
            if (node.isSelected()) {
                nodesToUnselect.push(node);
            }
        }
        return nodesRemoved;
    }

    protected updateLeafs<TData>(
        rootNode: RowNode<TData>,
        processedNodes: Set<RowNode<TData>>,
        reorder: boolean,
        changedRowNodes: ChangedRowNodes<TData>
    ): boolean {
        const allLeafs = new Array<RowNode<TData>>(processedNodes.size); // Preallocate
        let writeIdx = 0;
        let orderChanged = false;
        if (reorder) {
            for (const node of processedNodes) {
                const oldSourceRowIndex = node.sourceRowIndex;
                if (oldSourceRowIndex !== -1 && oldSourceRowIndex !== writeIdx) {
                    orderChanged = true;
                }
                node.sourceRowIndex = writeIdx;
                allLeafs[writeIdx++] = node;
            }
        } else {
            const removals = changedRowNodes.removals;
            const oldAllLeafs = rootNode.allLeafChildren!;
            for (let i = 0, len = oldAllLeafs.length; i < len; ++i) {
                const row = oldAllLeafs[i];
                if (!removals.has(row)) {
                    row.sourceRowIndex = writeIdx;
                    allLeafs[writeIdx++] = row; // First append all the old children that weren't removed
                }
            }
            for (const row of changedRowNodes.adds) {
                if (row.sourceRowIndex === -1) {
                    row.sourceRowIndex = writeIdx;
                    allLeafs[writeIdx++] = row; // Now append all the new children
                }
            }
            allLeafs.length = writeIdx;
        }
        rootNode.allLeafChildren = allLeafs;
        const sibling = rootNode.sibling;
        if (sibling) {
            sibling.allLeafChildren = allLeafs;
        }
        return orderChanged;
    }

    /** Called when a node needs to be deleted */
    protected deleteNode(node: RowNode<TData>): void {
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

    public updateRowData(
        rowDataTran: RowDataTransaction<TData>,
        changedRowNodes: ChangedRowNodes<TData>
    ): ClientSideNodeManagerUpdateRowDataResult<TData> {
        this.dispatchRowDataUpdateStartedEvent(rowDataTran.add);

        const updateRowDataResult: ClientSideNodeManagerUpdateRowDataResult<TData> = {
            changedRowNodes,
            rowNodeTransaction: { remove: [], update: [], add: [] },
            rowsInserted: false,
        };

        const nodesToUnselect: RowNode[] = [];

        const getRowIdFunc = _getRowIdCallback(this.gos);
        this.executeRemove(getRowIdFunc, rowDataTran, updateRowDataResult, nodesToUnselect);
        this.executeUpdate(getRowIdFunc, rowDataTran, updateRowDataResult, nodesToUnselect);
        this.executeAdd(rowDataTran, updateRowDataResult);

        this.deselect(nodesToUnselect);

        return updateRowDataResult;
    }

    private executeAdd(rowDataTran: RowDataTransaction, result: ClientSideNodeManagerUpdateRowDataResult<TData>): void {
        const add = rowDataTran.add;
        if (!add?.length) {
            return;
        }

        const allLeafs = this.rootNode.allLeafChildren!;
        const allLeafsLen = allLeafs.length;
        let addIndex = allLeafsLen;

        if (typeof rowDataTran.addIndex === 'number') {
            addIndex = this.sanitizeAddIndex(rowDataTran.addIndex);
            const gos = this.gos;
            if (addIndex > 0 && gos.get('treeData') && gos.get('getDataPath')) {
                addIndex = adjustAddIndexForDataPath(addIndex, allLeafs);
            }
        }

        const addLength = add.length;
        // Preallocate new array for result
        const newAllLeafs = new Array<RowNode<TData>>(allLeafsLen + addLength);

        // Copy nodes before addIndex
        for (let i = 0; i < addIndex; i++) {
            newAllLeafs[i] = allLeafs[i];
        }

        let writeIdx = addIndex;

        // Insert new nodes
        const adds = result.changedRowNodes.adds;
        for (let i = 0; i < addLength; i++) {
            const node = this.createRowNode(add[i]);
            adds.add(node);
            node.sourceRowIndex = writeIdx;
            newAllLeafs[writeIdx++] = node;
        }

        // Copy and update nodes after addIndex
        for (let i = addIndex; i < allLeafsLen; i++) {
            const node = allLeafs[i];
            node.sourceRowIndex = writeIdx;
            newAllLeafs[writeIdx++] = node;
        }

        this.rootNode.allLeafChildren = newAllLeafs;
        const sibling = this.rootNode.sibling;
        if (sibling) {
            sibling.allLeafChildren = newAllLeafs;
        }

        // If not appending, mark as inserted
        if (addIndex < allLeafsLen) {
            result.rowsInserted = true;
        }

        // add new row nodes to the transaction add items
        result.rowNodeTransaction.add = newAllLeafs.slice(addIndex, addIndex + addLength);
    }

    private executeRemove(
        getRowIdFunc: GetRowIdFunc<TData> | undefined,
        rowDataTran: RowDataTransaction,
        { changedRowNodes, rowNodeTransaction }: ClientSideNodeManagerUpdateRowDataResult<TData>,
        nodesToUnselect: RowNode<TData>[]
    ): void {
        const { remove } = rowDataTran;
        if (!remove?.length) {
            return;
        }
        const removedSet = new Set<RowNode<TData>>();
        const removedResult = rowNodeTransaction.remove;
        for (let i = 0, len = remove.length; i < len; i++) {
            const rowNode = this.lookupNode(getRowIdFunc, remove[i]);
            if (!rowNode) {
                continue;
            }
            if (rowNode.isSelected()) {
                nodesToUnselect.push(rowNode);
            }
            this.deleteNode(rowNode);
            changedRowNodes.remove(rowNode);
            removedResult.push(rowNode);
            removedSet.add(rowNode);
        }
        filterRemovedNodes(this.rootNode, removedSet);
    }

    private executeUpdate(
        getRowIdFunc: GetRowIdFunc<TData> | undefined,
        rowDataTran: RowDataTransaction,
        { changedRowNodes: { adds, updates }, rowNodeTransaction }: ClientSideNodeManagerUpdateRowDataResult<TData>,
        nodesToUnselect: RowNode<TData>[]
    ): void {
        const { update } = rowDataTran;
        if (!update?.length) {
            return;
        }
        const updatedRowNodes = rowNodeTransaction.update;
        for (let i = 0, len = update.length; i < len; i++) {
            const item = update[i];
            const rowNode = this.lookupNode(getRowIdFunc, item);
            if (!rowNode) {
                continue;
            }
            rowNode.updateData(item);
            if (!rowNode.selectable && rowNode.isSelected()) {
                nodesToUnselect.push(rowNode);
            }
            updatedRowNodes.push(rowNode);
            if (!adds.has(rowNode)) {
                updates.add(rowNode);
            }
        }
    }

    protected dispatchRowDataUpdateStartedEvent(rowData?: TData[] | null): void {
        this.eventSvc.dispatchEvent({
            type: 'rowDataUpdateStarted',
            firstRowData: rowData?.length ? rowData[0] : null,
        });
    }

    protected deselect(nodesToUnselect: RowNode<TData>[]): void {
        const source = 'rowDataChanged';
        const selectionSvc = this.beans.selectionSvc;
        const selectionChanged = nodesToUnselect.length > 0;
        if (selectionChanged) {
            selectionSvc?.setNodesSelected({
                newValue: false,
                nodes: nodesToUnselect,
                suppressFinishActions: true,
                source,
            });
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

    private sanitizeAddIndex(addIndex: number): number {
        const allChildrenCount = this.rootNode.allLeafChildren?.length ?? 0;
        if (addIndex < 0 || addIndex >= allChildrenCount || Number.isNaN(addIndex)) {
            return allChildrenCount; // Append. Also for negative values, as it was historically the behavior.
        }

        // Ensure index is a whole number and not a floating point.
        // Use case: the user want to add a row in the middle, doing addIndex = array.length / 2.
        // If the array has an odd number of elements, the addIndex need to be rounded up.
        // Consider that array.slice does round up internally, but we are setting this value to node.sourceRowIndex.
        return Math.ceil(addIndex);
    }

    protected createRowNode(data: TData): RowNode<TData> {
        const node: RowNode<TData> = new RowNode<TData>(this.beans);
        node.parent = this.rootNode;
        node.level = 0;
        node.group = false;
        node.expanded = false;

        node.setDataAndId(data, String(this.nextId));

        if (this.allNodesMap[node.id!]) {
            _warn(2, { nodeId: node.id });
        }
        this.allNodesMap[node.id!] = node;

        this.nextId++;

        return node;
    }

    protected lookupNode(getRowIdFunc: ((data: any) => string) | undefined, data: TData): RowNode<TData> | null {
        if (!getRowIdFunc) {
            return lookupNodeByData(this.rootNode.allLeafChildren, data);
        }

        // find rowNode using id
        const id = getRowIdFunc({ data, level: 0 });
        const rowNode = this.allNodesMap[id];
        if (rowNode) {
            return rowNode;
        }
        _error(4, { id });
        return null;
    }
}

export const initRootNode = <TData = any>(rootNode: RowNode<TData>): RowNode<TData> => {
    rootNode.group = true;
    rootNode.level = -1;
    rootNode.id = ROOT_NODE_ID;
    rootNode.allLeafChildren = [];
    rootNode.childrenAfterGroup = [];
    rootNode.childrenAfterSort = [];
    rootNode.childrenAfterAggFilter = [];
    rootNode.childrenAfterFilter = [];

    initRootSibling(rootNode);
    return rootNode;
};

const initRootSibling = <TData = any>(rootNode: RowNode<TData>): void => {
    const sibling = rootNode.sibling;
    if (sibling) {
        sibling.childrenAfterFilter = rootNode.childrenAfterFilter;
        sibling.childrenAfterGroup = rootNode.childrenAfterGroup;
        sibling.childrenAfterAggFilter = rootNode.childrenAfterAggFilter;
        sibling.childrenAfterSort = rootNode.childrenAfterSort;
        sibling.childrenMapped = rootNode.childrenMapped;
        sibling.allLeafChildren = rootNode.allLeafChildren;
    }
};

/**
 * Finds a row node in the given array whose data matches the provided data object.
 * Returns the node if found, otherwise undefined.
 */
const lookupNodeByData = <TData>(
    allLeafChildren: RowNode<TData>[] | null | undefined,
    data: TData
): RowNode<TData> | null => {
    if (allLeafChildren) {
        for (let i = 0, len = allLeafChildren.length; i < len; i++) {
            const node = allLeafChildren[i];
            if (node.data === data) {
                return node;
            }
        }
    }
    _error(5, { data });
    return null;
};

/**
 * Adjusts addIndex for treeData scenarios (AG-6231 workaround).
 * Returns the corrected addIndex value.
 */
const adjustAddIndexForDataPath = <TData>(addIndex: number, allLeafs: RowNode<TData>[]): number => {
    for (let i = 0, len = allLeafs.length; i < len; i++) {
        const node = allLeafs[i];
        if (node?.rowIndex == addIndex - 1) {
            return i + 1;
        }
    }
    return addIndex;
};

const filterRemovedNodes = <TData>(rootNode: RowNode<TData>, removedSet: ReadonlySet<RowNode<TData>>): void => {
    if (!removedSet.size) {
        return;
    }
    const allLeafs = rootNode.allLeafChildren;
    const allLeafsLen = allLeafs?.length;
    if (!allLeafsLen) {
        return;
    }
    const newAllLeafs = new Array<RowNode<TData>>(allLeafsLen - removedSet.size);
    let writeIdx = 0;
    for (let readIdx = 0, len = allLeafsLen; readIdx < len; ++readIdx) {
        const rowNode = allLeafs[readIdx];
        if (!removedSet.has(rowNode)) {
            rowNode.sourceRowIndex = writeIdx;
            newAllLeafs[writeIdx++] = rowNode;
        }
    }
    if (writeIdx !== allLeafsLen) {
        newAllLeafs.length = writeIdx;
        rootNode.allLeafChildren = newAllLeafs;
        const sibling = rootNode.sibling;
        if (sibling) {
            sibling.allLeafChildren = newAllLeafs;
        }
    }
};
