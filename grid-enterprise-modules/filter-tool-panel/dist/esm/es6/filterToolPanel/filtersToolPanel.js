var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Autowired, Component, RefSelector } from "@ag-grid-community/core";
export class FiltersToolPanel extends Component {
    constructor() {
        super(FiltersToolPanel.TEMPLATE);
        this.initialised = false;
        this.listenerDestroyFuncs = [];
    }
    init(params) {
        // if initialised is true, means this is a refresh
        if (this.initialised) {
            this.listenerDestroyFuncs.forEach(func => func());
            this.listenerDestroyFuncs = [];
        }
        this.initialised = true;
        const defaultParams = {
            suppressExpandAll: false,
            suppressFilterSearch: false,
            suppressSyncLayoutWithGrid: false,
            api: this.gridApi,
            columnApi: this.columnApi,
        };
        this.params = Object.assign(Object.assign(Object.assign({}, defaultParams), params), { context: this.gridOptionsService.context });
        this.filtersToolPanelHeaderPanel.init(this.params);
        this.filtersToolPanelListPanel.init(this.params);
        const hideExpand = this.params.suppressExpandAll;
        const hideSearch = this.params.suppressFilterSearch;
        if (hideExpand && hideSearch) {
            this.filtersToolPanelHeaderPanel.setDisplayed(false);
        }
        // this is necessary to prevent a memory leak while refreshing the tool panel
        this.listenerDestroyFuncs.push(this.addManagedListener(this.filtersToolPanelHeaderPanel, 'expandAll', this.onExpandAll.bind(this)), this.addManagedListener(this.filtersToolPanelHeaderPanel, 'collapseAll', this.onCollapseAll.bind(this)), this.addManagedListener(this.filtersToolPanelHeaderPanel, 'searchChanged', this.onSearchChanged.bind(this)), this.addManagedListener(this.filtersToolPanelListPanel, 'groupExpanded', this.onGroupExpanded.bind(this)));
    }
    // lazy initialise the panel
    setVisible(visible) {
        super.setDisplayed(visible);
        if (visible && !this.initialised) {
            this.init(this.params);
        }
    }
    onExpandAll() {
        this.filtersToolPanelListPanel.expandFilterGroups(true);
    }
    onCollapseAll() {
        this.filtersToolPanelListPanel.expandFilterGroups(false);
    }
    onSearchChanged(event) {
        this.filtersToolPanelListPanel.performFilterSearch(event.searchText);
    }
    setFilterLayout(colDefs) {
        this.filtersToolPanelListPanel.setFiltersLayout(colDefs);
    }
    onGroupExpanded(event) {
        this.filtersToolPanelHeaderPanel.setExpandState(event.state);
    }
    expandFilterGroups(groupIds) {
        this.filtersToolPanelListPanel.expandFilterGroups(true, groupIds);
    }
    collapseFilterGroups(groupIds) {
        this.filtersToolPanelListPanel.expandFilterGroups(false, groupIds);
    }
    expandFilters(colIds) {
        this.filtersToolPanelListPanel.expandFilters(true, colIds);
    }
    collapseFilters(colIds) {
        this.filtersToolPanelListPanel.expandFilters(false, colIds);
    }
    syncLayoutWithGrid() {
        this.filtersToolPanelListPanel.syncFilterLayout();
    }
    refresh() {
        this.init(this.params);
    }
    // this is a user component, and IComponent has "public destroy()" as part of the interface.
    // so we need to override destroy() just to make the method public.
    destroy() {
        super.destroy();
    }
}
FiltersToolPanel.TEMPLATE = `<div class="ag-filter-toolpanel">
            <ag-filters-tool-panel-header ref="filtersToolPanelHeaderPanel"></ag-filters-tool-panel-header>
            <ag-filters-tool-panel-list ref="filtersToolPanelListPanel"></ag-filters-tool-panel-list>
         </div>`;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsdGVyc1Rvb2xQYW5lbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9maWx0ZXJUb29sUGFuZWwvZmlsdGVyc1Rvb2xQYW5lbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSxPQUFPLEVBQ0gsU0FBUyxFQUlULFNBQVMsRUFLVCxXQUFXLEVBQ2QsTUFBTSx5QkFBeUIsQ0FBQztBQWFqQyxNQUFNLE9BQU8sZ0JBQWlCLFNBQVEsU0FBUztJQW1CM0M7UUFDSSxLQUFLLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxDQUFDLENBQUM7UUFMN0IsZ0JBQVcsR0FBRyxLQUFLLENBQUM7UUFFcEIseUJBQW9CLEdBQW1CLEVBQUUsQ0FBQztJQUlsRCxDQUFDO0lBRU0sSUFBSSxDQUFDLE1BQWtDO1FBQzFDLGtEQUFrRDtRQUNsRCxJQUFJLElBQUksQ0FBQyxXQUFXLEVBQUU7WUFDbEIsSUFBSSxDQUFDLG9CQUFvQixDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7WUFDbEQsSUFBSSxDQUFDLG9CQUFvQixHQUFHLEVBQUUsQ0FBQztTQUNsQztRQUVELElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDO1FBRXhCLE1BQU0sYUFBYSxHQUFnRDtZQUMvRCxpQkFBaUIsRUFBRSxLQUFLO1lBQ3hCLG9CQUFvQixFQUFFLEtBQUs7WUFDM0IsMEJBQTBCLEVBQUUsS0FBSztZQUNqQyxHQUFHLEVBQUUsSUFBSSxDQUFDLE9BQU87WUFDakIsU0FBUyxFQUFFLElBQUksQ0FBQyxTQUFTO1NBQzVCLENBQUM7UUFDRixJQUFJLENBQUMsTUFBTSxpREFDSixhQUFhLEdBQ2IsTUFBTSxLQUNULE9BQU8sRUFBRSxJQUFJLENBQUMsa0JBQWtCLENBQUMsT0FBTyxHQUMzQyxDQUFDO1FBRUYsSUFBSSxDQUFDLDJCQUEyQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFD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