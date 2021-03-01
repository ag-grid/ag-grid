var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { _, Autowired, Bean, Constants, PostConstruct, BeanStub } from "@ag-grid-community/core";
var ImmutableService = /** @class */ (function (_super) {
    __extends(ImmutableService, _super);
    function ImmutableService() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ImmutableService.prototype.postConstruct = function () {
        if (this.rowModel.getType() === Constants.ROW_MODEL_TYPE_CLIENT_SIDE) {
            this.clientSideRowModel = this.rowModel;
        }
    };
    // converts the setRowData() command to a transaction
    ImmutableService.prototype.createTransactionForRowData = function (data) {
        if (_.missing(this.clientSideRowModel)) {
            console.error('AG Grid: ImmutableService only works with ClientSideRowModel');
            return;
        }
        var getRowNodeIdFunc = this.gridOptionsWrapper.getRowNodeIdFunc();
        if (!getRowNodeIdFunc || _.missing(getRowNodeIdFunc)) {
            console.error('AG Grid: ImmutableService requires getRowNodeId() callback to be implemented, your row data need IDs!');
            return;
        }
        // convert the data into a transaction object by working out adds, removes and updates
        var transaction = {
            remove: [],
            update: [],
            add: []
        };
        var existingNodesMap = this.clientSideRowModel.getCopyOfNodesMap();
        var suppressSortOrder = this.gridOptionsWrapper.isSuppressMaintainUnsortedOrder();
        var orderMap = suppressSortOrder ? null : {};
        if (_.exists(data)) {
            // split all the new data in the following:
            // if new, push to 'add'
            // if update, push to 'update'
            // if not changed, do not include in the transaction
            data.forEach(function (dataItem, index) {
                var id = getRowNodeIdFunc(dataItem);
                var existingNode = existingNodesMap[id];
                if (orderMap) {
                    orderMap[id] = index;
                }
                if (existingNode) {
                    var dataHasChanged = existingNode.data !== dataItem;
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
        _.iterateObject(existingNodesMap, function (id, rowNode) {
            if (rowNode) {
                transaction.remove.push(rowNode.data);
            }
        });
        return [transaction, orderMap];
    };
    __decorate([
        Autowired('rowModel')
    ], ImmutableService.prototype, "rowModel", void 0);
    __decorate([
        PostConstruct
    ], ImmutableService.prototype, "postConstruct", null);
    ImmutableService = __decorate([
        Bean('immutableService')
    ], ImmutableService);
    return ImmutableService;
}(BeanStub));
export { ImmutableService };
