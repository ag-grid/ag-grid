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
import { _, Autowired, Component, Events, ProvidedColumnGroup } from "@ag-grid-community/core";
import { ToolPanelFilterComp } from "./toolPanelFilterComp";
import { ToolPanelFilterGroupComp } from "./toolPanelFilterGroupComp";
import { EXPAND_STATE } from "./filtersToolPanelHeaderPanel";
var FiltersToolPanelListPanel = /** @class */ (function (_super) {
    __extends(FiltersToolPanelListPanel, _super);
    function FiltersToolPanelListPanel() {
        var _this = _super.call(this, FiltersToolPanelListPanel.TEMPLATE) || this;
        _this.initialised = false;
        _this.filterGroupComps = [];
        return _this;
    }
    FiltersToolPanelListPanel.prototype.init = function (params) {
        var _this = this;
        this.initialised = true;
        var defaultParams = {
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
            this.addManagedListener(this.eventService, Events.EVENT_COLUMN_MOVED, function () { return _this.onColumnsChanged(); });
        }
        this.addManagedListener(this.eventService, Events.EVENT_NEW_COLUMNS_LOADED, function () { return _this.onColumnsChanged(); });
        this.addManagedListener(this.eventService, Events.EVENT_TOOL_PANEL_VISIBLE_CHANGED, function (event) {
            // when re-entering the filters tool panel we need to refresh the virtual lists in the set filters in case
            // filters have been changed elsewhere, i.e. via an api call.
            if (event.key === 'filters') {
                _this.refreshFilters(event.visible);
            }
        });
        if (this.columnModel.isReady()) {
            this.onColumnsChanged();
        }
    };
    FiltersToolPanelListPanel.prototype.onColumnsChanged = function () {
        var pivotModeActive = this.columnModel.isPivotMode();
        var shouldSyncColumnLayoutWithGrid = !this.params.suppressSyncLayoutWithGrid && !pivotModeActive;
        shouldSyncColumnLayoutWithGrid ? this.syncFilterLayout() : this.buildTreeFromProvidedColumnDefs();
    };
    FiltersToolPanelListPanel.prototype.syncFilterLayout = function () {
        this.toolPanelColDefService.syncLayoutWithGrid(this.setFiltersLayout.bind(this));
    };
    FiltersToolPanelListPanel.prototype.buildTreeFromProvidedColumnDefs = function () {
        var columnTree = this.columnModel.getPrimaryColumnTree();
        this.recreateFilters(columnTree);
    };
    FiltersToolPanelListPanel.prototype.setFiltersLayout = function (colDefs) {
        var columnTree = this.toolPanelColDefService.createColumnTree(colDefs);
        this.recreateFilters(columnTree);
    };
    FiltersToolPanelListPanel.prototype.recreateFilters = function (columnTree) {
        var _this = this;
        // Underlying filter comp/element won't get recreated if the column still exists (the element just gets detached/re-attached).
        // We can therefore restore focus if an element in the filter tool panel was focused.
        var activeElement = this.gridOptionsService.getDocument().activeElement;
        // Want to restore the expansion state where possible.
        var expansionState = this.getExpansionState();
        this.destroyFilters();
        this.filterGroupComps = this.recursivelyAddComps(columnTree, 0, expansionState);
        var len = this.filterGroupComps.length;
        if (len) {
            // skip the destroy function because this will be managed
            // by the `destroyFilters` function
            this.filterGroupComps.forEach(function (comp) { return _this.appendChild(comp); });
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
    };
    FiltersToolPanelListPanel.prototype.recursivelyAddComps = function (tree, depth, expansionState) {
        var _this = this;
        return _.flatten(tree.map(function (child) {
            if (child instanceof ProvidedColumnGroup) {
                return _.flatten(_this.recursivelyAddFilterGroupComps(child, depth, expansionState));
            }
            var column = child;
            if (!_this.shouldDisplayFilter(column)) {
                return [];
            }
            var hideFilterCompHeader = depth === 0;
            var filterComp = new ToolPanelFilterComp(hideFilterCompHeader);
            _this.createBean(filterComp);
            filterComp.setColumn(column);
            if (expansionState.get(column.getId())) {
                // Default state on creation and desired state are both collapsed. Expand if expanded before.
                filterComp.expand();
            }
            if (depth > 0) {
                return filterComp;
            }
            var filterGroupComp = _this.createBean(new ToolPanelFilterGroupComp(column, [filterComp], _this.onGroupExpanded.bind(_this), depth, true));
            filterGroupComp.addCssClassToTitleBar('ag-filter-toolpanel-header');
            if (!expansionState.get(filterGroupComp.getFilterGroupId())) {
                // Default state on creation is expanded. Desired initial state is collapsed. Always collapse unless expanded before.
                filterGroupComp.collapse();
            }
            return filterGroupComp;
        }));
    };
    FiltersToolPanelListPanel.prototype.recursivelyAddFilterGroupComps = function (columnGroup, depth, expansionState) {
        if (!this.filtersExistInChildren(columnGroup.getChildren())) {
            return;
        }
        var colGroupDef = columnGroup.getColGroupDef();
        if (colGroupDef && colGroupDef.suppressFiltersToolPanel) {
            return [];
        }
        var newDepth = columnGroup.isPadding() ? depth : depth + 1;
        var childFilterComps = _.flatten(this.recursivelyAddComps(columnGroup.getChildren(), newDepth, expansionState));
        if (columnGroup.isPadding()) {
            return childFilterComps;
        }
        var filterGroupComp = new ToolPanelFilterGroupComp(columnGroup, childFilterComps, this.onGroupExpanded.bind(this), depth, false);
        this.createBean(filterGroupComp);
        filterGroupComp.addCssClassToTitleBar('ag-filter-toolpanel-header');
        if (expansionState.get(filterGroupComp.getFilterGroupId()) === false) {
            // Default state on creation is expanded. Desired initial state is expanded. Only collapse if collapsed before.
            filterGroupComp.collapse();
        }
        return [filterGroupComp];
    };
    FiltersToolPanelListPanel.prototype.filtersExistInChildren = function (tree) {
        var _this = this;
        return tree.some(function (child) {
            if (child instanceof ProvidedColumnGroup) {
                return _this.filtersExistInChildren(child.getChildren());
            }
            return _this.shouldDisplayFilter(child);
        });
    };
    FiltersToolPanelListPanel.prototype.shouldDisplayFilter = function (column) {
        var suppressFiltersToolPanel = column.getColDef() && column.getColDef().suppressFiltersToolPanel;
        return column.isFilterAllowed() && !suppressFiltersToolPanel;
    };
    FiltersToolPanelListPanel.prototype.getExpansionState = function () {
        var expansionState = new Map();
        var recursiveGetExpansionState = function (filterGroupComp) {
            expansionState.set(filterGroupComp.getFilterGroupId(), filterGroupComp.isExpanded());
            filterGroupComp.getChildren().forEach(function (child) {
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
    };
    // we don't support refreshing, but must implement because it's on the tool panel interface
    FiltersToolPanelListPanel.prototype.refresh = function () { };
    // lazy initialise the panel
    FiltersToolPanelListPanel.prototype.setVisible = function (visible) {
        _super.prototype.setDisplayed.call(this, visible);
        if (visible && !this.initialised) {
            this.init(this.params);
        }
    };
    FiltersToolPanelListPanel.prototype.expandFilterGroups = function (expand, groupIds) {
        var updatedGroupIds = [];
        var updateGroupExpandState = function (filterGroup) {
            var groupId = filterGroup.getFilterGroupId();
            var shouldExpandOrCollapse = !groupIds || _.includes(groupIds, groupId);
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
            filterGroup.getChildren().forEach(function (child) {
                if (child instanceof ToolPanelFilterGroupComp) {
                    updateGroupExpandState(child);
                }
            });
        };
        this.filterGroupComps.forEach(updateGroupExpandState);
        // update header expand / collapse icon
        this.onGroupExpanded();
        if (groupIds) {
            var unrecognisedGroupIds = groupIds.filter(function (groupId) { return updatedGroupIds.indexOf(groupId) < 0; });
            if (unrecognisedGroupIds.length > 0) {
                console.warn('AG Grid: unable to find groups for these supplied groupIds:', unrecognisedGroupIds);
            }
        }
    };
    FiltersToolPanelListPanel.prototype.expandFilters = function (expand, colIds) {
        var updatedColIds = [];
        var updateGroupExpandState = function (filterComp) {
            if (filterComp instanceof ToolPanelFilterGroupComp) {
                var anyChildrenChanged_1 = false;
                filterComp.getChildren().forEach(function (child) {
                    var childUpdated = updateGroupExpandState(child);
                    if (childUpdated) {
                        if (expand) {
                            filterComp.expand();
                            anyChildrenChanged_1 = true;
                        }
                        else if (!filterComp.isColumnGroup()) {
                            // we only collapse columns wrapped in groups
                            filterComp.collapse();
                        }
                    }
                });
                return anyChildrenChanged_1;
            }
            var colId = filterComp.getColumn().getColId();
            var updateFilterExpandState = !colIds || _.includes(colIds, colId);
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
            var unrecognisedColIds = colIds.filter(function (colId) { return updatedColIds.indexOf(colId) < 0; });
            if (unrecognisedColIds.length > 0) {
                console.warn('AG Grid: unable to find columns for these supplied colIds:', unrecognisedColIds);
            }
        }
    };
    FiltersToolPanelListPanel.prototype.onGroupExpanded = function () {
        this.fireExpandedEvent();
    };
    FiltersToolPanelListPanel.prototype.fireExpandedEvent = function () {
        var expandedCount = 0;
        var notExpandedCount = 0;
        var updateExpandCounts = function (filterGroup) {
            if (!filterGroup.isColumnGroup()) {
                return;
            }
            filterGroup.isExpanded() ? expandedCount++ : notExpandedCount++;
            filterGroup.getChildren().forEach(function (child) {
                if (child instanceof ToolPanelFilterGroupComp) {
                    updateExpandCounts(child);
                }
            });
        };
        this.filterGroupComps.forEach(updateExpandCounts);
        var state;
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
    };
    FiltersToolPanelListPanel.prototype.performFilterSearch = function (searchText) {
        this.searchFilterText = _.exists(searchText) ? searchText.toLowerCase() : null;
        this.searchFilters(this.searchFilterText);
    };
    FiltersToolPanelListPanel.prototype.searchFilters = function (searchFilter) {
        var passesFilter = function (groupName) {
            return !_.exists(searchFilter) || groupName.toLowerCase().indexOf(searchFilter) !== -1;
        };
        var recursivelySearch = function (filterItem, parentPasses) {
            if (!(filterItem instanceof ToolPanelFilterGroupComp)) {
                return passesFilter(filterItem.getColumnFilterName() || '');
            }
            var children = filterItem.getChildren();
            var groupNamePasses = passesFilter(filterItem.getFilterGroupName());
            // if group or parent already passed - ensure this group and all children are visible
            var alreadyPassed = parentPasses || groupNamePasses;
            if (alreadyPassed) {
                // ensure group visible
                filterItem.hideGroup(false);
                // ensure all children are visible
                for (var i = 0; i < children.length; i++) {
                    recursivelySearch(children[i], alreadyPassed);
                    filterItem.hideGroupItem(false, i);
                }
                return true;
            }
            // hide group item filters
            var anyChildPasses = false;
            children.forEach(function (child, index) {
                var childPasses = recursivelySearch(child, parentPasses);
                filterItem.hideGroupItem(!childPasses, index);
                if (childPasses) {
                    anyChildPasses = true;
                }
            });
            // hide group if no children pass
            filterItem.hideGroup(!anyChildPasses);
            return anyChildPasses;
        };
        var firstVisible;
        var lastVisible;
        this.filterGroupComps.forEach(function (filterGroup, idx) {
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
    };
    FiltersToolPanelListPanel.prototype.setFirstAndLastVisible = function (firstIdx, lastIdx) {
        this.filterGroupComps.forEach(function (filterGroup, idx) {
            filterGroup.removeCssClass('ag-first-group-visible');
            filterGroup.removeCssClass('ag-last-group-visible');
            if (idx === firstIdx) {
                filterGroup.addCssClass('ag-first-group-visible');
            }
            if (idx === lastIdx) {
                filterGroup.addCssClass('ag-last-group-visible');
            }
        });
    };
    FiltersToolPanelListPanel.prototype.refreshFilters = function (isDisplayed) {
        this.filterGroupComps.forEach(function (filterGroupComp) { return filterGroupComp.refreshFilters(isDisplayed); });
    };
    FiltersToolPanelListPanel.prototype.destroyFilters = function () {
        this.filterGroupComps = this.destroyBeans(this.filterGroupComps);
        _.clearElement(this.getGui());
    };
    FiltersToolPanelListPanel.prototype.destroy = function () {
        this.destroyFilters();
        _super.prototype.destroy.call(this);
    };
    FiltersToolPanelListPanel.TEMPLATE = "<div class=\"ag-filter-list-panel\"></div>";
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
    return FiltersToolPanelListPanel;
}(Component));
export { FiltersToolPanelListPanel };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmlsdGVyc1Rvb2xQYW5lbExpc3RQYW5lbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9maWx0ZXJUb29sUGFuZWwvZmlsdGVyc1Rvb2xQYW5lbExpc3RQYW5lbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxPQUFPLEVBQ0gsQ0FBQyxFQUVELFNBQVMsRUFJVCxTQUFTLEVBQ1QsTUFBTSxFQUVOLG1CQUFtQixFQUV0QixNQUFNLHlCQUF5QixDQUFDO0FBRWpDLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLHVCQUF1QixDQUFDO0FBRTVELE9BQU8sRUFBRSx3QkFBd0IsRUFBdUIsTUFBTSw0QkFBNEIsQ0FBQztBQUMzRixPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sK0JBQStCLENBQUM7QUFHN0Q7SUFBK0MsNkNBQVM7SUFpQnBEO1FBQUEsWUFDSSxrQkFBTSx5QkFBeUIsQ0FBQyxRQUFRLENBQUMsU0FDNUM7UUFWTyxpQkFBVyxHQUFHLEtBQUssQ0FBQztRQUdwQixzQkFBZ0IsR0FBK0IsRUFBRSxDQUFDOztJQU8xRCxDQUFDO0lBRU0sd0NBQUksR0FBWCxVQUFZLE1BQWtDO1FBQTlDLGlCQStCQztRQTlCRyxJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQztRQUV4QixJQUFNLGFBQWEsR0FBK0I7WUFDOUMsaUJBQWlCLEVBQUUsS0FBSztZQUN4QixvQkFBb0IsRUFBRSxLQUFLO1lBQzNCLDBCQUEwQixFQUFFLEtBQUs7WUFDakMsR0FBRyxFQUFFLElBQUksQ0FBQyxPQUFPO1lBQ2pCLFNBQVMsRUFBRSxJQUFJLENBQUMsU0FBUztZQUN6QixPQUFPLEVBQUUsSUFBSSxDQUFDLGtCQUFrQixDQUFDLE9BQU87U0FDM0MsQ0FBQztRQUNGLENBQUMsQ0FBQyxTQUFTLENBQUMsYUFBYSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBQ25DLElBQUksQ0FBQyxNQUFNLEdBQUcs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