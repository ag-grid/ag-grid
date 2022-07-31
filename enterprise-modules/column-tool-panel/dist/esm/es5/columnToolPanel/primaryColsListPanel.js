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
import { _, Autowired, Component, Events, ProvidedColumnGroup, VirtualList, PreDestroy } from "@ag-grid-community/core";
import { PrimaryColsListPanelItemDragFeature } from './primaryColsListPanelItemDragFeature';
import { ToolPanelColumnGroupComp } from "./toolPanelColumnGroupComp";
import { ToolPanelColumnComp } from "./toolPanelColumnComp";
import { ExpandState } from "./primaryColsHeaderPanel";
import { ColumnModelItem } from "./columnModelItem";
var UIColumnModel = /** @class */ (function () {
    function UIColumnModel(items) {
        this.items = items;
    }
    UIColumnModel.prototype.getRowCount = function () {
        return this.items.length;
    };
    UIColumnModel.prototype.getRow = function (index) {
        return this.items[index];
    };
    return UIColumnModel;
}());
var PRIMARY_COLS_LIST_PANEL_CLASS = 'ag-column-select-list';
var PrimaryColsListPanel = /** @class */ (function (_super) {
    __extends(PrimaryColsListPanel, _super);
    function PrimaryColsListPanel() {
        var _this = _super.call(this, PrimaryColsListPanel.TEMPLATE) || this;
        _this.destroyColumnItemFuncs = [];
        return _this;
    }
    PrimaryColsListPanel.prototype.destroyColumnTree = function () {
        this.allColsTree = [];
        this.destroyColumnItemFuncs.forEach(function (f) { return f(); });
        this.destroyColumnItemFuncs = [];
    };
    PrimaryColsListPanel.prototype.init = function (params, allowDragging, eventType) {
        var _this = this;
        this.params = params;
        this.allowDragging = allowDragging;
        this.eventType = eventType;
        if (!this.params.suppressSyncLayoutWithGrid) {
            this.addManagedListener(this.eventService, Events.EVENT_COLUMN_MOVED, this.onColumnsChanged.bind(this));
        }
        this.addManagedListener(this.eventService, Events.EVENT_NEW_COLUMNS_LOADED, this.onColumnsChanged.bind(this));
        var eventsImpactingCheckedState = [
            Events.EVENT_COLUMN_PIVOT_CHANGED,
            Events.EVENT_COLUMN_PIVOT_MODE_CHANGED,
            Events.EVENT_COLUMN_ROW_GROUP_CHANGED,
            Events.EVENT_COLUMN_VALUE_CHANGED,
            Events.EVENT_COLUMN_VISIBLE,
            Events.EVENT_NEW_COLUMNS_LOADED
        ];
        eventsImpactingCheckedState.forEach(function (event) {
            // update header select all checkbox with current selection state
            _this.addManagedListener(_this.eventService, event, _this.fireSelectionChangedEvent.bind(_this));
        });
        this.expandGroupsByDefault = !this.params.contractColumnSelection;
        var translate = this.gridOptionsWrapper.getLocaleTextFunc();
        var columnListName = translate('ariaColumnList', 'Column List');
        this.virtualList = this.createManagedBean(new VirtualList('column-select', 'tree', columnListName));
        this.appendChild(this.virtualList.getGui());
        this.virtualList.setComponentCreator(function (item, listItemElement) {
            _.setAriaLevel(listItemElement, (item.getDept() + 1));
            return _this.createComponentFromItem(item, listItemElement);
        });
        if (this.columnModel.isReady()) {
            this.onColumnsChanged();
        }
        if (!params.suppressColumnMove && !this.gridOptionsWrapper.isSuppressMovableColumns()) {
            this.createManagedBean(new PrimaryColsListPanelItemDragFeature(this, this.virtualList));
        }
    };
    PrimaryColsListPanel.prototype.createComponentFromItem = function (item, listItemElement) {
        if (item.isGroup()) {
            var renderedGroup = new ToolPanelColumnGroupComp(item, this.allowDragging, this.eventType, listItemElement);
            this.getContext().createBean(renderedGroup);
            return renderedGroup;
        }
        var columnComp = new ToolPanelColumnComp(item.getColumn(), item.getDept(), this.allowDragging, this.groupsExist, listItemElement);
        this.getContext().createBean(columnComp);
        return columnComp;
    };
    PrimaryColsListPanel.prototype.onColumnsChanged = function () {
        var expandedStates = this.getExpandedStates();
        var pivotModeActive = this.columnModel.isPivotMode();
        var shouldSyncColumnLayoutWithGrid = !this.params.suppressSyncLayoutWithGrid && !pivotModeActive;
        if (shouldSyncColumnLayoutWithGrid) {
            this.buildTreeFromWhatGridIsDisplaying();
        }
        else {
            this.buildTreeFromProvidedColumnDefs();
        }
        this.setExpandedStates(expandedStates);
        this.markFilteredColumns();
        this.flattenAndFilterModel();
    };
    PrimaryColsListPanel.prototype.getDisplayedColsList = function () {
        return this.displayedColsList;
    };
    PrimaryColsListPanel.prototype.getExpandedStates = function () {
        if (!this.allColsTree) {
            return {};
        }
        var res = {};
        this.forEachItem(function (item) {
            if (!item.isGroup()) {
                return;
            }
            var colGroup = item.getColumnGroup();
            if (colGroup) { // group should always exist, this is defensive
                res[colGroup.getId()] = item.isExpanded();
            }
        });
        return res;
    };
    PrimaryColsListPanel.prototype.setExpandedStates = function (states) {
        if (!this.allColsTree) {
            return;
        }
        this.forEachItem(function (item) {
            if (!item.isGroup()) {
                return;
            }
            var colGroup = item.getColumnGroup();
            if (colGroup) { // group should always exist, this is defensive
                var expanded = states[colGroup.getId()];
                var groupExistedLastTime = expanded != null;
                if (groupExistedLastTime) {
                    item.setExpanded(expanded);
                }
            }
        });
    };
    PrimaryColsListPanel.prototype.buildTreeFromWhatGridIsDisplaying = function () {
        this.colDefService.syncLayoutWithGrid(this.setColumnLayout.bind(this));
    };
    PrimaryColsListPanel.prototype.setColumnLayout = function (colDefs) {
        var columnTree = this.colDefService.createColumnTree(colDefs);
        this.buildListModel(columnTree);
        // using col defs to check if groups exist as it could be a custom layout
        this.groupsExist = colDefs.some(function (colDef) {
            return colDef && typeof colDef.children !== 'undefined';
        });
        this.markFilteredColumns();
        this.flattenAndFilterModel();
    };
    PrimaryColsListPanel.prototype.buildTreeFromProvidedColumnDefs = function () {
        // add column / group comps to tool panel
        this.buildListModel(this.columnModel.getPrimaryColumnTree());
        this.groupsExist = this.columnModel.isPrimaryColumnGroupsPresent();
    };
    PrimaryColsListPanel.prototype.buildListModel = function (columnTree) {
        var _this = this;
        var columnExpandedListener = this.onColumnExpanded.bind(this);
        var addListeners = function (item) {
            item.addEventListener(ColumnModelItem.EVENT_EXPANDED_CHANGED, columnExpandedListener);
            var removeFunc = item.removeEventListener.bind(item, ColumnModelItem.EVENT_EXPANDED_CHANGED, columnExpandedListener);
            _this.destroyColumnItemFuncs.push(removeFunc);
        };
        var recursivelyBuild = function (tree, dept, parentList) {
            tree.forEach(function (child) {
                if (child instanceof ProvidedColumnGroup) {
                    createGroupItem(child, dept, parentList);
                }
                else {
                    createColumnItem(child, dept, parentList);
                }
            });
        };
        var createGroupItem = function (columnGroup, dept, parentList) {
            var columnGroupDef = columnGroup.getColGroupDef();
            var skipThisGroup = columnGroupDef && columnGroupDef.suppressColumnsToolPanel;
            if (skipThisGroup) {
                return;
            }
            if (columnGroup.isPadding()) {
                recursivelyBuild(columnGroup.getChildren(), dept, parentList);
                return;
            }
            var displayName = _this.columnModel.getDisplayNameForProvidedColumnGroup(null, columnGroup, _this.eventType);
            var item = new ColumnModelItem(displayName, columnGroup, dept, true, _this.expandGroupsByDefault);
            parentList.push(item);
            addListeners(item);
            recursivelyBuild(columnGroup.getChildren(), dept + 1, item.getChildren());
        };
        var createColumnItem = function (column, dept, parentList) {
            var skipThisColumn = column.getColDef() && column.getColDef().suppressColumnsToolPanel;
            if (skipThisColumn) {
                return;
            }
            var displayName = _this.columnModel.getDisplayNameForColumn(column, 'columnToolPanel');
            parentList.push(new ColumnModelItem(displayName, column, dept));
        };
        this.destroyColumnTree();
        recursivelyBuild(columnTree, 0, this.allColsTree);
    };
    PrimaryColsListPanel.prototype.onColumnExpanded = function () {
        this.flattenAndFilterModel();
    };
    PrimaryColsListPanel.prototype.flattenAndFilterModel = function () {
        var _this = this;
        this.displayedColsList = [];
        var recursiveFunc = function (item) {
            if (!item.isPassesFilter()) {
                return;
            }
            _this.displayedColsList.push(item);
            if (item.isGroup() && item.isExpanded()) {
                item.getChildren().forEach(recursiveFunc);
            }
        };
        this.allColsTree.forEach(recursiveFunc);
        this.virtualList.setModel(new UIColumnModel(this.displayedColsList));
        var focusedRow = this.virtualList.getLastFocusedRow();
        this.virtualList.refresh();
        if (focusedRow != null) {
            this.focusRowIfAlive(focusedRow);
        }
        this.notifyListeners();
    };
    PrimaryColsListPanel.prototype.focusRowIfAlive = function (rowIndex) {
        var _this = this;
        window.setTimeout(function () {
            if (_this.isAlive()) {
                _this.virtualList.focusRow(rowIndex);
            }
        }, 0);
    };
    PrimaryColsListPanel.prototype.forEachItem = function (callback) {
        var recursiveFunc = function (items) {
            items.forEach(function (item) {
                callback(item);
                if (item.isGroup()) {
                    recursiveFunc(item.getChildren());
                }
            });
        };
        recursiveFunc(this.allColsTree);
    };
    PrimaryColsListPanel.prototype.doSetExpandedAll = function (value) {
        this.forEachItem(function (item) {
            if (item.isGroup()) {
                item.setExpanded(value);
            }
        });
    };
    PrimaryColsListPanel.prototype.setGroupsExpanded = function (expand, groupIds) {
        if (!groupIds) {
            this.doSetExpandedAll(expand);
            return;
        }
        var expandedGroupIds = [];
        this.forEachItem(function (item) {
            if (!item.isGroup()) {
                return;
            }
            var groupId = item.getColumnGroup().getId();
            if (groupIds.indexOf(groupId) >= 0) {
                item.setExpanded(expand);
                expandedGroupIds.push(groupId);
            }
        });
        var unrecognisedGroupIds = groupIds.filter(function (groupId) { return !_.includes(expandedGroupIds, groupId); });
        if (unrecognisedGroupIds.length > 0) {
            console.warn('AG Grid: unable to find group(s) for supplied groupIds:', unrecognisedGroupIds);
        }
    };
    PrimaryColsListPanel.prototype.getExpandState = function () {
        var expandedCount = 0;
        var notExpandedCount = 0;
        this.forEachItem(function (item) {
            if (!item.isGroup()) {
                return;
            }
            if (item.isExpanded()) {
                expandedCount++;
            }
            else {
                notExpandedCount++;
            }
        });
        if (expandedCount > 0 && notExpandedCount > 0) {
            return ExpandState.INDETERMINATE;
        }
        if (notExpandedCount > 0) {
            return ExpandState.COLLAPSED;
        }
        return ExpandState.EXPANDED;
    };
    PrimaryColsListPanel.prototype.doSetSelectedAll = function (selectAllChecked) {
        this.modelItemUtils.selectAllChildren(this.allColsTree, selectAllChecked, this.eventType);
    };
    PrimaryColsListPanel.prototype.getSelectionState = function () {
        var checkedCount = 0;
        var uncheckedCount = 0;
        var pivotMode = this.columnModel.isPivotMode();
        this.forEachItem(function (item) {
            if (item.isGroup()) {
                return;
            }
            if (!item.isPassesFilter()) {
                return;
            }
            var column = item.getColumn();
            var colDef = column.getColDef();
            var checked;
            if (pivotMode) {
                var noPivotModeOptionsAllowed = !column.isAllowPivot() && !column.isAllowRowGroup() && !column.isAllowValue();
                if (noPivotModeOptionsAllowed) {
                    return;
                }
                checked = column.isValueActive() || column.isPivotActive() || column.isRowGroupActive();
            }
            else {
                if (colDef.lockVisible) {
                    return;
                }
                checked = column.isVisible();
            }
            checked ? checkedCount++ : uncheckedCount++;
        });
        if (checkedCount > 0 && uncheckedCount > 0) {
            return undefined;
        }
        return !(checkedCount === 0 || uncheckedCount > 0);
    };
    PrimaryColsListPanel.prototype.setFilterText = function (filterText) {
        this.filterText = _.exists(filterText) ? filterText.toLowerCase() : null;
        this.markFilteredColumns();
        this.flattenAndFilterModel();
    };
    PrimaryColsListPanel.prototype.markFilteredColumns = function () {
        var _this = this;
        var passesFilter = function (item) {
            if (!_.exists(_this.filterText)) {
                return true;
            }
            var displayName = item.getDisplayName();
            return displayName == null || displayName.toLowerCase().indexOf(_this.filterText) !== -1;
        };
        var recursivelyCheckFilter = function (item, parentPasses) {
            var atLeastOneChildPassed = false;
            if (item.isGroup()) {
                var groupPasses_1 = passesFilter(item);
                item.getChildren().forEach(function (child) {
                    var childPasses = recursivelyCheckFilter(child, groupPasses_1 || parentPasses);
                    if (childPasses) {
                        atLeastOneChildPassed = childPasses;
                    }
                });
            }
            var filterPasses = (parentPasses || atLeastOneChildPassed) ? true : passesFilter(item);
            item.setPassesFilter(filterPasses);
            return filterPasses;
        };
        this.allColsTree.forEach(function (item) { return recursivelyCheckFilter(item, false); });
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
    PrimaryColsListPanel.TEMPLATE = "<div class=\"" + PRIMARY_COLS_LIST_PANEL_CLASS + "\" role=\"presentation\"></div>";
    __decorate([
        Autowired('columnModel')
    ], PrimaryColsListPanel.prototype, "columnModel", void 0);
    __decorate([
        Autowired('toolPanelColDefService')
    ], PrimaryColsListPanel.prototype, "colDefService", void 0);
    __decorate([
        Autowired('modelItemUtils')
    ], PrimaryColsListPanel.prototype, "modelItemUtils", void 0);
    __decorate([
        PreDestroy
    ], PrimaryColsListPanel.prototype, "destroyColumnTree", null);
    return PrimaryColsListPanel;
}(Component));
export { PrimaryColsListPanel };
