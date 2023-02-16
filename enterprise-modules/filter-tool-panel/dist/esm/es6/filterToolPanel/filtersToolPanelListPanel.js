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
        this.addManagedListener(this.eventService, Events.EVENT_INTERNAL_TOOL_PANEL_VISIBLE_CHANGED, (event) => {
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
