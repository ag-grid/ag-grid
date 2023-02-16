"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.FiltersToolPanelListPanel = void 0;
var core_1 = require("@ag-grid-community/core");
var toolPanelFilterComp_1 = require("./toolPanelFilterComp");
var toolPanelFilterGroupComp_1 = require("./toolPanelFilterGroupComp");
var filtersToolPanelHeaderPanel_1 = require("./filtersToolPanelHeaderPanel");
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
        core_1._.mergeDeep(defaultParams, params);
        this.params = defaultParams;
        if (!this.params.suppressSyncLayoutWithGrid) {
            this.addManagedListener(this.eventService, core_1.Events.EVENT_COLUMN_MOVED, function () { return _this.onColumnsChanged(); });
        }
        this.addManagedListener(this.eventService, core_1.Events.EVENT_NEW_COLUMNS_LOADED, function () { return _this.onColumnsChanged(); });
        this.addManagedListener(this.eventService, core_1.Events.EVENT_INTERNAL_TOOL_PANEL_VISIBLE_CHANGED, function (event) {
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
        if (core_1._.exists(this.searchFilterText)) {
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
        return core_1._.flatten(tree.map(function (child) {
            if (child instanceof core_1.ProvidedColumnGroup) {
                return core_1._.flatten(_this.recursivelyAddFilterGroupComps(child, depth, expansionState));
            }
            var column = child;
            if (!_this.shouldDisplayFilter(column)) {
                return [];
            }
            var hideFilterCompHeader = depth === 0;
            var filterComp = new toolPanelFilterComp_1.ToolPanelFilterComp(hideFilterCompHeader);
            _this.createBean(filterComp);
            filterComp.setColumn(column);
            if (expansionState.get(column.getId())) {
                // Default state on creation and desired state are both collapsed. Expand if expanded before.
                filterComp.expand();
            }
            if (depth > 0) {
                return filterComp;
            }
            var filterGroupComp = _this.createBean(new toolPanelFilterGroupComp_1.ToolPanelFilterGroupComp(column, [filterComp], _this.onGroupExpanded.bind(_this), depth, true));
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
        var childFilterComps = core_1._.flatten(this.recursivelyAddComps(columnGroup.getChildren(), newDepth, expansionState));
        if (columnGroup.isPadding()) {
            return childFilterComps;
        }
        var filterGroupComp = new toolPanelFilterGroupComp_1.ToolPanelFilterGroupComp(columnGroup, childFilterComps, this.onGroupExpanded.bind(this), depth, false);
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
            if (child instanceof core_1.ProvidedColumnGroup) {
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
                if (child instanceof toolPanelFilterGroupComp_1.ToolPanelFilterGroupComp) {
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
            var shouldExpandOrCollapse = !groupIds || core_1._.includes(groupIds, groupId);
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
                if (child instanceof toolPanelFilterGroupComp_1.ToolPanelFilterGroupComp) {
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
            if (filterComp instanceof toolPanelFilterGroupComp_1.ToolPanelFilterGroupComp) {
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
            var updateFilterExpandState = !colIds || core_1._.includes(colIds, colId);
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
                if (child instanceof toolPanelFilterGroupComp_1.ToolPanelFilterGroupComp) {
                    updateExpandCounts(child);
                }
            });
        };
        this.filterGroupComps.forEach(updateExpandCounts);
        var state;
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
    };
    FiltersToolPanelListPanel.prototype.performFilterSearch = function (searchText) {
        this.searchFilterText = core_1._.exists(searchText) ? searchText.toLowerCase() : null;
        this.searchFilters(this.searchFilterText);
    };
    FiltersToolPanelListPanel.prototype.searchFilters = function (searchFilter) {
        var passesFilter = function (groupName) {
            return !core_1._.exists(searchFilter) || groupName.toLowerCase().indexOf(searchFilter) !== -1;
        };
        var recursivelySearch = function (filterItem, parentPasses) {
            if (!(filterItem instanceof toolPanelFilterGroupComp_1.ToolPanelFilterGroupComp)) {
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
        core_1._.clearElement(this.getGui());
    };
    FiltersToolPanelListPanel.prototype.destroy = function () {
        this.destroyFilters();
        _super.prototype.destroy.call(this);
    };
    FiltersToolPanelListPanel.TEMPLATE = "<div class=\"ag-filter-list-panel\"></div>";
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
    return FiltersToolPanelListPanel;
}(core_1.Component));
exports.FiltersToolPanelListPanel = FiltersToolPanelListPanel;
