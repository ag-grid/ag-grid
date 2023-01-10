"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToolPanelFilterGroupComp = void 0;
const core_1 = require("@ag-grid-community/core");
const toolPanelFilterComp_1 = require("./toolPanelFilterComp");
class ToolPanelFilterGroupComp extends core_1.Component {
    constructor(columnGroup, childFilterComps, expandedCallback, depth, showingColumn) {
        super();
        this.columnGroup = columnGroup;
        this.childFilterComps = childFilterComps;
        this.depth = depth;
        this.expandedCallback = expandedCallback;
        this.showingColumn = showingColumn;
    }
    preConstruct() {
        const groupParams = {
            cssIdentifier: 'filter-toolpanel',
            direction: 'vertical'
        };
        this.setTemplate(ToolPanelFilterGroupComp.TEMPLATE, { filterGroupComp: groupParams });
    }
    init() {
        this.setGroupTitle();
        this.filterGroupComp.setAlignItems('stretch');
        this.filterGroupComp.addCssClass(`ag-filter-toolpanel-group-level-${this.depth}`);
        this.filterGroupComp.addCssClassToTitleBar(`ag-filter-toolpanel-group-level-${this.depth}-header`);
        this.childFilterComps.forEach(filterComp => {
            this.filterGroupComp.addItem(filterComp);
            filterComp.addCssClassToTitleBar(`ag-filter-toolpanel-group-level-${this.depth + 1}-header`);
        });
        this.refreshFilterClass();
        this.addExpandCollapseListeners();
        this.addFilterChangedListeners();
        this.setupTooltip();
    }
    setupTooltip() {
        // we don't show tooltips for groups, as when the group expands, it's div contains the columns which also
        // have tooltips, so the tooltips would clash. Eg mouse over group, tooltip shows, mouse over column, another
        // tooltip shows but cos we didn't leave the group the group tooltip remains. this should be fixed in the future,
        // maybe the group shouldn't contain the children form a DOM perspective.
        if (!this.showingColumn) {
            return;
        }
        const refresh = () => {
            const newTooltipText = this.columnGroup.getColDef().headerTooltip;
            this.setTooltip(newTooltipText);
        };
        refresh();
        this.addManagedListener(this.eventService, core_1.Events.EVENT_NEW_COLUMNS_LOADED, refresh);
    }
    getTooltipParams() {
        const res = super.getTooltipParams();
        res.location = 'filterToolPanelColumnGroup';
        return res;
    }
    addCssClassToTitleBar(cssClass) {
        this.filterGroupComp.addCssClassToTitleBar(cssClass);
    }
    refreshFilters() {
        this.childFilterComps.forEach(filterComp => {
            if (filterComp instanceof ToolPanelFilterGroupComp) {
                filterComp.refreshFilters();
            }
            else {
                filterComp.refreshFilter();
            }
        });
    }
    isColumnGroup() {
        return this.columnGroup instanceof core_1.ProvidedColumnGroup;
    }
    isExpanded() {
        return this.filterGroupComp.isExpanded();
    }
    getChildren() {
        return this.childFilterComps;
    }
    getFilterGroupName() {
        return this.filterGroupName ? this.filterGroupName : '';
    }
    getFilterGroupId() {
        return this.columnGroup.getId();
    }
    hideGroupItem(hide, index) {
        this.filterGroupComp.hideItem(hide, index);
    }
    hideGroup(hide) {
        this.setDisplayed(!hide);
    }
    forEachToolPanelFilterChild(action) {
        this.childFilterComps.forEach(filterComp => {
            if (filterComp instanceof toolPanelFilterComp_1.ToolPanelFilterComp) {
                action(filterComp);
            }
        });
    }
    addExpandCollapseListeners() {
        const expandListener = this.isColumnGroup() ?
            () => this.expandedCallback() :
            () => this.forEachToolPanelFilterChild(filterComp => filterComp.expand());
        const collapseListener = this.isColumnGroup() ?
            () => this.expandedCallback() :
            () => this.forEachToolPanelFilterChild(filterComp => filterComp.collapse());
        this.addManagedListener(this.filterGroupComp, core_1.AgGroupComponent.EVENT_EXPANDED, expandListener);
        this.addManagedListener(this.filterGroupComp, core_1.AgGroupComponent.EVENT_COLLAPSED, collapseListener);
    }
    getColumns() {
        if (this.columnGroup instanceof core_1.ProvidedColumnGroup) {
            return this.columnGroup.getLeafColumns();
        }
        return [this.columnGroup];
    }
    addFilterChangedListeners() {
        this.getColumns().forEach(column => {
            this.addManagedListener(column, core_1.Column.EVENT_FILTER_CHANGED, () => this.refreshFilterClass());
        });
        if (!(this.columnGroup instanceof core_1.ProvidedColumnGroup)) {
            this.addManagedListener(this.eventService, core_1.Events.EVENT_FILTER_OPENED, this.onFilterOpened.bind(this));
        }
    }
    refreshFilterClass() {
        const columns = this.getColumns();
        const anyChildFiltersActive = () => columns.some(col => col.isFilterActive());
        this.filterGroupComp.addOrRemoveCssClass('ag-has-filter', anyChildFiltersActive());
    }
    onFilterOpened(event) {
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
    }
    expand() {
        this.filterGroupComp.toggleGroupExpand(true);
    }
    collapse() {
        this.filterGroupComp.toggleGroupExpand(false);
    }
    setGroupTitle() {
        this.filterGroupName = (this.columnGroup instanceof core_1.ProvidedColumnGroup) ?
            this.getColumnGroupName(this.columnGroup) : this.getColumnName(this.columnGroup);
        this.filterGroupComp.setTitle(this.filterGroupName || '');
    }
    getColumnGroupName(columnGroup) {
        return this.columnModel.getDisplayNameForProvidedColumnGroup(null, columnGroup, 'filterToolPanel');
    }
    getColumnName(column) {
        return this.columnModel.getDisplayNameForColumn(column, 'filterToolPanel', false);
    }
    destroyFilters() {
        this.childFilterComps = this.destroyBeans(this.childFilterComps);
        core_1._.clearElement(this.getGui());
    }
    destroy() {
        this.destroyFilters();
        super.destroy();
    }
}
ToolPanelFilterGroupComp.TEMPLATE = `<div class="ag-filter-toolpanel-group-wrapper">
            <ag-group-component ref="filterGroupComp"></ag-group-component>
        </div>`;
__decorate([
    core_1.RefSelector('filterGroupComp')
], ToolPanelFilterGroupComp.prototype, "filterGroupComp", void 0);
__decorate([
    core_1.Autowired('columnModel')
], ToolPanelFilterGroupComp.prototype, "columnModel", void 0);
__decorate([
    core_1.PreConstruct
], ToolPanelFilterGroupComp.prototype, "preConstruct", null);
__decorate([
    core_1.PostConstruct
], ToolPanelFilterGroupComp.prototype, "init", null);
exports.ToolPanelFilterGroupComp = ToolPanelFilterGroupComp;
