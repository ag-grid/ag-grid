"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@ag-grid-community/core");
let ImmutableService = class ImmutableService extends core_1.BeanStub {
    postConstruct() {
        if (this.rowModel.getType() === core_1.Constants.ROW_MODEL_TYPE_CLIENT_SIDE) {
            this.clientSideRowModel = this.rowModel;
        }
    }
    // converts the setRowData() command to a transaction
    createTransactionForRowData(data) {
        if (core_1._.missing(this.clientSideRowModel)) {
            console.error('AG Grid: ImmutableService only works with ClientSideRowModel');
            return;
        }
        const getRowNodeIdFunc = this.gridOptionsWrapper.getRowNodeIdFunc();
        if (!getRowNodeIdFunc || core_1._.missing(getRowNodeIdFunc)) {
            console.error('AG Grid: ImmutableService requires getRowNodeId() callback to be implemented, your row data need IDs!');
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
        const orderMap = suppressSortOrder ? null : {};
        if (core_1._.exists(data)) {
            // split all the new data in the following:
            // if new, push to 'add'
            // if update, push to 'update'
            // if not changed, do not include in the transaction
            data.forEach((dataItem, index) => {
                const id = getRowNodeIdFunc(dataItem);
                const existingNode = existingNodesMap[id];
                if (orderMap) {
                    orderMap[id] = index;
                }
                if (existingNode) {
                    const dataHasChanged = existingNode.data !== dataItem;
                    if (dataHasChanged) {
                        transaction.update.push(dataItem);
                    }
                    // otherwise, if data not changed, we just don't include it anywhere, as it's not a delta
                    // remove from list, so we know the item is not to be removed
                    existingNodesMap[id] = undefined;
                }
                else {
                    transaction.add.push(dataItem);
                }
            });
        }
        // at this point, all rows that are left, should be removed
        core_1._.iterateObject(existingNodesMap, (id, rowNode) => {
            if (rowNode) {
                transaction.remove.push(rowNode.data);
            }
        });
        return [transaction, orderMap];
    }
};
__decorate([
    core_1.Autowired('rowModel')
], ImmutableService.prototype, "rowModel", void 0);
__decorate([
    core_1.PostConstruct
], ImmutableService.prototype, "postConstruct", null);
ImmutableService = __decorate([
    core_1.Bean('immutableService')
], ImmutableService);
exports.ImmutableService = ImmutableService;
//# sourceMappingURL=immutableService.js.map