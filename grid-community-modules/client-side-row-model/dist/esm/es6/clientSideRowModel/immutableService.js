var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Autowired, Bean, BeanStub, PostConstruct, _ } from "@ag-grid-community/core";
let ImmutableService = class ImmutableService extends BeanStub {
    postConstruct() {
        if (this.rowModel.getType() === 'clientSide') {
            this.clientSideRowModel = this.rowModel;
        }
    }
    isActive() {
        // we used to have a property immutableData for this. however this was deprecated
        // in favour of having Immutable Data on by default when getRowId is provided
        const getRowIdProvided = this.gridOptionsService.exists('getRowId');
        const immutableData = this.gridOptionsService.is('immutableData');
        // this property is a backwards compatibility property, for those who want
        // the old behaviour of Row ID's but NOT Immutable Data.
        const resetRowDataOnUpdate = this.gridOptionsService.is('resetRowDataOnUpdate');
        if (resetRowDataOnUpdate) {
            return false;
        }
        return getRowIdProvided || immutableData;
    }
    setRowData(rowData) {
        const transactionAndMap = this.createTransactionForRowData(rowData);
        if (!transactionAndMap) {
            return;
        }
        const [transaction, orderIdMap] = transactionAndMap;
        this.clientSideRowModel.updateRowData(transaction, orderIdMap);
    }
    // converts the setRowData() command to a transaction
    createTransactionForRowData(rowData) {
        if (_.missing(this.clientSideRowModel)) {
            console.error('AG Grid: ImmutableService only works with ClientSideRowModel');
            return;
        }
        const getRowIdFunc = this.gridOptionsService.getRowIdFunc();
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
        const suppressSortOrder = this.gridOptionsService.is('suppressMaintainUnsortedOrder');
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
    PostConstruct
], ImmutableService.prototype, "postConstruct", null);
ImmutableService = __decorate([
    Bean('immutableService')
], ImmutableService);
export { ImmutableService };
