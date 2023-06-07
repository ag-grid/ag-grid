var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
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
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
import { Autowired, Bean, BeanStub, PostConstruct, _ } from "@ag-grid-community/core";
var ImmutableService = /** @class */ (function (_super) {
    __extends(ImmutableService, _super);
    function ImmutableService() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ImmutableService.prototype.postConstruct = function () {
        if (this.rowModel.getType() === 'clientSide') {
            this.clientSideRowModel = this.rowModel;
        }
    };
    ImmutableService.prototype.isActive = function () {
        var getRowIdProvided = this.gridOptionsService.exists('getRowId');
        // this property is a backwards compatibility property, for those who want
        // the old behaviour of Row ID's but NOT Immutable Data.
        var resetRowDataOnUpdate = this.gridOptionsService.is('resetRowDataOnUpdate');
        if (resetRowDataOnUpdate) {
            return false;
        }
        return getRowIdProvided;
    };
    ImmutableService.prototype.setRowData = function (rowData) {
        var transactionAndMap = this.createTransactionForRowData(rowData);
        if (!transactionAndMap) {
            return;
        }
        var _a = __read(transactionAndMap, 2), transaction = _a[0], orderIdMap = _a[1];
        this.clientSideRowModel.updateRowData(transaction, orderIdMap);
    };
    // converts the setRowData() command to a transaction
    ImmutableService.prototype.createTransactionForRowData = function (rowData) {
        if (_.missing(this.clientSideRowModel)) {
            console.error('AG Grid: ImmutableService only works with ClientSideRowModel');
            return;
        }
        var getRowIdFunc = this.gridOptionsService.getCallback('getRowId');
        if (getRowIdFunc == null) {
            console.error('AG Grid: ImmutableService requires getRowId() callback to be implemented, your row data needs IDs!');
            return;
        }
        // convert the data into a transaction object by working out adds, removes and updates
        var transaction = {
            remove: [],
            update: [],
            add: []
        };
        var existingNodesMap = this.clientSideRowModel.getCopyOfNodesMap();
        var suppressSortOrder = this.gridOptionsService.is('suppressMaintainUnsortedOrder');
        var orderMap = suppressSortOrder ? undefined : {};
        if (_.exists(rowData)) {
            // split all the new data in the following:
            // if new, push to 'add'
            // if update, push to 'update'
            // if not changed, do not include in the transaction
            rowData.forEach(function (data, index) {
                var id = getRowIdFunc({ data: data, level: 0 });
                var existingNode = existingNodesMap[id];
                if (orderMap) {
                    orderMap[id] = index;
                }
                if (existingNode) {
                    var dataHasChanged = existingNode.data !== data;
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
        Autowired('rowRenderer')
    ], ImmutableService.prototype, "rowRenderer", void 0);
    __decorate([
        PostConstruct
    ], ImmutableService.prototype, "postConstruct", null);
    ImmutableService = __decorate([
        Bean('immutableService')
    ], ImmutableService);
    return ImmutableService;
}(BeanStub));
export { ImmutableService };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW1tdXRhYmxlU2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jbGllbnRTaWRlUm93TW9kZWwvaW1tdXRhYmxlU2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsT0FBTyxFQUNILFNBQVMsRUFDVCxJQUFJLEVBQUUsUUFBUSxFQUVkLGFBQWEsRUFFUyxDQUFDLEVBQzFCLE1BQU0seUJBQXlCLENBQUM7QUFLakM7SUFBc0Msb0NBQVE7SUFBOUM7O0lBK0ZBLENBQUM7SUF2Rlcsd0NBQWEsR0FBckI7UUFDSSxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLEtBQUssWUFBWSxFQUFFO1lBQzFDLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxJQUFJLENBQUMsUUFBOEIsQ0FBQztTQUNqRTtJQUNMLENBQUM7SUFFTSxtQ0FBUSxHQUFmO1FBQ0ksSUFBTSxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ3BFLDBFQUEwRTtRQUMxRSx3REFBd0Q7UUFDeEQsSUFBTSxvQkFBb0IsR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUMsRUFBRSxDQUFDLHNCQUFzQixDQUFDLENBQUM7UUFFaEYsSUFBSSxvQkFBb0IsRUFBRTtZQUFFLE9BQU8sS0FBSyxDQUFDO1NBQUU7UUFDM0MsT0FBTyxnQkFBZ0IsQ0FBQztJQUM1QixDQUFDO0lBRU0scUNBQVUsR0FBakIsVUFBa0IsT0FBYztRQUM1QixJQUFNLGlCQUFpQixHQUFHLElBQUksQ0FBQywyQkFBMkIsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNwRSxJQUFJLENBQUMsaUJBQWlCLEVBQUU7WUFBRSxPQUFPO1NBQUU7UUFFN0IsSUFBQSxLQUFBLE9BQTRCLGlCQUFpQixJQUFBLEVBQTVDLFdBQVcsUUFBQSxFQUFFLFVBQVUs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