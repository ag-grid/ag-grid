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
const events_1 = require("../../../events");
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
const direction_1 = require("../../../constants/direction");
const columnMoveHelper_1 = require("../../columnMoveHelper");
class HeaderGroupCellCtrl extends abstractHeaderCellCtrl_1.AbstractHeaderCellCtrl {
    constructor(columnGroup, parentRowCtrl) {
        super(columnGroup, parentRowCtrl);
        this.onSuppressColMoveChange = () => {
            if (this.isSuppressMoving()) {
                this.removeDragSource();
            }
            else {
                if (!this.dragSource) {
                    const eGui = this.getGui();
                    this.setDragSource(eGui);
                }
            }
        };
        this.column = columnGroup;
    }
    setComp(comp, eGui, eResize) {
        this.comp = comp;
        this.setGui(eGui);
        this.displayName = this.columnModel.getDisplayNameForColumnGroup(this.column, 'header');
        this.addClasses();
        this.setupMovingCss();
        this.setupExpandable();
        this.setupTooltip();
        this.setupUserComp();
        const pinned = this.getParentRowCtrl().getPinned();
        const leafCols = this.column.getProvidedColumnGroup().getLeafColumns();
        this.createManagedBean(new hoverFeature_1.HoverFeature(leafCols, eGui));
        this.createManagedBean(new setLeftFeature_1.SetLeftFeature(this.column, eGui, this.beans));
        this.createManagedBean(new groupWidthFeature_1.GroupWidthFeature(comp, this.column));
        this.resizeFeature = this.createManagedBean(new groupResizeFeature_1.GroupResizeFeature(comp, eResize, pinned, this.column));
        this.createManagedBean(new managedFocusFeature_1.ManagedFocusFeature(eGui, {
            shouldStopEventPropagation: this.shouldStopEventPropagation.bind(this),
            onTabKeyDown: () => undefined,
            handleKeyDown: this.handleKeyDown.bind(this),
            onFocusIn: this.onFocusIn.bind(this)
        }));
        this.addManagedPropertyListener(events_1.Events.EVENT_SUPPRESS_COLUMN_MOVE_CHANGED, this.onSuppressColMoveChange);
        this.addResizeAndMoveKeyboardListeners();
    }
    resizeHeader(direction, shiftKey) {
        // check to avoid throwing when a component has not been setup yet (React 18)
        if (!this.resizeFeature) {
            return;
        }
        const isLeft = direction === direction_1.HorizontalDirection.Left;
        const diff = (isLeft ? -1 : 1) * this.resizeMultiplier;
        const initialValues = this.resizeFeature.getInitialValues(shiftKey);
        this.resizeFeature.resizeColumns(initialValues, initialValues.resizeStartWidth + diff, 'uiColumnResized', true);
    }
    moveHeader(hDirection) {
        const { eGui, column, columnModel, gridOptionsService, ctrlsService } = this;
        const isRtl = gridOptionsService.get('enableRtl');
        const isLeft = hDirection === direction_1.HorizontalDirection.Left;
        const pinned = this.getPinned();
        const rect = eGui.getBoundingClientRect();
        const left = rect.left;
        const width = rect.width;
        const xPosition = columnMoveHelper_1.ColumnMoveHelper.normaliseX(isLeft !== isRtl ? (left - 20) : (left + width + 20), pinned, true, gridOptionsService, ctrlsService);
        const id = column.getGroupId();
        const headerPosition = this.focusService.getFocusedHeader();
        columnMoveHelper_1.ColumnMoveHelper.attemptMoveColumns({
            allMovingColumns: this.column.getLeafColumns(),
            isFromHeader: true,
            hDirection,
            xPosition,
            pinned,
            fromEnter: false,
            fakeEvent: false,
            gridOptionsService: gridOptionsService,
            columnModel
        });
        const displayedLeafColumns = column.getDisplayedLeafColumns();
        const targetColumn = isLeft ? displayedLeafColumns[0] : (0, array_1.last)(displayedLeafColumns);
        this.ctrlsService.getGridBodyCtrl().getScrollFeature().ensureColumnVisible(targetColumn, 'auto');
        if (!this.isAlive() && headerPosition) {
            this.restoreFocus(id, column, headerPosition);
        }
    }
    restoreFocus(groupId, previousColumnGroup, previousPosition) {
        const leafCols = previousColumnGroup.getLeafColumns();
        if (!leafCols.length) {
            return;
        }
        const parent = leafCols[0].getParent();
        if (!parent) {
            return;
        }
        const newColumnGroup = this.findGroupWidthId(parent, groupId);
        if (newColumnGroup) {
            this.focusService.focusHeaderPosition({
                headerPosition: Object.assign(Object.assign({}, previousPosition), { column: newColumnGroup })
            });
        }
    }
    findGroupWidthId(columnGroup, id) {
        while (columnGroup) {
            if (columnGroup.getGroupId() === id) {
                return columnGroup;
            }
            columnGroup = columnGroup.getParent();
        }
        return null;
    }
    resizeLeafColumnsToFit(source) {
        // check to avoid throwing when a component has not been setup yet (React 18)
        if (!this.resizeFeature) {
            return;
        }
        this.resizeFeature.resizeLeafColumnsToFit(source);
    }
    setupUserComp() {
        const params = {
            displayName: this.displayName,
            columnGroup: this.column,
            setExpanded: (expanded) => {
                this.columnModel.setColumnGroupOpened(this.column.getProvidedColumnGroup(), expanded, "gridInitializing");
            },
            api: this.gridOptionsService.api,
            columnApi: this.gridOptionsService.columnApi,
            context: this.gridOptionsService.context
        };
        const compDetails = this.userComponentFactory.getHeaderGroupCompDetails(params);
        this.comp.setUserCompDetails(compDetails);
    }
    setupTooltip() {
        const colGroupDef = this.column.getColGroupDef();
        const tooltipCtrl = {
            getColumn: () => this.column,
            getGui: () => this.eGui,
            getLocation: () => 'headerGroup',
            getTooltipValue: () => colGroupDef && colGroupDef.headerTooltip
        };
        if (colGroupDef) {
            tooltipCtrl.getColDef = () => colGroupDef;
        }
        const tooltipFeature = this.createManagedBean(new tooltipFeature_1.TooltipFeature(tooltipCtrl, this.beans));
        tooltipFeature.setComp(this.eGui);
    }
    setupExpandable() {
        const providedColGroup = this.column.getProvidedColumnGroup();
        this.refreshExpanded();
        this.addManagedListener(providedColGroup, providedColumnGroup_1.ProvidedColumnGroup.EVENT_EXPANDABLE_CHANGED, this.refreshExpanded.bind(this));
        this.addManagedListener(providedColGroup, providedColumnGroup_1.ProvidedColumnGroup.EVENT_EXPANDED_CHANGED, this.refreshExpanded.bind(this));
    }
    refreshExpanded() {
        const column = this.column;
        this.expandable = column.isExpandable();
        const expanded = column.isExpanded();
        if (this.expandable) {
            this.comp.setAriaExpanded(expanded ? 'true' : 'false');
        }
        else {
            this.comp.setAriaExpanded(undefined);
        }
    }
    getColId() {
        return this.column.getUniqueId();
    }
    addClasses() {
        const colGroupDef = this.column.getColGroupDef();
        const classes = cssClassApplier_1.CssClassApplier.getHeaderClassesFromColDef(colGroupDef, this.gridOptionsService, null, this.column);
        // having different classes below allows the style to not have a bottom border
        // on the group header, if no group is specified
        if (this.column.isPadding()) {
            classes.push('ag-header-group-cell-no-group');
            const leafCols = this.column.getLeafColumns();
            if (leafCols.every(col => col.isSpanHeaderHeight())) {
                classes.push('ag-header-span-height');
            }
        }
        else {
            classes.push('ag-header-group-cell-with-group');
        }
        classes.forEach(c => this.comp.addOrRemoveCssClass(c, true));
    }
    setupMovingCss() {
        const providedColumnGroup = this.column.getProvidedColumnGroup();
        const leafColumns = providedColumnGroup.getLeafColumns();
        // this function adds or removes the moving css, based on if the col is moving.
        // this is what makes the header go dark when it is been moved (gives impression to
        // user that the column was picked up).
        const listener = () => this.comp.addOrRemoveCssClass('ag-header-cell-moving', this.column.isMoving());
        leafColumns.forEach(col => {
            this.addManagedListener(col, column_1.Column.EVENT_MOVING_CHANGED, listener);
        });
        listener();
    }
    onFocusIn(e) {
        if (!this.eGui.contains(e.relatedTarget)) {
            const rowIndex = this.getRowIndex();
            this.beans.focusService.setFocusedHeader(rowIndex, this.column);
        }
    }
    handleKeyDown(e) {
        super.handleKeyDown(e);
        const wrapperHasFocus = this.getWrapperHasFocus();
        if (!this.expandable || !wrapperHasFocus) {
            return;
        }
        if (e.key === keyCode_1.KeyCode.ENTER) {
            const column = this.column;
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
        this.removeDragSource();
        if (!eHeaderGroup) {
            return;
        }
        const { column, columnModel, displayName, gridOptionsService, dragAndDropService } = this;
        const allLeafColumns = column.getProvidedColumnGroup().getLeafColumns();
        let hideColumnOnExit = !gridOptionsService.get('suppressDragLeaveHidesColumns');
        const dragSource = this.dragSource = {
            type: dragAndDropService_1.DragSourceType.HeaderCell,
            eElement: eHeaderGroup,
            getDefaultIconName: () => hideColumnOnExit ? dragAndDropService_1.DragAndDropService.ICON_HIDE : dragAndDropService_1.DragAndDropService.ICON_NOT_ALLOWED,
            dragItemName: displayName,
            // we add in the original group leaf columns, so we move both visible and non-visible items
            getDragItem: () => this.getDragItemForGroup(column),
            onDragStarted: () => {
                hideColumnOnExit = !gridOptionsService.get('suppressDragLeaveHidesColumns');
                allLeafColumns.forEach(col => col.setMoving(true, "uiColumnDragged"));
            },
            onDragStopped: () => allLeafColumns.forEach(col => col.setMoving(false, "uiColumnDragged")),
            onGridEnter: (dragItem) => {
                var _a;
                if (hideColumnOnExit) {
                    const unlockedColumns = ((_a = dragItem === null || dragItem === void 0 ? void 0 : dragItem.columns) === null || _a === void 0 ? void 0 : _a.filter(col => !col.getColDef().lockVisible)) || [];
                    columnModel.setColumnsVisible(unlockedColumns, true, "uiColumnMoved");
                }
            },
            onGridExit: (dragItem) => {
                var _a;
                if (hideColumnOnExit) {
                    const unlockedColumns = ((_a = dragItem === null || dragItem === void 0 ? void 0 : dragItem.columns) === null || _a === void 0 ? void 0 : _a.filter(col => !col.getColDef().lockVisible)) || [];
                    columnModel.setColumnsVisible(unlockedColumns, false, "uiColumnMoved");
                }
            },
        };
        dragAndDropService.addDragSource(dragSource, true);
    }
    // when moving the columns, we want to move all the columns (contained within the DragItem) in this group in one go,
    // and in the order they are currently in the screen.
    getDragItemForGroup(columnGroup) {
        const allColumnsOriginalOrder = columnGroup.getProvidedColumnGroup().getLeafColumns();
        // capture visible state, used when re-entering grid to dictate which columns should be visible
        const visibleState = {};
        allColumnsOriginalOrder.forEach(column => visibleState[column.getId()] = column.isVisible());
        const allColumnsCurrentOrder = [];
        this.columnModel.getAllDisplayedColumns().forEach(column => {
            if (allColumnsOriginalOrder.indexOf(column) >= 0) {
                allColumnsCurrentOrder.push(column);
                (0, array_1.removeFromArray)(allColumnsOriginalOrder, column);
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
        this.column.getLeafColumns().forEach((column) => {
            if (column.getColDef().suppressMovable || column.getColDef().lockPosition) {
                childSuppressesMoving = true;
            }
        });
        const result = childSuppressesMoving || this.gridOptionsService.get('suppressMovableColumns');
        return result;
    }
}
__decorate([
    (0, context_1.Autowired)('columnModel')
], HeaderGroupCellCtrl.prototype, "columnModel", void 0);
exports.HeaderGroupCellCtrl = HeaderGroupCellCtrl;
