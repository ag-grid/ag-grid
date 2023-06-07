var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { _, AgGroupComponent, Autowired, Column, Component, Events, ProvidedColumnGroup, PostConstruct, PreConstruct, RefSelector } from "@ag-grid-community/core";
import { ToolPanelFilterComp } from "./toolPanelFilterComp";
export class ToolPanelFilterGroupComp extends Component {
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
        this.addManagedListener(this.eventService, Events.EVENT_NEW_COLUMNS_LOADED, refresh);
    }
    getTooltipParams() {
        const res = super.getTooltipParams();
        res.location = 'filterToolPanelColumnGroup';
        return res;
    }
    addCssClassToTitleBar(cssClass) {
        this.filterGroupComp.addCssClassToTitleBar(cssClass);
    }
    refreshFilters(isDisplayed) {
        this.childFilterComps.forEach(filterComp => {
            if (filterComp instanceof ToolPanelFilterGroupComp) {
                filterComp.refreshFilters(isDisplayed);
            }
            else {
                filterComp.refreshFilter(isDisplayed);
            }
        });
    }
    isColumnGroup() {
        return this.columnGroup instanceof ProvidedColumnGroup;
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
            if (filterComp instanceof ToolPanelFilterComp) {
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
        this.addManagedListener(this.filterGroupComp, AgGroupComponent.EVENT_EXPANDED, expandListener);
        this.addManagedListener(this.filterGroupComp, AgGroupComponent.EVENT_COLLAPSED, collapseListener);
    }
    getColumns() {
        if (this.columnGroup instanceof ProvidedColumnGroup) {
            return this.columnGroup.getLeafColumns();
        }
        return [this.columnGroup];
    }
    addFilterChangedListeners() {
        this.getColumns().forEach(column => {
            this.addManagedListener(column, Column.EVENT_FILTER_CHANGED, () => this.refreshFilterClass());
        });
        if (!(this.columnGroup instanceof ProvidedColumnGroup)) {
            this.addManagedListener(this.eventService, Events.EVENT_FILTER_OPENED, this.onFilterOpened.bind(this));
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
        this.filterGroupName = (this.columnGroup instanceof ProvidedColumnGroup) ?
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
        _.clearElement(this.getGui());
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9vbFBhbmVsRmlsdGVyR3JvdXBDb21wLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2ZpbHRlclRvb2xQYW5lbC90b29sUGFuZWxGaWx0ZXJHcm91cENvbXAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsT0FBTyxFQUNILENBQUMsRUFDRCxnQkFBZ0IsRUFDaEIsU0FBUyxFQUNULE1BQU0sRUFFTixTQUFTLEVBQ1QsTUFBTSxFQUVOLG1CQUFtQixFQUVuQixhQUFhLEVBRWIsWUFBWSxFQUNaLFdBQVcsRUFHZCxNQUFNLHlCQUF5QixDQUFDO0FBQ2pDLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLHVCQUF1QixDQUFDO0FBSTVELE1BQU0sT0FBTyx3QkFBeUIsU0FBUSxTQUFTO0lBaUJuRCxZQUFZLFdBQTRCLEVBQUUsZ0JBQXVDLEVBQzdFLGdCQUE0QixFQUFFLEtBQWEsRUFBRSxhQUFzQjtRQUNuRSxLQUFLLEVBQUUsQ0FBQztRQUNSLElBQUksQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFDO1FBQy9CLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxnQkFBZ0IsQ0FBQztRQUN6QyxJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztRQUNuQixJQUFJLENBQUMsZ0JBQWdCLEdBQUcsZ0JBQWdCLENBQUM7UUFDekMsSUFBSSxDQUFDLGFBQWEsR0FBRyxhQUFhLENBQUM7SUFDdkMsQ0FBQztJQUdPLFlBQVk7UUFDaEIsTUFBTSxXQUFXLEdBQTJCO1lBQ3hDLGFBQWEsRUFBRSxrQkFBa0I7WUFDakMsU0FBUyxFQUFFLFVBQVU7U0FDeEIsQ0FBQztRQUNGLElBQUksQ0FBQyxXQUFXLENBQUMsd0JBQXdCLENBQUMsUUFBUSxFQUFFLEVBQUUsZUFBZSxFQUFFLFdBQVcsRUFBRSxDQUFDLENBQUM7SUFDMUYsQ0FBQztJQUdNLElBQUk7UUFDUCxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7UUFDckIsSUFBSSxD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