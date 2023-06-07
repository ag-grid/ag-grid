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
import { ProvidedFilter, AgPromise, Autowired, AgGroupComponent, TabGuardComp, AgMenuItemComponent, PostConstruct, _ } from '@ag-grid-community/core';
var MultiFilter = /** @class */ (function (_super) {
    __extends(MultiFilter, _super);
    function MultiFilter() {
        var _this = _super.call(this, /* html */ "<div class=\"ag-multi-filter ag-menu-list-compact\"></div>") || this;
        _this.filterDefs = [];
        _this.filters = [];
        _this.guiDestroyFuncs = [];
        _this.activeFilterIndices = [];
        _this.lastActivatedMenuItem = null;
        _this.afterFiltersReadyFuncs = [];
        return _this;
    }
    MultiFilter.prototype.postConstruct = function () {
        var _this = this;
        this.initialiseTabGuard({
            onFocusIn: function (e) { return _this.onFocusIn(e); }
        });
    };
    MultiFilter.getFilterDefs = function (params) {
        var filters = params.filters;
        return filters && filters.length > 0 ?
            filters :
            [{ filter: 'agTextColumnFilter' }, { filter: 'agSetColumnFilter' }];
    };
    MultiFilter.prototype.init = function (params) {
        var _this = this;
        this.params = params;
        this.filterDefs = MultiFilter.getFilterDefs(params);
        var column = params.column, filterChangedCallback = params.filterChangedCallback;
        this.column = column;
        this.filterChangedCallback = filterChangedCallback;
        var filterPromises = [];
        this.filterDefs.forEach(function (filterDef, index) {
            var filterPromise = _this.createFilter(filterDef, index);
            if (filterPromise != null) {
                filterPromises.push(filterPromise);
            }
        });
        // we have to refresh the GUI here to ensure that Angular components are not rendered in odd places
        return AgPromise
            .all(filterPromises)
            .then(function (filters) {
            _this.filters = filters;
            _this.refreshGui('columnMenu');
            _this.afterFiltersReadyFuncs.forEach(function (f) { return f(); });
            _this.afterFiltersReadyFuncs.length = 0;
        });
    };
    MultiFilter.prototype.refreshGui = function (container) {
        var _this = this;
        if (container === this.lastOpenedInContainer) {
            return;
        }
        this.removeAllChildrenExceptTabGuards();
        this.destroyChildren();
        this.filters.forEach(function (filter, index) {
            if (index > 0) {
                _this.appendChild(_.loadTemplate(/* html */ "<div class=\"ag-filter-separator\"></div>"));
            }
            var filterDef = _this.filterDefs[index];
            var filterTitle = _this.getFilterTitle(filter, filterDef);
            var filterGui;
            if (filterDef.display === 'subMenu' && container !== 'toolPanel') {
                // prevent sub-menu being used in tool panel
                var menuItem = _this.insertFilterMenu(filter, filterTitle);
                filterGui = menuItem.getGui();
            }
            else if (filterDef.display === 'subMenu' || filterDef.display === 'accordion') {
                // sub-menus should appear as groups in the tool panel
                var group = _this.insertFilterGroup(filter, filterTitle);
                filterGui = group.getGui();
            }
            else {
                // display inline
                filterGui = filter.getGui();
            }
            _this.appendChild(filterGui);
        });
        this.lastOpenedInContainer = container;
    };
    MultiFilter.prototype.getFilterTitle = function (filter, filterDef) {
        if (filterDef.title != null) {
            return filterDef.title;
        }
        var filterWithoutType = filter;
        return typeof filterWithoutType.getFilterTitle === 'function' ? filterWithoutType.getFilterTitle() : 'Filter';
    };
    MultiFilter.prototype.destroyChildren = function () {
        this.guiDestroyFuncs.forEach(function (func) { return func(); });
        this.guiDestroyFuncs.length = 0;
    };
    MultiFilter.prototype.insertFilterMenu = function (filter, name) {
        var _this = this;
        var menuItem = this.createBean(new AgMenuItemComponent({
            name: name,
            subMenu: filter,
            cssClasses: ['ag-multi-filter-menu-item'],
            isCompact: true,
            isAnotherSubMenuOpen: function () { return false; },
        }));
        menuItem.setParentComponent(this);
        this.guiDestroyFuncs.push(function () { return _this.destroyBean(menuItem); });
        this.addManagedListener(menuItem, AgMenuItemComponent.EVENT_MENU_ITEM_ACTIVATED, function (event) {
            if (_this.lastActivatedMenuItem && _this.lastActivatedMenuItem !== event.menuItem) {
                _this.lastActivatedMenuItem.deactivate();
            }
            _this.lastActivatedMenuItem = event.menuItem;
        });
        menuItem.addGuiEventListener('focusin', function () { return menuItem.activate(); });
        menuItem.addGuiEventListener('focusout', function () {
            if (!menuItem.isSubMenuOpen()) {
                menuItem.deactivate();
            }
        });
        return menuItem;
    };
    MultiFilter.prototype.insertFilterGroup = function (filter, title) {
        var _this = this;
        var group = this.createBean(new AgGroupComponent({
            title: title,
            cssIdentifier: 'multi-filter',
        }));
        this.guiDestroyFuncs.push(function () { return _this.destroyBean(group); });
        group.addItem(filter.getGui());
        group.toggleGroupExpand(false);
        if (filter.afterGuiAttached) {
            group.addManagedListener(group, AgGroupComponent.EVENT_EXPANDED, function () { return filter.afterGuiAttached({
                container: _this.lastOpenedInContainer,
                suppressFocus: true
            }); });
        }
        return group;
    };
    MultiFilter.prototype.isFilterActive = function () {
        return this.filters.some(function (filter) { return filter.isFilterActive(); });
    };
    MultiFilter.prototype.getLastActiveFilterIndex = function () {
        return this.activeFilterIndices.length > 0 ? this.activeFilterIndices[this.activeFilterIndices.length - 1] : null;
    };
    MultiFilter.prototype.doesFilterPass = function (params, filterToSkip) {
        var rowPasses = true;
        this.filters.forEach(function (filter) {
            if (!rowPasses || filter === filterToSkip || !filter.isFilterActive()) {
                return;
            }
            rowPasses = filter.doesFilterPass(params);
        });
        return rowPasses;
    };
    MultiFilter.prototype.getFilterType = function () {
        return 'multi';
    };
    MultiFilter.prototype.getModelFromUi = function () {
        var model = {
            filterType: this.getFilterType(),
            filterModels: this.filters.map(function (filter) {
                var providedFilter = filter;
                if (typeof providedFilter.getModelFromUi === 'function') {
                    return providedFilter.getModelFromUi();
                }
                return null;
            })
        };
        return model;
    };
    MultiFilter.prototype.getModel = function () {
        if (!this.isFilterActive()) {
            return null;
        }
        var model = {
            filterType: this.getFilterType(),
            filterModels: this.filters.map(function (filter) {
                if (filter.isFilterActive()) {
                    return filter.getModel();
                }
                return null;
            })
        };
        return model;
    };
    MultiFilter.prototype.setModel = function (model) {
        var _this = this;
        var setFilterModel = function (filter, filterModel) {
            return new AgPromise(function (resolve) {
                var promise = filter.setModel(filterModel);
                promise ? promise.then(function () { return resolve(); }) : resolve();
            });
        };
        var promises = [];
        if (model == null) {
            promises = this.filters.map(function (filter, index) {
                var res = setFilterModel(filter, null).then(function () {
                    _this.updateActiveList(index);
                });
                return res;
            });
        }
        else {
            this.filters.forEach(function (filter, index) {
                var filterModel = model.filterModels.length > index ? model.filterModels[index] : null;
                var res = setFilterModel(filter, filterModel).then(function () {
                    _this.updateActiveList(index);
                });
                promises.push(res);
            });
        }
        return AgPromise.all(promises).then(function () { });
    };
    MultiFilter.prototype.applyModel = function (source) {
        if (source === void 0) { source = 'api'; }
        var result = false;
        this.filters.forEach(function (filter) {
            if (filter instanceof ProvidedFilter) {
                result = filter.applyModel(source) || result;
            }
        });
        return result;
    };
    MultiFilter.prototype.getChildFilterInstance = function (index) {
        return this.filters[index];
    };
    MultiFilter.prototype.afterGuiAttached = function (params) {
        if (params) {
            this.refreshGui(params.container);
        }
        var filters = this.params.filters;
        var suppressFocus = filters && filters.some(function (filter) { return filter.display && filter.display !== 'inline'; });
        this.executeFunctionIfExists('afterGuiAttached', __assign(__assign({}, params || {}), { suppressFocus: suppressFocus }));
        var eDocument = this.gridOptionsService.getDocument();
        var activeEl = eDocument.activeElement;
        // if suppress focus is true, we might run into two scenarios:
        // 1 - we are loading the filter for the first time and the component isn't ready,
        //     which means the document will have focus.
        // 2 - The focus will be somewhere inside the component due to auto focus
        // In both cases we need to force the focus somewhere valid but outside the filter.
        if (suppressFocus && (activeEl === eDocument.body || this.getGui().contains(activeEl))) {
            // reset focus to the top of the container, and blur
            this.forceFocusOutOfContainer(true);
        }
    };
    MultiFilter.prototype.afterGuiDetached = function () {
        this.executeFunctionIfExists('afterGuiDetached');
    };
    MultiFilter.prototype.onAnyFilterChanged = function () {
        this.executeFunctionIfExists('onAnyFilterChanged');
    };
    MultiFilter.prototype.onNewRowsLoaded = function () {
        this.executeFunctionIfExists('onNewRowsLoaded');
    };
    MultiFilter.prototype.destroy = function () {
        var _this = this;
        this.filters.forEach(function (filter) {
            filter.setModel(null);
            _this.destroyBean(filter);
        });
        this.filters.length = 0;
        this.destroyChildren();
        _super.prototype.destroy.call(this);
    };
    MultiFilter.prototype.executeFunctionIfExists = function (name) {
        var params = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            params[_i - 1] = arguments[_i];
        }
        // The first filter is always the "dominant" one. By iterating in reverse order we ensure the first filter
        // always gets the last say
        _.forEachReverse(this.filters, function (filter) {
            var func = filter[name];
            if (typeof func === 'function') {
                func.apply(filter, params);
            }
        });
    };
    MultiFilter.prototype.createFilter = function (filterDef, index) {
        var _this = this;
        var _a = this.params, filterModifiedCallback = _a.filterModifiedCallback, doesRowPassOtherFilter = _a.doesRowPassOtherFilter;
        var filterInstance;
        var filterParams = __assign(__assign({}, this.filterManager.createFilterParams(this.column, this.column.getColDef())), { filterModifiedCallback: filterModifiedCallback, filterChangedCallback: function (additionalEventAttributes) {
                _this.executeWhenAllFiltersReady(function () { return _this.filterChanged(index, additionalEventAttributes); });
            }, doesRowPassOtherFilter: function (node) {
                return doesRowPassOtherFilter(node) && _this.doesFilterPass({ node: node, data: node.data }, filterInstance);
            } });
        var compDetails = this.userComponentFactory.getFilterDetails(filterDef, filterParams, 'agTextColumnFilter');
        if (!compDetails) {
            return null;
        }
        var filterPromise = compDetails.newAgStackInstance();
        if (filterPromise) {
            filterPromise.then(function (filter) { return filterInstance = filter; });
        }
        return filterPromise;
    };
    MultiFilter.prototype.executeWhenAllFiltersReady = function (action) {
        if (this.filters && this.filters.length > 0) {
            action();
        }
        else {
            this.afterFiltersReadyFuncs.push(action);
        }
    };
    MultiFilter.prototype.updateActiveList = function (index) {
        var changedFilter = this.filters[index];
        _.removeFromArray(this.activeFilterIndices, index);
        if (changedFilter.isFilterActive()) {
            this.activeFilterIndices.push(index);
        }
    };
    MultiFilter.prototype.filterChanged = function (index, additionalEventAttributes) {
        this.updateActiveList(index);
        this.filterChangedCallback(additionalEventAttributes);
        var changedFilter = this.filters[index];
        this.filters.forEach(function (filter) {
            if (filter === changedFilter) {
                return;
            }
            if (typeof filter.onAnyFilterChanged === 'function') {
                filter.onAnyFilterChanged();
            }
        });
    };
    MultiFilter.prototype.onFocusIn = function (e) {
        if (this.lastActivatedMenuItem != null && !this.lastActivatedMenuItem.getGui().contains(e.target)) {
            this.lastActivatedMenuItem.deactivate();
            this.lastActivatedMenuItem = null;
        }
        return true;
    };
    MultiFilter.prototype.getModelAsString = function (model) {
        var _a, _b, _c, _d;
        if (!this.filters || !((_a = model === null || model === void 0 ? void 0 : model.filterModels) === null || _a === void 0 ? void 0 : _a.length)) {
            return '';
        }
        var lastActiveIndex = (_b = this.getLastActiveFilterIndex()) !== null && _b !== void 0 ? _b : 0;
        var activeFilter = this.filters[lastActiveIndex];
        return (_d = (_c = activeFilter.getModelAsString) === null || _c === void 0 ? void 0 : _c.call(activeFilter, model.filterModels[lastActiveIndex])) !== null && _d !== void 0 ? _d : '';
    };
    __decorate([
        Autowired('filterManager')
    ], MultiFilter.prototype, "filterManager", void 0);
    __decorate([
        Autowired('userComponentFactory')
    ], MultiFilter.prototype, "userComponentFactory", void 0);
    __decorate([
        PostConstruct
    ], MultiFilter.prototype, "postConstruct", null);
    return MultiFilter;
}(TabGuardComp));
export { MultiFilter };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibXVsdGlGaWx0ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvbXVsdGlGaWx0ZXIvbXVsdGlGaWx0ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxPQUFPLEVBQ0gsY0FBYyxFQUNkLFNBQVMsRUFRVCxTQUFTLEVBT1QsZ0JBQWdCLEVBRWhCLFlBQVksRUFDWixtQkFBbUIsRUFFbkIsYUFBYSxFQUViLENBQUMsRUFDSixNQUFNLHlCQUF5QixDQUFDO0FBRWpDO0lBQWlDLCtCQUFZO0lBZ0J6QztRQUFBLFlBQ0ksa0JBQU0sVUFBVSxDQUFBLDREQUEwRCxDQUFDLFNBQzlFO1FBYk8sZ0JBQVUsR0FBc0IsRUFBRSxDQUFDO1FBQ25DLGFBQU8sR0FBeUIsRUFBRSxDQUFDO1FBQ25DLHFCQUFlLEdBQW1CLEVBQUUsQ0FBQztRQUlyQyx5QkFBbUIsR0FBYSxFQUFFLENBQUM7UUFDbkMsMkJBQXFCLEdBQStCLElBQUksQ0FBQztRQUV6RCw0QkFBc0IsR0FBbUIsRUFBRSxDQUFDOztJQUlwRCxDQUFDO0lBR08sbUNBQWEsR0FBckI7UUFEQSxpQkFLQztRQUhHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQztZQUNwQixTQUFTLEVBQUUsVUFBQSxDQUFDLElBQUksT0FBQSxLQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFqQixDQUFpQjtTQUNwQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRWEseUJBQWEsR0FBM0IsVUFBNEIsTUFBeUI7UUFDekMsSUFBQSxPQUFPLEdBQUssTUFBTSxRQUFYLENBQVk7UUFFM0IsT0FBTyxPQUFPLElBQUksT0FBTyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztZQUNsQyxPQUFPLENBQUMsQ0FBQztZQUNULENBQUMsRUFBRSxNQUFNLEVBQUUsb0JBQW9CLEVBQUUsRUFBRSxFQUFFLE1BQU0sRUFBRSxtQkFBbUIsRUFB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