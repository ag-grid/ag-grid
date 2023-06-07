var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Autowired, Bean, BeanStub, Events, PostConstruct } from "@ag-grid-community/core";
let FilterListener = class FilterListener extends BeanStub {
    postConstruct() {
        // only want to be active if SSRM active, otherwise would be interfering with other row models
        if (!this.gridOptionsService.isRowModelType('serverSide')) {
            return;
        }
        this.addManagedListener(this.eventService, Events.EVENT_FILTER_CHANGED, this.onFilterChanged.bind(this));
    }
    onFilterChanged() {
        const storeParams = this.serverSideRowModel.getParams();
        if (!storeParams) {
            return;
        } // params is undefined if no datasource set
        const newModel = this.filterManager.getFilterModel();
        const oldModel = storeParams ? storeParams.filterModel : {};
        const changedColumns = this.findChangedColumns(newModel, oldModel);
        const valueColChanged = this.listenerUtils.isSortingWithValueColumn(changedColumns);
        const secondaryColChanged = this.listenerUtils.isSortingWithSecondaryColumn(changedColumns);
        const params = {
            valueColChanged,
            secondaryColChanged,
            changedColumns
        };
        this.serverSideRowModel.refreshAfterFilter(newModel, params);
    }
    findChangedColumns(oldModel, newModel) {
        const allColKeysMap = {};
        Object.keys(oldModel).forEach(key => allColKeysMap[key] = true);
        Object.keys(newModel).forEach(key => allColKeysMap[key] = true);
        const res = [];
        Object.keys(allColKeysMap).forEach(key => {
            const oldJson = JSON.stringify(oldModel[key]);
            const newJson = JSON.stringify(newModel[key]);
            const filterChanged = oldJson != newJson;
            if (filterChanged) {
                res.push(key);
            }
        });
        return res;
    }
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
export { FilterListener };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsdGVyTGlzdGVuZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvc2VydmVyU2lkZVJvd01vZGVsL2xpc3RlbmVycy9maWx0ZXJMaXN0ZW5lci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSxPQUFPLEVBQ0gsU0FBUyxFQUNULElBQUksRUFDSixRQUFRLEVBQ1IsTUFBTSxFQUVOLGFBQWEsRUFFaEIsTUFBTSx5QkFBeUIsQ0FBQztBQUtqQyxJQUFhLGNBQWMsR0FBM0IsTUFBYSxjQUFlLFNBQVEsUUFBUTtJQU9oQyxhQUFhO1FBQ2pCLDhGQUE4RjtRQUM5RixJQUFJLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLGNBQWMsQ0FBQyxZQUFZLENBQUMsRUFBRTtZQUFFLE9BQU87U0FBRTtRQUV0RSxJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxNQUFNLENBQUMsb0JBQW9CLEVBQUUsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUM3RyxDQUFDO0lBRU8sZUFBZTtRQUNuQixNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUMsU0FBUyxFQUFFLENBQUM7UUFDeEQsSUFBSSxDQUFDLFdBQVcsRUFBRTtZQUFFLE9BQU87U0FBRSxDQUFDLDJDQUEyQztRQUV6RSxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLGNBQWMsRUFBRSxDQUFDO1FBQ3JELE1BQU0sUUFBUSxHQUFHLFdBQVcsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO1FBRTVELE1BQU0sY0FBYyxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFDbkUsTUFBTSxlQUFlLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyx3QkFBd0IsQ0FBQyxjQUFjLENBQUMsQ0FBQztRQUNwRixNQUFNLG1CQUFtQixHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsNEJBQTRCLENBQUMsY0FBYyxDQUFDLENBQUM7UUFFNUYsTUFBTSxNQUFNLEdBQTRCO1lBQ3BDLGVBQWU7WUFDZixtQkFBbUI7WUFDbkIsY0FBYztTQUNqQixDQUFDO1FBRUYsSUFBSSxDQUFDLGtCQUFrQixDQUFDLGtCQUFrQixDQUFDLFFBQVEsRUFBRSxNQUFNLENBQUMsQ0FBQztJQUNqRSxDQUFDO0lBRU8sa0JBQWtCLENBQUMsUUFBYSxFQUFFLFFBQWE7UUFFbkQsTUFBTSxhQUFhLEdBQTZCLEVBQUUsQ0FBQztRQUVuRCxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQztRQUNoRSxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQztRQUVoRSxNQUFNLEdBQUcsR0FBYSxFQUFFLENBQUM7UUFFekIsTUFBTSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUU7WUFDckMsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztZQUM5QyxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQzlDLE1BQU0sYUFBYSxHQUFHLE9BQU8sSUFBSSxPQUFPLENBQUM7WUFDekMsSUFBSSxhQUFhLEVBQUU7Z0JBQ2YsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQzthQUNqQjtRQUNMLENBQUMsQ0FBQyxDQUFDO1FBRUgsT0FBTyxHQUFHLENBQUM7SUFDZixDQUFDO0NBQ0osQ0FBQTtBQXBEMEI7SUFBdEIsU0FBUyxDQUFDLFVBQVUsQ0FBQzswREFBZ0Q7QUFDMUM7SUFBM0IsU0FBUyxDQUFDLGVBQWUsQ0FBQztxREFBc0M7QUFDakM7SUFBL0IsU0FBUyxDQUFDLG1CQUFtQixDQUFDO3FEQUFzQztBQUdyRTtJQURDLGFBQWE7bURBTWI7QUFaUSxjQUFjO0lBRDFCLElBQUksQ0FBQyxvQkFBb0IsQ0FBQztHQUNkLGNBQWMsQ0FzRDFCO1NBdERZLGNBQWMifQ==