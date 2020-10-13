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
var columnModelItem_1 = require("./columnModelItem");
var ColumnModel = /** @class */ (function () {
    function ColumnModel(items) {
        this.items = items;
    }
    ColumnModel.prototype.getRowCount = function () {
        return this.items.length;
    };
    ColumnModel.prototype.getRow = function (index) {
        return this.items[index];
    };
    return ColumnModel;
}());
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
        this.virtualList = this.createManagedBean(new core_1.VirtualList('column-select', 'tree'));
        this.appendChild(this.virtualList.getGui());
        this.virtualList.setComponentCreator(function (item, listItemElement) { return _this.createComponentFromItem(item, listItemElement); });
        if (this.columnController.isReady()) {
            this.onColumnsChanged();
        }
    };
    PrimaryColsListPanel.prototype.createComponentFromItem = function (item, listItemElement) {
        if (item.isGroup()) {
            var renderedGroup = new toolPanelColumnGroupComp_1.ToolPanelColumnGroupComp(item, this.allowDragging, this.eventType, listItemElement);
            this.getContext().createBean(renderedGroup);
            return renderedGroup;
        }
        var columnComp = new toolPanelColumnComp_1.ToolPanelColumnComp(item.getColumn(), item.getDept(), this.allowDragging, this.groupsExist, listItemElement);
        this.getContext().createBean(columnComp);
        return columnComp;
    };
    PrimaryColsListPanel.prototype.onColumnsChanged = function () {
        var pivotModeActive = this.columnController.isPivotMode();
        var shouldSyncColumnLayoutWithGrid = !this.params.suppressSyncLayoutWithGrid && !pivotModeActive;
        if (shouldSyncColumnLayoutWithGrid) {
            this.buildTreeFromWhatGridIsDisplaying();
        }
        else {
            this.buildTreeFromProvidedColumnDefs();
        }
        this.markFilteredColumns();
        this.flattenAndFilterModel();
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
        this.buildListModel(this.columnController.getPrimaryColumnTree());
        this.groupsExist = this.columnController.isPrimaryColumnGroupsPresent();
    };
    PrimaryColsListPanel.prototype.buildListModel = function (columnTree) {
        var _this = this;
        var columnExpandedListener = this.onColumnExpanded.bind(this);
        var addListeners = function (item) {
            item.addEventListener(columnModelItem_1.ColumnModelItem.EVENT_EXPANDED_CHANGED, columnExpandedListener);
            var removeFunc = item.removeEventListener.bind(item, columnModelItem_1.ColumnModelItem.EVENT_EXPANDED_CHANGED, columnExpandedListener);
            _this.destroyColumnItemFuncs.push(removeFunc);
        };
        var recursivelyBuild = function (tree, dept, parentList) {
            tree.forEach(function (child) {
                if (child instanceof core_1.OriginalColumnGroup) {
                    createGroupItem(child, dept, parentList);
                }
                else {
                    createColumnItem(child, dept, parentList);
                }
            });
        };
        var createGroupItem = function (columnGroup, dept, parentList) {
            var skipThisGroup = columnGroup.getColGroupDef() && columnGroup.getColGroupDef().suppressColumnsToolPanel;
            if (skipThisGroup) {
                return;
            }
            if (columnGroup.isPadding()) {
                recursivelyBuild(columnGroup.getChildren(), dept, parentList);
                return;
            }
            var displayName = _this.columnController.getDisplayNameForOriginalColumnGroup(null, columnGroup, _this.eventType);
            var item = new columnModelItem_1.ColumnModelItem(displayName, columnGroup, dept, true, _this.expandGroupsByDefault);
            parentList.push(item);
            addListeners(item);
            recursivelyBuild(columnGroup.getChildren(), dept + 1, item.getChildren());
        };
        var createColumnItem = function (column, dept, parentList) {
            var skipThisColumn = column.getColDef() && column.getColDef().suppressColumnsToolPanel;
            if (skipThisColumn) {
                return;
            }
            var displayName = _this.columnController.getDisplayNameForColumn(column, 'toolPanel');
            parentList.push(new columnModelItem_1.ColumnModelItem(displayName, column, dept));
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
        this.virtualList.setModel(new ColumnModel(this.displayedColsList));
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
        var unrecognisedGroupIds = groupIds.filter(function (groupId) { return !core_1._.includes(expandedGroupIds, groupId); });
        if (unrecognisedGroupIds.length > 0) {
            console.warn('ag-Grid: unable to find group(s) for supplied groupIds:', unrecognisedGroupIds);
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
            return primaryColsHeaderPanel_1.ExpandState.INDETERMINATE;
        }
        if (notExpandedCount > 0) {
            return primaryColsHeaderPanel_1.ExpandState.COLLAPSED;
        }
        return primaryColsHeaderPanel_1.ExpandState.EXPANDED;
    };
    PrimaryColsListPanel.prototype.doSetSelectedAll = function (selectAllChecked) {
        this.modelItemUtils.selectAllChildren(this.allColsTree, selectAllChecked, this.eventType);
    };
    PrimaryColsListPanel.prototype.getSelectionState = function () {
        var checkedCount = 0;
        var uncheckedCount = 0;
        var pivotMode = this.columnController.isPivotMode();
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
        if (checkedCount > 0 && uncheckedCount > 0)
            return undefined;
        return !(checkedCount === 0 || uncheckedCount > 0);
    };
    PrimaryColsListPanel.prototype.setFilterText = function (filterText) {
        this.filterText = core_1._.exists(filterText) ? filterText.toLowerCase() : null;
        this.markFilteredColumns();
        this.flattenAndFilterModel();
    };
    PrimaryColsListPanel.prototype.markFilteredColumns = function () {
        var _this = this;
        var passesFilter = function (item) {
            if (!core_1._.exists(_this.filterText))
                return true;
            return item.getDisplayName() != null ? item.getDisplayName().toLowerCase().indexOf(_this.filterText) >= 0 : true;
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
    PrimaryColsListPanel.TEMPLATE = "<div class=\"ag-column-select-list\" role=\"tree\"></div>";
    __decorate([
        core_1.Autowired('columnController')
    ], PrimaryColsListPanel.prototype, "columnController", void 0);
    __decorate([
        core_1.Autowired('toolPanelColDefService')
    ], PrimaryColsListPanel.prototype, "colDefService", void 0);
    __decorate([
        core_1.Autowired('columnApi')
    ], PrimaryColsListPanel.prototype, "columnApi", void 0);
    __decorate([
        core_1.Autowired('modelItemUtils')
    ], PrimaryColsListPanel.prototype, "modelItemUtils", void 0);
    __decorate([
        core_1.PreDestroy
    ], PrimaryColsListPanel.prototype, "destroyColumnTree", null);
    return PrimaryColsListPanel;
}(core_1.Component));
exports.PrimaryColsListPanel = PrimaryColsListPanel;
//# sourceMappingURL=primaryColsListPanel.js.map