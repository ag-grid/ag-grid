import type {
    BeanCollection,
    IImmutableService,
    IRowModel,
    ISelectionService,
    NamedBean,
    RowDataTransaction,
    RowNode,
} from '@ag-grid-community/core';
import {
    BeanStub,
    _errorOnce,
    _exists,
    _getRowIdCallback,
    _isClientSideRowModel,
    _iterateObject,
    _missing,
} from '@ag-grid-community/core';

import type { ClientSideRowModel } from './clientSideRowModel';

export class ImmutableService extends BeanStub implements NamedBean, IImmutableService {
    beanName = 'immutableService' as const;

    private rowModel: IRowModel;
    private selectionService: ISelectionService;

    public wireBeans(beans: BeanCollection): void {
        this.rowModel = beans.rowModel;
        this.selectionService = beans.selectionService;
    }

    private clientSideRowModel: ClientSideRowModel;

    public postConstruct(): void {
        if (_isClientSideRowModel(this.gos)) {
            this.clientSideRowModel = this.rowModel as ClientSideRowModel;

            this.addManagedPropertyListener('rowData', () => this.onRowDataUpdated());
        }
    }

    public isActive(): boolean {
        const getRowIdProvided = this.gos.exists('getRowId');
        // this property is a backwards compatibility property, for those who want
        // the old behaviour of Row ID's but NOT Immutable Data.
        const resetRowDataOnUpdate = this.gos.get('resetRowDataOnUpdate');

        if (resetRowDataOnUpdate) {
            return false;
        }
        return getRowIdProvided;
    }

    public setRowData<TData>(rowData: TData[]): void {
        // convert the setRowData data into a transaction object by working out adds, removes and updates

        const rowDataTransaction = this.createTransactionForRowData(rowData);
        if (!rowDataTransaction) {
            return; // no transaction to apply
        }

        const nodeManager = this.clientSideRowModel.getNodeManager();

        // Apply the transaction
        const { rowNodeTransaction, rowsInserted } = nodeManager.updateRowData(rowDataTransaction);

        let orderChanged = false;

        // If true, we will not apply the new order specified in the rowData, but keep the old order.
        const suppressSortOrder = this.gos.get('suppressMaintainUnsortedOrder');
        if (!suppressSortOrder) {
            // we need to reorder the nodes to match the new data order
            orderChanged = nodeManager.updateRowOrderFromRowData(rowData);
        }

        this.clientSideRowModel.afterImmutableDataChange(rowNodeTransaction, orderChanged || rowsInserted);
    }

    /** Converts the setRowData() command to a transaction */
    private createTransactionForRowData<TData>(rowData: TData[]): RowDataTransaction | null {
        if (!_isClientSideRowModel(this.gos)) {
            _errorOnce('ImmutableService only works with ClientSideRowModel');
            return null;
        }

        const getRowIdFunc = _getRowIdCallback(this.gos);
        if (getRowIdFunc == null) {
            _errorOnce('ImmutableService requires getRowId() callback to be implemented, your row data needs IDs!');
            return null;
        }

        // get a map of the existing data, that we are going to modify as we find rows to not delete
        const existingNodesMap: { [id: string]: RowNode | undefined } = this.clientSideRowModel
            .getNodeManager()
            .getCopyOfNodesMap();

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

    private onRowDataUpdated(): void {
        const rowData = this.gos.get('rowData');
        if (!rowData) {
            return;
        }

        if (this.isActive()) {
            this.setRowData(rowData);
        } else {
            this.selectionService.reset('rowDataChanged');
            this.clientSideRowModel.setRowData(rowData);
        }
    }
}
