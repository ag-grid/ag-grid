var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Component, _, Autowired, AgPromise, } from '@ag-grid-community/core';
import { MultiFilter } from './multiFilter';
export class MultiFloatingFilterComp extends Component {
    constructor() {
        super(/* html */ `<div class="ag-multi-floating-filter ag-floating-filter-input"></div>`);
        this.floatingFilters = [];
    }
    init(params) {
        this.params = params;
        const filterParams = params.filterParams;
        const floatingFilterPromises = [];
        MultiFilter.getFilterDefs(filterParams).forEach((filterDef, index) => {
            const floatingFilterParams = Object.assign(Object.assign({}, params), { 
                // set the parent filter instance for each floating filter to the relevant child filter instance
                parentFilterInstance: (callback) => {
                    this.parentMultiFilterInstance((parent) => {
                        const child = parent.getChildFilterInstance(index);
                        if (child == null) {
                            return;
                        }
                        callback(child);
                    });
                } });
            _.mergeDeep(floatingFilterParams.filterParams, filterDef.filterParams);
            const floatingFilterPromise = this.createFloatingFilter(filterDef, floatingFilterParams);
            if (floatingFilterPromise != null) {
                floatingFilterPromises.push(floatingFilterPromise);
            }
        });
        return AgPromise.all(floatingFilterPromises).then(floatingFilters => {
            floatingFilters.forEach((floatingFilter, index) => {
                this.floatingFilters.push(floatingFilter);
                const gui = floatingFilter.getGui();
                this.appendChild(gui);
                if (index > 0) {
                    _.setDisplayed(gui, false);
                }
            });
        });
    }
    onParentModelChanged(model, event) {
        // We don't want to update the floating filter if the floating filter caused the change,
        // because the UI is already in sync. if we didn't do this, the UI would behave strangely
        // as it would be updating as the user is typing
        if (event && event.afterFloatingFilter) {
            return;
        }
        this.parentMultiFilterInstance((parent) => {
            if (model == null) {
                this.floatingFilters.forEach((filter, i) => {
                    filter.onParentModelChanged(null, event);
                    _.setDisplayed(filter.getGui(), i === 0);
                });
            }
            else {
                const lastActiveFloatingFilterIndex = parent.getLastActiveFilterIndex();
                this.floatingFilters.forEach((filter, i) => {
                    const filterModel = model.filterModels.length > i ? model.filterModels[i] : null;
                    filter.onParentModelChanged(filterModel, event);
                    const shouldShow = lastActiveFloatingFilterIndex == null ? i === 0 : i === lastActiveFloatingFilterIndex;
                    _.setDisplayed(filter.getGui(), shouldShow);
                });
            }
        });
    }
    destroy() {
        this.destroyBeans(this.floatingFilters);
        this.floatingFilters.length = 0;
        super.destroy();
    }
    createFloatingFilter(filterDef, params) {
        var _a;
        let defaultComponentName = (_a = this.userComponentFactory.getDefaultFloatingFilterType(filterDef, () => this.filterManager.getDefaultFloatingFilter(this.params.column))) !== null && _a !== void 0 ? _a : 'agReadOnlyFloatingFilter';
        const compDetails = this.userComponentFactory.getFloatingFilterCompDetails(filterDef, params, defaultComponentName);
        return compDetails ? compDetails.newAgStackInstance() : null;
    }
    parentMultiFilterInstance(cb) {
        this.params.parentFilterInstance((parent) => {
            if (!(parent instanceof MultiFilter)) {
                throw new Error('AG Grid - MultiFloatingFilterComp expects MultiFilter as its parent');
            }
            cb(parent);
        });
    }
}
__decorate([
    Autowired('userComponentFactory')
], MultiFloatingFilterComp.prototype, "userComponentFactory", void 0);
__decorate([
    Autowired('filterManager')
], MultiFloatingFilterComp.prototype, "filterManager", void 0);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibXVsdGlGbG9hdGluZ0ZpbHRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9tdWx0aUZpbHRlci9tdWx0aUZsb2F0aW5nRmlsdGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLE9BQU8sRUFDSCxTQUFTLEVBRVQsQ0FBQyxFQUlELFNBQVMsRUFFVCxTQUFTLEdBS1osTUFBTSx5QkFBeUIsQ0FBQztBQUNqQyxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBRTVDLE1BQU0sT0FBTyx1QkFBd0IsU0FBUSxTQUFTO0lBT2xEO1FBQ0ksS0FBSyxDQUFDLFVBQVUsQ0FBQSx1RUFBdUUsQ0FBQyxDQUFDO1FBSnJGLG9CQUFlLEdBQTBCLEVBQUUsQ0FBQztJQUtwRCxDQUFDO0lBRU0sSUFBSSxDQUFDLE1BQTBDO1FBQ2xELElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO1FBRXJCLE1BQU0sWUFBWSxHQUFHLE1BQU0sQ0FBQyxZQUFpQyxDQUFDO1FBQzlELE1BQU0sc0JBQXNCLEdBQXFDLEVBQUUsQ0FBQztRQUVwRSxXQUFXLENBQUMsYUFBYSxDQUFDLFlBQVksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLFNBQVMsRUFBRSxLQUFLLEVBQUUsRUFBRTtZQUNqRSxNQUFNLG9CQUFvQixtQ0FDbkIsTUFBTTtnQkFDVCxnR0FBZ0c7Z0JBQ2hHLG9CQUFvQixFQUFFLENBQUMsUUFBUSxFQUFFLEVBQUU7b0JBQy9CLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUFFO3dCQUN0QyxNQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsc0JBQXNCLENBQUMsS0FBSyxDQUFDLENBQUM7d0JBQ25ELElBQUksS0FBSyxJQUFJLElBQUksRUFBRTs0QkFBRSxPQUFPO3lCQUFFO3dCQUU5QixRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7b0JBQ3BCLENBQUMsQ0FBQyxDQUFDO2dCQUNQ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