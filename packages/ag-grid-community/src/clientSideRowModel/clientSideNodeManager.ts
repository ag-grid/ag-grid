import { BeanStub } from '../context/beanStub';
import type { GetRowIdFunc } from '../entities/gridOptions';
import { RowNode } from '../entities/rowNode';
import { _getRowIdCallback } from '../gridOptionsUtils';
import type { IChangedRowNodes, RefreshModelParams } from '../interfaces/iClientSideRowModel';
import type { RowDataTransaction } from '../interfaces/rowDataTransaction';
import type { RowNodeTransaction } from '../interfaces/rowNodeTransaction';
import { _error, _warn } from '../validation/logging';

export interface ClientSideNodeManagerUpdateRowDataResult<TData = any> {
    changedRowNodes: IChangedRowNodes<TData>;

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

    public activate?(): void;

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
            result[i] = this.createRowNode(rowData[i], i);
        }
        return result;
    }

    public setImmutableRowData(params: RefreshModelParams<TData>, rowData: TData[]): void {
        const getRowIdFunc = _getRowIdCallback(this.gos)!;
        const reorder = !this.gos.get('suppressMaintainUnsortedOrder');
        const processedNodes = new Set<RowNode<TData>>();
        const rootNode = this.rootNode;
        const oldAllLeafChildren = rootNode.allLeafChildren!;
        const oldAllLeafChildrenLen = oldAllLeafChildren.length;

        let nodesAdded = false;
        let nodesRemoved = false;
        let nodesUpdated = false;
        let orderChanged = false;
        const changedRowNodes = params.changedRowNodes!;
        const { adds, updates } = changedRowNodes;
        for (let i = 0, prevSourceRowIndex = -1, len = rowData.length; i < len; i++) {
            const data = rowData[i];
            let node: RowNode<TData> | undefined = this.getRowNode(getRowIdFunc({ data, level: 0 }));
            if (!node) {
                nodesAdded = true;
                node = this.createRowNode(data, -1);
                adds.add(node);
            } else {
                if (reorder) {
                    const sourceRowIndex = node.sourceRowIndex;
                    orderChanged ||=
                        sourceRowIndex <= prevSourceRowIndex || // A node was moved up, so order changed
                        nodesAdded; // A node was inserted not at the end
                    prevSourceRowIndex = sourceRowIndex;
                }
                if (node.data !== data) {
                    nodesUpdated = true;
                    node.updateData(data);
                    if (!adds.has(node)) {
                        updates.add(node);
                    }
                }
            }
            processedNodes.add(node);
        }

        // Destroy the remaining unprocessed node and collect the removed that were selected.
        const nodesToUnselect: RowNode<TData>[] = [];
        for (let i = 0; i < oldAllLeafChildrenLen; i++) {
            const node = oldAllLeafChildren[i];
            if (!processedNodes.has(node)) {
                nodesRemoved = true;
                if (node.isSelected()) {
                    nodesToUnselect.push(node);
                }
                if (node.pinnedSibling) {
                    this.beans.pinnedRowModel?.pinRow(node.pinnedSibling, null);
                }
                this.rowNodeDeleted(node);
                changedRowNodes.remove(node);
            }
        }

        if (nodesAdded || nodesRemoved || orderChanged) {
            const newAllLeafChildren = new Array<RowNode<TData>>(processedNodes.size); // Preallocate
            let writeIdx = 0;
            if (!reorder) {
                // All the old nodes will be in the new array in the order they were in the old array
                // At the end of this loop, processedNodes will contain only the new appended nodes
                for (let i = 0; i < oldAllLeafChildrenLen; ++i) {
                    const node = oldAllLeafChildren[i];
                    if (processedNodes.delete(node)) {
                        node.sourceRowIndex = writeIdx;
                        newAllLeafChildren[writeIdx++] = node;
                    }
                }
            }

            for (const node of processedNodes) {
                node.sourceRowIndex = writeIdx;
                newAllLeafChildren[writeIdx++] = node;
            }

            rootNode.allLeafChildren = newAllLeafChildren;
            const sibling = rootNode.sibling;
            if (sibling) {
                sibling.allLeafChildren = newAllLeafChildren;
            }
            params.rowNodesOrderChanged ||= orderChanged;
        }

        if (nodesAdded || nodesRemoved || orderChanged || nodesUpdated) {
            this.deselectNodes(nodesToUnselect);
            params.rowDataUpdated = true;
        }
    }

    /** Called when a node needs to be deleted */
    protected rowNodeDeleted(node: RowNode<TData>): void {
        node.clearRowTopAndRowIndex(); // so row renderer knows to fade row out (and not reposition it)
        const id = node.id!;
        const allNodesMap = this.allNodesMap;
        if (allNodesMap[id] === node) {
            delete allNodesMap[id];
        }
    }

    public updateRowData(
        rowDataTran: RowDataTransaction<TData>,
        changedRowNodes: IChangedRowNodes<TData>
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

        this.deselectNodes(nodesToUnselect);

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
            const node = this.createRowNode(add[i], writeIdx);
            adds.add(node);
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
        const removeRowNodes = rowNodeTransaction.remove;
        for (let i = 0, len = remove.length; i < len; i++) {
            const rowNode = this.lookupRowNode(getRowIdFunc, remove[i]);
            if (!rowNode) {
                continue;
            }
            if (rowNode.isSelected()) {
                nodesToUnselect.push(rowNode);
            }
            if (rowNode.pinnedSibling) {
                this.beans.pinnedRowModel?.pinRow(rowNode.pinnedSibling, null);
            }
            this.rowNodeDeleted(rowNode);
            changedRowNodes.remove(rowNode);
            removeRowNodes.push(rowNode);
            removedSet.add(rowNode);
        }
        if (!removedSet.size) {
            return;
        }
        const allLeafs = this.rootNode.allLeafChildren;
        const allLeafsLen = allLeafs?.length ?? 0;
        if (!allLeafsLen) {
            return;
        }
        const newAllLeafs = new Array<RowNode<TData>>(allLeafsLen - removedSet.size);
        let writeIdx = 0;
        for (let readIdx = 0, len = allLeafsLen; readIdx < len; ++readIdx) {
            const rowNode = allLeafs![readIdx];
            if (!removedSet.has(rowNode)) {
                rowNode.sourceRowIndex = writeIdx;
                newAllLeafs[writeIdx++] = rowNode;
            }
        }
        if (writeIdx !== allLeafsLen) {
            newAllLeafs.length = writeIdx;
            this.rootNode.allLeafChildren = newAllLeafs;
            const sibling = this.rootNode.sibling;
            if (sibling) {
                sibling.allLeafChildren = newAllLeafs;
            }
        }
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
            const rowNode = this.lookupRowNode(getRowIdFunc, item);
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

    protected deselectNodes(nodesToUnselect: RowNode<TData>[]): void {
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

    protected createRowNode(data: TData, sourceRowIndex: number): RowNode<TData> {
        const node: RowNode<TData> = new RowNode<TData>(this.beans);
        node.parent = this.rootNode;
        node.level = 0;
        node.group = false;
        node.expanded = false;
        node.sourceRowIndex = sourceRowIndex;

        node.setDataAndId(data, String(this.nextId));

        if (this.allNodesMap[node.id!]) {
            _warn(2, { nodeId: node.id });
        }
        this.allNodesMap[node.id!] = node;

        this.nextId++;

        return node;
    }

    protected lookupRowNode(getRowIdFunc: ((data: any) => string) | undefined, data: TData): RowNode<TData> | null {
        if (!getRowIdFunc) {
            return lookupRowNodeByData(this.rootNode.allLeafChildren, data);
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
const lookupRowNodeByData = <TData>(
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
