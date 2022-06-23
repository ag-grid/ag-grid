import {
    Autowired,
    Bean, BeanStub, ColumnApi, Constants,
    FilterManager,
    GridApi,
    IImmutableService,
    IRowModel,
    PostConstruct,
    RowDataTransaction,
    RowNode, RowRenderer, _
} from "@ag-grid-community/core";
import { ClientSideRowModel } from "./clientSideRowModel";


@Bean('immutableService')
export class ImmutableService extends BeanStub implements IImmutableService {

    @Autowired('rowModel') private rowModel: IRowModel;
    @Autowired('rowRenderer') private rowRenderer: RowRenderer;
    @Autowired('columnApi') private columnApi: ColumnApi;
    @Autowired('gridApi') private gridApi: GridApi;
    @Autowired('filterManager') private filterManager: FilterManager;

    private clientSideRowModel: ClientSideRowModel;

    @PostConstruct
    private postConstruct(): void {
        if (this.rowModel.getType() === Constants.ROW_MODEL_TYPE_CLIENT_SIDE) {
            this.clientSideRowModel = this.rowModel as ClientSideRowModel;
        }
    }

    public isActive(): boolean {
        return this.gridOptionsWrapper.isImmutableData();
    }

    public setRowData(rowData: any[]): void {
        const transactionAndMap = this.createTransactionForRowData(rowData);
        if (!transactionAndMap) { return; }

        const [transaction, orderIdMap] = transactionAndMap;
        const nodeTransaction = this.clientSideRowModel.updateRowData(transaction, orderIdMap);
        // need to force updating of full width rows - note this wouldn't be necessary the full width cell comp listened
        // to the data change event on the row node and refreshed itself.
        if (nodeTransaction) {
            this.rowRenderer.refreshFullWidthRows(nodeTransaction.update);
        }
    }

    // converts the setRowData() command to a transaction
    private createTransactionForRowData(rowData: any[]): ([RowDataTransaction, { [id: string]: number } | undefined]) | undefined {
        if (_.missing(this.clientSideRowModel)) {
            console.error('AG Grid: ImmutableService only works with ClientSideRowModel');
            return;
        }

        const getRowIdFunc = this.gridOptionsWrapper.getRowIdFunc();
        if (getRowIdFunc == null) {
            console.error('AG Grid: ImmutableService requires getRowId() callback to be implemented, your row data needs IDs!');
            return;
        }

        // convert the data into a transaction object by working out adds, removes and updates
        const transaction: RowDataTransaction = {
            remove: [],
            update: [],
            add: []
        };

        const existingNodesMap: { [id: string]: RowNode | undefined } = this.clientSideRowModel.getCopyOfNodesMap();

        const suppressSortOrder = this.gridOptionsWrapper.isSuppressMaintainUnsortedOrder();
        const orderMap: { [id: string]: number } | undefined = suppressSortOrder ? undefined : {};

        if (_.exists(rowData)) {
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
        _.iterateObject(existingNodesMap, (id: string, rowNode: RowNode) => {
            if (rowNode) {
                transaction.remove!.push(rowNode.data);
            }
        });

        return [transaction, orderMap];
    }

}
