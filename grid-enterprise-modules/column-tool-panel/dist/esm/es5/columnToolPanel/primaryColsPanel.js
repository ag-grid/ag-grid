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
import { Component, RefSelector, PositionableFeature } from "@ag-grid-community/core";
var PrimaryColsPanel = /** @class */ (function (_super) {
    __extends(PrimaryColsPanel, _super);
    function PrimaryColsPanel() {
        return _super.call(this, PrimaryColsPanel.TEMPLATE) || this;
    }
    // we allow dragging in the toolPanel, but not when this component appears in the column menu
    PrimaryColsPanel.prototype.init = function (allowDragging, params, eventType) {
        this.allowDragging = allowDragging;
        this.params = params;
        this.eventType = eventType;
        this.primaryColsHeaderPanel.init(this.params);
        var hideFilter = this.params.suppressColumnFilter;
        var hideSelect = this.params.suppressColumnSelectAll;
        var hideExpand = this.params.suppressColumnExpandAll;
        if (hideExpand && hideFilter && hideSelect) {
            this.primaryColsHeaderPanel.setDisplayed(false);
        }
        this.addManagedListener(this.primaryColsListPanel, 'groupExpanded', this.onGroupExpanded.bind(this));
        this.addManagedListener(this.primaryColsListPanel, 'selectionChanged', this.onSelectionChange.bind(this));
        this.primaryColsListPanel.init(this.params, this.allowDragging, this.eventType);
        this.addManagedListener(this.primaryColsHeaderPanel, 'expandAll', this.onExpandAll.bind(this));
        this.addManagedListener(this.primaryColsHeaderPanel, 'collapseAll', this.onCollapseAll.bind(this));
        this.addManagedListener(this.primaryColsHeaderPanel, 'selectAll', this.onSelectAll.bind(this));
        this.addManagedListener(this.primaryColsHeaderPanel, 'unselectAll', this.onUnselectAll.bind(this));
        this.addManagedListener(this.primaryColsHeaderPanel, 'filterChanged', this.onFilterChanged.bind(this));
        this.positionableFeature = new PositionableFeature(this.getGui(), { minHeight: 100 });
        this.createManagedBean(this.positionableFeature);
    };
    PrimaryColsPanel.prototype.toggleResizable = function (resizable) {
        this.positionableFeature.setResizable(resizable ? { bottom: true } : false);
    };
    PrimaryColsPanel.prototype.onExpandAll = function () {
        this.primaryColsListPanel.doSetExpandedAll(true);
    };
    PrimaryColsPanel.prototype.onCollapseAll = function () {
        this.primaryColsListPanel.doSetExpandedAll(false);
    };
    PrimaryColsPanel.prototype.expandGroups = function (groupIds) {
        this.primaryColsListPanel.setGroupsExpanded(true, groupIds);
    };
    PrimaryColsPanel.prototype.collapseGroups = function (groupIds) {
        this.primaryColsListPanel.setGroupsExpanded(false, groupIds);
    };
    PrimaryColsPanel.prototype.setColumnLayout = function (colDefs) {
        this.primaryColsListPanel.setColumnLayout(colDefs);
    };
    PrimaryColsPanel.prototype.onFilterChanged = function (event) {
        this.primaryColsListPanel.setFilterText(event.filterText);
    };
    PrimaryColsPanel.prototype.syncLayoutWithGrid = function () {
        this.primaryColsListPanel.onColumnsChanged();
    };
    PrimaryColsPanel.prototype.onSelectAll = function () {
        this.primaryColsListPanel.doSetSelectedAll(true);
    };
    PrimaryColsPanel.prototype.onUnselectAll = function () {
        this.primaryColsListPanel.doSetSelectedAll(false);
    };
    PrimaryColsPanel.prototype.onGroupExpanded = function (event) {
        this.primaryColsHeaderPanel.setExpandState(event.state);
    };
    PrimaryColsPanel.prototype.onSelectionChange = function (event) {
        this.primaryColsHeaderPanel.setSelectionState(event.state);
    };
    PrimaryColsPanel.TEMPLATE = "<div class=\"ag-column-select\">\n            <ag-primary-cols-header ref=\"primaryColsHeaderPanel\"></ag-primary-cols-header>\n            <ag-primary-cols-list ref=\"primaryColsListPanel\"></ag-primary-cols-list>\n        </div>";
    __decorate([
        RefSelector('primaryColsHeaderPanel')
    ], PrimaryColsPanel.prototype, "primaryColsHeaderPanel", void 0);
    __decorate([
        RefSelector('primaryColsListPanel')
    ], PrimaryColsPanel.prototype, "primaryColsListPanel", void 0);
    return PrimaryColsPanel;
}(Component));
export { PrimaryColsPanel };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJpbWFyeUNvbHNQYW5lbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9jb2x1bW5Ub29sUGFuZWwvcHJpbWFyeUNvbHNQYW5lbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxPQUFPLEVBR0gsU0FBUyxFQUVULFdBQVcsRUFHWCxtQkFBbUIsRUFDdEIsTUFBTSx5QkFBeUIsQ0FBQztBQUlqQztJQUFzQyxvQ0FBUztJQWdCM0M7ZUFDSSxrQkFBTSxnQkFBZ0IsQ0FBQyxRQUFRLENBQUM7SUFDcEMsQ0FBQztJQUVELDZGQUE2RjtJQUN0RiwrQkFBSSxHQUFYLFVBQ0ksYUFBc0IsRUFDdEIsTUFBaUMsRUFDakMsU0FBMEI7UUFFMUIsSUFBSSxDQUFDLGFBQWEsR0FBRyxhQUFhLENBQUM7UUFDbkMsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7UUFDckIsSUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7UUFFM0IsSUFBSSxDQUFDLHNCQUFzQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7UUFFOUMsSUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQztRQUNwRCxJQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLHVCQUF1QixDQUFDO1FBQ3ZELElBQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsdUJBQXVCLENBQUM7UUFFdkQsSUFBSSxVQUFVLElBQUksVUFBVSxJQUFJLFVBQVUsRUFBRTtZQUN4QyxJQUFJLENBQUMsc0JBQXNCLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDO1NBQ25EO1FBRUQsSUFBSSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxvQkFBb0IsRUFBRSxlQUFlLEVBQUUsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMs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