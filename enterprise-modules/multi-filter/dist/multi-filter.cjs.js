/**
          * @ag-grid-enterprise/multi-filter - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue * @version v28.2.1
          * @link https://www.ag-grid.com/
          * @license Commercial
          */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var core = require('@ag-grid-community/core');
var core$1 = require('@ag-grid-enterprise/core');

var __extends$1 = (undefined && undefined.__extends) || (function () {
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
var __assign$1 = (undefined && undefined.__assign) || function () {
    __assign$1 = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign$1.apply(this, arguments);
};
var __decorate$1 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var MultiFilter = /** @class */ (function (_super) {
    __extends$1(MultiFilter, _super);
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
        return core.AgPromise
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
                _this.appendChild(core._.loadTemplate(/* html */ "<div class=\"ag-filter-separator\"></div>"));
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
        var menuItem = this.createBean(new core.AgMenuItemComponent({
            name: name,
            subMenu: filter,
            cssClasses: ['ag-multi-filter-menu-item'],
            isCompact: true,
            isAnotherSubMenuOpen: function () { return false; },
        }));
        menuItem.setParentComponent(this);
        this.guiDestroyFuncs.push(function () { return _this.destroyBean(menuItem); });
        this.addManagedListener(menuItem, core.AgMenuItemComponent.EVENT_MENU_ITEM_ACTIVATED, function (event) {
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
        var group = this.createBean(new core.AgGroupComponent({
            title: title,
            cssIdentifier: 'multi-filter',
        }));
        this.guiDestroyFuncs.push(function () { return _this.destroyBean(group); });
        group.addItem(filter.getGui());
        group.toggleGroupExpand(false);
        if (filter.afterGuiAttached) {
            var params_1 = { container: this.lastOpenedInContainer, suppressFocus: true };
            group.addManagedListener(group, core.AgGroupComponent.EVENT_EXPANDED, function () { return filter.afterGuiAttached(params_1); });
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
            return new core.AgPromise(function (resolve) {
                var promise = filter.setModel(filterModel);
                promise ? promise.then(function () { return resolve(); }) : resolve();
            });
        };
        var promises = [];
        if (model == null) {
            promises = this.filters.map(function (filter, index) {
                var res = setFilterModel(filter, null);
                _this.updateActiveList(index);
                return res;
            });
        }
        else {
            this.filters.forEach(function (filter, index) {
                var filterModel = model.filterModels.length > index ? model.filterModels[index] : null;
                var res = setFilterModel(filter, filterModel);
                promises.push(res);
                _this.updateActiveList(index);
            });
        }
        return core.AgPromise.all(promises).then(function () { });
    };
    MultiFilter.prototype.applyModel = function () {
        var result = false;
        this.filters.forEach(function (filter) {
            if (filter instanceof core.ProvidedFilter) {
                result = filter.applyModel() || result;
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
        this.executeFunctionIfExists('afterGuiAttached', __assign$1(__assign$1({}, params || {}), { suppressFocus: suppressFocus }));
        var eDocument = this.gridOptionsWrapper.getDocument();
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
        core._.forEachReverse(this.filters, function (filter) {
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
        var filterParams = __assign$1(__assign$1({}, this.filterManager.createFilterParams(this.column, this.column.getColDef())), { filterModifiedCallback: filterModifiedCallback, filterChangedCallback: function (additionalEventAttributes) {
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
        core._.removeFromArray(this.activeFilterIndices, index);
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
    __decorate$1([
        core.Autowired('filterManager')
    ], MultiFilter.prototype, "filterManager", void 0);
    __decorate$1([
        core.Autowired('userComponentFactory')
    ], MultiFilter.prototype, "userComponentFactory", void 0);
    __decorate$1([
        core.PostConstruct
    ], MultiFilter.prototype, "postConstruct", null);
    return MultiFilter;
}(core.TabGuardComp));

var __extends = (undefined && undefined.__extends) || (function () {
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
var __assign = (undefined && undefined.__assign) || function () {
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
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
            var floatingFilterPromise = _this.createFloatingFilter(filterDef, floatingFilterParams);
            if (floatingFilterPromise != null) {
                floatingFilterPromises.push(floatingFilterPromise);
            }
        });
        return core.AgPromise.all(floatingFilterPromises).then(function (floatingFilters) {
            floatingFilters.forEach(function (floatingFilter, index) {
                _this.floatingFilters.push(floatingFilter);
                var gui = floatingFilter.getGui();
                _this.appendChild(gui);
                if (index > 0) {
                    core._.setDisplayed(gui, false);
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
                    core._.setDisplayed(filter.getGui(), i === 0);
                });
            }
            else {
                var lastActiveFloatingFilterIndex_1 = parent.getLastActiveFilterIndex();
                _this.floatingFilters.forEach(function (filter, i) {
                    var filterModel = model.filterModels.length > i ? model.filterModels[i] : null;
                    filter.onParentModelChanged(filterModel, event);
                    var shouldShow = lastActiveFloatingFilterIndex_1 == null ? i === 0 : i === lastActiveFloatingFilterIndex_1;
                    core._.setDisplayed(filter.getGui(), shouldShow);
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
        var defaultComponentName = this.userComponentFactory.getDefaultFloatingFilterType(filterDef) || 'agTextColumnFloatingFilter';
        var compDetails = this.userComponentFactory.getFloatingFilterCompDetails(filterDef, params, defaultComponentName);
        return compDetails ? compDetails.newAgStackInstance() : null;
    };
    MultiFloatingFilterComp.prototype.parentMultiFilterInstance = function (cb) {
        this.params.parentFilterInstance(function (parent) {
            if (!(parent instanceof MultiFilter)) {
                throw new Error('AG Grid - MultiFloatingFilterComp expects MultiFilter as it\'s parent');
            }
            cb(parent);
        });
    };
    __decorate([
        core.Autowired('userComponentFactory')
    ], MultiFloatingFilterComp.prototype, "userComponentFactory", void 0);
    return MultiFloatingFilterComp;
}(core.Component));

var MultiFilterModule = {
    moduleName: core.ModuleNames.MultiFilterModule,
    beans: [],
    userComponents: [
        { componentName: 'agMultiColumnFilter', componentClass: MultiFilter },
        { componentName: 'agMultiColumnFloatingFilter', componentClass: MultiFloatingFilterComp },
    ],
    dependantModules: [
        core$1.EnterpriseCoreModule
    ]
};

exports.MultiFilter = MultiFilter;
exports.MultiFilterModule = MultiFilterModule;
