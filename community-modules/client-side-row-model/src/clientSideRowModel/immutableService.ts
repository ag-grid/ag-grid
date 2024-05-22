import {
    Autowired,
    Bean,
    BeanStub,
    IImmutableService,
    IRowModel,
    ISelectionService,
    RowDataTransaction,
    RowNode,
    RowRenderer,
    _exists,
    _iterateObject,
    _missing,
} from '@ag-grid-community/core';

import { ClientSideRowModel } from './clientSideRowModel';

@Bean('immutableService')
export class ImmutableService extends BeanStub implements IImmutableService {
    @Autowired('rowModel') private rowModel: IRowModel;
    @Autowired('rowRenderer') private rowRenderer: RowRenderer;
    @Autowired('selectionService') private selectionService: ISelectionService;

    private clientSideRowModel: ClientSideRowModel;

    public override postConstruct(): void {
        super.postConstruct();
        if (this.rowModel.getType() === 'clientSide') {
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
            console.error('AG Grid: ImmutableService only works with ClientSideRowModel');
            return;
        }

        const getRowIdFunc = this.gos.getCallback('getRowId');
        if (getRowIdFunc == null) {
            console.error(
                'AG Grid: ImmutableService requires getRowId() callback to be implemented, your row data needs IDs!'
            );
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
                const id: string = getRowIdFunc({ data, level: 0 });
                const existingNode: RowNode | undefined = existingNodesMap[id];

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
        _iterateObject(existingNodesMap, (id: string, rowNode: RowNode) => {
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
