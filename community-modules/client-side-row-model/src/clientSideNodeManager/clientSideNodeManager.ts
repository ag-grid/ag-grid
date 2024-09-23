import type {
    ClientSideNodeManagerUpdateRowDataResult,
    IClientSideNodeManager,
    NamedBean,
    RowDataTransaction,
} from '@ag-grid-community/core';
import {
    RowNode,
    _cloneObject,
    _errorOnce,
    _exists,
    _getRowIdCallback,
    _iterateObject,
    _missingOrEmpty,
    _warnOnce,
} from '@ag-grid-community/core';

import type { ClientSideNodeManagerRootNode, ClientSideNodeManagerRowNode } from './abstractClientSideNodeManager';
import { AbstractClientSideNodeManager } from './abstractClientSideNodeManager';

const TOP_LEVEL = 0;

export class ClientSideNodeManager<TData>
    extends AbstractClientSideNodeManager<TData>
    implements IClientSideNodeManager<TData>, NamedBean
{
    beanName = 'clientSideNodeManager' as const;

    // when user is provide the id's, we also keep a map of ids to row nodes for convenience
    private allNodesMap: { [id: string]: RowNode } = {};
    private nextId = 0;

    public getRowNode(id: string): RowNode | undefined {
        return this.allNodesMap[id];
    }

    public override setRowData(rowData: TData[]): void {
        this.dispatchRowDataUpdateStartedEvent(rowData);

        const rootNode = this.rootNode;
        const sibling: ClientSideNodeManagerRootNode<TData> = this.rootNode.sibling;

        rootNode.childrenAfterFilter = null;
        rootNode.childrenAfterGroup = null;
        rootNode.childrenAfterAggFilter = null;
        rootNode.childrenAfterSort = null;
        rootNode.childrenMapped = null;
        rootNode.updateHasChildren();

        this.nextId = 0;
        this.allNodesMap = {};

        if (rowData) {
            // we use rootNode as the parent, however if using ag-grid-enterprise, the grouping stage
            // sets the parent node on each row (even if we are not grouping). so setting parent node
            // here is for benefit of ag-grid-community users
            rootNode.allLeafChildren = rowData.map((dataItem, index) =>
                this.createNode(dataItem, this.rootNode, TOP_LEVEL, index)
            );
        } else {
            rootNode.allLeafChildren = [];
            rootNode.childrenAfterGroup = [];
        }

        if (sibling) {
            sibling.childrenAfterFilter = rootNode.childrenAfterFilter;
            sibling.childrenAfterGroup = rootNode.childrenAfterGroup;
            sibling.childrenAfterAggFilter = rootNode.childrenAfterAggFilter;
            sibling.childrenAfterSort = rootNode.childrenAfterSort;
            sibling.childrenMapped = rootNode.childrenMapped;
            sibling.allLeafChildren = rootNode.allLeafChildren;
        }
    }

    public override setImmutableRowData(rowData: TData[]): ClientSideNodeManagerUpdateRowDataResult<TData> | null {
        // convert the setRowData data into a transaction object by working out adds, removes and updates

        const rowDataTransaction = this.createTransactionForRowData(rowData);
        if (!rowDataTransaction) {
            return null; // no transaction to apply
        }

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

    /** Converts the setRowData() command to a transaction */
    private createTransactionForRowData(rowData: TData[]): RowDataTransaction<TData> | null {
        const getRowIdFunc = _getRowIdCallback(this.gos);
        if (getRowIdFunc == null) {
            _errorOnce('ImmutableService requires getRowId() callback to be implemented, your row data needs IDs!');
            return null;
        }

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

    public override updateRowData(
        rowDataTran: RowDataTransaction<TData>
    ): ClientSideNodeManagerUpdateRowDataResult<TData> {
        this.dispatchRowDataUpdateStartedEvent(rowDataTran.add);

        const updateRowDataResult: ClientSideNodeManagerUpdateRowDataResult<TData> = {
            rowNodeTransaction: { remove: [], update: [], add: [] },
            rowsInserted: false,
            rowsOrderChanged: false,
        };

        const nodesToUnselect: RowNode[] = [];

        this.executeRemove(rowDataTran, updateRowDataResult, nodesToUnselect);
        this.executeUpdate(rowDataTran, updateRowDataResult, nodesToUnselect);
        this.executeAdd(rowDataTran, updateRowDataResult);

        this.updateSelection(nodesToUnselect, 'rowDataChanged');

        return updateRowDataResult;
    }

    /**
     * Used by the immutable service, after updateRowData, after updating with a generated transaction to
     * apply the order as specified by the the new data. We use sourceRowIndex to determine the order of the rows.
     * Time complexity is O(n) where n is the number of rows/rowData
     * @returns true if the order changed, otherwise false
     */
    private updateRowOrderFromRowData(rowData: TData[]): boolean {
        const rows = this.rootNode.allLeafChildren;
        const rowsLength = rows?.length ?? 0;
        const rowsOutOfOrder = new Map<TData, ClientSideNodeManagerRowNode<TData>>();
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

    private executeAdd(rowDataTran: RowDataTransaction, result: ClientSideNodeManagerUpdateRowDataResult<TData>): void {
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
                const isTreeData = this.gos.get('treeData');
                if (isTreeData) {
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
        const newNodes: RowNode[] = add!.map((item, index) =>
            this.createNode(item, this.rootNode, TOP_LEVEL, addIndex + index)
        );

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

        const sibling: ClientSideNodeManagerRootNode<TData> = this.rootNode.sibling;
        if (sibling) {
            sibling.allLeafChildren = allLeafChildren;
        }

        // add new row nodes to the transaction add items
        result.rowNodeTransaction.add = newNodes;
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

    private executeRemove(
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
            const rowNode = this.lookupRowNode(item);

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

        const sibling: ClientSideNodeManagerRootNode<TData> | null = this.rootNode.sibling;
        if (sibling) {
            sibling.allLeafChildren = this.rootNode.allLeafChildren;
        }
    }

    private executeUpdate(
        rowDataTran: RowDataTransaction,
        { rowNodeTransaction }: ClientSideNodeManagerUpdateRowDataResult<TData>,
        nodesToUnselect: RowNode[]
    ): void {
        const { update } = rowDataTran;
        if (_missingOrEmpty(update)) {
            return;
        }

        update!.forEach((item) => {
            const rowNode = this.lookupRowNode(item);

            if (!rowNode) {
                return;
            }

            rowNode.updateData(item);
            if (!rowNode.selectable && rowNode.isSelected()) {
                nodesToUnselect.push(rowNode);
            }

            this.setMasterForRow(rowNode, item, TOP_LEVEL, false);

            rowNodeTransaction.update.push(rowNode);
        });
    }

    private lookupRowNode(data: TData): RowNode | null {
        const getRowIdFunc = _getRowIdCallback(this.gos);

        let rowNode: RowNode | undefined;
        if (getRowIdFunc) {
            // find rowNode using id
            const id = getRowIdFunc({ data, level: 0 });
            rowNode = this.allNodesMap[id];
            if (!rowNode) {
                _errorOnce(`could not find row id=${id}, data item was not found for this id`);
                return null;
            }
        } else {
            // find rowNode using object references
            rowNode = this.rootNode.allLeafChildren?.find((node) => node.data === data);
            if (!rowNode) {
                _errorOnce(`could not find data item as object was not found`, data);
                _errorOnce(`Consider using getRowId to help the Grid find matching row data`);
                return null;
            }
        }

        return rowNode || null;
    }

    private createNode(dataItem: TData, parent: RowNode<TData>, level: number, sourceRowIndex: number): RowNode<TData> {
        const node: ClientSideNodeManagerRowNode<TData> = new RowNode<TData>(this.beans);
        node.sourceRowIndex = sourceRowIndex;

        node.group = false;
        this.setMasterForRow(node, dataItem, level, true);

        if (parent) {
            node.parent = parent;
        }
        node.level = level;
        node.setDataAndId(dataItem, this.nextId.toString());

        if (this.allNodesMap[node.id!]) {
            _warnOnce(
                `duplicate node id '${node.id}' detected from getRowId callback, this could cause issues in your grid.`
            );
        }
        this.allNodesMap[node.id!] = node;

        this.nextId++;

        return node;
    }
}
