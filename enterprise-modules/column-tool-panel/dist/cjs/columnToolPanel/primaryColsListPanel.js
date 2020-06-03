"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@ag-grid-community/core");
var toolPanelColumnGroupComp_1 = require("./toolPanelColumnGroupComp");
var toolPanelColumnComp_1 = require("./toolPanelColumnComp");
var primaryColsHeaderPanel_1 = require("./primaryColsHeaderPanel");
var PrimaryColsListPanel = /** @class */ (function (_super) {
    __extends(PrimaryColsListPanel, _super);
    function PrimaryColsListPanel() {
        var _this = _super.call(this, PrimaryColsListPanel.TEMPLATE) || this;
        _this.selectAllChecked = true;
        _this.columnComps = new Map();
        _this.getColumnCompId = function (columnGroupChild) {
            if (columnGroupChild instanceof core_1.OriginalColumnGroup) {
                // group comps are stored using a custom key (groupId + child colIds concatenated) as we need
                // to distinguish individual column groups after they have been split by user
                var childIds = columnGroupChild.getLeafColumns().map(function (child) { return child.getId(); }).join('-');
                return columnGroupChild.getId() + '-' + childIds;
            }
            return columnGroupChild.getId();
        };
        return _this;
    }
    PrimaryColsListPanel.prototype.init = function (params, allowDragging) {
        var _this = this;
        this.params = params;
        this.allowDragging = allowDragging;
        if (!this.params.suppressSyncLayoutWithGrid) {
            this.addManagedListener(this.eventService, core_1.Events.EVENT_COLUMN_MOVED, this.onColumnsChanged.bind(this));
        }
        this.addManagedListener(this.eventService, core_1.Events.EVENT_COLUMN_EVERYTHING_CHANGED, this.onColumnsChanged.bind(this));
        var eventsImpactingCheckedState = [
            core_1.Events.EVENT_COLUMN_EVERYTHING_CHANGED,
            core_1.Events.EVENT_COLUMN_PIVOT_CHANGED,
            core_1.Events.EVENT_COLUMN_PIVOT_MODE_CHANGED,
            core_1.Events.EVENT_COLUMN_ROW_GROUP_CHANGED,
            core_1.Events.EVENT_COLUMN_VALUE_CHANGED,
            core_1.Events.EVENT_COLUMN_VISIBLE,
            core_1.Events.EVENT_NEW_COLUMNS_LOADED
        ];
        eventsImpactingCheckedState.forEach(function (event) {
            // update header select all checkbox with current selection state
            _this.addManagedListener(_this.eventService, event, _this.fireSelectionChangedEvent.bind(_this));
        });
        this.expandGroupsByDefault = !this.params.contractColumnSelection;
        if (this.columnController.isReady()) {
            this.onColumnsChanged();
        }
    };
    PrimaryColsListPanel.prototype.handleKeyDown = function (e) {
        switch (e.keyCode) {
            case core_1.Constants.KEY_UP:
            case core_1.Constants.KEY_DOWN:
                e.preventDefault();
                this.nagivateToNextItem(e.keyCode === core_1.Constants.KEY_UP);
                break;
        }
    };
    PrimaryColsListPanel.prototype.nagivateToNextItem = function (up) {
        var nextEl = this.focusController.findNextFocusableElement(this.getFocusableElement(), true, up);
        if (nextEl) {
            nextEl.focus();
        }
    };
    PrimaryColsListPanel.prototype.onColumnsChanged = function () {
        var pivotModeActive = this.columnController.isPivotMode();
        var shouldSyncColumnLayoutWithGrid = !this.params.suppressSyncLayoutWithGrid && !pivotModeActive;
        shouldSyncColumnLayoutWithGrid ? this.syncColumnLayout() : this.buildTreeFromProvidedColumnDefs();
        this.setFilterText(this.filterText);
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
            if (child instanceof core_1.OriginalColumnGroup) {
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
            var renderedGroup = new toolPanelColumnGroupComp_1.ToolPanelColumnGroupComp(columnGroup, dept, this.allowDragging, this.expandGroupsByDefault, this.onGroupExpanded.bind(this), function () { return _this.filterResults; });
            this.getContext().createBean(renderedGroup);
            var renderedGroupGui = renderedGroup.getGui();
            this.appendChild(renderedGroupGui);
            // we want to indent on the gui for the children
            newDept = dept + 1;
            // group comps are stored using a custom key (groupId + child colIds concatenated) as we need
            // to distinguish individual column groups after they have been split by user
            var key = this.getColumnCompId(columnGroup);
            this.columnComps.set(key, renderedGroup);
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
        var columnComp = new toolPanelColumnComp_1.ToolPanelColumnComp(column, dept, this.allowDragging, groupsExist);
        this.getContext().createBean(columnComp);
        var columnCompGui = columnComp.getGui();
        this.appendChild(columnCompGui);
        this.columnComps.set(column.getId(), columnComp);
    };
    PrimaryColsListPanel.prototype.onGroupExpanded = function () {
        this.recursivelySetVisibility(this.columnTree, true);
        this.fireGroupExpandedEvent();
    };
    PrimaryColsListPanel.prototype.doSetExpandedAll = function (value) {
        this.columnComps.forEach(function (renderedItem) {
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
            _this.columnComps.forEach(function (comp, key) {
                // check if group comp starts with supplied group id as the tool panel keys contain
                // groupId + childIds concatenated
                var foundMatchingGroupComp = key.indexOf(suppliedGroupId) === 0;
                if (foundMatchingGroupComp) {
                    comp.setExpanded(expand);
                    expandedGroupIds.push(suppliedGroupId);
                }
            });
        });
        var unrecognisedGroupIds = groupIds.filter(function (groupId) { return !core_1._.includes(expandedGroupIds, groupId); });
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
                if (item instanceof core_1.OriginalColumnGroup) {
                    var compId = _this.getColumnCompId(item);
                    var comp = _this.columnComps.get(compId);
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
            return primaryColsHeaderPanel_1.EXPAND_STATE.INDETERMINATE;
        }
        if (notExpandedCount > 0) {
            return primaryColsHeaderPanel_1.EXPAND_STATE.COLLAPSED;
        }
        return primaryColsHeaderPanel_1.EXPAND_STATE.EXPANDED;
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
            this.columnComps.forEach(function (column) { return column.onSelectAllChanged(_this.selectAllChecked); });
        }
        else {
            // we don't want to change visibility on lock visible columns
            var primaryCols = this.columnApi.getPrimaryColumns();
            var colsToChange = primaryCols.filter(function (col) { return !col.getColDef().lockVisible; });
            // however if pivot mode is off, then it's all about column visibility so we can do a bulk
            // operation directly with the column controller. we could column.onSelectAllChanged(checked)
            // as above, however this would work on each column independently and take longer.
            if (!core_1._.exists(this.filterText)) {
                this.columnController.setColumnsVisible(colsToChange, this.selectAllChecked, 'columnMenu');
                return;
            }
            // obtain list of columns currently filtered
            var filteredCols_1 = [];
            core_1._.iterateObject(this.filterResults, function (key, passesFilter) {
                if (passesFilter)
                    filteredCols_1.push(key);
            });
            if (filteredCols_1.length > 0) {
                var filteredColsToChange = colsToChange.filter(function (col) { return core_1._.includes(filteredCols_1, col.getColId()); });
                // update visibility of columns currently filtered
                this.columnController.setColumnsVisible(filteredColsToChange, this.selectAllChecked, 'columnMenu');
                // update select all header with new state
                var selectionState = this.selectAllChecked ? true : false;
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
            return undefined;
        }
        if (checkedCount === 0 || uncheckedCount > 0) {
            return false;
        }
        return true;
    };
    PrimaryColsListPanel.prototype.setFilterText = function (filterText) {
        this.filterText = core_1._.exists(filterText) ? filterText.toLowerCase() : null;
        this.filterColumns();
        this.recursivelySetVisibility(this.columnTree, true);
        // groups selection state may need to be updated when filter is present
        this.columnComps.forEach(function (columnComp) {
            if (columnComp instanceof toolPanelColumnGroupComp_1.ToolPanelColumnGroupComp) {
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
            if (!core_1._.exists(_this.filterText))
                return true;
            var columnCompId = _this.getColumnCompId(item);
            var comp = _this.columnComps.get(columnCompId);
            if (!comp)
                return false;
            var isPaddingGroup = item instanceof core_1.OriginalColumnGroup && item.isPadding();
            if (isPaddingGroup)
                return false;
            var displayName = comp.getDisplayName();
            return displayName !== null ? displayName.toLowerCase().indexOf(_this.filterText) >= 0 : true;
        };
        var recursivelyCheckFilter = function (item, parentPasses) {
            var atLeastOneChildPassed = false;
            if (item instanceof core_1.OriginalColumnGroup) {
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
            var comp = _this.columnComps.get(compId);
            if (comp) {
                var filterResultExists = _this.filterResults && core_1._.exists(_this.filterResults[compId]);
                var passesFilter = filterResultExists ? _this.filterResults[compId] : true;
                comp.setDisplayed(parentGroupsOpen && passesFilter);
            }
            if (child instanceof core_1.OriginalColumnGroup) {
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
        var _this = this;
        var eGui = this.getGui();
        if (this.columnComps) {
            this.columnComps.forEach(function (renderedItem) {
                eGui.removeChild(renderedItem.getGui());
                _this.destroyBean(renderedItem);
            });
        }
        this.columnComps = new Map();
    };
    PrimaryColsListPanel.prototype.destroy = function () {
        this.destroyColumnComps();
        _super.prototype.destroy.call(this);
    };
    PrimaryColsListPanel.TEMPLATE = "<div class=\"ag-column-select-list\"></div>";
    __decorate([
        core_1.Autowired('columnController')
    ], PrimaryColsListPanel.prototype, "columnController", void 0);
    __decorate([
        core_1.Autowired('toolPanelColDefService')
    ], PrimaryColsListPanel.prototype, "colDefService", void 0);
    __decorate([
        core_1.Autowired('columnApi')
    ], PrimaryColsListPanel.prototype, "columnApi", void 0);
    return PrimaryColsListPanel;
}(core_1.ManagedFocusComponent));
exports.PrimaryColsListPanel = PrimaryColsListPanel;
//# sourceMappingURL=primaryColsListPanel.js.map