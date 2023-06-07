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
import { Autowired, Component, RefSelector } from "@ag-grid-community/core";
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
        this.params = __assign(__assign(__assign({}, defaultParams), params), { context: this.gridOptionsService.context });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsdGVyc1Rvb2xQYW5lbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9maWx0ZXJUb29sUGFuZWwvZmlsdGVyc1Rvb2xQYW5lbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLE9BQU8sRUFDSCxTQUFTLEVBSVQsU0FBUyxFQUtULFdBQVcsRUFDZCxNQUFNLHlCQUF5QixDQUFDO0FBYWpDO0lBQXNDLG9DQUFTO0lBbUIzQztRQUFBLFlBQ0ksa0JBQU0sZ0JBQWdCLENBQUMsUUFBUSxDQUFDLFNBQ25DO1FBTk8saUJBQVcsR0FBRyxLQUFLLENBQUM7UUFFcEIsMEJBQW9CLEdBQW1CLEVBQUUsQ0FBQzs7SUFJbEQsQ0FBQztJQUVNLCtCQUFJLEdBQVgsVUFBWSxNQUFrQztRQUMxQyxrREFBa0Q7UUFDbEQsSUFBSSxJQUFJLENBQUMsV0FBVyxFQUFFO1lBQ2xCLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxPQUFPLENBQUMsVUFBQSxJQUFJLElBQUksT0FBQSxJQUFJLEVBQUUsRUFBTixDQUFNLENBQUMsQ0FBQztZQUNsRCxJQUFJLENBQUMsb0JBQW9CLEdBQUcsRUFBRSxDQUFDO1NBQ2xDO1FBRUQsSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUM7UUFFeEIsSUFBTSxhQUFhLEdBQWdEO1lBQy9ELGlCQUFpQixFQUFFLEtBQUs7WUFDeEIsb0JBQW9CLEVBQUUsS0FBSztZQUMzQiwwQkFBMEIsRUFBRSxLQUFLO1lBQ2pDLEdBQUcsRUFBRSxJQUFJLENBQUMsT0FBTztZQUNqQixTQUFTLEVBQUUsSUFBSSxDQUFDLFNBQVM7U0FDNUIsQ0FBQztRQUNGLElBQUksQ0FBQyxNQUFNLGtDQUNKLGFBQWEsR0FDYixNQUFNLEtBQ1QsT0FBTyxFQUFFLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLEdBQzNDLENBQUM7UUFFRixJQUFJLENBQUMsMkJBQTJCLENBQUMs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