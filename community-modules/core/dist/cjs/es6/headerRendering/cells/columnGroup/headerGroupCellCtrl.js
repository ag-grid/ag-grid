/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.1.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HeaderGroupCellCtrl = void 0;
const keyCode_1 = require("../../../constants/keyCode");
const context_1 = require("../../../context/context");
const dragAndDropService_1 = require("../../../dragAndDrop/dragAndDropService");
const column_1 = require("../../../entities/column");
const providedColumnGroup_1 = require("../../../entities/providedColumnGroup");
const setLeftFeature_1 = require("../../../rendering/features/setLeftFeature");
const array_1 = require("../../../utils/array");
const managedFocusFeature_1 = require("../../../widgets/managedFocusFeature");
const tooltipFeature_1 = require("../../../widgets/tooltipFeature");
const abstractHeaderCellCtrl_1 = require("../abstractCell/abstractHeaderCellCtrl");
const cssClassApplier_1 = require("../cssClassApplier");
const hoverFeature_1 = require("../hoverFeature");
const groupResizeFeature_1 = require("./groupResizeFeature");
const groupWidthFeature_1 = require("./groupWidthFeature");
class HeaderGroupCellCtrl extends abstractHeaderCellCtrl_1.AbstractHeaderCellCtrl {
    constructor(columnGroup, parentRowCtrl) {
        super(columnGroup, parentRowCtrl);
        this.columnGroup = columnGroup;
    }
    setComp(comp, eGui, eResize) {
        super.setGui(eGui);
        this.comp = comp;
        this.displayName = this.columnModel.getDisplayNameForColumnGroup(this.columnGroup, 'header');
        this.addClasses();
        this.addAttributes();
        this.setupMovingCss();
        this.setupExpandable();
        this.setupTooltip();
        this.setupUserComp();
        const pinned = this.getParentRowCtrl().getPinned();
        const leafCols = this.columnGroup.getProvidedColumnGroup().getLeafColumns();
        this.createManagedBean(new hoverFeature_1.HoverFeature(leafCols, eGui));
        this.createManagedBean(new setLeftFeature_1.SetLeftFeature(this.columnGroup, eGui, this.beans));
        this.createManagedBean(new groupWidthFeature_1.GroupWidthFeature(comp, this.columnGroup));
        this.groupResizeFeature = this.createManagedBean(new groupResizeFeature_1.GroupResizeFeature(comp, eResize, pinned, this.columnGroup));
        this.createManagedBean(new managedFocusFeature_1.ManagedFocusFeature(eGui, {
            shouldStopEventPropagation: this.shouldStopEventPropagation.bind(this),
            onTabKeyDown: () => undefined,
            handleKeyDown: this.handleKeyDown.bind(this),
            onFocusIn: this.onFocusIn.bind(this)
        }));
    }
    resizeLeafColumnsToFit() {
        this.groupResizeFeature.onResizeStart(false);
        this.groupResizeFeature.resizeLeafColumnsToFit();
    }
    setupUserComp() {
        let displayName = this.displayName;
        const params = {
            displayName: this.displayName,
            columnGroup: this.columnGroup,
            setExpanded: (expanded) => {
                this.columnModel.setColumnGroupOpened(this.columnGroup.getProvidedColumnGroup(), expanded, "gridInitializing");
            },
            api: this.gridApi,
            columnApi: this.columnApi,
            context: this.gridOptionsService.context
        };
        if (!displayName) {
            let columnGroup = this.columnGroup;
            const leafCols = columnGroup.getLeafColumns();
            // find the top most column group that represents the same columns. so if we are dragging a group, we also
            // want to visually show the parent groups dragging for the same column set. for example imaging 5 levels
            // of grouping, with each group only containing the next group, and the last group containing three columns,
            // then when you move any group (even the lowest level group) you are in-fact moving all the groups, as all
            // the groups represent the same column set.
            while (columnGroup.getParent() && columnGroup.getParent().getLeafColumns().length === leafCols.length) {
                columnGroup = columnGroup.getParent();
            }
            const colGroupDef = columnGroup.getColGroupDef();
            if (colGroupDef) {
                displayName = colGroupDef.headerName;
            }
            if (!displayName) {
                displayName = leafCols ? this.columnModel.getDisplayNameForColumn(leafCols[0], 'header', true) : '';
            }
        }
        const compDetails = this.userComponentFactory.getHeaderGroupCompDetails(params);
        this.comp.setUserCompDetails(compDetails);
    }
    setupTooltip() {
        const colGroupDef = this.columnGroup.getColGroupDef();
        const tooltipCtrl = {
            getColumn: () => this.columnGroup,
            getGui: () => this.eGui,
            getLocation: () => 'headerGroup',
            getTooltipValue: () => colGroupDef && colGroupDef.headerTooltip
        };
        if (colGroupDef) {
            tooltipCtrl.getColDef = () => colGroupDef;
        }
        const tooltipFeature = this.createManagedBean(new tooltipFeature_1.TooltipFeature(tooltipCtrl, this.beans));
        tooltipFeature.setComp(this.comp);
    }
    setupExpandable() {
        const providedColGroup = this.columnGroup.getProvidedColumnGroup();
        this.refreshExpanded();
        this.addManagedListener(providedColGroup, providedColumnGroup_1.ProvidedColumnGroup.EVENT_EXPANDABLE_CHANGED, this.refreshExpanded.bind(this));
        this.addManagedListener(providedColGroup, providedColumnGroup_1.ProvidedColumnGroup.EVENT_EXPANDED_CHANGED, this.refreshExpanded.bind(this));
    }
    refreshExpanded() {
        const column = this.columnGroup;
        this.expandable = column.isExpandable();
        const expanded = column.isExpanded();
        if (this.expandable) {
            this.comp.setAriaExpanded(expanded ? 'true' : 'false');
        }
        else {
            this.comp.setAriaExpanded(undefined);
        }
    }
    addAttributes() {
        this.comp.setColId(this.columnGroup.getUniqueId());
    }
    addClasses() {
        const colGroupDef = this.columnGroup.getColGroupDef();
        const classes = cssClassApplier_1.CssClassApplier.getHeaderClassesFromColDef(colGroupDef, this.gridOptionsService, null, this.columnGroup);
        // having different classes below allows the style to not have a bottom border
        // on the group header, if no group is specified
        classes.push(this.columnGroup.isPadding() ? `ag-header-group-cell-no-group` : `ag-header-group-cell-with-group`);
        classes.forEach(c => this.comp.addOrRemoveCssClass(c, true));
    }
    setupMovingCss() {
        const providedColumnGroup = this.columnGroup.getProvidedColumnGroup();
        const leafColumns = providedColumnGroup.getLeafColumns();
        // this function adds or removes the moving css, based on if the col is moving.
        // this is what makes the header go dark when it is been moved (gives impression to
        // user that the column was picked up).
        const listener = () => this.comp.addOrRemoveCssClass('ag-header-cell-moving', this.columnGroup.isMoving());
        leafColumns.forEach(col => {
            this.addManagedListener(col, column_1.Column.EVENT_MOVING_CHANGED, listener);
        });
        listener();
    }
    onFocusIn(e) {
        if (!this.eGui.contains(e.relatedTarget)) {
            const rowIndex = this.getRowIndex();
            this.beans.focusService.setFocusedHeader(rowIndex, this.columnGroup);
        }
    }
    handleKeyDown(e) {
        super.handleKeyDown(e);
        const wrapperHasFocus = this.getWrapperHasFocus();
        if (!this.expandable || !wrapperHasFocus) {
            return;
        }
        if (e.key === keyCode_1.KeyCode.ENTER) {
            const column = this.columnGroup;
            const newExpandedValue = !column.isExpanded();
            this.columnModel.setColumnGroupOpened(column.getProvidedColumnGroup(), newExpandedValue, "uiColumnExpanded");
        }
    }
    // unlike columns, this will only get called once, as we don't react on props on column groups
    // (we will always destroy and recreate this comp if something changes)
    setDragSource(eHeaderGroup) {
        if (this.isSuppressMoving()) {
            return;
        }
        const allLeafColumns = this.columnGroup.getProvidedColumnGroup().getLeafColumns();
        const hideColumnOnExit = !this.gridOptionsService.is('suppressDragLeaveHidesColumns');
        const dragSource = {
            type: dragAndDropService_1.DragSourceType.HeaderCell,
            eElement: eHeaderGroup,
            defaultIconName: hideColumnOnExit ? dragAndDropService_1.DragAndDropService.ICON_HIDE : dragAndDropService_1.DragAndDropService.ICON_NOT_ALLOWED,
            dragItemName: this.displayName,
            // we add in the original group leaf columns, so we move both visible and non-visible items
            getDragItem: this.getDragItemForGroup.bind(this),
            onDragStarted: () => allLeafColumns.forEach(col => col.setMoving(true, "uiColumnDragged")),
            onDragStopped: () => allLeafColumns.forEach(col => col.setMoving(false, "uiColumnDragged")),
            onGridEnter: (dragItem) => {
                var _a;
                if (hideColumnOnExit) {
                    const unlockedColumns = ((_a = dragItem === null || dragItem === void 0 ? void 0 : dragItem.columns) === null || _a === void 0 ? void 0 : _a.filter(col => !col.getColDef().lockVisible)) || [];
                    this.columnModel.setColumnsVisible(unlockedColumns, true, "uiColumnMoved");
                }
            },
            onGridExit: (dragItem) => {
                var _a;
                if (hideColumnOnExit) {
                    const unlockedColumns = ((_a = dragItem === null || dragItem === void 0 ? void 0 : dragItem.columns) === null || _a === void 0 ? void 0 : _a.filter(col => !col.getColDef().lockVisible)) || [];
                    this.columnModel.setColumnsVisible(unlockedColumns, false, "uiColumnMoved");
                }
            },
        };
        this.dragAndDropService.addDragSource(dragSource, true);
        this.addDestroyFunc(() => this.dragAndDropService.removeDragSource(dragSource));
    }
    // when moving the columns, we want to move all the columns (contained within the DragItem) in this group in one go,
    // and in the order they are currently in the screen.
    getDragItemForGroup() {
        const allColumnsOriginalOrder = this.columnGroup.getProvidedColumnGroup().getLeafColumns();
        // capture visible state, used when re-entering grid to dictate which columns should be visible
        const visibleState = {};
        allColumnsOriginalOrder.forEach(column => visibleState[column.getId()] = column.isVisible());
        const allColumnsCurrentOrder = [];
        this.columnModel.getAllDisplayedColumns().forEach(column => {
            if (allColumnsOriginalOrder.indexOf(column) >= 0) {
                allColumnsCurrentOrder.push(column);
                array_1.removeFromArray(allColumnsOriginalOrder, column);
            }
        });
        // we are left with non-visible columns, stick these in at the end
        allColumnsOriginalOrder.forEach(column => allColumnsCurrentOrder.push(column));
        // create and return dragItem
        return {
            columns: allColumnsCurrentOrder,
            visibleState: visibleState
        };
    }
    isSuppressMoving() {
        // if any child is fixed, then don't allow moving
        let childSuppressesMoving = false;
        this.columnGroup.getLeafColumns().forEach((column) => {
            if (column.getColDef().suppressMovable || column.getColDef().lockPosition) {
                childSuppressesMoving = true;
            }
        });
        const result = childSuppressesMoving || this.gridOptionsService.is('suppressMovableColumns');
        return result;
    }
}
__decorate([
    context_1.Autowired('columnModel')
], HeaderGroupCellCtrl.prototype, "columnModel", void 0);
__decorate([
    context_1.Autowired('dragAndDropService')
], HeaderGroupCellCtrl.prototype, "dragAndDropService", void 0);
__decorate([
    context_1.Autowired('gridApi')
], HeaderGroupCellCtrl.prototype, "gridApi", void 0);
__decorate([
    context_1.Autowired('columnApi')
], HeaderGroupCellCtrl.prototype, "columnApi", void 0);
exports.HeaderGroupCellCtrl = HeaderGroupCellCtrl;
