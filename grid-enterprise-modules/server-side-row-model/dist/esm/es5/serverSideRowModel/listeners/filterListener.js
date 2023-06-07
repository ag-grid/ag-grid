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
import { Autowired, Bean, BeanStub, Events, PostConstruct } from "@ag-grid-community/core";
var FilterListener = /** @class */ (function (_super) {
    __extends(FilterListener, _super);
    function FilterListener() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    FilterListener.prototype.postConstruct = function () {
        // only want to be active if SSRM active, otherwise would be interfering with other row models
        if (!this.gridOptionsService.isRowModelType('serverSide')) {
            return;
        }
        this.addManagedListener(this.eventService, Events.EVENT_FILTER_CHANGED, this.onFilterChanged.bind(this));
    };
    FilterListener.prototype.onFilterChanged = function () {
        var storeParams = this.serverSideRowModel.getParams();
        if (!storeParams) {
            return;
        } // params is undefined if no datasource set
        var newModel = this.filterManager.getFilterModel();
        var oldModel = storeParams ? storeParams.filterModel : {};
        var changedColumns = this.findChangedColumns(newModel, oldModel);
        var valueColChanged = this.listenerUtils.isSortingWithValueColumn(changedColumns);
        var secondaryColChanged = this.listenerUtils.isSortingWithSecondaryColumn(changedColumns);
        var params = {
            valueColChanged: valueColChanged,
            secondaryColChanged: secondaryColChanged,
            changedColumns: changedColumns
        };
        this.serverSideRowModel.refreshAfterFilter(newModel, params);
    };
    FilterListener.prototype.findChangedColumns = function (oldModel, newModel) {
        var allColKeysMap = {};
        Object.keys(oldModel).forEach(function (key) { return allColKeysMap[key] = true; });
        Object.keys(newModel).forEach(function (key) { return allColKeysMap[key] = true; });
        var res = [];
        Object.keys(allColKeysMap).forEach(function (key) {
            var oldJson = JSON.stringify(oldModel[key]);
            var newJson = JSON.stringify(newModel[key]);
            var filterChanged = oldJson != newJson;
            if (filterChanged) {
                res.push(key);
            }
        });
        return res;
    };
    __decorate([
        Autowired('rowModel')
    ], FilterListener.prototype, "serverSideRowModel", void 0);
    __decorate([
        Autowired('filterManager')
    ], FilterListener.prototype, "filterManager", void 0);
    __decorate([
        Autowired('ssrmListenerUtils')
    ], FilterListener.prototype, "listenerUtils", void 0);
    __decorate([
        PostConstruct
    ], FilterListener.prototype, "postConstruct", null);
    FilterListener = __decorate([
        Bean('ssrmFilterListener')
    ], FilterListener);
    return FilterListener;
}(BeanStub));
export { FilterListener };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsdGVyTGlzdGVuZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvc2VydmVyU2lkZVJvd01vZGVsL2xpc3RlbmVycy9maWx0ZXJMaXN0ZW5lci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxPQUFPLEVBQ0gsU0FBUyxFQUNULElBQUksRUFDSixRQUFRLEVBQ1IsTUFBTSxFQUVOLGFBQWEsRUFFaEIsTUFBTSx5QkFBeUIsQ0FBQztBQUtqQztJQUFvQyxrQ0FBUTtJQUE1Qzs7SUFzREEsQ0FBQztJQS9DVyxzQ0FBYSxHQUFyQjtRQUNJLDhGQUE4RjtRQUM5RixJQUFJLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLGNBQWMsQ0FBQyxZQUFZLENBQUMsRUFBRTtZQUFFLE9BQU87U0FBRTtRQUV0RSxJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxNQUFNLENBQUMsb0JBQW9CLEVBQUUsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUM3RyxDQUFDO0lBRU8sd0NBQWUsR0FBdkI7UUFDSSxJQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUMsU0FBUyxFQUFFLENBQUM7UUFDeEQsSUFBSSxDQUFDLFdBQVcsRUFBRTtZQUFFLE9BQU87U0FBRSxDQUFDLDJDQUEyQztRQUV6RSxJQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLGNBQWMsRUFBRSxDQUFDO1FBQ3JELElBQU0sUUFBUSxHQUFHLFdBQVcsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO1FBRTVELElBQU0sY0FBYyxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFDbkUsSUFBTSxlQUFlLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyx3QkFBd0IsQ0FBQyxjQUFjLENBQUMsQ0FBQztRQUNwRixJQUFNLG1CQUFtQixHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsNEJBQTRCLENBQUMsY0FBYyxDQUFDLENBQUM7UUFFNUYsSUFBTSxNQUFNLEdBQTRCO1lBQ3BDLGVBQWUsaUJBQUE7WUFDZixtQkFBbUIscUJBQUE7WUFDbkIsY0FBYyxnQkFBQTtTQUNqQixDQUFDO1FBRUYsSUFBSSxDQUFDLGtCQUFrQixDQUFDLGtCQUFrQixDQUFDLFFBQVEsRUFBRSxNQUFNLENBQUMsQ0FBQztJQUNqRSxDQUFDO0lBRU8sMkNBQWtCLEdBQTFCLFVBQTJCLFFBQWEsRUFBRSxRQUFhO1FBRW5ELElBQU0sYUFBYSxHQUE2QixFQUFFLENBQUM7UUFFbkQsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxPQUFPLENBQUMsVUFBQSxHQUFHLElBQUksT0FBQSxhQUFhLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxFQUF6QixDQUF5QixDQUFDLENBQUM7UUFDaEUsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxPQUFPLENBQUMsVUFBQSxHQUFHLElBQUksT0FBQSxhQUFhLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBSSxFQUF6QixDQUF5QixDQUFDLENBQUM7UUFFaEUsSUFBTSxHQUFHLEdBQWEsRUFBRSxDQUFDO1FBRXpCLE1BQU0sQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUMsT0FBTyxDQUFDLFVBQUEsR0FBRztZQUNsQyxJQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQzlDLElBQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDOUMsSUFBTSxhQUFhLEdBQUcsT0FBTyxJQUFJLE9BQU8sQ0FBQztZQUN6QyxJQUFJLGFBQWEsRUFBRTtnQkFDZixHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2FBQ2pCO1FBQ0wsQ0FBQyxDQUFDLENBQUM7UUFFSCxPQUFPLEdBQUcsQ0FBQztJQUNmLENBQUM7SUFuRHNCO1FBQXRCLFNBQVMsQ0FBQyxVQUFVLENBQUM7OERBQWdEO0lBQzFDO1FBQTNCLFNBQVMsQ0FBQyxlQUFlLENBQUM7eURBQXNDO0lBQ2pDO1FBQS9CLFNBQVMsQ0FBQyxtQkFBbUIsQ0FBQzt5REFBc0M7SUFHckU7UUFEQyxhQUFhO3VEQU1iO0lBWlEsY0FBYztRQUQxQixJQUFJLENBQUMsb0JBQW9CLENBQUM7T0FDZCxjQUFjLENBc0QxQjtJQUFELHFCQUFDO0NBQUEsQUF0REQsQ0FBb0MsUUFBUSxHQXNEM0M7U0F0RFksY0FBYyJ9