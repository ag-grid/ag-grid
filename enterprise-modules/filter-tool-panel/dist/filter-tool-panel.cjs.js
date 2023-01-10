/**
          * @ag-grid-enterprise/filter-tool-panel - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue * @version v29.0.0
          * @link https://www.ag-grid.com/
          * @license Commercial
          */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var core = require('@ag-grid-community/core');
var core$1 = require('@ag-grid-enterprise/core');
var sideBar = require('@ag-grid-enterprise/side-bar');

var __extends$4 = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate$4 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var EXPAND_STATE;
(function (EXPAND_STATE) {
    EXPAND_STATE[EXPAND_STATE["EXPANDED"] = 0] = "EXPANDED";
    EXPAND_STATE[EXPAND_STATE["COLLAPSED"] = 1] = "COLLAPSED";
    EXPAND_STATE[EXPAND_STATE["INDETERMINATE"] = 2] = "INDETERMINATE";
})(EXPAND_STATE || (EXPAND_STATE = {}));
var FiltersToolPanelHeaderPanel = /** @class */ (function (_super) {
    __extends$4(FiltersToolPanelHeaderPanel, _super);
    function FiltersToolPanelHeaderPanel() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    FiltersToolPanelHeaderPanel.prototype.preConstruct = function () {
        this.setTemplate(/* html */ "<div class=\"ag-filter-toolpanel-search\" role=\"presentation\">\n                <div ref=\"eExpand\" class=\"ag-filter-toolpanel-expand\"></div>\n                <ag-input-text-field ref=\"eFilterTextField\" class=\"ag-filter-toolpanel-search-input\"></ag-input-text-field>\n            </div>");
    };
    FiltersToolPanelHeaderPanel.prototype.postConstruct = function () {
        var translate = this.localeService.getLocaleTextFunc();
        this.eFilterTextField.onValueChange(this.onSearchTextChanged.bind(this));
        this.eFilterTextField.setInputAriaLabel(translate('ariaFilterColumnsInput', 'Filter Columns Input'));
        this.createExpandIcons();
        this.setExpandState(EXPAND_STATE.EXPANDED);
        this.addManagedListener(this.eExpand, 'click', this.onExpandClicked.bind(this));
        this.addManagedListener(this.eventService, core.Events.EVENT_NEW_COLUMNS_LOADED, this.showOrHideOptions.bind(this));
    };
    FiltersToolPanelHeaderPanel.prototype.init = function (params) {
        this.params = params;
        if (this.columnModel.isReady()) {
            this.showOrHideOptions();
        }
    };
    FiltersToolPanelHeaderPanel.prototype.createExpandIcons = function () {
        this.eExpand.appendChild(this.eExpandChecked = core._.createIconNoSpan('columnSelectOpen', this.gridOptionsService));
        this.eExpand.appendChild(this.eExpandUnchecked = core._.createIconNoSpan('columnSelectClosed', this.gridOptionsService));
        this.eExpand.appendChild(this.eExpandIndeterminate = core._.createIconNoSpan('columnSelectIndeterminate', this.gridOptionsService));
    };
    // we only show expand / collapse if we are showing filters
    FiltersToolPanelHeaderPanel.prototype.showOrHideOptions = function () {
        var showFilterSearch = !this.params.suppressFilterSearch;
        var showExpand = !this.params.suppressExpandAll;
        var translate = this.localeService.getLocaleTextFunc();
        this.eFilterTextField.setInputPlaceholder(translate('searchOoo', 'Search...'));
        var isFilterGroupPresent = function (col) { return col.getOriginalParent() && col.isFilterAllowed(); };
        var filterGroupsPresent = this.columnModel.getAllGridColumns().some(isFilterGroupPresent);
        core._.setDisplayed(this.eFilterTextField.getGui(), showFilterSearch);
        core._.setDisplayed(this.eExpand, showExpand && filterGroupsPresent);
    };
    FiltersToolPanelHeaderPanel.prototype.onSearchTextChanged = function () {
        var _this = this;
        if (!this.onSearchTextChangedDebounced) {
            this.onSearchTextChangedDebounced = core._.debounce(function () {
                _this.dispatchEvent({ type: 'searchChanged', searchText: _this.eFilterTextField.getValue() });
            }, 300);
        }
        this.onSearchTextChangedDebounced();
    };
    FiltersToolPanelHeaderPanel.prototype.onExpandClicked = function () {
        var event = this.currentExpandState === EXPAND_STATE.EXPANDED ? { type: 'collapseAll' } : { type: 'expandAll' };
        this.dispatchEvent(event);
    };
    FiltersToolPanelHeaderPanel.prototype.setExpandState = function (state) {
        this.currentExpandState = state;
        core._.setDisplayed(this.eExpandChecked, this.currentExpandState === EXPAND_STATE.EXPANDED);
        core._.setDisplayed(this.eExpandUnchecked, this.currentExpandState === EXPAND_STATE.COLLAPSED);
        core._.setDisplayed(this.eExpandIndeterminate, this.currentExpandState === EXPAND_STATE.INDETERMINATE);
    };
    __decorate$4([
        core.Autowired('columnModel')
    ], FiltersToolPanelHeaderPanel.prototype, "columnModel", void 0);
    __decorate$4([
        core.RefSelector('eExpand')
    ], FiltersToolPanelHeaderPanel.prototype, "eExpand", void 0);
    __decorate$4([
        core.RefSelector('eFilterTextField')
    ], FiltersToolPanelHeaderPanel.prototype, "eFilterTextField", void 0);
    __decorate$4([
        core.PreConstruct
    ], FiltersToolPanelHeaderPanel.prototype, "preConstruct", null);
    __decorate$4([
        core.PostConstruct
    ], FiltersToolPanelHeaderPanel.prototype, "postConstruct", null);
    return FiltersToolPanelHeaderPanel;
}(core.Component));

var __extends$3 = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate$3 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var ToolPanelFilterComp = /** @class */ (function (_super) {
    __extends$3(ToolPanelFilterComp, _super);
    function ToolPanelFilterComp(hideHeader) {
        if (hideHeader === void 0) { hideHeader = false; }
        var _this = _super.call(this, ToolPanelFilterComp.TEMPLATE) || this;
        _this.expanded = false;
        _this.hideHeader = hideHeader;
        return _this;
    }
    ToolPanelFilterComp.prototype.postConstruct = function () {
        this.eExpandChecked = core._.createIconNoSpan('columnSelectOpen', this.gridOptionsService);
        this.eExpandUnchecked = core._.createIconNoSpan('columnSelectClosed', this.gridOptionsService);
        this.eExpand.appendChild(this.eExpandChecked);
        this.eExpand.appendChild(this.eExpandUnchecked);
    };
    ToolPanelFilterComp.prototype.setColumn = function (column) {
        var _this = this;
        this.column = column;
        this.eFilterName.innerText = this.columnModel.getDisplayNameForColumn(this.column, 'filterToolPanel', false) || '';
        this.addManagedListener(this.eFilterToolPanelHeader, 'click', this.toggleExpanded.bind(this));
        this.addManagedListener(this.eFilterToolPanelHeader, 'keydown', function (e) {
            if (e.key === core.KeyCode.ENTER) {
                _this.toggleExpanded();
            }
        });
        this.addManagedListener(this.eventService, core.Events.EVENT_FILTER_OPENED, this.onFilterOpened.bind(this));
        this.addInIcon('filter', this.eFilterIcon, this.column);
        core._.setDisplayed(this.eFilterIcon, this.isFilterActive(), { skipAriaHidden: true });
        core._.setDisplayed(this.eExpandChecked, false);
        if (this.hideHeader) {
            core._.setDisplayed(this.eFilterToolPanelHeader, false);
            this.eFilterToolPanelHeader.removeAttribute('tabindex');
        }
        else {
            this.eFilterToolPanelHeader.setAttribute('tabindex', '0');
        }
        this.addManagedListener(this.column, core.Column.EVENT_FILTER_CHANGED, this.onFilterChanged.bind(this));
    };
    ToolPanelFilterComp.prototype.getColumn = function () {
        return this.column;
    };
    ToolPanelFilterComp.prototype.getColumnFilterName = function () {
        return this.columnModel.getDisplayNameForColumn(this.column, 'filterToolPanel', false);
    };
    ToolPanelFilterComp.prototype.addCssClassToTitleBar = function (cssClass) {
        this.eFilterToolPanelHeader.classList.add(cssClass);
    };
    ToolPanelFilterComp.prototype.addInIcon = function (iconName, eParent, column) {
        if (eParent == null) {
            return;
        }
        var eIcon = core._.createIconNoSpan(iconName, this.gridOptionsService, column);
        eParent.appendChild(eIcon);
    };
    ToolPanelFilterComp.prototype.isFilterActive = function () {
        return this.filterManager.isFilterActive(this.column);
    };
    ToolPanelFilterComp.prototype.onFilterChanged = function () {
        core._.setDisplayed(this.eFilterIcon, this.isFilterActive(), { skipAriaHidden: true });
        this.dispatchEvent({ type: core.Column.EVENT_FILTER_CHANGED });
    };
    ToolPanelFilterComp.prototype.toggleExpanded = function () {
        this.expanded ? this.collapse() : this.expand();
    };
    ToolPanelFilterComp.prototype.expand = function () {
        var _this = this;
        if (this.expanded) {
            return;
        }
        this.expanded = true;
        core._.setAriaExpanded(this.eFilterToolPanelHeader, true);
        core._.setDisplayed(this.eExpandChecked, true);
        core._.setDisplayed(this.eExpandUnchecked, false);
        var filterPanelWrapper = core._.loadTemplate(/* html */ "<div class=\"ag-filter-toolpanel-instance-filter\"></div>");
        var filterWrapper = this.filterManager.getOrCreateFilterWrapper(this.column, 'TOOLBAR');
        if (!filterWrapper) {
            return;
        }
        var filterPromise = filterWrapper.filterPromise, guiPromise = filterWrapper.guiPromise;
        filterPromise === null || filterPromise === void 0 ? void 0 : filterPromise.then(function (filter) {
            _this.underlyingFilter = filter;
            if (!filter) {
                return;
            }
            guiPromise.then(function (filterContainerEl) {
                if (filterContainerEl) {
                    filterPanelWrapper.appendChild(filterContainerEl);
                }
                _this.agFilterToolPanelBody.appendChild(filterPanelWrapper);
                if (filter.afterGuiAttached) {
                    filter.afterGuiAttached({ container: 'toolPanel' });
                }
            });
        });
    };
    ToolPanelFilterComp.prototype.collapse = function () {
        if (!this.expanded) {
            return;
        }
        this.expanded = false;
        core._.setAriaExpanded(this.eFilterToolPanelHeader, false);
        this.agFilterToolPanelBody.removeChild(this.agFilterToolPanelBody.children[0]);
        core._.setDisplayed(this.eExpandChecked, false);
        core._.setDisplayed(this.eExpandUnchecked, true);
    };
    ToolPanelFilterComp.prototype.refreshFilter = function () {
        if (!this.expanded) {
            return;
        }
        var filter = this.underlyingFilter;
        if (!filter) {
            return;
        }
        // set filters should be updated when the filter has been changed elsewhere, i.e. via api. Note that we can't
        // use 'afterGuiAttached' to refresh the virtual list as it also focuses on the mini filter which changes the
        // scroll position in the filter list panel
        if (typeof filter.refreshVirtualList === 'function') {
            filter.refreshVirtualList();
        }
    };
    ToolPanelFilterComp.prototype.onFilterOpened = function (event) {
        if (event.source !== 'COLUMN_MENU') {
            return;
        }
        if (event.column !== this.column) {
            return;
        }
        if (!this.expanded) {
            return;
        }
        this.collapse();
    };
    ToolPanelFilterComp.TEMPLATE = "\n        <div class=\"ag-filter-toolpanel-instance\">\n            <div class=\"ag-filter-toolpanel-header ag-filter-toolpanel-instance-header\" ref=\"eFilterToolPanelHeader\" role=\"button\" aria-expanded=\"false\">\n                <div ref=\"eExpand\" class=\"ag-filter-toolpanel-expand\"></div>\n                <span ref=\"eFilterName\" class=\"ag-header-cell-text\"></span>\n                <span ref=\"eFilterIcon\" class=\"ag-header-icon ag-filter-icon ag-filter-toolpanel-instance-header-icon\" aria-hidden=\"true\"></span>\n            </div>\n            <div class=\"ag-filter-toolpanel-instance-body ag-filter\" ref=\"agFilterToolPanelBody\"></div>\n        </div>";
    __decorate$3([
        core.RefSelector('eFilterToolPanelHeader')
    ], ToolPanelFilterComp.prototype, "eFilterToolPanelHeader", void 0);
    __decorate$3([
        core.RefSelector('eFilterName')
    ], ToolPanelFilterComp.prototype, "eFilterName", void 0);
    __decorate$3([
        core.RefSelector('agFilterToolPanelBody')
    ], ToolPanelFilterComp.prototype, "agFilterToolPanelBody", void 0);
    __decorate$3([
        core.RefSelector('eFilterIcon')
    ], ToolPanelFilterComp.prototype, "eFilterIcon", void 0);
    __decorate$3([
        core.RefSelector('eExpand')
    ], ToolPanelFilterComp.prototype, "eExpand", void 0);
    __decorate$3([
        core.Autowired('filterManager')
    ], ToolPanelFilterComp.prototype, "filterManager", void 0);
    __decorate$3([
        core.Autowired('columnModel')
    ], ToolPanelFilterComp.prototype, "columnModel", void 0);
    __decorate$3([
        core.PostConstruct
    ], ToolPanelFilterComp.prototype, "postConstruct", null);
    return ToolPanelFilterComp;
}(core.Component));

var __extends$2 = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate$2 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var ToolPanelFilterGroupComp = /** @class */ (function (_super) {
    __extends$2(ToolPanelFilterGroupComp, _super);
    function ToolPanelFilterGroupComp(columnGroup, childFilterComps, expandedCallback, depth, showingColumn) {
        var _this = _super.call(this) || this;
        _this.columnGroup = columnGroup;
        _this.childFilterComps = childFilterComps;
        _this.depth = depth;
        _this.expandedCallback = expandedCallback;
        _this.showingColumn = showingColumn;
        return _this;
    }
    ToolPanelFilterGroupComp.prototype.preConstruct = function () {
        var groupParams = {
            cssIdentifier: 'filter-toolpanel',
            direction: 'vertical'
        };
        this.setTemplate(ToolPanelFilterGroupComp.TEMPLATE, { filterGroupComp: groupParams });
    };
    ToolPanelFilterGroupComp.prototype.init = function () {
        var _this = this;
        this.setGroupTitle();
        this.filterGroupComp.setAlignItems('stretch');
        this.filterGroupComp.addCssClass("ag-filter-toolpanel-group-level-" + this.depth);
        this.filterGroupComp.addCssClassToTitleBar("ag-filter-toolpanel-group-level-" + this.depth + "-header");
        this.childFilterComps.forEach(function (filterComp) {
            _this.filterGroupComp.addItem(filterComp);
            filterComp.addCssClassToTitleBar("ag-filter-toolpanel-group-level-" + (_this.depth + 1) + "-header");
        });
        this.refreshFilterClass();
        this.addExpandCollapseListeners();
        this.addFilterChangedListeners();
        this.setupTooltip();
    };
    ToolPanelFilterGroupComp.prototype.setupTooltip = function () {
        var _this = this;
        // we don't show tooltips for groups, as when the group expands, it's div contains the columns which also
        // have tooltips, so the tooltips would clash. Eg mouse over group, tooltip shows, mouse over column, another
        // tooltip shows but cos we didn't leave the group the group tooltip remains. this should be fixed in the future,
        // maybe the group shouldn't contain the children form a DOM perspective.
        if (!this.showingColumn) {
            return;
        }
        var refresh = function () {
            var newTooltipText = _this.columnGroup.getColDef().headerTooltip;
            _this.setTooltip(newTooltipText);
        };
        refresh();
        this.addManagedListener(this.eventService, core.Events.EVENT_NEW_COLUMNS_LOADED, refresh);
    };
    ToolPanelFilterGroupComp.prototype.getTooltipParams = function () {
        var res = _super.prototype.getTooltipParams.call(this);
        res.location = 'filterToolPanelColumnGroup';
        return res;
    };
    ToolPanelFilterGroupComp.prototype.addCssClassToTitleBar = function (cssClass) {
        this.filterGroupComp.addCssClassToTitleBar(cssClass);
    };
    ToolPanelFilterGroupComp.prototype.refreshFilters = function () {
        this.childFilterComps.forEach(function (filterComp) {
            if (filterComp instanceof ToolPanelFilterGroupComp) {
                filterComp.refreshFilters();
            }
            else {
                filterComp.refreshFilter();
            }
        });
    };
    ToolPanelFilterGroupComp.prototype.isColumnGroup = function () {
        return this.columnGroup instanceof core.ProvidedColumnGroup;
    };
    ToolPanelFilterGroupComp.prototype.isExpanded = function () {
        return this.filterGroupComp.isExpanded();
    };
    ToolPanelFilterGroupComp.prototype.getChildren = function () {
        return this.childFilterComps;
    };
    ToolPanelFilterGroupComp.prototype.getFilterGroupName = function () {
        return this.filterGroupName ? this.filterGroupName : '';
    };
    ToolPanelFilterGroupComp.prototype.getFilterGroupId = function () {
        return this.columnGroup.getId();
    };
    ToolPanelFilterGroupComp.prototype.hideGroupItem = function (hide, index) {
        this.filterGroupComp.hideItem(hide, index);
    };
    ToolPanelFilterGroupComp.prototype.hideGroup = function (hide) {
        this.setDisplayed(!hide);
    };
    ToolPanelFilterGroupComp.prototype.forEachToolPanelFilterChild = function (action) {
        this.childFilterComps.forEach(function (filterComp) {
            if (filterComp instanceof ToolPanelFilterComp) {
                action(filterComp);
            }
        });
    };
    ToolPanelFilterGroupComp.prototype.addExpandCollapseListeners = function () {
        var _this = this;
        var expandListener = this.isColumnGroup() ?
            function () { return _this.expandedCallback(); } :
            function () { return _this.forEachToolPanelFilterChild(function (filterComp) { return filterComp.expand(); }); };
        var collapseListener = this.isColumnGroup() ?
            function () { return _this.expandedCallback(); } :
            function () { return _this.forEachToolPanelFilterChild(function (filterComp) { return filterComp.collapse(); }); };
        this.addManagedListener(this.filterGroupComp, core.AgGroupComponent.EVENT_EXPANDED, expandListener);
        this.addManagedListener(this.filterGroupComp, core.AgGroupComponent.EVENT_COLLAPSED, collapseListener);
    };
    ToolPanelFilterGroupComp.prototype.getColumns = function () {
        if (this.columnGroup instanceof core.ProvidedColumnGroup) {
            return this.columnGroup.getLeafColumns();
        }
        return [this.columnGroup];
    };
    ToolPanelFilterGroupComp.prototype.addFilterChangedListeners = function () {
        var _this = this;
        this.getColumns().forEach(function (column) {
            _this.addManagedListener(column, core.Column.EVENT_FILTER_CHANGED, function () { return _this.refreshFilterClass(); });
        });
        if (!(this.columnGroup instanceof core.ProvidedColumnGroup)) {
            this.addManagedListener(this.eventService, core.Events.EVENT_FILTER_OPENED, this.onFilterOpened.bind(this));
        }
    };
    ToolPanelFilterGroupComp.prototype.refreshFilterClass = function () {
        var columns = this.getColumns();
        var anyChildFiltersActive = function () { return columns.some(function (col) { return col.isFilterActive(); }); };
        this.filterGroupComp.addOrRemoveCssClass('ag-has-filter', anyChildFiltersActive());
    };
    ToolPanelFilterGroupComp.prototype.onFilterOpened = function (event) {
        // when a filter is opened elsewhere, i.e. column menu we close the filter comp so we also need to collapse
        // the column group. This approach means we don't need to try and sync filter models on the same column.
        if (event.source !== 'COLUMN_MENU') {
            return;
        }
        if (event.column !== this.columnGroup) {
            return;
        }
        if (!this.isExpanded()) {
            return;
        }
        this.collapse();
    };
    ToolPanelFilterGroupComp.prototype.expand = function () {
        this.filterGroupComp.toggleGroupExpand(true);
    };
    ToolPanelFilterGroupComp.prototype.collapse = function () {
        this.filterGroupComp.toggleGroupExpand(false);
    };
    ToolPanelFilterGroupComp.prototype.setGroupTitle = function () {
        this.filterGroupName = (this.columnGroup instanceof core.ProvidedColumnGroup) ?
            this.getColumnGroupName(this.columnGroup) : this.getColumnName(this.columnGroup);
        this.filterGroupComp.setTitle(this.filterGroupName || '');
    };
    ToolPanelFilterGroupComp.prototype.getColumnGroupName = function (columnGroup) {
        return this.columnModel.getDisplayNameForProvidedColumnGroup(null, columnGroup, 'filterToolPanel');
    };
    ToolPanelFilterGroupComp.prototype.getColumnName = function (column) {
        return this.columnModel.getDisplayNameForColumn(column, 'filterToolPanel', false);
    };
    ToolPanelFilterGroupComp.prototype.destroyFilters = function () {
        this.childFilterComps = this.destroyBeans(this.childFilterComps);
        core._.clearElement(this.getGui());
    };
    ToolPanelFilterGroupComp.prototype.destroy = function () {
        this.destroyFilters();
        _super.prototype.destroy.call(this);
    };
    ToolPanelFilterGroupComp.TEMPLATE = "<div class=\"ag-filter-toolpanel-group-wrapper\">\n            <ag-group-component ref=\"filterGroupComp\"></ag-group-component>\n        </div>";
    __decorate$2([
        core.RefSelector('filterGroupComp')
    ], ToolPanelFilterGroupComp.prototype, "filterGroupComp", void 0);
    __decorate$2([
        core.Autowired('columnModel')
    ], ToolPanelFilterGroupComp.prototype, "columnModel", void 0);
    __decorate$2([
        core.PreConstruct
    ], ToolPanelFilterGroupComp.prototype, "preConstruct", null);
    __decorate$2([
        core.PostConstruct
    ], ToolPanelFilterGroupComp.prototype, "init", null);
    return ToolPanelFilterGroupComp;
}(core.Component));

var __extends$1 = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate$1 = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var FiltersToolPanelListPanel = /** @class */ (function (_super) {
    __extends$1(FiltersToolPanelListPanel, _super);
    function FiltersToolPanelListPanel() {
        var _this = _super.call(this, FiltersToolPanelListPanel.TEMPLATE) || this;
        _this.initialised = false;
        _this.filterGroupComps = [];
        return _this;
    }
    FiltersToolPanelListPanel.prototype.init = function (params) {
        var _this = this;
        this.initialised = true;
        var defaultParams = {
            suppressExpandAll: false,
            suppressFilterSearch: false,
            suppressSyncLayoutWithGrid: false,
            api: this.gridApi,
            columnApi: this.columnApi,
            context: this.gridOptionsService.get('context')
        };
        core._.mergeDeep(defaultParams, params);
        this.params = defaultParams;
        if (!this.params.suppressSyncLayoutWithGrid) {
            this.addManagedListener(this.eventService, core.Events.EVENT_COLUMN_MOVED, function () { return _this.onColumnsChanged(); });
        }
        this.addManagedListener(this.eventService, core.Events.EVENT_NEW_COLUMNS_LOADED, function () { return _this.onColumnsChanged(); });
        this.addManagedListener(this.eventService, core.Events.EVENT_TOOL_PANEL_VISIBLE_CHANGED, function (event) {
            // when re-entering the filters tool panel we need to refresh the virtual lists in the set filters in case
            // filters have been changed elsewhere, i.e. via an api call.
            if (event.source === 'filters') {
                _this.refreshFilters();
            }
        });
        if (this.columnModel.isReady()) {
            this.onColumnsChanged();
        }
    };
    FiltersToolPanelListPanel.prototype.onColumnsChanged = function () {
        var pivotModeActive = this.columnModel.isPivotMode();
        var shouldSyncColumnLayoutWithGrid = !this.params.suppressSyncLayoutWithGrid && !pivotModeActive;
        shouldSyncColumnLayoutWithGrid ? this.syncFilterLayout() : this.buildTreeFromProvidedColumnDefs();
    };
    FiltersToolPanelListPanel.prototype.syncFilterLayout = function () {
        this.toolPanelColDefService.syncLayoutWithGrid(this.setFiltersLayout.bind(this));
    };
    FiltersToolPanelListPanel.prototype.buildTreeFromProvidedColumnDefs = function () {
        var _this = this;
        this.destroyFilters();
        var columnTree = this.columnModel.getPrimaryColumnTree();
        this.filterGroupComps = this.recursivelyAddComps(columnTree, 0);
        var len = this.filterGroupComps.length;
        if (len) {
            // skip the destroy function because this will be managed
            // by the `destroyFilters` function
            this.filterGroupComps.forEach(function (comp) { return _this.appendChild(comp); });
            this.setFirstAndLastVisible(0, len - 1);
        }
        // perform search if searchFilterText exists
        if (core._.exists(this.searchFilterText)) {
            this.searchFilters(this.searchFilterText);
        }
        // notify header of expand
        this.fireExpandedEvent();
    };
    FiltersToolPanelListPanel.prototype.setFiltersLayout = function (colDefs) {
        var _this = this;
        this.destroyFilters();
        var columnTree = this.toolPanelColDefService.createColumnTree(colDefs);
        this.filterGroupComps = this.recursivelyAddComps(columnTree, 0);
        var len = this.filterGroupComps.length;
        if (len) {
            // skip the destroy function because this will be managed
            // by the `destroyFilters` function
            this.filterGroupComps.forEach(function (comp) { return _this.appendChild(comp); });
            this.setFirstAndLastVisible(0, len - 1);
        }
        // perform search if searchFilterText exists
        if (core._.exists(this.searchFilterText)) {
            this.searchFilters(this.searchFilterText);
        }
        // notify header of expand
        this.fireExpandedEvent();
    };
    FiltersToolPanelListPanel.prototype.recursivelyAddComps = function (tree, depth) {
        var _this = this;
        return core._.flatten(tree.map(function (child) {
            if (child instanceof core.ProvidedColumnGroup) {
                return core._.flatten(_this.recursivelyAddFilterGroupComps(child, depth));
            }
            var column = child;
            if (!_this.shouldDisplayFilter(column)) {
                return [];
            }
            var hideFilterCompHeader = depth === 0;
            var filterComp = new ToolPanelFilterComp(hideFilterCompHeader);
            _this.createBean(filterComp);
            filterComp.setColumn(column);
            if (depth > 0) {
                return filterComp;
            }
            var filterGroupComp = _this.createBean(new ToolPanelFilterGroupComp(column, [filterComp], _this.onGroupExpanded.bind(_this), depth, true));
            filterGroupComp.addCssClassToTitleBar('ag-filter-toolpanel-header');
            filterGroupComp.collapse();
            return filterGroupComp;
        }));
    };
    FiltersToolPanelListPanel.prototype.recursivelyAddFilterGroupComps = function (columnGroup, depth) {
        if (!this.filtersExistInChildren(columnGroup.getChildren())) {
            return;
        }
        var colGroupDef = columnGroup.getColGroupDef();
        if (colGroupDef && colGroupDef.suppressFiltersToolPanel) {
            return [];
        }
        var newDepth = columnGroup.isPadding() ? depth : depth + 1;
        var childFilterComps = core._.flatten(this.recursivelyAddComps(columnGroup.getChildren(), newDepth));
        if (columnGroup.isPadding()) {
            return childFilterComps;
        }
        var filterGroupComp = new ToolPanelFilterGroupComp(columnGroup, childFilterComps, this.onGroupExpanded.bind(this), depth, false);
        this.createBean(filterGroupComp);
        filterGroupComp.addCssClassToTitleBar('ag-filter-toolpanel-header');
        return [filterGroupComp];
    };
    FiltersToolPanelListPanel.prototype.filtersExistInChildren = function (tree) {
        var _this = this;
        return tree.some(function (child) {
            if (child instanceof core.ProvidedColumnGroup) {
                return _this.filtersExistInChildren(child.getChildren());
            }
            return _this.shouldDisplayFilter(child);
        });
    };
    FiltersToolPanelListPanel.prototype.shouldDisplayFilter = function (column) {
        var suppressFiltersToolPanel = column.getColDef() && column.getColDef().suppressFiltersToolPanel;
        return column.isFilterAllowed() && !suppressFiltersToolPanel;
    };
    // we don't support refreshing, but must implement because it's on the tool panel interface
    FiltersToolPanelListPanel.prototype.refresh = function () { };
    // lazy initialise the panel
    FiltersToolPanelListPanel.prototype.setVisible = function (visible) {
        _super.prototype.setDisplayed.call(this, visible);
        if (visible && !this.initialised) {
            this.init(this.params);
        }
    };
    FiltersToolPanelListPanel.prototype.expandFilterGroups = function (expand, groupIds) {
        var updatedGroupIds = [];
        var updateGroupExpandState = function (filterGroup) {
            var groupId = filterGroup.getFilterGroupId();
            var shouldExpandOrCollapse = !groupIds || core._.includes(groupIds, groupId);
            if (shouldExpandOrCollapse) {
                // don't expand 'column groups', i.e. top level columns wrapped in a group
                if (expand && filterGroup.isColumnGroup()) {
                    filterGroup.expand();
                }
                else {
                    filterGroup.collapse();
                }
                updatedGroupIds.push(groupId);
            }
            // recursively look for more groups to expand / collapse
            filterGroup.getChildren().forEach(function (child) {
                if (child instanceof ToolPanelFilterGroupComp) {
                    updateGroupExpandState(child);
                }
            });
        };
        this.filterGroupComps.forEach(updateGroupExpandState);
        // update header expand / collapse icon
        this.onGroupExpanded();
        if (groupIds) {
            var unrecognisedGroupIds = groupIds.filter(function (groupId) { return updatedGroupIds.indexOf(groupId) < 0; });
            if (unrecognisedGroupIds.length > 0) {
                console.warn('AG Grid: unable to find groups for these supplied groupIds:', unrecognisedGroupIds);
            }
        }
    };
    FiltersToolPanelListPanel.prototype.expandFilters = function (expand, colIds) {
        var updatedColIds = [];
        var updateGroupExpandState = function (filterComp) {
            if (filterComp instanceof ToolPanelFilterGroupComp) {
                var anyChildrenChanged_1 = false;
                filterComp.getChildren().forEach(function (child) {
                    var childUpdated = updateGroupExpandState(child);
                    if (childUpdated) {
                        if (expand) {
                            filterComp.expand();
                            anyChildrenChanged_1 = true;
                        }
                        else if (!filterComp.isColumnGroup()) {
                            // we only collapse columns wrapped in groups
                            filterComp.collapse();
                        }
                    }
                });
                return anyChildrenChanged_1;
            }
            var colId = filterComp.getColumn().getColId();
            var updateFilterExpandState = !colIds || core._.includes(colIds, colId);
            if (updateFilterExpandState) {
                expand ? filterComp.expand() : filterComp.collapse();
                updatedColIds.push(colId);
            }
            return updateFilterExpandState;
        };
        this.filterGroupComps.forEach(updateGroupExpandState);
        // update header expand / collapse icon
        this.onGroupExpanded();
        if (colIds) {
            var unrecognisedColIds = colIds.filter(function (colId) { return updatedColIds.indexOf(colId) < 0; });
            if (unrecognisedColIds.length > 0) {
                console.warn('AG Grid: unable to find columns for these supplied colIds:', unrecognisedColIds);
            }
        }
    };
    FiltersToolPanelListPanel.prototype.onGroupExpanded = function () {
        this.fireExpandedEvent();
    };
    FiltersToolPanelListPanel.prototype.fireExpandedEvent = function () {
        var expandedCount = 0;
        var notExpandedCount = 0;
        var updateExpandCounts = function (filterGroup) {
            if (!filterGroup.isColumnGroup()) {
                return;
            }
            filterGroup.isExpanded() ? expandedCount++ : notExpandedCount++;
            filterGroup.getChildren().forEach(function (child) {
                if (child instanceof ToolPanelFilterGroupComp) {
                    updateExpandCounts(child);
                }
            });
        };
        this.filterGroupComps.forEach(updateExpandCounts);
        var state;
        if (expandedCount > 0 && notExpandedCount > 0) {
            state = EXPAND_STATE.INDETERMINATE;
        }
        else if (notExpandedCount > 0) {
            state = EXPAND_STATE.COLLAPSED;
        }
        else {
            state = EXPAND_STATE.EXPANDED;
        }
        this.dispatchEvent({ type: 'groupExpanded', state: state });
    };
    FiltersToolPanelListPanel.prototype.performFilterSearch = function (searchText) {
        this.searchFilterText = core._.exists(searchText) ? searchText.toLowerCase() : null;
        this.searchFilters(this.searchFilterText);
    };
    FiltersToolPanelListPanel.prototype.searchFilters = function (searchFilter) {
        var passesFilter = function (groupName) {
            return !core._.exists(searchFilter) || groupName.toLowerCase().indexOf(searchFilter) !== -1;
        };
        var recursivelySearch = function (filterItem, parentPasses) {
            if (!(filterItem instanceof ToolPanelFilterGroupComp)) {
                return passesFilter(filterItem.getColumnFilterName() || '');
            }
            var children = filterItem.getChildren();
            var groupNamePasses = passesFilter(filterItem.getFilterGroupName());
            // if group or parent already passed - ensure this group and all children are visible
            var alreadyPassed = parentPasses || groupNamePasses;
            if (alreadyPassed) {
                // ensure group visible
                filterItem.hideGroup(false);
                // ensure all children are visible
                for (var i = 0; i < children.length; i++) {
                    recursivelySearch(children[i], alreadyPassed);
                    filterItem.hideGroupItem(false, i);
                }
                return true;
            }
            // hide group item filters
            var anyChildPasses = false;
            children.forEach(function (child, index) {
                var childPasses = recursivelySearch(child, parentPasses);
                filterItem.hideGroupItem(!childPasses, index);
                if (childPasses) {
                    anyChildPasses = true;
                }
            });
            // hide group if no children pass
            filterItem.hideGroup(!anyChildPasses);
            return anyChildPasses;
        };
        var firstVisible;
        var lastVisible;
        this.filterGroupComps.forEach(function (filterGroup, idx) {
            recursivelySearch(filterGroup, false);
            if (firstVisible === undefined) {
                if (!filterGroup.containsCssClass('ag-hidden')) {
                    firstVisible = idx;
                    lastVisible = idx;
                }
            }
            else if (!filterGroup.containsCssClass('ag-hidden') && lastVisible !== idx) {
                lastVisible = idx;
            }
        });
        this.setFirstAndLastVisible(firstVisible, lastVisible);
    };
    FiltersToolPanelListPanel.prototype.setFirstAndLastVisible = function (firstIdx, lastIdx) {
        this.filterGroupComps.forEach(function (filterGroup, idx) {
            filterGroup.removeCssClass('ag-first-group-visible');
            filterGroup.removeCssClass('ag-last-group-visible');
            if (idx === firstIdx) {
                filterGroup.addCssClass('ag-first-group-visible');
            }
            if (idx === lastIdx) {
                filterGroup.addCssClass('ag-last-group-visible');
            }
        });
    };
    FiltersToolPanelListPanel.prototype.refreshFilters = function () {
        this.filterGroupComps.forEach(function (filterGroupComp) { return filterGroupComp.refreshFilters(); });
    };
    FiltersToolPanelListPanel.prototype.destroyFilters = function () {
        this.filterGroupComps = this.destroyBeans(this.filterGroupComps);
        core._.clearElement(this.getGui());
    };
    FiltersToolPanelListPanel.prototype.destroy = function () {
        this.destroyFilters();
        _super.prototype.destroy.call(this);
    };
    FiltersToolPanelListPanel.TEMPLATE = "<div class=\"ag-filter-list-panel\"></div>";
    __decorate$1([
        core.Autowired("gridApi")
    ], FiltersToolPanelListPanel.prototype, "gridApi", void 0);
    __decorate$1([
        core.Autowired("columnApi")
    ], FiltersToolPanelListPanel.prototype, "columnApi", void 0);
    __decorate$1([
        core.Autowired('toolPanelColDefService')
    ], FiltersToolPanelListPanel.prototype, "toolPanelColDefService", void 0);
    __decorate$1([
        core.Autowired('columnModel')
    ], FiltersToolPanelListPanel.prototype, "columnModel", void 0);
    return FiltersToolPanelListPanel;
}(core.Component));

var __extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
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
var FiltersToolPanel = /** @class */ (function (_super) {
    __extends(FiltersToolPanel, _super);
    function FiltersToolPanel() {
        var _this = _super.call(this, FiltersToolPanel.TEMPLATE) || this;
        _this.initialised = false;
        _this.listenerDestroyFuncs = [];
        return _this;
    }
    FiltersToolPanel.prototype.init = function (params) {
        // if initialised is true, means this is a refresh
        if (this.initialised) {
            this.listenerDestroyFuncs.forEach(function (func) { return func(); });
            this.listenerDestroyFuncs = [];
        }
        this.initialised = true;
        var defaultParams = {
            suppressExpandAll: false,
            suppressFilterSearch: false,
            suppressSyncLayoutWithGrid: false,
            api: this.gridApi,
            columnApi: this.columnApi,
        };
        this.params = __assign(__assign(__assign({}, defaultParams), params), { context: this.gridOptionsService.get('context') });
        this.filtersToolPanelHeaderPanel.init(this.params);
        this.filtersToolPanelListPanel.init(this.params);
        var hideExpand = this.params.suppressExpandAll;
        var hideSearch = this.params.suppressFilterSearch;
        if (hideExpand && hideSearch) {
            this.filtersToolPanelHeaderPanel.setDisplayed(false);
        }
        // this is necessary to prevent a memory leak while refreshing the tool panel
        this.listenerDestroyFuncs.push(this.addManagedListener(this.filtersToolPanelHeaderPanel, 'expandAll', this.onExpandAll.bind(this)), this.addManagedListener(this.filtersToolPanelHeaderPanel, 'collapseAll', this.onCollapseAll.bind(this)), this.addManagedListener(this.filtersToolPanelHeaderPanel, 'searchChanged', this.onSearchChanged.bind(this)), this.addManagedListener(this.filtersToolPanelListPanel, 'groupExpanded', this.onGroupExpanded.bind(this)));
    };
    // lazy initialise the panel
    FiltersToolPanel.prototype.setVisible = function (visible) {
        _super.prototype.setDisplayed.call(this, visible);
        if (visible && !this.initialised) {
            this.init(this.params);
        }
    };
    FiltersToolPanel.prototype.onExpandAll = function () {
        this.filtersToolPanelListPanel.expandFilterGroups(true);
    };
    FiltersToolPanel.prototype.onCollapseAll = function () {
        this.filtersToolPanelListPanel.expandFilterGroups(false);
    };
    FiltersToolPanel.prototype.onSearchChanged = function (event) {
        this.filtersToolPanelListPanel.performFilterSearch(event.searchText);
    };
    FiltersToolPanel.prototype.setFilterLayout = function (colDefs) {
        this.filtersToolPanelListPanel.setFiltersLayout(colDefs);
    };
    FiltersToolPanel.prototype.onGroupExpanded = function (event) {
        this.filtersToolPanelHeaderPanel.setExpandState(event.state);
    };
    FiltersToolPanel.prototype.expandFilterGroups = function (groupIds) {
        this.filtersToolPanelListPanel.expandFilterGroups(true, groupIds);
    };
    FiltersToolPanel.prototype.collapseFilterGroups = function (groupIds) {
        this.filtersToolPanelListPanel.expandFilterGroups(false, groupIds);
    };
    FiltersToolPanel.prototype.expandFilters = function (colIds) {
        this.filtersToolPanelListPanel.expandFilters(true, colIds);
    };
    FiltersToolPanel.prototype.collapseFilters = function (colIds) {
        this.filtersToolPanelListPanel.expandFilters(false, colIds);
    };
    FiltersToolPanel.prototype.syncLayoutWithGrid = function () {
        this.filtersToolPanelListPanel.syncFilterLayout();
    };
    FiltersToolPanel.prototype.refresh = function () {
        this.init(this.params);
    };
    // this is a user component, and IComponent has "public destroy()" as part of the interface.
    // so we need to override destroy() just to make the method public.
    FiltersToolPanel.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
    };
    FiltersToolPanel.TEMPLATE = "<div class=\"ag-filter-toolpanel\">\n            <ag-filters-tool-panel-header ref=\"filtersToolPanelHeaderPanel\"></ag-filters-tool-panel-header>\n            <ag-filters-tool-panel-list ref=\"filtersToolPanelListPanel\"></ag-filters-tool-panel-list>\n         </div>";
    __decorate([
        core.RefSelector('filtersToolPanelHeaderPanel')
    ], FiltersToolPanel.prototype, "filtersToolPanelHeaderPanel", void 0);
    __decorate([
        core.RefSelector('filtersToolPanelListPanel')
    ], FiltersToolPanel.prototype, "filtersToolPanelListPanel", void 0);
    __decorate([
        core.Autowired('gridApi')
    ], FiltersToolPanel.prototype, "gridApi", void 0);
    __decorate([
        core.Autowired('columnApi')
    ], FiltersToolPanel.prototype, "columnApi", void 0);
    return FiltersToolPanel;
}(core.Component));

// DO NOT UPDATE MANUALLY: Generated from script during build time
var VERSION = '29.0.0';

var FiltersToolPanelModule = {
    version: VERSION,
    moduleName: core.ModuleNames.FiltersToolPanelModule,
    beans: [],
    agStackComponents: [
        { componentName: 'AgFiltersToolPanelHeader', componentClass: FiltersToolPanelHeaderPanel },
        { componentName: 'AgFiltersToolPanelList', componentClass: FiltersToolPanelListPanel }
    ],
    userComponents: [
        { componentName: 'agFiltersToolPanel', componentClass: FiltersToolPanel },
    ],
    dependantModules: [
        sideBar.SideBarModule,
        core$1.EnterpriseCoreModule
    ]
};

exports.FiltersToolPanelModule = FiltersToolPanelModule;
