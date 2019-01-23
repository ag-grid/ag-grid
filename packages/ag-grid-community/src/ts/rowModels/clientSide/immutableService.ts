import { Autowired, Bean, PostConstruct } from "../../context/context";
import { ClientSideRowModel, RowDataTransaction } from "./clientSideRowModel";
import { IRowModel } from "../../interfaces/iRowModel";
import { Constants } from "../../constants";
import { GridOptionsWrapper } from "../../gridOptionsWrapper";
import { RowNode } from "../../entities/rowNode";
import { _ } from "../../utils";

@Bean('immutableService')
export class ImmutableService {

    @Autowired('rowModel') private rowModel: IRowModel;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;

    private clientSideRowModel: ClientSideRowModel;

    @PostConstruct
    private postConstruct(): void {
        if (this.rowModel.getType() === Constants.ROW_MODEL_TYPE_CLIENT_SIDE) {
            this.clientSideRowModel = this.rowModel as ClientSideRowModel;
        }
    }

    // converts the setRowData() command to a transaction
    public createTransactionForRowData(data: any[]): ([RowDataTransaction, { [id: string]: number }]) | undefined {

        if (_.missing(this.clientSideRowModel)) {
            console.error('ag-Grid: ImmutableService only works with ClientSideRowModel');
            return;
        }

        const getRowNodeIdFunc = this.gridOptionsWrapper.getRowNodeIdFunc();
        if (!getRowNodeIdFunc || _.missing(getRowNodeIdFunc)) {
            console.error('ag-Grid: ImmutableService requires getRowNodeId() callback to be implemented, your row data need IDs!');
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
        const orderMap: { [id: string]: number } = suppressSortOrder ? null : {};

        if (_.exists(data)) {
            // split all the new data in the following:
            // if new, push to 'add'
            // if update, push to 'update'
            // if not changed, do not include in the transaction
            data.forEach((dataItem: any, index: number) => {
                const id: string = getRowNodeIdFunc(dataItem);
                const existingNode: RowNode | undefined = existingNodesMap[id];

                if (orderMap) {
                    orderMap[id] = index;
                }

                if (existingNode) {
                    const dataHasChanged = existingNode.data !== dataItem;
                    if (dataHasChanged) {
                        transaction.update!.push(dataItem);
                    }
                    // otherwise, if data not changed, we just don't include it anywhere, as it's not a delta

                    // remove from list, so we know the item is not to be removed
                    existingNodesMap[id] = undefined;
                } else {
                    transaction.add!.push(dataItem);
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