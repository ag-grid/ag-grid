var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Autowired, Bean, BeanStub, Constants, PostConstruct, _ } from "@ag-grid-community/core";
let ImmutableService = class ImmutableService extends BeanStub {
    postConstruct() {
        if (this.rowModel.getType() === Constants.ROW_MODEL_TYPE_CLIENT_SIDE) {
            this.clientSideRowModel = this.rowModel;
        }
    }
    isActive() {
        return this.gridOptionsWrapper.isImmutableData();
    }
    setRowData(rowData) {
        const transactionAndMap = this.createTransactionForRowData(rowData);
        if (!transactionAndMap) {
            return;
        }
        const [transaction, orderIdMap] = transactionAndMap;
        const nodeTransaction = this.clientSideRowModel.updateRowData(transaction, orderIdMap);
        // need to force updating of full width rows - note this wouldn't be necessary the full width cell comp listened
        // to the data change event on the row node and refreshed itself.
        if (nodeTransaction) {
            this.rowRenderer.refreshFullWidthRows(nodeTransaction.update);
        }
    }
    // converts the setRowData() command to a transaction
    createTransactionForRowData(rowData) {
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
        const transaction = {
            remove: [],
            update: [],
            add: []
        };
        const existingNodesMap = this.clientSideRowModel.getCopyOfNodesMap();
        const suppressSortOrder = this.gridOptionsWrapper.isSuppressMaintainUnsortedOrder();
        const orderMap = suppressSortOrder ? undefined : {};
        if (_.exists(rowData)) {
            // split all the new data in the following:
            // if new, push to 'add'
            // if update, push to 'update'
            // if not changed, do not include in the transaction
            rowData.forEach((data, index) => {
                const id = getRowIdFunc({ data, level: 0 });
                const existingNode = existingNodesMap[id];
                if (orderMap) {
                    orderMap[id] = index;
                }
                if (existingNode) {
                    const dataHasChanged = existingNode.data !== data;
                    if (dataHasChanged) {
                        transaction.update.push(data);
                    }
                    // otherwise, if data not changed, we just don't include it anywhere, as it's not a delta
                    // remove from list, so we know the item is not to be removed
                    existingNodesMap[id] = undefined;
                }
                else {
                    transaction.add.push(data);
                }
            });
        }
        // at this point, all rows that are left, should be removed
        _.iterateObject(existingNodesMap, (id, rowNode) => {
            if (rowNode) {
                transaction.remove.push(rowNode.data);
            }
        });
        return [transaction, orderMap];
    }
};
__decorate([
    Autowired('rowModel')
], ImmutableService.prototype, "rowModel", void 0);
__decorate([
    Autowired('rowRenderer')
], ImmutableService.prototype, "rowRenderer", void 0);
__decorate([
    Autowired('columnApi')
], ImmutableService.prototype, "columnApi", void 0);
__decorate([
    Autowired('gridApi')
], ImmutableService.prototype, "gridApi", void 0);
__decorate([
    Autowired('filterManager')
], ImmutableService.prototype, "filterManager", void 0);
__decorate([
    PostConstruct
], ImmutableService.prototype, "postConstruct", null);
ImmutableService = __decorate([
    Bean('immutableService')
], ImmutableService);
export { ImmutableService };
