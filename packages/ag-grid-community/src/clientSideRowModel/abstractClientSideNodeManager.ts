import { BeanStub } from '../context/beanStub';
import type { BeanCollection } from '../context/context';
import { RowNode } from '../entities/rowNode';
import type { SelectionEventSourceType } from '../events';
import { _getRowIdCallback } from '../gridOptionsUtils';
import type {
    ClientSideNodeManagerUpdateRowDataResult,
    IClientSideNodeManager,
} from '../interfaces/iClientSideNodeManager';
import type { RowDataTransaction } from '../interfaces/rowDataTransaction';
import { _exists, _missingOrEmpty } from '../utils/generic';
import { _cloneObject, _iterateObject } from '../utils/object';
import { _logError, _logWarn } from '../validation/logging';

const ROOT_NODE_ID = 'ROOT_NODE_ID';

/**
 * This is the type of any row in allLeafChildren and childrenAfterGroup of the ClientSideNodeManager rootNode.
 * ClientSideNodeManager is allowed to update the sourceRowIndex property of the nodes.
 */
interface ClientSideNodeManagerRowNode<TData> extends RowNode<TData> {
    sourceRowIndex: number;
}

/**
 * This is the type of the root RowNode of the ClientSideNodeManager
 * ClientSideNodeManager is allowed to update the allLeafChildren and childrenAfterGroup properties of the root node.
 */
interface ClientSideNodeManagerRootNode<TData> extends RowNode<TData> {
    sibling: ClientSideNodeManagerRootNode<TData>;
    allLeafChildren: ClientSideNodeManagerRowNode<TData>[] | null;
    childrenAfterGroup: ClientSideNodeManagerRowNode<TData>[] | null;
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace AbstractClientSideNodeManager {
    export type RowNode<TData> = ClientSideNodeManagerRowNode<TData>;
    export type RootNode<TData> = ClientSideNodeManagerRootNode<TData>;
}

export abstract class AbstractClientSideNodeManager<TData = any>
    extends BeanStub
    implements IClientSideNodeManager<TData>
{
    private nextId = 0;
    protected allNodesMap: { [id: string]: RowNode } = {};

    public rootNode: AbstractClientSideNodeManager.RootNode<TData>;

    protected beans: BeanCollection;

    public wireBeans(beans: BeanCollection): void {
        this.beans = beans;
    }

    public getRowNode(id: string): RowNode | undefined {
        return this.allNodesMap[id];
    }

    public extractRowData(): TData[] | null | undefined {
        return this.rootNode.allLeafChildren?.map((node) => node.data!);
    }

    public setNewRowData(rowData: TData[]): void {
        this.dispatchRowDataUpdateStartedEvent(rowData);

        const rootNode = this.rootNode;
        const sibling = this.rootNode.sibling;

        rootNode.childrenAfterFilter = null;
        rootNode.childrenAfterGroup = null;
        rootNode.childrenAfterAggFilter = null;
        rootNode.childrenAfterSort = null;
        rootNode.childrenMapped = null;
        rootNode.updateHasChildren();

        // Clear internal maps

        this.allNodesMap = {};
        this.nextId = 0;

        this.loadNewRowData(rowData);

        if (sibling) {
            sibling.childrenAfterFilter = rootNode.childrenAfterFilter;
            sibling.childrenAfterGroup = rootNode.childrenAfterGroup;
            sibling.childrenAfterAggFilter = rootNode.childrenAfterAggFilter;
            sibling.childrenAfterSort = rootNode.childrenAfterSort;
            sibling.childrenMapped = rootNode.childrenMapped;
            sibling.allLeafChildren = rootNode.allLeafChildren;
        }
    }

    protected loadNewRowData(rowData: TData[]): void {
        this.rootNode.allLeafChildren = rowData?.map((dataItem, index) => this.createRowNode(dataItem, index)) ?? [];
    }

    public setImmutableRowData(rowData: TData[]): ClientSideNodeManagerUpdateRowDataResult<TData> {
        // convert the setRowData data into a transaction object by working out adds, removes and updates

        const rowDataTransaction = this.createTransactionForRowData(rowData);

        // Apply the transaction
        const result = this.updateRowData(rowDataTransaction);

        // If true, we will not apply the new order specified in the rowData, but keep the old order.
        const suppressSortOrder = this.gos.get('suppressMaintainUnsortedOrder');
        if (!suppressSortOrder) {
            // we need to reorder the nodes to match the new data order
            result.rowsOrderChanged = this.updateRowOrderFromRowData(rowData);
        }

        return result;
    }

    public updateRowData(rowDataTran: RowDataTransaction<TData>): ClientSideNodeManagerUpdateRowDataResult<TData> {
        this.dispatchRowDataUpdateStartedEvent(rowDataTran.add);

        const updateRowDataResult: ClientSideNodeManagerUpdateRowDataResult<TData> = {
            rowNodeTransaction: { remove: [], update: [], add: [] },
            rowsInserted: false,
            rowsOrderChanged: false,
        };

        const nodesToUnselect: RowNode[] = [];

        const getRowIdFunc = _getRowIdCallback(this.gos);
        this.executeRemove(getRowIdFunc, rowDataTran, updateRowDataResult, nodesToUnselect);
        this.executeUpdate(getRowIdFunc, rowDataTran, updateRowDataResult, nodesToUnselect);
        this.executeAdd(rowDataTran, updateRowDataResult);

        this.updateSelection(nodesToUnselect, 'rowDataChanged');

        return updateRowDataResult;
    }

    /** Converts the setRowData() command to a transaction */
    private createTransactionForRowData(rowData: TData[]): RowDataTransaction<TData> {
        const getRowIdFunc = _getRowIdCallback(this.gos)!;

        // get a map of the existing data, that we are going to modify as we find rows to not delete
        const existingNodesMap: { [id: string]: RowNode | undefined } = _cloneObject(this.allNodesMap);

        const remove: TData[] = [];
        const update: TData[] = [];
        const add: TData[] = [];

        if (_exists(rowData)) {
            // split all the new data in the following:
            // if new, push to 'add'
            // if update, push to 'update'
            // if not changed, do not include in the transaction
            rowData.forEach((data: TData) => {
                const id = getRowIdFunc({ data, level: 0 });
                const existingNode = existingNodesMap[id];

                if (existingNode) {
                    const dataHasChanged = existingNode.data !== data;
                    if (dataHasChanged) {
                        update.push(data);
                    }
                    // otherwise, if data not changed, we just don't include it anywhere, as it's not a delta

                    existingNodesMap[id] = undefined; // remove from list, so we know the item is not to be removed
                } else {
                    add.push(data);
                }
            });
        }

        // at this point, all rows that are left, should be removed
        _iterateObject(existingNodesMap, (id, rowNode) => {
            if (rowNode) {
                remove.push(rowNode.data);
            }
        });

        return { remove, update, add };
    }

    /**
     * Used by setImmutableRowData, after updateRowData, after updating with a generated transaction to
     * apply the order as specified by the the new data. We use sourceRowIndex to determine the order of the rows.
     * Time complexity is O(n) where n is the number of rows/rowData
     * @returns true if the order changed, otherwise false
     */
    private updateRowOrderFromRowData(rowData: TData[]): boolean {
        const rows = this.rootNode.allLeafChildren;
        const rowsLength = rows?.length ?? 0;
        const rowsOutOfOrder = new Map<TData, AbstractClientSideNodeManager.RowNode<TData>>();
        let firstIndexOutOfOrder = -1;
        let lastIndexOutOfOrder = -1;

        // Step 1: Build the rowsOutOfOrder mapping data => row for the rows out of order, in O(n)
        for (let i = 0; i < rowsLength; ++i) {
            const row = rows![i];
            const data = row.data;
            if (data !== rowData[i]) {
                // The row is not in the correct position
                if (lastIndexOutOfOrder < 0) {
                    firstIndexOutOfOrder = i; // First row out of order was found
                }
                lastIndexOutOfOrder = i; // Last row out of order
                rowsOutOfOrder.set(data!, row); // A new row out of order was found, add it to the map
            }
        }
        if (firstIndexOutOfOrder < 0) {
            return false; // No rows out of order
        }

        // Step 2: Overwrite the rows out of order we find in the map, in O(n)
        for (let i = firstIndexOutOfOrder; i <= lastIndexOutOfOrder; ++i) {
            const row = rowsOutOfOrder.get(rowData[i]);
            if (row !== undefined) {
                rows![i] = row; // Out of order row found, overwrite it
                row.sourceRowIndex = i; // Update its position
            }
        }
        return true; // The order changed
    }

    protected executeAdd(
        rowDataTran: RowDataTransaction,
        result: ClientSideNodeManagerUpdateRowDataResult<TData>
    ): void {
        const add = rowDataTran.add;
        if (_missingOrEmpty(add)) {
            return;
        }

        const allLeafChildren = this.rootNode.allLeafChildren!;
        let addIndex = allLeafChildren.length;

        if (typeof rowDataTran.addIndex === 'number') {
            addIndex = this.sanitizeAddIndex(rowDataTran.addIndex);

            if (addIndex > 0) {
                // TODO: this code should not be here, see AG-12602
                // This was a fix for AG-6231, but is not the correct fix
                // We enable it only for trees that use getDataPath and not the new children field
                const getDataPath = this.gos.get('treeData') && this.gos.get('getDataPath');
                if (getDataPath) {
                    for (let i = 0; i < allLeafChildren.length; i++) {
                        const node = allLeafChildren[i];
                        if (node?.rowIndex == addIndex - 1) {
                            addIndex = i + 1;
                            break;
                        }
                    }
                }
            }
        }

        // create new row nodes for each data item
        const newNodes: RowNode[] = add!.map((item, index) => this.createRowNode(item, addIndex + index));

        if (addIndex < allLeafChildren.length) {
            // Insert at the specified index

            const nodesBeforeIndex = allLeafChildren.slice(0, addIndex);
            const nodesAfterIndex = allLeafChildren.slice(addIndex, allLeafChildren.length);

            // update latter row indexes
            const nodesAfterIndexFirstIndex = nodesBeforeIndex.length + newNodes.length;
            for (let index = 0, length = nodesAfterIndex.length; index < length; ++index) {
                nodesAfterIndex[index].sourceRowIndex = nodesAfterIndexFirstIndex + index;
            }

            this.rootNode.allLeafChildren = [...nodesBeforeIndex, ...newNodes, ...nodesAfterIndex];

            // Mark the result as rows inserted
            result.rowsInserted = true;
        } else {
            // Just append at the end
            this.rootNode.allLeafChildren = allLeafChildren.concat(newNodes);
        }

        const sibling = this.rootNode.sibling;
        if (sibling) {
            sibling.allLeafChildren = allLeafChildren;
        }

        // add new row nodes to the transaction add items
        result.rowNodeTransaction.add = newNodes;
    }

    protected executeRemove(
        getRowIdFunc: ((data: any) => string) | undefined,
        rowDataTran: RowDataTransaction,
        { rowNodeTransaction }: ClientSideNodeManagerUpdateRowDataResult<TData>,
        nodesToUnselect: RowNode[]
    ): void {
        const { remove } = rowDataTran;

        if (_missingOrEmpty(remove)) {
            return;
        }

        const rowIdsRemoved: { [key: string]: boolean } = {};

        remove!.forEach((item) => {
            const rowNode = this.lookupRowNode(getRowIdFunc, item);

            if (!rowNode) {
                return;
            }

            // do delete - setting 'suppressFinishActions = true' to ensure EVENT_SELECTION_CHANGED is not raised for
            // each row node updated, instead it is raised once by the calling code if any selected nodes exist.
            if (rowNode.isSelected()) {
                nodesToUnselect.push(rowNode);
            }

            // so row renderer knows to fade row out (and not reposition it)
            rowNode.clearRowTopAndRowIndex();

            // NOTE: were we could remove from allLeaveChildren, however removeFromArray() is expensive, especially
            // if called multiple times (eg deleting lots of rows) and if allLeafChildren is a large list
            rowIdsRemoved[rowNode.id!] = true;
            // removeFromArray(this.rootNode.allLeafChildren, rowNode);
            delete this.allNodesMap[rowNode.id!];

            rowNodeTransaction.remove.push(rowNode);
        });

        this.rootNode.allLeafChildren =
            this.rootNode.allLeafChildren?.filter((rowNode) => !rowIdsRemoved[rowNode.id!]) ?? null;

        // after rows have been removed, all following rows need the position index updated
        this.rootNode.allLeafChildren?.forEach((node, idx) => {
            node.sourceRowIndex = idx;
        });

        const sibling = this.rootNode.sibling;
        if (sibling) {
            sibling.allLeafChildren = this.rootNode.allLeafChildren;
        }
    }

    protected executeUpdate(
        getRowIdFunc: ((data: any) => string) | undefined,
        rowDataTran: RowDataTransaction,
        { rowNodeTransaction }: ClientSideNodeManagerUpdateRowDataResult<TData>,
        nodesToUnselect: RowNode[]
    ): void {
        const { update } = rowDataTran;
        if (_missingOrEmpty(update)) {
            return;
        }

        update!.forEach((item) => {
            const rowNode = this.lookupRowNode(getRowIdFunc, item);

            if (!rowNode) {
                return;
            }

            rowNode.updateData(item);
            if (!rowNode.selectable && rowNode.isSelected()) {
                nodesToUnselect.push(rowNode);
            }

            rowNodeTransaction.update.push(rowNode);
        });
    }

    public deactivate(): void {
        if (this.rootNode) {
            this.setNewRowData([]);
            this.rootNode = null!;
        }
    }

    public activate(rootRowNode: RowNode<TData>): void {
        const rootNode = rootRowNode as ClientSideNodeManagerRootNode<TData>;

        this.rootNode = rootNode;

        if (rootNode) {
            rootNode.group = true;
            rootNode.level = -1;
            rootNode.id = ROOT_NODE_ID;
            rootNode.allLeafChildren = [];
            rootNode.childrenAfterGroup = [];
            rootNode.childrenAfterSort = [];
            rootNode.childrenAfterAggFilter = [];
            rootNode.childrenAfterFilter = [];
        }
    }

    protected dispatchRowDataUpdateStartedEvent(rowData?: TData[] | null): void {
        this.eventService.dispatchEvent({
            type: 'rowDataUpdateStarted',
            firstRowData: rowData?.length ? rowData[0] : null,
        });
    }

    protected updateSelection(nodesToUnselect: RowNode<TData>[], source: SelectionEventSourceType): void {
        const selectionService = this.beans.selectionService;
        const selectionChanged = nodesToUnselect.length > 0;
        if (selectionChanged) {
            selectionService?.setNodesSelected({
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
        selectionService?.updateGroupsFromChildrenSelections?.(source);

        if (selectionChanged) {
            this.eventService.dispatchEvent({
                type: 'selectionChanged',
                source: source,
            });
        }
    }

    protected isExpanded(level: number): boolean {
        const expandByDefault = this.gos.get('groupDefaultExpanded');
        if (expandByDefault === -1) {
            return true;
        }
        return level < expandByDefault;
    }

    protected sanitizeAddIndex(addIndex: number): number {
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

    protected createRowNode(dataItem: TData, sourceRowIndex: number): RowNode<TData> {
        const node: ClientSideNodeManagerRowNode<TData> = new RowNode<TData>(this.beans);
        node.parent = this.rootNode;
        node.level = 0;
        node.group = false;
        node.master = false;
        node.expanded = false;
        node.sourceRowIndex = sourceRowIndex;

        node.setDataAndId(dataItem, String(this.nextId));

        if (this.allNodesMap[node.id!]) {
            _logWarn(2, { nodeId: node.id });
        }
        this.allNodesMap[node.id!] = node;

        this.nextId++;

        return node;
    }

    protected lookupRowNode(getRowIdFunc: ((data: any) => string) | undefined, data: TData): RowNode | null {
        let rowNode: RowNode | undefined;
        if (getRowIdFunc) {
            // find rowNode using id
            const id = getRowIdFunc({ data, level: 0 });
            rowNode = this.allNodesMap[id];
            if (!rowNode) {
                _logError(4, { id });
                return null;
            }
        } else {
            // find rowNode using object references
            rowNode = this.rootNode.allLeafChildren?.find((node) => node.data === data);
            if (!rowNode) {
                _logError(5, { data });
                return null;
            }
        }

        return rowNode || null;
    }
}
