"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@ag-grid-community/core");
const primaryColsListPanelItemDragFeature_1 = require("./primaryColsListPanelItemDragFeature");
const toolPanelColumnGroupComp_1 = require("./toolPanelColumnGroupComp");
const toolPanelColumnComp_1 = require("./toolPanelColumnComp");
const primaryColsHeaderPanel_1 = require("./primaryColsHeaderPanel");
const columnModelItem_1 = require("./columnModelItem");
class UIColumnModel {
    constructor(items) {
        this.items = items;
    }
    getRowCount() {
        return this.items.length;
    }
    getRow(index) {
        return this.items[index];
    }
}
const PRIMARY_COLS_LIST_PANEL_CLASS = 'ag-column-select-list';
class PrimaryColsListPanel extends core_1.Component {
    constructor() {
        super(PrimaryColsListPanel.TEMPLATE);
        this.destroyColumnItemFuncs = [];
    }
    destroyColumnTree() {
        this.allColsTree = [];
        this.destroyColumnItemFuncs.forEach(f => f());
        this.destroyColumnItemFuncs = [];
    }
    init(params, allowDragging, eventType) {
        this.params = params;
        this.allowDragging = allowDragging;
        this.eventType = eventType;
        if (!this.params.suppressSyncLayoutWithGrid) {
            this.addManagedListener(this.eventService, core_1.Events.EVENT_COLUMN_MOVED, this.onColumnsChanged.bind(this));
        }
        this.addManagedListener(this.eventService, core_1.Events.EVENT_NEW_COLUMNS_LOADED, this.onColumnsChanged.bind(this));
        const eventsImpactingCheckedState = [
            core_1.Events.EVENT_COLUMN_PIVOT_CHANGED,
            core_1.Events.EVENT_COLUMN_PIVOT_MODE_CHANGED,
            core_1.Events.EVENT_COLUMN_ROW_GROUP_CHANGED,
            core_1.Events.EVENT_COLUMN_VALUE_CHANGED,
            core_1.Events.EVENT_COLUMN_VISIBLE,
            core_1.Events.EVENT_NEW_COLUMNS_LOADED
        ];
        eventsImpactingCheckedState.forEach(event => {
            // update header select all checkbox with current selection state
            this.addManagedListener(this.eventService, event, this.fireSelectionChangedEvent.bind(this));
        });
        this.expandGroupsByDefault = !this.params.contractColumnSelection;
        const translate = this.gridOptionsWrapper.getLocaleTextFunc();
        const columnListName = translate('ariaColumnList', 'Column List');
        this.virtualList = this.createManagedBean(new core_1.VirtualList('column-select', 'tree', columnListName));
        this.appendChild(this.virtualList.getGui());
        this.virtualList.setComponentCreator((item, listItemElement) => {
            core_1._.setAriaLevel(listItemElement, (item.getDept() + 1));
            return this.createComponentFromItem(item, listItemElement);
        });
        if (this.columnModel.isReady()) {
            this.onColumnsChanged();
        }
        if (!params.suppressColumnMove && !this.gridOptionsWrapper.isSuppressMovableColumns()) {
            this.createManagedBean(new primaryColsListPanelItemDragFeature_1.PrimaryColsListPanelItemDragFeature(this, this.virtualList));
        }
    }
    createComponentFromItem(item, listItemElement) {
        if (item.isGroup()) {
            const renderedGroup = new toolPanelColumnGroupComp_1.ToolPanelColumnGroupComp(item, this.allowDragging, this.eventType, listItemElement);
            this.getContext().createBean(renderedGroup);
            return renderedGroup;
        }
        const columnComp = new toolPanelColumnComp_1.ToolPanelColumnComp(item.getColumn(), item.getDept(), this.allowDragging, this.groupsExist, listItemElement);
        this.getContext().createBean(columnComp);
        return columnComp;
    }
    onColumnsChanged() {
        const expandedStates = this.getExpandedStates();
        const pivotModeActive = this.columnModel.isPivotMode();
        const shouldSyncColumnLayoutWithGrid = !this.params.suppressSyncLayoutWithGrid && !pivotModeActive;
        if (shouldSyncColumnLayoutWithGrid) {
            this.buildTreeFromWhatGridIsDisplaying();
        }
        else {
            this.buildTreeFromProvidedColumnDefs();
        }
        this.setExpandedStates(expandedStates);
        this.markFilteredColumns();
        this.flattenAndFilterModel();
    }
    getDisplayedColsList() {
        return this.displayedColsList;
    }
    getExpandedStates() {
        if (!this.allColsTree) {
            return {};
        }
        const res = {};
        this.forEachItem(item => {
            if (!item.isGroup()) {
                return;
            }
            const colGroup = item.getColumnGroup();
            if (colGroup) { // group should always exist, this is defensive
                res[colGroup.getId()] = item.isExpanded();
            }
        });
        return res;
    }
    setExpandedStates(states) {
        if (!this.allColsTree) {
            return;
        }
        this.forEachItem(item => {
            if (!item.isGroup()) {
                return;
            }
            const colGroup = item.getColumnGroup();
            if (colGroup) { // group should always exist, this is defensive
                const expanded = states[colGroup.getId()];
                const groupExistedLastTime = expanded != null;
                if (groupExistedLastTime) {
                    item.setExpanded(expanded);
                }
            }
        });
    }
    buildTreeFromWhatGridIsDisplaying() {
        this.colDefService.syncLayoutWithGrid(this.setColumnLayout.bind(this));
    }
    setColumnLayout(colDefs) {
        const columnTree = this.colDefService.createColumnTree(colDefs);
        this.buildListModel(columnTree);
        // using col defs to check if groups exist as it could be a custom layout
        this.groupsExist = colDefs.some(colDef => {
            return colDef && typeof colDef.children !== 'undefined';
        });
        this.markFilteredColumns();
        this.flattenAndFilterModel();
    }
    buildTreeFromProvidedColumnDefs() {
        // add column / group comps to tool panel
        this.buildListModel(this.columnModel.getPrimaryColumnTree());
        this.groupsExist = this.columnModel.isPrimaryColumnGroupsPresent();
    }
    buildListModel(columnTree) {
        const columnExpandedListener = this.onColumnExpanded.bind(this);
        const addListeners = (item) => {
            item.addEventListener(columnModelItem_1.ColumnModelItem.EVENT_EXPANDED_CHANGED, columnExpandedListener);
            const removeFunc = item.removeEventListener.bind(item, columnModelItem_1.ColumnModelItem.EVENT_EXPANDED_CHANGED, columnExpandedListener);
            this.destroyColumnItemFuncs.push(removeFunc);
        };
        const recursivelyBuild = (tree, dept, parentList) => {
            tree.forEach(child => {
                if (child instanceof core_1.ProvidedColumnGroup) {
                    createGroupItem(child, dept, parentList);
                }
                else {
                    createColumnItem(child, dept, parentList);
                }
            });
        };
        const createGroupItem = (columnGroup, dept, parentList) => {
            const columnGroupDef = columnGroup.getColGroupDef();
            const skipThisGroup = columnGroupDef && columnGroupDef.suppressColumnsToolPanel;
            if (skipThisGroup) {
                return;
            }
            if (columnGroup.isPadding()) {
                recursivelyBuild(columnGroup.getChildren(), dept, parentList);
                return;
            }
            const displayName = this.columnModel.getDisplayNameForProvidedColumnGroup(null, columnGroup, this.eventType);
            const item = new columnModelItem_1.ColumnModelItem(displayName, columnGroup, dept, true, this.expandGroupsByDefault);
            parentList.push(item);
            addListeners(item);
            recursivelyBuild(columnGroup.getChildren(), dept + 1, item.getChildren());
        };
        const createColumnItem = (column, dept, parentList) => {
            const skipThisColumn = column.getColDef() && column.getColDef().suppressColumnsToolPanel;
            if (skipThisColumn) {
                return;
            }
            const displayName = this.columnModel.getDisplayNameForColumn(column, 'columnToolPanel');
            parentList.push(new columnModelItem_1.ColumnModelItem(displayName, column, dept));
        };
        this.destroyColumnTree();
        recursivelyBuild(columnTree, 0, this.allColsTree);
    }
    onColumnExpanded() {
        this.flattenAndFilterModel();
    }
    flattenAndFilterModel() {
        this.displayedColsList = [];
        const recursiveFunc = (item) => {
            if (!item.isPassesFilter()) {
                return;
            }
            this.displayedColsList.push(item);
            if (item.isGroup() && item.isExpanded()) {
                item.getChildren().forEach(recursiveFunc);
            }
        };
        this.allColsTree.forEach(recursiveFunc);
        this.virtualList.setModel(new UIColumnModel(this.displayedColsList));
        const focusedRow = this.virtualList.getLastFocusedRow();
        this.virtualList.refresh();
        if (focusedRow != null) {
            this.focusRowIfAlive(focusedRow);
        }
        this.notifyListeners();
    }
    focusRowIfAlive(rowIndex) {
        window.setTimeout(() => {
            if (this.isAlive()) {
                this.virtualList.focusRow(rowIndex);
            }
        }, 0);
    }
    forEachItem(callback) {
        const recursiveFunc = (items) => {
            items.forEach(item => {
                callback(item);
                if (item.isGroup()) {
                    recursiveFunc(item.getChildren());
                }
            });
        };
        recursiveFunc(this.allColsTree);
    }
    doSetExpandedAll(value) {
        this.forEachItem(item => {
            if (item.isGroup()) {
                item.setExpanded(value);
            }
        });
    }
    setGroupsExpanded(expand, groupIds) {
        if (!groupIds) {
            this.doSetExpandedAll(expand);
            return;
        }
        const expandedGroupIds = [];
        this.forEachItem(item => {
            if (!item.isGroup()) {
                return;
            }
            const groupId = item.getColumnGroup().getId();
            if (groupIds.indexOf(groupId) >= 0) {
                item.setExpanded(expand);
                expandedGroupIds.push(groupId);
            }
        });
        const unrecognisedGroupIds = groupIds.filter(groupId => !core_1._.includes(expandedGroupIds, groupId));
        if (unrecognisedGroupIds.length > 0) {
            console.warn('AG Grid: unable to find group(s) for supplied groupIds:', unrecognisedGroupIds);
        }
    }
    getExpandState() {
        let expandedCount = 0;
        let notExpandedCount = 0;
        this.forEachItem(item => {
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
    }
    doSetSelectedAll(selectAllChecked) {
        this.modelItemUtils.selectAllChildren(this.allColsTree, selectAllChecked, this.eventType);
    }
    getSelectionState() {
        let checkedCount = 0;
        let uncheckedCount = 0;
        const pivotMode = this.columnModel.isPivotMode();
        this.forEachItem(item => {
            if (item.isGroup()) {
                return;
            }
            if (!item.isPassesFilter()) {
                return;
            }
            const column = item.getColumn();
            const colDef = column.getColDef();
            let checked;
            if (pivotMode) {
                const noPivotModeOptionsAllowed = !column.isAllowPivot() && !column.isAllowRowGroup() && !column.isAllowValue();
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
    }
    setFilterText(filterText) {
        this.filterText = core_1._.exists(filterText) ? filterText.toLowerCase() : null;
        this.markFilteredColumns();
        this.flattenAndFilterModel();
    }
    markFilteredColumns() {
        const passesFilter = (item) => {
            if (!core_1._.exists(this.filterText)) {
                return true;
            }
            const displayName = item.getDisplayName();
            return displayName == null || displayName.toLowerCase().indexOf(this.filterText) !== -1;
        };
        const recursivelyCheckFilter = (item, parentPasses) => {
            let atLeastOneChildPassed = false;
            if (item.isGroup()) {
                const groupPasses = passesFilter(item);
                item.getChildren().forEach(child => {
                    const childPasses = recursivelyCheckFilter(child, groupPasses || parentPasses);
                    if (childPasses) {
                        atLeastOneChildPassed = childPasses;
                    }
                });
            }
            const filterPasses = (parentPasses || atLeastOneChildPassed) ? true : passesFilter(item);
            item.setPassesFilter(filterPasses);
            return filterPasses;
        };
        this.allColsTree.forEach(item => recursivelyCheckFilter(item, false));
    }
    notifyListeners() {
        this.fireGroupExpandedEvent();
        this.fireSelectionChangedEvent();
    }
    fireGroupExpandedEvent() {
        const expandState = this.getExpandState();
        this.dispatchEvent({ type: 'groupExpanded', state: expandState });
    }
    fireSelectionChangedEvent() {
        const selectionState = this.getSelectionState();
        this.dispatchEvent({ type: 'selectionChanged', state: selectionState });
    }
}
PrimaryColsListPanel.TEMPLATE = `<div class="${PRIMARY_COLS_LIST_PANEL_CLASS}" role="presentation"></div>`;
__decorate([
    core_1.Autowired('columnModel')
], PrimaryColsListPanel.prototype, "columnModel", void 0);
__decorate([
    core_1.Autowired('toolPanelColDefService')
], PrimaryColsListPanel.prototype, "colDefService", void 0);
__decorate([
    core_1.Autowired('modelItemUtils')
], PrimaryColsListPanel.prototype, "modelItemUtils", void 0);
__decorate([
    core_1.PreDestroy
], PrimaryColsListPanel.prototype, "destroyColumnTree", null);
exports.PrimaryColsListPanel = PrimaryColsListPanel;
