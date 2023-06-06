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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { _, AgGroupComponent, Autowired, Column, Component, Events, ProvidedColumnGroup, PostConstruct, PreConstruct, RefSelector } from "@ag-grid-community/core";
import { ToolPanelFilterComp } from "./toolPanelFilterComp";
var ToolPanelFilterGroupComp = /** @class */ (function (_super) {
    __extends(ToolPanelFilterGroupComp, _super);
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
        this.addManagedListener(this.eventService, Events.EVENT_NEW_COLUMNS_LOADED, refresh);
    };
    ToolPanelFilterGroupComp.prototype.getTooltipParams = function () {
        var res = _super.prototype.getTooltipParams.call(this);
        res.location = 'filterToolPanelColumnGroup';
        return res;
    };
    ToolPanelFilterGroupComp.prototype.addCssClassToTitleBar = function (cssClass) {
        this.filterGroupComp.addCssClassToTitleBar(cssClass);
    };
    ToolPanelFilterGroupComp.prototype.refreshFilters = function (isDisplayed) {
        this.childFilterComps.forEach(function (filterComp) {
            if (filterComp instanceof ToolPanelFilterGroupComp) {
                filterComp.refreshFilters(isDisplayed);
            }
            else {
                filterComp.refreshFilter(isDisplayed);
            }
        });
    };
    ToolPanelFilterGroupComp.prototype.isColumnGroup = function () {
        return this.columnGroup instanceof ProvidedColumnGroup;
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
        this.addManagedListener(this.filterGroupComp, AgGroupComponent.EVENT_EXPANDED, expandListener);
        this.addManagedListener(this.filterGroupComp, AgGroupComponent.EVENT_COLLAPSED, collapseListener);
    };
    ToolPanelFilterGroupComp.prototype.getColumns = function () {
        if (this.columnGroup instanceof ProvidedColumnGroup) {
            return this.columnGroup.getLeafColumns();
        }
        return [this.columnGroup];
    };
    ToolPanelFilterGroupComp.prototype.addFilterChangedListeners = function () {
        var _this = this;
        this.getColumns().forEach(function (column) {
            _this.addManagedListener(column, Column.EVENT_FILTER_CHANGED, function () { return _this.refreshFilterClass(); });
        });
        if (!(this.columnGroup instanceof ProvidedColumnGroup)) {
            this.addManagedListener(this.eventService, Events.EVENT_FILTER_OPENED, this.onFilterOpened.bind(this));
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
        this.filterGroupName = (this.columnGroup instanceof ProvidedColumnGroup) ?
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
        _.clearElement(this.getGui());
    };
    ToolPanelFilterGroupComp.prototype.destroy = function () {
        this.destroyFilters();
        _super.prototype.destroy.call(this);
    };
    ToolPanelFilterGroupComp.TEMPLATE = "<div class=\"ag-filter-toolpanel-group-wrapper\">\n            <ag-group-component ref=\"filterGroupComp\"></ag-group-component>\n        </div>";
    __decorate([
        RefSelector('filterGroupComp')
    ], ToolPanelFilterGroupComp.prototype, "filterGroupComp", void 0);
    __decorate([
        Autowired('columnModel')
    ], ToolPanelFilterGroupComp.prototype, "columnModel", void 0);
    __decorate([
        PreConstruct
    ], ToolPanelFilterGroupComp.prototype, "preConstruct", null);
    __decorate([
        PostConstruct
    ], ToolPanelFilterGroupComp.prototype, "init", null);
    return ToolPanelFilterGroupComp;
}(Component));
export { ToolPanelFilterGroupComp };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9vbFBhbmVsRmlsdGVyR3JvdXBDb21wLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2ZpbHRlclRvb2xQYW5lbC90b29sUGFuZWxGaWx0ZXJHcm91cENvbXAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsT0FBTyxFQUNILENBQUMsRUFDRCxnQkFBZ0IsRUFDaEIsU0FBUyxFQUNULE1BQU0sRUFFTixTQUFTLEVBQ1QsTUFBTSxFQUVOLG1CQUFtQixFQUVuQixhQUFhLEVBRWIsWUFBWSxFQUNaLFdBQVcsRUFHZCxNQUFNLHlCQUF5QixDQUFDO0FBQ2pDLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLHVCQUF1QixDQUFDO0FBSTVEO0lBQThDLDRDQUFTO0lBaUJuRCxrQ0FBWSxXQUE0QixFQUFFLGdCQUF1QyxFQUM3RSxnQkFBNEIsRUFBRSxLQUFhLEVBQUUsYUFBc0I7UUFEdkUsWUFFSSxpQkFBTyxTQU1WO1FBTEcsS0FBSSxDQUFDLFdBQVcsR0FBRyxXQUFXLENBQUM7UUFDL0IsS0FBSSxDQUFDLGdCQUFnQixHQUFHLGdCQUFnQixDQUFDO1FBQ3pDLEtBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO1FBQ25CLEtBQUksQ0FBQyxnQkFBZ0IsR0FBRyxnQkFBZ0IsQ0FBQztRQUN6QyxLQUFJLENBQUMsYUFBYSxHQUFHLGFBQWEsQ0FBQzs7SUFDdkMsQ0FBQztJQUdPLCtDQUFZLEdBQXBCO1FBQ0ksSUFBTSxXQUFXLEdBQTJCO1lBQ3hDLGFBQWEsRUFBRSxrQkFBa0I7WUFDakMsU0FBUyxFQUFFLFVBQVU7U0FDeEIsQ0FBQztRQUNGLElBQUksQ0FBQyxXQUFXLENBQUMsd0JBQXdCLENBQUMsUUFBUSxFQUFFLEVBQUUsZUFBZSxFQUFFLFdBQVcsRUFBRSxDQUFDLENBQUM7SUFDMUYsQ0FBQztJQUdNLHVDQUFJLEdBQVg7UUFEQSxpQkFpQkM7UUFmRyxJQUFJLENBQUMs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