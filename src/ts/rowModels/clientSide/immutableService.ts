import {Autowired, Bean, PostConstruct} from "../../context/context";
import {ClientSideRowModel, RowDataTransaction} from "./clientSideRowModel";
import {IRowModel} from "../../interfaces/iRowModel";
import {Constants} from "../../constants";
import {_} from "../../utils";
import {GridOptionsWrapper} from "../../gridOptionsWrapper";
import {RowNode} from "../../entities/rowNode";

@Bean('immutableService')
export class ImmutableService {

    @Autowired('rowModel') private rowModel: IRowModel;
    @Autowired('gridOptionsWrapper') private gridOptionsWrapper: GridOptionsWrapper;

    private clientSideRowModel: ClientSideRowModel;

    @PostConstruct
    private postConstruct(): void {
        if (this.rowModel.getType()===Constants.ROW_MODEL_TYPE_CLIENT_SIDE) {
            this.clientSideRowModel = <ClientSideRowModel> this.rowModel;
        }
    }

    // converts the setRowData() command to a transaction
    public createTransactionForRowData(data: any[]): [RowDataTransaction, {[id:string]: number}] {

        if (_.missing(this.clientSideRowModel)) {
            console.error('ag-Grid: ImmutableService only works with ClientSideRowModel');
            return;
        }

        let getRowNodeIdFunc = this.gridOptionsWrapper.getRowNodeIdFunc();
        if (_.missing(getRowNodeIdFunc)) {
            console.error('ag-Grid: ImmutableService requires getRowNodeId() callback to be implemented, your row data need IDs!');
            return;
        }

        // convert the data into a transaction object by working out adds, removes and updates
        let transaction: RowDataTransaction = {
            remove: [],
            update: [],
            add: []
        };

        let existingNodesMap: {[id:string]: RowNode} = this.clientSideRowModel.getCopyOfNodesMap();

        let orderMap: {[id:string]: number} = {};

        if (_.exists(data)) {
            // split all the new data in the following:
            // if new, push to 'add'
            // if update, push to 'update'
            // if not changed, do not include in the transaction
            data.forEach( (dataItem: any, index: number) => {
                let id: string = getRowNodeIdFunc(dataItem);
                let existingNode: RowNode = existingNodesMap[id];

                orderMap[id] = index;

                if (existingNode) {
                    let dataHasChanged = existingNode.data !== dataItem;
                    if (dataHasChanged) {
                        transaction.update.push(dataItem);
                    }
                    // otherwise, if data not changed, we just don't include it anywhere, as it's not a delta

                    // remove from list, so we know the item is not to be removed
                    existingNodesMap[id] = undefined;
                } else {
                    transaction.add.push(dataItem);
                }
            });
        }

        // at this point, all rows that are left, should be removed
        _.iterateObject(existingNodesMap, (id: string, rowNode: RowNode)=> {
            if (rowNode) {
                transaction.remove.push(rowNode.data);
            }
        });

        return [transaction, orderMap];
    }

}