var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
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
import { _, Autowired, Component, Events, OriginalColumnGroup } from "@ag-grid-community/core";
import { ToolPanelColumnGroupComp } from "./toolPanelColumnGroupComp";
import { ToolPanelColumnComp } from "./toolPanelColumnComp";
import { EXPAND_STATE, SELECTED_STATE } from "./primaryColsHeaderPanel";
var PrimaryColsListPanel = /** @class */ (function (_super) {
    __extends(PrimaryColsListPanel, _super);
    function PrimaryColsListPanel() {
        var _this = _super.call(this, PrimaryColsListPanel.TEMPLATE) || this;
        _this.selectAllChecked = true;
        _this.getColumnCompId = function (columnGroupChild) {
            if (columnGroupChild instanceof OriginalColumnGroup) {
                // group comps are stored using a custom key (groupId + child colIds concatenated) as we need
                // to distinguish individual column groups after they have been split by user
                var childIds = columnGroupChild.getLeafColumns().map(function (child) { return child.getId(); }).join('-');
                return columnGroupChild.getId() + '-' + childIds;
            }
            else {
                return columnGroupChild.getId();
            }
        };
        return _this;
    }
    PrimaryColsListPanel.prototype.init = function (params, allowDragging) {
        var _this = this;
        this.params = params;
        this.allowDragging = allowDragging;
        if (!this.params.suppressSyncLayoutWithGrid) {
            this.addDestroyableEventListener(this.eventService, Events.EVENT_COLUMN_MOVED, this.onColumnsChanged.bind(this));
        }
        this.addDestroyableEventListener(this.eventService, Events.EVENT_COLUMN_EVERYTHING_CHANGED, this.onColumnsChanged.bind(this));
        var eventsImpactingCheckedState = [
            Events.EVENT_COLUMN_EVERYTHING_CHANGED,
            Events.EVENT_COLUMN_PIVOT_CHANGED,
            Events.EVENT_COLUMN_PIVOT_MODE_CHANGED,
            Events.EVENT_COLUMN_ROW_GROUP_CHANGED,
            Events.EVENT_COLUMN_VALUE_CHANGED,
            Events.EVENT_COLUMN_VISIBLE,
            Events.EVENT_NEW_COLUMNS_LOADED
        ];
        eventsImpactingCheckedState.forEach(function (event) {
            // update header select all checkbox with current selection state
            _this.addDestroyableEventListener(_this.eventService, event, _this.fireSelectionChangedEvent.bind(_this));
        });
        this.expandGroupsByDefault = !this.params.contractColumnSelection;
        if (this.columnController.isReady()) {
            this.onColumnsChanged();
        }
    };
    PrimaryColsListPanel.prototype.onColumnsChanged = function () {
        var pivotModeActive = this.columnController.isPivotMode();
        var shouldSyncColumnLayoutWithGrid = !this.params.suppressSyncLayoutWithGrid && !pivotModeActive;
        shouldSyncColumnLayoutWithGrid ? this.syncColumnLayout() : this.buildTreeFromProvidedColumnDefs();
    };
    PrimaryColsListPanel.prototype.syncColumnLayout = function () {
        this.colDefService.syncLayoutWithGrid(this.setColumnLayout.bind(this));
    };
    PrimaryColsListPanel.prototype.setColumnLayout = function (colDefs) {
        this.destroyColumnComps();
        // create column tree using supplied colDef's
        this.columnTree = this.colDefService.createColumnTree(colDefs);
        // using col defs to check if groups exist as it could be a custom layout
        var groupsExist = colDefs.some(function (colDef) {
            return colDef && typeof colDef.children !== 'undefined';
        });
        this.recursivelyAddComps(this.columnTree, 0, groupsExist);
        this.recursivelySetVisibility(this.columnTree, true);
        // notify header
        this.notifyListeners();
    };
    PrimaryColsListPanel.prototype.buildTreeFromProvidedColumnDefs = function () {
        this.destroyColumnComps();
        // add column / group comps to tool panel
        this.columnTree = this.columnController.getPrimaryColumnTree();
        var groupsExist = this.columnController.isPrimaryColumnGroupsPresent();
        this.recursivelyAddComps(this.columnTree, 0, groupsExist);
        this.recursivelySetVisibility(this.columnTree, true);
        // notify header
        this.notifyListeners();
    };
    PrimaryColsListPanel.prototype.recursivelyAddComps = function (tree, dept, groupsExist) {
        var _this = this;
        tree.forEach(function (child) {
            if (child instanceof OriginalColumnGroup) {
                _this.recursivelyAddGroupComps(child, dept, groupsExist);
            }
            else {
                _this.addColumnComps(child, dept, groupsExist);
            }
        });
    };
    PrimaryColsListPanel.prototype.recursivelyAddGroupComps = function (columnGroup, dept, groupsExist) {
        var _this = this;
        // only render group if user provided the definition
        var newDept;
        if (columnGroup.getColGroupDef() && columnGroup.getColGroupDef().suppressColumnsToolPanel) {
            return;
        }
        if (!columnGroup.isPadding()) {
            var renderedGroup = new ToolPanelColumnGroupComp(columnGroup, dept, this.allowDragging, this.expandGroupsByDefault, this.onGroupExpanded.bind(this), function () { return _this.filterResults; });
            this.getContext().wireBean(renderedGroup);
            this.getGui().appendChild(renderedGroup.getGui());
            // we want to indent on the gui for the children
            newDept = dept + 1;
            // group comps are stored using a custom key (groupId + child colIds concatenated) as we need
            // to distinguish individual column groups after they have been split by user
            var key = this.getColumnCompId(columnGroup);
            this.columnComps[key] = renderedGroup;
        }
        else {
            // no children, so no indent
            newDept = dept;
        }
        this.recursivelyAddComps(columnGroup.getChildren(), newDept, groupsExist);
    };
    PrimaryColsListPanel.prototype.addColumnComps = function (column, dept, groupsExist) {
        if (column.getColDef() && column.getColDef().suppressColumnsToolPanel) {
            return;
        }
        var columnComp = new ToolPanelColumnComp(column, dept, this.allowDragging, groupsExist);
        this.getContext().wireBean(columnComp);
        this.getGui().appendChild(columnComp.getGui());
        this.columnComps[column.getId()] = columnComp;
    };
    PrimaryColsListPanel.prototype.onGroupExpanded = function () {
        this.recursivelySetVisibility(this.columnTree, true);
        this.fireGroupExpandedEvent();
    };
    PrimaryColsListPanel.prototype.doSetExpandedAll = function (value) {
        _.iterateObject(this.columnComps, function (key, renderedItem) {
            if (renderedItem.isExpandable()) {
                renderedItem.setExpanded(value);
            }
        });
    };
    PrimaryColsListPanel.prototype.setGroupsExpanded = function (expand, groupIds) {
        var _this = this;
        var expandedGroupIds = [];
        if (!groupIds) {
            this.doSetExpandedAll(expand);
            return;
        }
        groupIds.forEach(function (suppliedGroupId) {
            // we need to search through all comps to handle the case when groups are split
            _.iterateObject(_this.columnComps, function (key, comp) {
                // check if group comp starts with supplied group id as the tool panel keys contain
                // groupId + childIds concatenated
                var foundMatchingGroupComp = key.indexOf(suppliedGroupId) === 0;
                if (foundMatchingGroupComp) {
                    comp.setExpanded(expand);
                    expandedGroupIds.push(suppliedGroupId);
                }
            });
        });
        var unrecognisedGroupIds = groupIds.filter(function (groupId) { return !_.includes(expandedGroupIds, groupId); });
        if (unrecognisedGroupIds.length > 0) {
            console.warn('ag-Grid: unable to find group(s) for supplied groupIds:', unrecognisedGroupIds);
        }
    };
    PrimaryColsListPanel.prototype.getExpandState = function () {
        var _this = this;
        var expandedCount = 0;
        var notExpandedCount = 0;
        var recursiveFunc = function (items) {
            items.forEach(function (item) {
                // only interested in groups
                if (item instanceof OriginalColumnGroup) {
                    var compId = _this.getColumnCompId(item);
                    var comp = _this.columnComps[compId];
                    if (comp) {
                        if (comp.isExpanded()) {
                            expandedCount++;
                        }
                        else {
                            notExpandedCount++;
                        }
                    }
                    var columnGroup = item;
                    var groupChildren = columnGroup.getChildren();
                    recursiveFunc(groupChildren);
                }
            });
        };
        recursiveFunc(this.columnTree);
        if (expandedCount > 0 && notExpandedCount > 0) {
            return EXPAND_STATE.INDETERMINATE;
        }
        else if (notExpandedCount > 0) {
            return EXPAND_STATE.COLLAPSED;
        }
        else {
            return EXPAND_STATE.EXPANDED;
        }
    };
    PrimaryColsListPanel.prototype.doSetSelectedAll = function (selectAllChecked) {
        this.selectAllChecked = selectAllChecked;
        this.updateSelections();
    };
    PrimaryColsListPanel.prototype.updateSelections = function () {
        var _this = this;
        if (this.columnApi.isPivotMode()) {
            // if pivot mode is on, then selecting columns has special meaning (eg group, aggregate, pivot etc),
            // so there is no bulk operation we can do.
            _.iterateObject(this.columnComps, function (key, column) {
                column.onSelectAllChanged(_this.selectAllChecked);
            });
        }
        else {
            // however if pivot mode is off, then it's all about column visibility so we can do a bulk
            // operation directly with the column controller. we could column.onSelectAllChanged(checked)
            // as above, however this would work on each column independently and take longer.
            if (!_.exists(this.filterText)) {
                var primaryCols = this.columnApi.getPrimaryColumns();
                // we don't want to change visibility on lock visible / hidden columns
                var colsToChange = primaryCols.filter(function (col) {
                    return !col.getColDef().lockVisible && !col.getColDef().hide;
                });
                this.columnApi.setColumnsVisible(colsToChange, this.selectAllChecked);
                return;
            }
            // obtain list of columns currently filtered
            var filteredCols_1 = [];
            _.iterateObject(this.filterResults, function (key, passesFilter) {
                if (passesFilter)
                    filteredCols_1.push(key);
            });
            if (filteredCols_1.length > 0) {
                // update visibility of columns currently filtered
                this.columnApi.setColumnsVisible(filteredCols_1, this.selectAllChecked);
                // update select all header with new state
                var selectionState = this.selectAllChecked ? SELECTED_STATE.CHECKED : SELECTED_STATE.UNCHECKED;
                this.dispatchEvent({ type: 'selectionChanged', state: selectionState });
            }
        }
    };
    PrimaryColsListPanel.prototype.getSelectionState = function () {
        var _this = this;
        var allPrimaryColumns = this.columnController.getAllPrimaryColumns();
        var columns = [];
        if (allPrimaryColumns !== null) {
            columns = allPrimaryColumns.filter(function (col) { return !col.getColDef().lockVisible; });
        }
        var pivotMode = this.columnController.isPivotMode();
        var checkedCount = 0;
        var uncheckedCount = 0;
        columns.forEach(function (col) {
            // ignore lock visible columns
            if (col.getColDef().lockVisible) {
                return;
            }
            // not not count columns not in tool panel
            var colDef = col.getColDef();
            if (colDef && colDef.suppressColumnsToolPanel) {
                return;
            }
            // ignore columns that have been removed from panel by filter
            if (_this.filterResults && !_this.filterResults[col.getColId()])
                return;
            var checked;
            if (pivotMode) {
                var noPivotModeOptionsAllowed = !col.isAllowPivot() && !col.isAllowRowGroup() && !col.isAllowValue();
                if (noPivotModeOptionsAllowed) {
                    return;
                }
                checked = col.isValueActive() || col.isPivotActive() || col.isRowGroupActive();
            }
            else {
                checked = col.isVisible();
            }
            if (checked) {
                checkedCount++;
            }
            else {
                uncheckedCount++;
            }
        });
        if (checkedCount > 0 && uncheckedCount > 0) {
            return SELECTED_STATE.INDETERMINATE;
        }
        else if (checkedCount === 0 || uncheckedCount > 0) {
            return SELECTED_STATE.UNCHECKED;
        }
        else {
            return SELECTED_STATE.CHECKED;
        }
    };
    PrimaryColsListPanel.prototype.setFilterText = function (filterText) {
        this.filterText = _.exists(filterText) ? filterText.toLowerCase() : null;
        this.filterColumns();
        this.recursivelySetVisibility(this.columnTree, true);
        // groups selection state may need to be updated when filter is present
        _.iterateObject(this.columnComps, function (key, columnComp) {
            if (columnComp instanceof ToolPanelColumnGroupComp) {
                columnComp.onColumnStateChanged();
            }
        });
        // update header panel with current selection and expanded state
        this.fireSelectionChangedEvent();
        this.fireGroupExpandedEvent();
    };
    PrimaryColsListPanel.prototype.filterColumns = function () {
        var _this = this;
        var filterResults = {};
        var passesFilter = function (item) {
            if (!_.exists(_this.filterText))
                return true;
            var columnCompId = _this.getColumnCompId(item);
            var comp = _this.columnComps[columnCompId];
            if (!comp)
                return false;
            var isPaddingGroup = item instanceof OriginalColumnGroup && item.isPadding();
            if (isPaddingGroup)
                return false;
            var displayName = comp.getDisplayName();
            return displayName !== null ? displayName.toLowerCase().indexOf(_this.filterText) >= 0 : true;
        };
        var recursivelyCheckFilter = function (item, parentPasses) {
            var atLeastOneChildPassed = false;
            if (item instanceof OriginalColumnGroup) {
                var groupPasses_1 = passesFilter(item);
                item.getChildren().forEach(function (child) {
                    var childPasses = recursivelyCheckFilter(child, groupPasses_1 || parentPasses);
                    if (childPasses) {
                        atLeastOneChildPassed = childPasses;
                    }
                });
            }
            var filterPasses = (parentPasses || atLeastOneChildPassed) ? true : passesFilter(item);
            var columnCompId = _this.getColumnCompId(item);
            filterResults[columnCompId] = filterPasses;
            return filterPasses;
        };
        this.columnTree.forEach(function (item) { return recursivelyCheckFilter(item, false); });
        this.filterResults = filterResults;
    };
    PrimaryColsListPanel.prototype.recursivelySetVisibility = function (columnTree, parentGroupsOpen) {
        var _this = this;
        columnTree.forEach(function (child) {
            var compId = _this.getColumnCompId(child);
            var comp = _this.columnComps[compId];
            if (comp) {
                var passesFilter = _this.filterResults ? _this.filterResults[compId] : true;
                comp.setDisplayed(parentGroupsOpen && passesFilter);
            }
            if (child instanceof OriginalColumnGroup) {
                var columnGroup = child;
                var childrenOpen = void 0;
                if (comp) {
                    var expanded = comp.isExpanded();
                    childrenOpen = parentGroupsOpen ? expanded : false;
                }
                else {
                    childrenOpen = parentGroupsOpen;
                }
                var children = columnGroup.getChildren();
                _this.recursivelySetVisibility(children, childrenOpen);
            }
        });
    };
    PrimaryColsListPanel.prototype.notifyListeners = function () {
        this.fireGroupExpandedEvent();
        this.fireSelectionChangedEvent();
    };
    PrimaryColsListPanel.prototype.fireGroupExpandedEvent = function () {
        var expandState = this.getExpandState();
        this.dispatchEvent({ type: 'groupExpanded', state: expandState });
    };
    PrimaryColsListPanel.prototype.fireSelectionChangedEvent = function () {
        var selectionState = this.getSelectionState();
        this.dispatchEvent({ type: 'selectionChanged', state: selectionState });
    };
    PrimaryColsListPanel.prototype.destroyColumnComps = function () {
        _.clearElement(this.getGui());
        if (this.columnComps) {
            _.iterateObject(this.columnComps, function (key, renderedItem) { return renderedItem.destroy(); });
        }
        this.columnComps = {};
    };
    PrimaryColsListPanel.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
        this.destroyColumnComps();
    };
    PrimaryColsListPanel.TEMPLATE = "<div class=\"ag-primary-cols-list-panel\"></div>";
    __decorate([
        Autowired('gridOptionsWrapper')
    ], PrimaryColsListPanel.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        Autowired('columnController')
    ], PrimaryColsListPanel.prototype, "columnController", void 0);
    __decorate([
        Autowired('toolPanelColDefService')
    ], PrimaryColsListPanel.prototype, "colDefService", void 0);
    __decorate([
        Autowired('eventService')
    ], PrimaryColsListPanel.prototype, "eventService", void 0);
    __decorate([
        Autowired('columnApi')
    ], PrimaryColsListPanel.prototype, "columnApi", void 0);
    return PrimaryColsListPanel;
}(Component));
export { PrimaryColsListPanel };
