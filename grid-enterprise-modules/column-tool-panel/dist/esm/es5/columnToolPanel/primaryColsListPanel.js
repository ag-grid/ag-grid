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
        var translate = this.localeService.getLocaleTextFunc();
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
        if (!params.suppressColumnMove && !this.gridOptionsService.is('suppressMovableColumns')) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJpbWFyeUNvbHNMaXN0UGFuZWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvY29sdW1uVG9vbFBhbmVsL3ByaW1hcnlDb2xzTGlzdFBhbmVsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLE9BQU8sRUFDSCxDQUFDLEVBRUQsU0FBUyxFQUtULFNBQVMsRUFDVCxNQUFNLEVBQ04sbUJBQW1CLEVBR25CLFdBQVcsRUFFWCxVQUFVLEVBQ2IsTUFBTSx5QkFBeUIsQ0FBQztBQUNqQyxPQUFPLEVBQUUsbUNBQW1DLEVBQUUsTUFBTSx1Q0FBdUMsQ0FBQztBQUM1RixPQUFPLEVBQUUsd0JBQXdCLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQztBQUN0RSxPQUFPLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQztBQUU1RCxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFDdkQsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBR3BEO0lBSUksdUJBQVksS0FBd0I7UUFDaEMsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7SUFDdkIsQ0FBQztJQUVNLG1DQUFXLEdBQWxCO1FBQ0ksT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQztJQUM3QixDQUFDO0lBRU0sOEJBQU0sR0FBYixVQUFjLEtBQWE7UUFDdkIsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQzdCLENBQUM7SUFDTCxvQkFBQztBQUFELENBQUMsQUFmRCxJQWVDO0FBRUQsSUFBTSw2QkFBNkIsR0FBRyx1QkFBdUIsQ0FBQztBQUU5RDtJQUEwQyx3Q0FBUztJQXNCL0M7UUFBQSxZQUNJLGtCQUFNLG9CQUFvQixDQUFDLFFBQVEsQ0FBQyxTQUN2QztRQUpPLDRCQUFzQixHQUFtQixFQUFFLENBQUM7O0lBSXBELENBQUM7SUFH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