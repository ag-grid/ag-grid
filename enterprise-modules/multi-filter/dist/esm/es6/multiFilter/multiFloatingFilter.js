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
        let defaultComponentName = this.userComponentFactory.getDefaultFloatingFilterType(filterDef) || 'agTextColumnFloatingFilter';
        const compDetails = this.userComponentFactory.getFloatingFilterCompDetails(filterDef, params, defaultComponentName);
        return compDetails ? compDetails.newAgStackInstance() : null;
    }
    parentMultiFilterInstance(cb) {
        this.params.parentFilterInstance((parent) => {
            if (!(parent instanceof MultiFilter)) {
                throw new Error('AG Grid - MultiFloatingFilterComp expects MultiFilter as it\'s parent');
            }
            cb(parent);
        });
    }
}
__decorate([
    Autowired('userComponentFactory')
], MultiFloatingFilterComp.prototype, "userComponentFactory", void 0);
