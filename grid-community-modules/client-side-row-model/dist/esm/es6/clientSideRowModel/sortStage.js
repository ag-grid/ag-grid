var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { _, Autowired, Bean, BeanStub } from "@ag-grid-community/core";
let SortStage = class SortStage extends BeanStub {
    execute(params) {
        const sortOptions = this.sortController.getSortOptions();
        const sortActive = _.exists(sortOptions) && sortOptions.length > 0;
        const deltaSort = sortActive
            && _.exists(params.rowNodeTransactions)
            // in time we can remove this check, so that delta sort is always
            // on if transactions are present. it's off for now so that we can
            // selectively turn it on and test it with some select users before
            // rolling out to everyone.
            && this.gridOptionsService.is('deltaSort');
        const sortContainsGroupColumns = sortOptions.some(opt => !!this.columnModel.getGroupDisplayColumnForGroup(opt.column.getId()));
        this.sortService.sort(sortOptions, sortActive, deltaSort, params.rowNodeTransactions, params.changedPath, sortContainsGroupColumns);
    }
};
__decorate([
    Autowired('sortService')
], SortStage.prototype, "sortService", void 0);
__decorate([
    Autowired('sortController')
], SortStage.prototype, "sortController", void 0);
__decorate([
    Autowired('columnModel')
], SortStage.prototype, "columnModel", void 0);
SortStage = __decorate([
    Bean('sortStage')
], SortStage);
export { SortStage };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic29ydFN0YWdlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2NsaWVudFNpZGVSb3dNb2RlbC9zb3J0U3RhZ2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsT0FBTyxFQUNILENBQUMsRUFDRCxTQUFTLEVBQ1QsSUFBSSxFQUlKLFFBQVEsRUFFWCxNQUFNLHlCQUF5QixDQUFDO0FBS2pDLElBQWEsU0FBUyxHQUF0QixNQUFhLFNBQVUsU0FBUSxRQUFRO0lBTTVCLE9BQU8sQ0FBQyxNQUEwQjtRQUNyQyxNQUFNLFdBQVcsR0FBaUIsSUFBSSxDQUFDLGNBQWMsQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUV2RSxNQUFNLFVBQVUsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxJQUFJLFdBQVcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO1FBQ25FLE1BQU0sU0FBUyxHQUFHLFVBQVU7ZUFDckIsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsbUJBQW1CLENBQUM7WUFDdkMsaUVBQWlFO1lBQ2pFLGtFQUFrRTtZQUNsRSxtRUFBbUU7WUFDbkUsMkJBQTJCO2VBQ3hCLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxFQUFFLENBQUMsV0FBVyxDQUFDLENBQUM7UUFFL0MsTUFBTSx3QkFBd0IsR0FBRyxXQUFXLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsNkJBQTZCLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDL0gsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLFVBQVUsRUFBRSxTQUFTLEVBQUUsTUFBTSxDQUFDLG1CQUFtQixFQUFFLE1BQU0sQ0FBQyxXQUFXLEVBQUUsd0JBQXdCLENBQUMsQ0FBQztJQUN4SSxDQUFDO0NBQ0osQ0FBQTtBQW5CNkI7SUFBekIsU0FBUyxDQUFDLGFBQWEsQ0FBQzs4Q0FBa0M7QUFDOUI7SUFBNUIsU0FBUyxDQUFDLGdCQUFnQixDQUFDO2lEQUF3QztBQUMxQztJQUF6QixTQUFTLENBQUMsYUFBYSxDQUFDOzhDQUFrQztBQUpsRCxTQUFTO0lBRHJCLElBQUksQ0FBQyxXQUFXLENBQUM7R0FDTCxTQUFTLENBcUJyQjtTQXJCWSxTQUFTIn0=