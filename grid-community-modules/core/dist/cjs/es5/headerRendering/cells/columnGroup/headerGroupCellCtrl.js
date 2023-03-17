/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.2.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
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
exports.HeaderGroupCellCtrl = void 0;
var keyCode_1 = require("../../../constants/keyCode");
var context_1 = require("../../../context/context");
var dragAndDropService_1 = require("../../../dragAndDrop/dragAndDropService");
var column_1 = require("../../../entities/column");
var providedColumnGroup_1 = require("../../../entities/providedColumnGroup");
var setLeftFeature_1 = require("../../../rendering/features/setLeftFeature");
var array_1 = require("../../../utils/array");
var managedFocusFeature_1 = require("../../../widgets/managedFocusFeature");
var tooltipFeature_1 = require("../../../widgets/tooltipFeature");
var abstractHeaderCellCtrl_1 = require("../abstractCell/abstractHeaderCellCtrl");
var cssClassApplier_1 = require("../cssClassApplier");
var hoverFeature_1 = require("../hoverFeature");
var groupResizeFeature_1 = require("./groupResizeFeature");
var groupWidthFeature_1 = require("./groupWidthFeature");
var HeaderGroupCellCtrl = /** @class */ (function (_super) {
    __extends(HeaderGroupCellCtrl, _super);
    function HeaderGroupCellCtrl(columnGroup, parentRowCtrl) {
        var _this = _super.call(this, columnGroup, parentRowCtrl) || this;
        _this.columnGroup = columnGroup;
        return _this;
    }
    HeaderGroupCellCtrl.prototype.setComp = function (comp, eGui, eResize) {
        _super.prototype.setGui.call(this, eGui);
        this.comp = comp;
        this.displayName = this.columnModel.getDisplayNameForColumnGroup(this.columnGroup, 'header');
        this.addClasses();
        this.addAttributes();
        this.setupMovingCss();
        this.setupExpandable();
        this.setupTooltip();
        this.setupUserComp();
        var pinned = this.getParentRowCtrl().getPinned();
        var leafCols = this.columnGroup.getProvidedColumnGroup().getLeafColumns();
        this.createManagedBean(new hoverFeature_1.HoverFeature(leafCols, eGui));
        this.createManagedBean(new setLeftFeature_1.SetLeftFeature(this.columnGroup, eGui, this.beans));
        this.createManagedBean(new groupWidthFeature_1.GroupWidthFeature(comp, this.columnGroup));
        this.groupResizeFeature = this.createManagedBean(new groupResizeFeature_1.GroupResizeFeature(comp, eResize, pinned, this.columnGroup));
        this.createManagedBean(new managedFocusFeature_1.ManagedFocusFeature(eGui, {
            shouldStopEventPropagation: this.shouldStopEventPropagation.bind(this),
            onTabKeyDown: function () { return undefined; },
            handleKeyDown: this.handleKeyDown.bind(this),
            onFocusIn: this.onFocusIn.bind(this)
        }));
    };
    HeaderGroupCellCtrl.prototype.resizeLeafColumnsToFit = function () {
        var _a, _b;
        // AG-8205 Temp null check to avoid throwing when a component has not been setup yet (React 18)
        (_a = this.groupResizeFeature) === null || _a === void 0 ? void 0 : _a.onResizeStart(false);
        (_b = this.groupResizeFeature) === null || _b === void 0 ? void 0 : _b.resizeLeafColumnsToFit();
    };
    HeaderGroupCellCtrl.prototype.setupUserComp = function () {
        var _this = this;
        var displayName = this.displayName;
        var params = {
            displayName: this.displayName,
            columnGroup: this.columnGroup,
            setExpanded: function (expanded) {
                _this.columnModel.setColumnGroupOpened(_this.columnGroup.getProvidedColumnGroup(), expanded, "gridInitializing");
            },
            api: this.gridApi,
            columnApi: this.columnApi,
            context: this.gridOptionsService.context
        };
        if (!displayName) {
            var columnGroup = this.columnGroup;
            var leafCols = columnGroup.getLeafColumns();
            // find the top most column group that represents the same columns. so if we are dragging a group, we also
            // want to visually show the parent groups dragging for the same column set. for example imaging 5 levels
            // of grouping, with each group only containing the next group, and the last group containing three columns,
            // then when you move any group (even the lowest level group) you are in-fact moving all the groups, as all
            // the groups represent the same column set.
            while (columnGroup.getParent() && columnGroup.getParent().getLeafColumns().length === leafCols.length) {
                columnGroup = columnGroup.getParent();
            }
            var colGroupDef = columnGroup.getColGroupDef();
            if (colGroupDef) {
                displayName = colGroupDef.headerName;
            }
            if (!displayName) {
                displayName = leafCols ? this.columnModel.getDisplayNameForColumn(leafCols[0], 'header', true) : '';
            }
        }
        var compDetails = this.userComponentFactory.getHeaderGroupCompDetails(params);
        this.comp.setUserCompDetails(compDetails);
    };
    HeaderGroupCellCtrl.prototype.setupTooltip = function () {
        var _this = this;
        var colGroupDef = this.columnGroup.getColGroupDef();
        var tooltipCtrl = {
            getColumn: function () { return _this.columnGroup; },
            getGui: function () { return _this.eGui; },
            getLocation: function () { return 'headerGroup'; },
            getTooltipValue: function () { return colGroupDef && colGroupDef.headerTooltip; }
        };
        if (colGroupDef) {
            tooltipCtrl.getColDef = function () { return colGroupDef; };
        }
        var tooltipFeature = this.createManagedBean(new tooltipFeature_1.TooltipFeature(tooltipCtrl, this.beans));
        tooltipFeature.setComp(this.comp);
    };
    HeaderGroupCellCtrl.prototype.setupExpandable = function () {
        var providedColGroup = this.columnGroup.getProvidedColumnGroup();
        this.refreshExpanded();
        this.addManagedListener(providedColGroup, providedColumnGroup_1.ProvidedColumnGroup.EVENT_EXPANDABLE_CHANGED, this.refreshExpanded.bind(this));
        this.addManagedListener(providedColGroup, providedColumnGroup_1.ProvidedColumnGroup.EVENT_EXPANDED_CHANGED, this.refreshExpanded.bind(this));
    };
    HeaderGroupCellCtrl.prototype.refreshExpanded = function () {
        var column = this.columnGroup;
        this.expandable = column.isExpandable();
        var expanded = column.isExpanded();
        if (this.expandable) {
            this.comp.setAriaExpanded(expanded ? 'true' : 'false');
        }
        else {
            this.comp.setAriaExpanded(undefined);
        }
    };
    HeaderGroupCellCtrl.prototype.addAttributes = function () {
        this.comp.setColId(this.columnGroup.getUniqueId());
    };
    HeaderGroupCellCtrl.prototype.addClasses = function () {
        var _this = this;
        var colGroupDef = this.columnGroup.getColGroupDef();
        var classes = cssClassApplier_1.CssClassApplier.getHeaderClassesFromColDef(colGroupDef, this.gridOptionsService, null, this.columnGroup);
        // having different classes below allows the style to not have a bottom border
        // on the group header, if no group is specified
        if (this.columnGroup.isPadding()) {
            classes.push('ag-header-group-cell-no-group');
            var leafCols = this.columnGroup.getLeafColumns();
            if (leafCols.every(function (col) { return col.isSpanHeaderHeight(); })) {
                classes.push('ag-header-span-height');
            }
        }
        else {
            classes.push('ag-header-group-cell-with-group');
        }
        classes.forEach(function (c) { return _this.comp.addOrRemoveCssClass(c, true); });
    };
    HeaderGroupCellCtrl.prototype.setupMovingCss = function () {
        var _this = this;
        var providedColumnGroup = this.columnGroup.getProvidedColumnGroup();
        var leafColumns = providedColumnGroup.getLeafColumns();
        // this function adds or removes the moving css, based on if the col is moving.
        // this is what makes the header go dark when it is been moved (gives impression to
        // user that the column was picked up).
        var listener = function () { return _this.comp.addOrRemoveCssClass('ag-header-cell-moving', _this.columnGroup.isMoving()); };
        leafColumns.forEach(function (col) {
            _this.addManagedListener(col, column_1.Column.EVENT_MOVING_CHANGED, listener);
        });
        listener();
    };
    HeaderGroupCellCtrl.prototype.onFocusIn = function (e) {
        if (!this.eGui.contains(e.relatedTarget)) {
            var rowIndex = this.getRowIndex();
            this.beans.focusService.setFocusedHeader(rowIndex, this.columnGroup);
        }
    };
    HeaderGroupCellCtrl.prototype.handleKeyDown = function (e) {
        _super.prototype.handleKeyDown.call(this, e);
        var wrapperHasFocus = this.getWrapperHasFocus();
        if (!this.expandable || !wrapperHasFocus) {
            return;
        }
        if (e.key === keyCode_1.KeyCode.ENTER) {
            var column = this.columnGroup;
            var newExpandedValue = !column.isExpanded();
            this.columnModel.setColumnGroupOpened(column.getProvidedColumnGroup(), newExpandedValue, "uiColumnExpanded");
        }
    };
    // unlike columns, this will only get called once, as we don't react on props on column groups
    // (we will always destroy and recreate this comp if something changes)
    HeaderGroupCellCtrl.prototype.setDragSource = function (eHeaderGroup) {
        var _this = this;
        if (this.isSuppressMoving()) {
            return;
        }
        var allLeafColumns = this.columnGroup.getProvidedColumnGroup().getLeafColumns();
        var hideColumnOnExit = !this.gridOptionsService.is('suppressDragLeaveHidesColumns');
        var dragSource = {
            type: dragAndDropService_1.DragSourceType.HeaderCell,
            eElement: eHeaderGroup,
            defaultIconName: hideColumnOnExit ? dragAndDropService_1.DragAndDropService.ICON_HIDE : dragAndDropService_1.DragAndDropService.ICON_NOT_ALLOWED,
            dragItemName: this.displayName,
            // we add in the original group leaf columns, so we move both visible and non-visible items
            getDragItem: this.getDragItemForGroup.bind(this),
            onDragStarted: function () { return allLeafColumns.forEach(function (col) { return col.setMoving(true, "uiColumnDragged"); }); },
            onDragStopped: function () { return allLeafColumns.forEach(function (col) { return col.setMoving(false, "uiColumnDragged"); }); },
            onGridEnter: function (dragItem) {
                var _a;
                if (hideColumnOnExit) {
                    var unlockedColumns = ((_a = dragItem === null || dragItem === void 0 ? void 0 : dragItem.columns) === null || _a === void 0 ? void 0 : _a.filter(function (col) { return !col.getColDef().lockVisible; })) || [];
                    _this.columnModel.setColumnsVisible(unlockedColumns, true, "uiColumnMoved");
                }
            },
            onGridExit: function (dragItem) {
                var _a;
                if (hideColumnOnExit) {
                    var unlockedColumns = ((_a = dragItem === null || dragItem === void 0 ? void 0 : dragItem.columns) === null || _a === void 0 ? void 0 : _a.filter(function (col) { return !col.getColDef().lockVisible; })) || [];
                    _this.columnModel.setColumnsVisible(unlockedColumns, false, "uiColumnMoved");
                }
            },
        };
        this.dragAndDropService.addDragSource(dragSource, true);
        this.addDestroyFunc(function () { return _this.dragAndDropService.removeDragSource(dragSource); });
    };
    // when moving the columns, we want to move all the columns (contained within the DragItem) in this group in one go,
    // and in the order they are currently in the screen.
    HeaderGroupCellCtrl.prototype.getDragItemForGroup = function () {
        var allColumnsOriginalOrder = this.columnGroup.getProvidedColumnGroup().getLeafColumns();
        // capture visible state, used when re-entering grid to dictate which columns should be visible
        var visibleState = {};
        allColumnsOriginalOrder.forEach(function (column) { return visibleState[column.getId()] = column.isVisible(); });
        var allColumnsCurrentOrder = [];
        this.columnModel.getAllDisplayedColumns().forEach(function (column) {
            if (allColumnsOriginalOrder.indexOf(column) >= 0) {
                allColumnsCurrentOrder.push(column);
                array_1.removeFromArray(allColumnsOriginalOrder, column);
            }
        });
        // we are left with non-visible columns, stick these in at the end
        allColumnsOriginalOrder.forEach(function (column) { return allColumnsCurrentOrder.push(column); });
        // create and return dragItem
        return {
            columns: allColumnsCurrentOrder,
            visibleState: visibleState
        };
    };
    HeaderGroupCellCtrl.prototype.isSuppressMoving = function () {
        // if any child is fixed, then don't allow moving
        var childSuppressesMoving = false;
        this.columnGroup.getLeafColumns().forEach(function (column) {
            if (column.getColDef().suppressMovable || column.getColDef().lockPosition) {
                childSuppressesMoving = true;
            }
        });
        var result = childSuppressesMoving || this.gridOptionsService.is('suppressMovableColumns');
        return result;
    };
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
    return HeaderGroupCellCtrl;
}(abstractHeaderCellCtrl_1.AbstractHeaderCellCtrl));
exports.HeaderGroupCellCtrl = HeaderGroupCellCtrl;
