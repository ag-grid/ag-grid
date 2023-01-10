"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FiltersToolPanelListPanel = void 0;
const core_1 = require("@ag-grid-community/core");
const toolPanelFilterComp_1 = require("./toolPanelFilterComp");
const toolPanelFilterGroupComp_1 = require("./toolPanelFilterGroupComp");
const filtersToolPanelHeaderPanel_1 = require("./filtersToolPanelHeaderPanel");
class FiltersToolPanelListPanel extends core_1.Component {
    constructor() {
        super(FiltersToolPanelListPanel.TEMPLATE);
        this.initialised = false;
        this.filterGroupComps = [];
    }
    init(params) {
        this.initialised = true;
        const defaultParams = {
            suppressExpandAll: false,
            suppressFilterSearch: false,
            suppressSyncLayoutWithGrid: false,
            api: this.gridApi,
            columnApi: this.columnApi,
            context: this.gridOptionsService.get('context')
        };
        core_1._.mergeDeep(defaultParams, params);
        this.params = defaultParams;
        if (!this.params.suppressSyncLayoutWithGrid) {
            this.addManagedListener(this.eventService, core_1.Events.EVENT_COLUMN_MOVED, () => this.onColumnsChanged());
        }
        this.addManagedListener(this.eventService, core_1.Events.EVENT_NEW_COLUMNS_LOADED, () => this.onColumnsChanged());
        this.addManagedListener(this.eventService, core_1.Events.EVENT_TOOL_PANEL_VISIBLE_CHANGED, (event) => {
            // when re-entering the filters tool panel we need to refresh the virtual lists in the set filters in case
            // filters have been changed elsewhere, i.e. via an api call.
            if (event.source === 'filters') {
                this.refreshFilters();
            }
        });
        if (this.columnModel.isReady()) {
            this.onColumnsChanged();
        }
    }
    onColumnsChanged() {
        const pivotModeActive = this.columnModel.isPivotMode();
        const shouldSyncColumnLayoutWithGrid = !this.params.suppressSyncLayoutWithGrid && !pivotModeActive;
        shouldSyncColumnLayoutWithGrid ? this.syncFilterLayout() : this.buildTreeFromProvidedColumnDefs();
    }
    syncFilterLayout() {
        this.toolPanelColDefService.syncLayoutWithGrid(this.setFiltersLayout.bind(this));
    }
    buildTreeFromProvidedColumnDefs() {
        this.destroyFilters();
        const columnTree = this.columnModel.getPrimaryColumnTree();
        this.filterGroupComps = this.recursivelyAddComps(columnTree, 0);
        const len = this.filterGroupComps.length;
        if (len) {
            // skip the destroy function because this will be managed
            // by the `destroyFilters` function
            this.filterGroupComps.forEach(comp => this.appendChild(comp));
            this.setFirstAndLastVisible(0, len - 1);
        }
        // perform search if searchFilterText exists
        if (core_1._.exists(this.searchFilterText)) {
            this.searchFilters(this.searchFilterText);
        }
        // notify header of expand
        this.fireExpandedEvent();
    }
    setFiltersLayout(colDefs) {
        this.destroyFilters();
        const columnTree = this.toolPanelColDefService.createColumnTree(colDefs);
        this.filterGroupComps = this.recursivelyAddComps(columnTree, 0);
        const len = this.filterGroupComps.length;
        if (len) {
            // skip the destroy function because this will be managed
            // by the `destroyFilters` function
            this.filterGroupComps.forEach(comp => this.appendChild(comp));
            this.setFirstAndLastVisible(0, len - 1);
        }
        // perform search if searchFilterText exists
        if (core_1._.exists(this.searchFilterText)) {
            this.searchFilters(this.searchFilterText);
        }
        // notify header of expand
        this.fireExpandedEvent();
    }
    recursivelyAddComps(tree, depth) {
        return core_1._.flatten(tree.map(child => {
            if (child instanceof core_1.ProvidedColumnGroup) {
                return core_1._.flatten(this.recursivelyAddFilterGroupComps(child, depth));
            }
            const column = child;
            if (!this.shouldDisplayFilter(column)) {
                return [];
            }
            const hideFilterCompHeader = depth === 0;
            const filterComp = new toolPanelFilterComp_1.ToolPanelFilterComp(hideFilterCompHeader);
            this.createBean(filterComp);
            filterComp.setColumn(column);
            if (depth > 0) {
                return filterComp;
            }
            const filterGroupComp = this.createBean(new toolPanelFilterGroupComp_1.ToolPanelFilterGroupComp(column, [filterComp], this.onGroupExpanded.bind(this), depth, true));
            filterGroupComp.addCssClassToTitleBar('ag-filter-toolpanel-header');
            filterGroupComp.collapse();
            return filterGroupComp;
        }));
    }
    recursivelyAddFilterGroupComps(columnGroup, depth) {
        if (!this.filtersExistInChildren(columnGroup.getChildren())) {
            return;
        }
        const colGroupDef = columnGroup.getColGroupDef();
        if (colGroupDef && colGroupDef.suppressFiltersToolPanel) {
            return [];
        }
        const newDepth = columnGroup.isPadding() ? depth : depth + 1;
        const childFilterComps = core_1._.flatten(this.recursivelyAddComps(columnGroup.getChildren(), newDepth));
        if (columnGroup.isPadding()) {
            return childFilterComps;
        }
        const filterGroupComp = new toolPanelFilterGroupComp_1.ToolPanelFilterGroupComp(columnGroup, childFilterComps, this.onGroupExpanded.bind(this), depth, false);
        this.createBean(filterGroupComp);
        filterGroupComp.addCssClassToTitleBar('ag-filter-toolpanel-header');
        return [filterGroupComp];
    }
    filtersExistInChildren(tree) {
        return tree.some(child => {
            if (child instanceof core_1.ProvidedColumnGroup) {
                return this.filtersExistInChildren(child.getChildren());
            }
            return this.shouldDisplayFilter(child);
        });
    }
    shouldDisplayFilter(column) {
        const suppressFiltersToolPanel = column.getColDef() && column.getColDef().suppressFiltersToolPanel;
        return column.isFilterAllowed() && !suppressFiltersToolPanel;
    }
    // we don't support refreshing, but must implement because it's on the tool panel interface
    refresh() { }
    // lazy initialise the panel
    setVisible(visible) {
        super.setDisplayed(visible);
        if (visible && !this.initialised) {
            this.init(this.params);
        }
    }
    expandFilterGroups(expand, groupIds) {
        const updatedGroupIds = [];
        const updateGroupExpandState = (filterGroup) => {
            const groupId = filterGroup.getFilterGroupId();
            const shouldExpandOrCollapse = !groupIds || core_1._.includes(groupIds, groupId);
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
            filterGroup.getChildren().forEach(child => {
                if (child instanceof toolPanelFilterGroupComp_1.ToolPanelFilterGroupComp) {
                    updateGroupExpandState(child);
                }
            });
        };
        this.filterGroupComps.forEach(updateGroupExpandState);
        // update header expand / collapse icon
        this.onGroupExpanded();
        if (groupIds) {
            const unrecognisedGroupIds = groupIds.filter(groupId => updatedGroupIds.indexOf(groupId) < 0);
            if (unrecognisedGroupIds.length > 0) {
                console.warn('AG Grid: unable to find groups for these supplied groupIds:', unrecognisedGroupIds);
            }
        }
    }
    expandFilters(expand, colIds) {
        const updatedColIds = [];
        const updateGroupExpandState = (filterComp) => {
            if (filterComp instanceof toolPanelFilterGroupComp_1.ToolPanelFilterGroupComp) {
                let anyChildrenChanged = false;
                filterComp.getChildren().forEach(child => {
                    const childUpdated = updateGroupExpandState(child);
                    if (childUpdated) {
                        if (expand) {
                            filterComp.expand();
                            anyChildrenChanged = true;
                        }
                        else if (!filterComp.isColumnGroup()) {
                            // we only collapse columns wrapped in groups
                            filterComp.collapse();
                        }
                    }
                });
                return anyChildrenChanged;
            }
            const colId = filterComp.getColumn().getColId();
            const updateFilterExpandState = !colIds || core_1._.includes(colIds, colId);
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
            const unrecognisedColIds = colIds.filter(colId => updatedColIds.indexOf(colId) < 0);
            if (unrecognisedColIds.length > 0) {
                console.warn('AG Grid: unable to find columns for these supplied colIds:', unrecognisedColIds);
            }
        }
    }
    onGroupExpanded() {
        this.fireExpandedEvent();
    }
    fireExpandedEvent() {
        let expandedCount = 0;
        let notExpandedCount = 0;
        const updateExpandCounts = (filterGroup) => {
            if (!filterGroup.isColumnGroup()) {
                return;
            }
            filterGroup.isExpanded() ? expandedCount++ : notExpandedCount++;
            filterGroup.getChildren().forEach(child => {
                if (child instanceof toolPanelFilterGroupComp_1.ToolPanelFilterGroupComp) {
                    updateExpandCounts(child);
                }
            });
        };
        this.filterGroupComps.forEach(updateExpandCounts);
        let state;
        if (expandedCount > 0 && notExpandedCount > 0) {
            state = filtersToolPanelHeaderPanel_1.EXPAND_STATE.INDETERMINATE;
        }
        else if (notExpandedCount > 0) {
            state = filtersToolPanelHeaderPanel_1.EXPAND_STATE.COLLAPSED;
        }
        else {
            state = filtersToolPanelHeaderPanel_1.EXPAND_STATE.EXPANDED;
        }
        this.dispatchEvent({ type: 'groupExpanded', state: state });
    }
    performFilterSearch(searchText) {
        this.searchFilterText = core_1._.exists(searchText) ? searchText.toLowerCase() : null;
        this.searchFilters(this.searchFilterText);
    }
    searchFilters(searchFilter) {
        const passesFilter = (groupName) => {
            return !core_1._.exists(searchFilter) || groupName.toLowerCase().indexOf(searchFilter) !== -1;
        };
        const recursivelySearch = (filterItem, parentPasses) => {
            if (!(filterItem instanceof toolPanelFilterGroupComp_1.ToolPanelFilterGroupComp)) {
                return passesFilter(filterItem.getColumnFilterName() || '');
            }
            const children = filterItem.getChildren();
            const groupNamePasses = passesFilter(filterItem.getFilterGroupName());
            // if group or parent already passed - ensure this group and all children are visible
            const alreadyPassed = parentPasses || groupNamePasses;
            if (alreadyPassed) {
                // ensure group visible
                filterItem.hideGroup(false);
                // ensure all children are visible
                for (let i = 0; i < children.length; i++) {
                    recursivelySearch(children[i], alreadyPassed);
                    filterItem.hideGroupItem(false, i);
                }
                return true;
            }
            // hide group item filters
            let anyChildPasses = false;
            children.forEach((child, index) => {
                const childPasses = recursivelySearch(child, parentPasses);
                filterItem.hideGroupItem(!childPasses, index);
                if (childPasses) {
                    anyChildPasses = true;
                }
            });
            // hide group if no children pass
            filterItem.hideGroup(!anyChildPasses);
            return anyChildPasses;
        };
        let firstVisible;
        let lastVisible;
        this.filterGroupComps.forEach((filterGroup, idx) => {
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
    }
    setFirstAndLastVisible(firstIdx, lastIdx) {
        this.filterGroupComps.forEach((filterGroup, idx) => {
            filterGroup.removeCssClass('ag-first-group-visible');
            filterGroup.removeCssClass('ag-last-group-visible');
            if (idx === firstIdx) {
                filterGroup.addCssClass('ag-first-group-visible');
            }
            if (idx === lastIdx) {
                filterGroup.addCssClass('ag-last-group-visible');
            }
        });
    }
    refreshFilters() {
        this.filterGroupComps.forEach(filterGroupComp => filterGroupComp.refreshFilters());
    }
    destroyFilters() {
        this.filterGroupComps = this.destroyBeans(this.filterGroupComps);
        core_1._.clearElement(this.getGui());
    }
    destroy() {
        this.destroyFilters();
        super.destroy();
    }
}
FiltersToolPanelListPanel.TEMPLATE = `<div class="ag-filter-list-panel"></div>`;
__decorate([
    core_1.Autowired("gridApi")
], FiltersToolPanelListPanel.prototype, "gridApi", void 0);
__decorate([
    core_1.Autowired("columnApi")
], FiltersToolPanelListPanel.prototype, "columnApi", void 0);
__decorate([
    core_1.Autowired('toolPanelColDefService')
], FiltersToolPanelListPanel.prototype, "toolPanelColDefService", void 0);
__decorate([
    core_1.Autowired('columnModel')
], FiltersToolPanelListPanel.prototype, "columnModel", void 0);
exports.FiltersToolPanelListPanel = FiltersToolPanelListPanel;
