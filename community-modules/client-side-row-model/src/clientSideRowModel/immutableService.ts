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

    public setRowData(rowData: any[]): void {
        const transactionAndMap = this.createTransactionForRowData(rowData);
        if (!transactionAndMap) {
            return;
        }

        const [transaction, orderIdMap] = transactionAndMap;
        this.clientSideRowModel.updateRowData(transaction, orderIdMap);
    }

    // converts the setRowData() command to a transaction
    private createTransactionForRowData(
        rowData: any[]
    ): [RowDataTransaction, { [id: string]: number } | undefined] | undefined {
        if (_missing(this.clientSideRowModel)) {
            _errorOnce('ImmutableService only works with ClientSideRowModel');
            return;
        }

        const getRowIdFunc = _getRowIdCallback(this.gos);
        if (getRowIdFunc == null) {
            _errorOnce('ImmutableService requires getRowId() callback to be implemented, your row data needs IDs!');
            return;
        }

        // convert the data into a transaction object by working out adds, removes and updates
        const transaction: RowDataTransaction = {
            remove: [],
            update: [],
            add: [],
        };

        const existingNodesMap: { [id: string]: RowNode | undefined } = this.clientSideRowModel.getCopyOfNodesMap();

        const suppressSortOrder = this.gos.get('suppressMaintainUnsortedOrder');
        const orderMap: { [id: string]: number } | undefined = suppressSortOrder ? undefined : {};

        if (_exists(rowData)) {
            // split all the new data in the following:
            // if new, push to 'add'
            // if update, push to 'update'
            // if not changed, do not include in the transaction
            rowData.forEach((data: any, index: number) => {
                const id = getRowIdFunc({ data, level: 0 });
                const existingNode = existingNodesMap[id];

                if (orderMap) {
                    orderMap[id] = index;
                }

                if (existingNode) {
                    const dataHasChanged = existingNode.data !== data;
                    if (dataHasChanged) {
                        transaction.update!.push(data);
                    }
                    // otherwise, if data not changed, we just don't include it anywhere, as it's not a delta

                    // remove from list, so we know the item is not to be removed
                    existingNodesMap[id] = undefined;
                } else {
                    transaction.add!.push(data);
                }
            });
        }

        // at this point, all rows that are left, should be removed
        _iterateObject(existingNodesMap, (id, rowNode) => {
            if (rowNode) {
                transaction.remove!.push(rowNode.data);
            }
        });

        return [transaction, orderMap];
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
