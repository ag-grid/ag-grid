"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@ag-grid-community/core");
class FiltersToolPanel extends core_1.Component {
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
        this.params = Object.assign(Object.assign(Object.assign({}, defaultParams), this.params), { context: this.gridOptionsWrapper.getContext() });
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
    core_1.RefSelector('filtersToolPanelHeaderPanel')
], FiltersToolPanel.prototype, "filtersToolPanelHeaderPanel", void 0);
__decorate([
    core_1.RefSelector('filtersToolPanelListPanel')
], FiltersToolPanel.prototype, "filtersToolPanelListPanel", void 0);
__decorate([
    core_1.Autowired('gridApi')
], FiltersToolPanel.prototype, "gridApi", void 0);
__decorate([
    core_1.Autowired('columnApi')
], FiltersToolPanel.prototype, "columnApi", void 0);
exports.FiltersToolPanel = FiltersToolPanel;
