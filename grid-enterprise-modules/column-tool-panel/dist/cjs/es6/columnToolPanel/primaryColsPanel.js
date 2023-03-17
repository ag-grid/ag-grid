"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrimaryColsPanel = void 0;
const core_1 = require("@ag-grid-community/core");
class PrimaryColsPanel extends core_1.Component {
    constructor() {
        super(PrimaryColsPanel.TEMPLATE);
    }
    // we allow dragging in the toolPanel, but not when this component appears in the column menu
    init(allowDragging, params, eventType) {
        this.allowDragging = allowDragging;
        this.params = params;
        this.eventType = eventType;
        this.primaryColsHeaderPanel.init(this.params);
        const hideFilter = this.params.suppressColumnFilter;
        const hideSelect = this.params.suppressColumnSelectAll;
        const hideExpand = this.params.suppressColumnExpandAll;
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
        this.positionableFeature = new core_1.PositionableFeature(this.getGui(), { minHeight: 100 });
        this.createManagedBean(this.positionableFeature);
    }
    toggleResizable(resizable) {
        this.positionableFeature.setResizable(resizable ? { bottom: true } : false);
    }
    onExpandAll() {
        this.primaryColsListPanel.doSetExpandedAll(true);
    }
    onCollapseAll() {
        this.primaryColsListPanel.doSetExpandedAll(false);
    }
    expandGroups(groupIds) {
        this.primaryColsListPanel.setGroupsExpanded(true, groupIds);
    }
    collapseGroups(groupIds) {
        this.primaryColsListPanel.setGroupsExpanded(false, groupIds);
    }
    setColumnLayout(colDefs) {
        this.primaryColsListPanel.setColumnLayout(colDefs);
    }
    onFilterChanged(event) {
        this.primaryColsListPanel.setFilterText(event.filterText);
    }
    syncLayoutWithGrid() {
        this.primaryColsListPanel.onColumnsChanged();
    }
    onSelectAll() {
        this.primaryColsListPanel.doSetSelectedAll(true);
    }
    onUnselectAll() {
        this.primaryColsListPanel.doSetSelectedAll(false);
    }
    onGroupExpanded(event) {
        this.primaryColsHeaderPanel.setExpandState(event.state);
    }
    onSelectionChange(event) {
        this.primaryColsHeaderPanel.setSelectionState(event.state);
    }
}
PrimaryColsPanel.TEMPLATE = `<div class="ag-column-select">
            <ag-primary-cols-header ref="primaryColsHeaderPanel"></ag-primary-cols-header>
            <ag-primary-cols-list ref="primaryColsListPanel"></ag-primary-cols-list>
        </div>`;
__decorate([
    core_1.RefSelector('primaryColsHeaderPanel')
], PrimaryColsPanel.prototype, "primaryColsHeaderPanel", void 0);
__decorate([
    core_1.RefSelector('primaryColsListPanel')
], PrimaryColsPanel.prototype, "primaryColsListPanel", void 0);
exports.PrimaryColsPanel = PrimaryColsPanel;
