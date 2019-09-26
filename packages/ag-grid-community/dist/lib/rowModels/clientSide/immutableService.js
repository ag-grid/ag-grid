/**
 * ag-grid-community - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v21.2.2
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var context_1 = require("../../context/context");
var constants_1 = require("../../constants");
var gridOptionsWrapper_1 = require("../../gridOptionsWrapper");
var utils_1 = require("../../utils");
var ImmutableService = /** @class */ (function () {
    function ImmutableService() {
    }
    ImmutableService.prototype.postConstruct = function () {
        if (this.rowModel.getType() === constants_1.Constants.ROW_MODEL_TYPE_CLIENT_SIDE) {
            this.clientSideRowModel = this.rowModel;
        }
    };
    // converts the setRowData() command to a transaction
    ImmutableService.prototype.createTransactionForRowData = function (data) {
        if (utils_1._.missing(this.clientSideRowModel)) {
            console.error('ag-Grid: ImmutableService only works with ClientSideRowModel');
            return;
        }
        var getRowNodeIdFunc = this.gridOptionsWrapper.getRowNodeIdFunc();
        if (!getRowNodeIdFunc || utils_1._.missing(getRowNodeIdFunc)) {
            console.error('ag-Grid: ImmutableService requires getRowNodeId() callback to be implemented, your row data need IDs!');
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
        if (utils_1._.exists(data)) {
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
        utils_1._.iterateObject(existingNodesMap, function (id, rowNode) {
            if (rowNode) {
                transaction.remove.push(rowNode.data);
            }
        });
        return [transaction, orderMap];
    };
    __decorate([
        context_1.Autowired('rowModel'),
        __metadata("design:type", Object)
    ], ImmutableService.prototype, "rowModel", void 0);
    __decorate([
        context_1.Autowired('gridOptionsWrapper'),
        __metadata("design:type", gridOptionsWrapper_1.GridOptionsWrapper)
    ], ImmutableService.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        context_1.PostConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], ImmutableService.prototype, "postConstruct", null);
    ImmutableService = __decorate([
        context_1.Bean('immutableService')
    ], ImmutableService);
    return ImmutableService;
}());
exports.ImmutableService = ImmutableService;
