var __extends = (this && this.__extends) || (function () {
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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { _, Autowired, Component, RefSelector } from "@ag-grid-community/core";
var FiltersToolPanel = /** @class */ (function (_super) {
    __extends(FiltersToolPanel, _super);
    function FiltersToolPanel() {
        var _this = _super.call(this, FiltersToolPanel.TEMPLATE) || this;
        _this.initialised = false;
        return _this;
    }
    FiltersToolPanel.prototype.init = function (params) {
        this.initialised = true;
        var defaultParams = {
            suppressExpandAll: false,
            suppressFilterSearch: false,
            suppressSyncLayoutWithGrid: false,
            api: this.gridApi,
            columnApi: this.columnApi
        };
        _.mergeDeep(defaultParams, params);
        this.params = defaultParams;
        this.filtersToolPanelHeaderPanel.init(this.params);
        this.filtersToolPanelListPanel.init(this.params);
        var hideExpand = this.params.suppressExpandAll;
        var hideSearch = this.params.suppressFilterSearch;
        if (hideExpand && hideSearch) {
            this.filtersToolPanelHeaderPanel.setDisplayed(false);
        }
        this.addManagedListener(this.filtersToolPanelHeaderPanel, 'expandAll', this.onExpandAll.bind(this));
        this.addManagedListener(this.filtersToolPanelHeaderPanel, 'collapseAll', this.onCollapseAll.bind(this));
        this.addManagedListener(this.filtersToolPanelHeaderPanel, 'searchChanged', this.onSearchChanged.bind(this));
        this.addManagedListener(this.filtersToolPanelListPanel, 'groupExpanded', this.onGroupExpanded.bind(this));
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
    FiltersToolPanel.TEMPLATE = "<div class=\"ag-filter-toolpanel\">\n            <ag-filters-tool-panel-header ref=\"filtersToolPanelHeaderPanel\"></ag-filters-tool-panel-header>\n            <ag-filters-tool-panel-list ref=\"filtersToolPanelListPanel\"></ag-filters-tool-panel-list> \n         </div>";
    __decorate([
        RefSelector('filtersToolPanelHeaderPanel')
    ], FiltersToolPanel.prototype, "filtersToolPanelHeaderPanel", void 0);
    __decorate([
        RefSelector('filtersToolPanelListPanel')
    ], FiltersToolPanel.prototype, "filtersToolPanelListPanel", void 0);
    __decorate([
        Autowired('gridApi')
    ], FiltersToolPanel.prototype, "gridApi", void 0);
    __decorate([
        Autowired('columnApi')
    ], FiltersToolPanel.prototype, "columnApi", void 0);
    return FiltersToolPanel;
}(Component));
export { FiltersToolPanel };
