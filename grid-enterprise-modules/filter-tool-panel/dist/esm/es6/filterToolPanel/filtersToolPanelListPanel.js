var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { _, Autowired, Component, Events, ProvidedColumnGroup } from "@ag-grid-community/core";
import { ToolPanelFilterComp } from "./toolPanelFilterComp";
import { ToolPanelFilterGroupComp } from "./toolPanelFilterGroupComp";
import { EXPAND_STATE } from "./filtersToolPanelHeaderPanel";
export class FiltersToolPanelListPanel extends Component {
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
            context: this.gridOptionsService.context
        };
        _.mergeDeep(defaultParams, params);
        this.params = defaultParams;
        if (!this.params.suppressSyncLayoutWithGrid) {
            this.addManagedListener(this.eventService, Events.EVENT_COLUMN_MOVED, () => this.onColumnsChanged());
        }
        this.addManagedListener(this.eventService, Events.EVENT_NEW_COLUMNS_LOADED, () => this.onColumnsChanged());
        this.addManagedListener(this.eventService, Events.EVENT_TOOL_PANEL_VISIBLE_CHANGED, (event) => {
            // when re-entering the filters tool panel we need to refresh the virtual lists in the set filters in case
            // filters have been changed elsewhere, i.e. via an api call.
            if (event.key === 'filters') {
                this.refreshFilters(event.visible);
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
        const columnTree = this.columnModel.getPrimaryColumnTree();
        this.recreateFilters(columnTree);
    }
    setFiltersLayout(colDefs) {
        const columnTree = this.toolPanelColDefService.createColumnTree(colDefs);
        this.recreateFilters(columnTree);
    }
    recreateFilters(columnTree) {
        // Underlying filter comp/element won't get recreated if the column still exists (the element just gets detached/re-attached).
        // We can therefore restore focus if an element in the filter tool panel was focused.
        const activeElement = this.gridOptionsService.getDocument().activeElement;
        // Want to restore the expansion state where possible.
        const expansionState = this.getExpansionState();
        this.destroyFilters();
        this.filterGroupComps = this.recursivelyAddComps(columnTree, 0, expansionState);
        const len = this.filterGroupComps.length;
        if (len) {
            // skip the destroy function because this will be managed
            // by the `destroyFilters` function
            this.filterGroupComps.forEach(comp => this.appendChild(comp));
            this.setFirstAndLastVisible(0, len - 1);
        }
        // perform search if searchFilterText exists
        if (_.exists(this.searchFilterText)) {
            this.searchFilters(this.searchFilterText);
        }
        // notify header of expand
        this.fireExpandedEvent();
        // We only care about restoring focus if the originally focused element was in the filter tool panel.
        if (this.getGui().contains(activeElement)) {
            activeElement.focus();
        }
    }
    recursivelyAddComps(tree, depth, expansionState) {
        return _.flatten(tree.map(child => {
            if (child instanceof ProvidedColumnGroup) {
                return _.flatten(this.recursivelyAddFilterGroupComps(child, depth, expansionState));
            }
            const column = child;
            if (!this.shouldDisplayFilter(column)) {
                return [];
            }
            const hideFilterCompHeader = depth === 0;
            const filterComp = new ToolPanelFilterComp(hideFilterCompHeader);
            this.createBean(filterComp);
            filterComp.setColumn(column);
            if (expansionState.get(column.getId())) {
                // Default state on creation and desired state are both collapsed. Expand if expanded before.
                filterComp.expand();
            }
            if (depth > 0) {
                return filterComp;
            }
            const filterGroupComp = this.createBean(new ToolPanelFilterGroupComp(column, [filterComp], this.onGroupExpanded.bind(this), depth, true));
            filterGroupComp.addCssClassToTitleBar('ag-filter-toolpanel-header');
            if (!expansionState.get(filterGroupComp.getFilterGroupId())) {
                // Default state on creation is expanded. Desired initial state is collapsed. Always collapse unless expanded before.
                filterGroupComp.collapse();
            }
            return filterGroupComp;
        }));
    }
    recursivelyAddFilterGroupComps(columnGroup, depth, expansionState) {
        if (!this.filtersExistInChildren(columnGroup.getChildren())) {
            return;
        }
        const colGroupDef = columnGroup.getColGroupDef();
        if (colGroupDef && colGroupDef.suppressFiltersToolPanel) {
            return [];
        }
        const newDepth = columnGroup.isPadding() ? depth : depth + 1;
        const childFilterComps = _.flatten(this.recursivelyAddComps(columnGroup.getChildren(), newDepth, expansionState));
        if (columnGroup.isPadding()) {
            return childFilterComps;
        }
        const filterGroupComp = new ToolPanelFilterGroupComp(columnGroup, childFilterComps, this.onGroupExpanded.bind(this), depth, false);
        this.createBean(filterGroupComp);
        filterGroupComp.addCssClassToTitleBar('ag-filter-toolpanel-header');
        if (expansionState.get(filterGroupComp.getFilterGroupId()) === false) {
            // Default state on creation is expanded. Desired initial state is expanded. Only collapse if collapsed before.
            filterGroupComp.collapse();
        }
        return [filterGroupComp];
    }
    filtersExistInChildren(tree) {
        return tree.some(child => {
            if (child instanceof ProvidedColumnGroup) {
                return this.filtersExistInChildren(child.getChildren());
            }
            return this.shouldDisplayFilter(child);
        });
    }
    shouldDisplayFilter(column) {
        const suppressFiltersToolPanel = column.getColDef() && column.getColDef().suppressFiltersToolPanel;
        return column.isFilterAllowed() && !suppressFiltersToolPanel;
    }
    getExpansionState() {
        const expansionState = new Map();
        const recursiveGetExpansionState = (filterGroupComp) => {
            expansionState.set(filterGroupComp.getFilterGroupId(), filterGroupComp.isExpanded());
            filterGroupComp.getChildren().forEach(child => {
                if (child instanceof ToolPanelFilterGroupComp) {
                    recursiveGetExpansionState(child);
                }
                else {
                    expansionState.set(child.getColumn().getId(), child.isExpanded());
                }
            });
        };
        this.filterGroupComps.forEach(recursiveGetExpansionState);
        return expansionState;
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
            const shouldExpandOrCollapse = !groupIds || _.includes(groupIds, groupId);
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
                if (child instanceof ToolPanelFilterGroupComp) {
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
            if (filterComp instanceof ToolPanelFilterGroupComp) {
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
            const updateFilterExpandState = !colIds || _.includes(colIds, colId);
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
                if (child instanceof ToolPanelFilterGroupComp) {
                    updateExpandCounts(child);
                }
            });
        };
        this.filterGroupComps.forEach(updateExpandCounts);
        let state;
        if (expandedCount > 0 && notExpandedCount > 0) {
            state = EXPAND_STATE.INDETERMINATE;
        }
        else if (notExpandedCount > 0) {
            state = EXPAND_STATE.COLLAPSED;
        }
        else {
            state = EXPAND_STATE.EXPANDED;
        }
        this.dispatchEvent({ type: 'groupExpanded', state: state });
    }
    performFilterSearch(searchText) {
        this.searchFilterText = _.exists(searchText) ? searchText.toLowerCase() : null;
        this.searchFilters(this.searchFilterText);
    }
    searchFilters(searchFilter) {
        const passesFilter = (groupName) => {
            return !_.exists(searchFilter) || groupName.toLowerCase().indexOf(searchFilter) !== -1;
        };
        const recursivelySearch = (filterItem, parentPasses) => {
            if (!(filterItem instanceof ToolPanelFilterGroupComp)) {
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
    refreshFilters(isDisplayed) {
        this.filterGroupComps.forEach(filterGroupComp => filterGroupComp.refreshFilters(isDisplayed));
    }
    destroyFilters() {
        this.filterGroupComps = this.destroyBeans(this.filterGroupComps);
        _.clearElement(this.getGui());
    }
    destroy() {
        this.destroyFilters();
        super.destroy();
    }
}
FiltersToolPanelListPanel.TEMPLATE = `<div class="ag-filter-list-panel"></div>`;
__decorate([
    Autowired("gridApi")
], FiltersToolPanelListPanel.prototype, "gridApi", void 0);
__decorate([
    Autowired("columnApi")
], FiltersToolPanelListPanel.prototype, "columnApi", void 0);
__decorate([
    Autowired('toolPanelColDefService')
], FiltersToolPanelListPanel.prototype, "toolPanelColDefService", void 0);
__decorate([
    Autowired('columnModel')
], FiltersToolPanelListPanel.prototype, "columnModel", void 0);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsdGVyc1Rvb2xQYW5lbExpc3RQYW5lbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9maWx0ZXJUb29sUGFuZWwvZmlsdGVyc1Rvb2xQYW5lbExpc3RQYW5lbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSxPQUFPLEVBQ0gsQ0FBQyxFQUVELFNBQVMsRUFJVCxTQUFTLEVBQ1QsTUFBTSxFQUVOLG1CQUFtQixFQUV0QixNQUFNLHlCQUF5QixDQUFDO0FBRWpDLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLHVCQUF1QixDQUFDO0FBRTVELE9BQU8sRUFBRSx3QkFBd0IsRUFBdUIsTUFBTSw0QkFBNEIsQ0FBQztBQUMzRixPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sK0JBQStCLENBQUM7QUFHN0QsTUFBTSxPQUFPLHlCQUEwQixTQUFRLFNBQVM7SUFpQnBEO1FBQ0ksS0FBSyxDQUFDLHlCQUF5QixDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBVHRDLGdCQUFXLEdBQUcsS0FBSyxDQUFDO1FBR3BCLHFCQUFnQixHQUErQixFQUFFLENBQUM7SUFPMUQsQ0FBQztJQUVNLElBQUksQ0FBQyxNQUFrQztRQUMxQyxJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQztRQUV4QixNQUFNLGFBQWEsR0FBK0I7WUFDOUMsaUJBQWlCLEVBQUUsS0FBSztZQUN4QixvQkFBb0IsRUFBRSxLQUFLO1lBQzNCLDBCQUEwQixFQUFFLEtBQUs7WUFDakMsR0FBRyxFQUFFLElBQUksQ0FBQyxPQUFPO1lBQ2pCLFNBQVMsRUFBRSxJQUFJLENBQUMsU0FBUztZQUN6QixPQUFPLEVBQUUsSUFBSSxDQUFDLGtCQUFrQixDQUFDLE9BQU87U0FDM0MsQ0FBQztRQUNGLENBQUMsQ0FBQyxTQUFTLENBQUMsYUFBYSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQ25DLElBQUksQ0FBQyxNQUFNLEdBQUcsYUFBYSxDQUFDO1FBRTVCLElBQUks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