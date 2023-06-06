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
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Component, _, Autowired, AgPromise, } from '@ag-grid-community/core';
import { MultiFilter } from './multiFilter';
var MultiFloatingFilterComp = /** @class */ (function (_super) {
    __extends(MultiFloatingFilterComp, _super);
    function MultiFloatingFilterComp() {
        var _this = _super.call(this, /* html */ "<div class=\"ag-multi-floating-filter ag-floating-filter-input\"></div>") || this;
        _this.floatingFilters = [];
        return _this;
    }
    MultiFloatingFilterComp.prototype.init = function (params) {
        var _this = this;
        this.params = params;
        var filterParams = params.filterParams;
        var floatingFilterPromises = [];
        MultiFilter.getFilterDefs(filterParams).forEach(function (filterDef, index) {
            var floatingFilterParams = __assign(__assign({}, params), { 
                // set the parent filter instance for each floating filter to the relevant child filter instance
                parentFilterInstance: function (callback) {
                    _this.parentMultiFilterInstance(function (parent) {
                        var child = parent.getChildFilterInstance(index);
                        if (child == null) {
                            return;
                        }
                        callback(child);
                    });
                } });
            _.mergeDeep(floatingFilterParams.filterParams, filterDef.filterParams);
            var floatingFilterPromise = _this.createFloatingFilter(filterDef, floatingFilterParams);
            if (floatingFilterPromise != null) {
                floatingFilterPromises.push(floatingFilterPromise);
            }
        });
        return AgPromise.all(floatingFilterPromises).then(function (floatingFilters) {
            floatingFilters.forEach(function (floatingFilter, index) {
                _this.floatingFilters.push(floatingFilter);
                var gui = floatingFilter.getGui();
                _this.appendChild(gui);
                if (index > 0) {
                    _.setDisplayed(gui, false);
                }
            });
        });
    };
    MultiFloatingFilterComp.prototype.onParentModelChanged = function (model, event) {
        var _this = this;
        // We don't want to update the floating filter if the floating filter caused the change,
        // because the UI is already in sync. if we didn't do this, the UI would behave strangely
        // as it would be updating as the user is typing
        if (event && event.afterFloatingFilter) {
            return;
        }
        this.parentMultiFilterInstance(function (parent) {
            if (model == null) {
                _this.floatingFilters.forEach(function (filter, i) {
                    filter.onParentModelChanged(null, event);
                    _.setDisplayed(filter.getGui(), i === 0);
                });
            }
            else {
                var lastActiveFloatingFilterIndex_1 = parent.getLastActiveFilterIndex();
                _this.floatingFilters.forEach(function (filter, i) {
                    var filterModel = model.filterModels.length > i ? model.filterModels[i] : null;
                    filter.onParentModelChanged(filterModel, event);
                    var shouldShow = lastActiveFloatingFilterIndex_1 == null ? i === 0 : i === lastActiveFloatingFilterIndex_1;
                    _.setDisplayed(filter.getGui(), shouldShow);
                });
            }
        });
    };
    MultiFloatingFilterComp.prototype.destroy = function () {
        this.destroyBeans(this.floatingFilters);
        this.floatingFilters.length = 0;
        _super.prototype.destroy.call(this);
    };
    MultiFloatingFilterComp.prototype.createFloatingFilter = function (filterDef, params) {
        var _this = this;
        var _a;
        var defaultComponentName = (_a = this.userComponentFactory.getDefaultFloatingFilterType(filterDef, function () { return _this.filterManager.getDefaultFloatingFilter(_this.params.column); })) !== null && _a !== void 0 ? _a : 'agReadOnlyFloatingFilter';
        var compDetails = this.userComponentFactory.getFloatingFilterCompDetails(filterDef, params, defaultComponentName);
        return compDetails ? compDetails.newAgStackInstance() : null;
    };
    MultiFloatingFilterComp.prototype.parentMultiFilterInstance = function (cb) {
        this.params.parentFilterInstance(function (parent) {
            if (!(parent instanceof MultiFilter)) {
                throw new Error('AG Grid - MultiFloatingFilterComp expects MultiFilter as its parent');
            }
            cb(parent);
        });
    };
    __decorate([
        Autowired('userComponentFactory')
    ], MultiFloatingFilterComp.prototype, "userComponentFactory", void 0);
    __decorate([
        Autowired('filterManager')
    ], MultiFloatingFilterComp.prototype, "filterManager", void 0);
    return MultiFloatingFilterComp;
}(Component));
export { MultiFloatingFilterComp };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibXVsdGlGbG9hdGluZ0ZpbHRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9tdWx0aUZpbHRlci9tdWx0aUZsb2F0aW5nRmlsdGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsT0FBTyxFQUNILFNBQVMsRUFFVCxDQUFDLEVBSUQsU0FBUyxFQUVULFNBQVMsR0FLWixNQUFNLHlCQUF5QixDQUFDO0FBQ2pDLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFFNUM7SUFBNkMsMkNBQVM7SUFPbEQ7UUFBQSxZQUNJLGtCQUFNLFVBQVUsQ0FBQSx5RUFBdUUsQ0FBQyxTQUMzRjtRQUxPLHFCQUFlLEdBQTBCLEVBQUUsQ0FBQzs7SUFLcEQsQ0FBQztJQUVNLHNDQUFJLEdBQVgsVUFBWSxNQUEwQztRQUF0RCxpQkF5Q0M7UUF4Q0csSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7UUFFckIsSUFBTSxZQUFZLEdBQUcsTUFBTSxDQUFDLFlBQWlDLENBQUM7UUFDOUQsSUFBTSxzQkFBc0IsR0FBcUMsRUFBRSxDQUFDO1FBRXBFLFdBQVcsQ0FBQyxhQUFhLENBQUMsWUFBWSxDQUFDLENBQUMsT0FBTyxDQUFDLFVBQUMsU0FBUyxFQUFFLEtBQUs7WUFDN0QsSUFBTSxvQkFBb0IseUJBQ25CLE1BQU07Z0JBQ1QsZ0dBQWdHO2dCQUNoRyxvQkFBb0IsRUFBRSxVQUFDLFFBQVE7b0JBQzNCLEtBQUksQ0FBQyx5QkFBeUIsQ0FBQyxVQUFDLE1BQU07d0JBQ2xDLElBQU0sS0FBSyxHQUFHLE1BQU0sQ0FBQyxzQkFBc0IsQ0FBQyxLQUFLLENBQUMsQ0FBQzt3QkFDbkQsSUFBSSxLQUFLLElBQUksSUFBSSxFQUFFOzRCQUFFLE9BQU87eUJBQUU7d0JBRTlCLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQztvQkFDcEIsQ0FBQyxDQUFDLENBQUM7Z0JB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