/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v28.2.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
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
import { KeyCode } from '../../../constants/keyCode';
import { Autowired } from "../../../context/context";
import { DragAndDropService, DragSourceType } from "../../../dragAndDrop/dragAndDropService";
import { Column } from "../../../entities/column";
import { ProvidedColumnGroup } from "../../../entities/providedColumnGroup";
import { SetLeftFeature } from "../../../rendering/features/setLeftFeature";
import { removeFromArray } from "../../../utils/array";
import { ManagedFocusFeature } from "../../../widgets/managedFocusFeature";
import { TooltipFeature } from "../../../widgets/tooltipFeature";
import { AbstractHeaderCellCtrl } from "../abstractCell/abstractHeaderCellCtrl";
import { CssClassApplier } from "../cssClassApplier";
import { HoverFeature } from "../hoverFeature";
import { GroupResizeFeature } from "./groupResizeFeature";
import { GroupWidthFeature } from "./groupWidthFeature";
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
        this.createManagedBean(new HoverFeature(leafCols, eGui));
        this.createManagedBean(new SetLeftFeature(this.columnGroup, eGui, this.beans));
        this.createManagedBean(new GroupWidthFeature(comp, this.columnGroup));
        this.groupResizeFeature = this.createManagedBean(new GroupResizeFeature(comp, eResize, pinned, this.columnGroup));
        this.createManagedBean(new ManagedFocusFeature(eGui, {
            shouldStopEventPropagation: this.shouldStopEventPropagation.bind(this),
            onTabKeyDown: function () { return undefined; },
            handleKeyDown: this.handleKeyDown.bind(this),
            onFocusIn: this.onFocusIn.bind(this)
        }));
    };
    HeaderGroupCellCtrl.prototype.resizeLeafColumnsToFit = function () {
        this.groupResizeFeature.onResizeStart(false);
        this.groupResizeFeature.resizeLeafColumnsToFit();
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
            context: this.gridOptionsWrapper.getContext()
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
        var tooltipFeature = this.createManagedBean(new TooltipFeature(tooltipCtrl, this.beans));
        tooltipFeature.setComp(this.comp);
    };
    HeaderGroupCellCtrl.prototype.setupExpandable = function () {
        var providedColGroup = this.columnGroup.getProvidedColumnGroup();
        this.refreshExpanded();
        this.addManagedListener(providedColGroup, ProvidedColumnGroup.EVENT_EXPANDABLE_CHANGED, this.refreshExpanded.bind(this));
        this.addManagedListener(providedColGroup, ProvidedColumnGroup.EVENT_EXPANDED_CHANGED, this.refreshExpanded.bind(this));
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
        var classes = CssClassApplier.getHeaderClassesFromColDef(colGroupDef, this.gridOptionsWrapper, null, this.columnGroup);
        // having different classes below allows the style to not have a bottom border
        // on the group header, if no group is specified
        classes.push(this.columnGroup.isPadding() ? "ag-header-group-cell-no-group" : "ag-header-group-cell-with-group");
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
            _this.addManagedListener(col, Column.EVENT_MOVING_CHANGED, listener);
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
        if (e.key === KeyCode.ENTER) {
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
        var hideColumnOnExit = !this.gridOptionsWrapper.isSuppressDragLeaveHidesColumns();
        var dragSource = {
            type: DragSourceType.HeaderCell,
            eElement: eHeaderGroup,
            defaultIconName: hideColumnOnExit ? DragAndDropService.ICON_HIDE : DragAndDropService.ICON_NOT_ALLOWED,
            dragItemName: this.displayName,
            // we add in the original group leaf columns, so we move both visible and non-visible items
            getDragItem: this.getDragItemForGroup.bind(this),
            onDragStarted: function () { return allLeafColumns.forEach(function (col) { return col.setMoving(true, "uiColumnDragged"); }); },
            onDragStopped: function () { return allLeafColumns.forEach(function (col) { return col.setMoving(false, "uiColumnDragged"); }); },
            onGridEnter: function (dragItem) {
                var _a, _b;
                if (hideColumnOnExit) {
                    var unlockedColumns = ((_b = (_a = dragItem) === null || _a === void 0 ? void 0 : _a.columns) === null || _b === void 0 ? void 0 : _b.filter(function (col) { return !col.getColDef().lockVisible; })) || [];
                    _this.columnModel.setColumnsVisible(unlockedColumns, true, "uiColumnMoved");
                }
            },
            onGridExit: function (dragItem) {
                var _a, _b;
                if (hideColumnOnExit) {
                    var unlockedColumns = ((_b = (_a = dragItem) === null || _a === void 0 ? void 0 : _a.columns) === null || _b === void 0 ? void 0 : _b.filter(function (col) { return !col.getColDef().lockVisible; })) || [];
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
                removeFromArray(allColumnsOriginalOrder, column);
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
        var result = childSuppressesMoving || this.gridOptionsWrapper.isSuppressMovableColumns();
        return result;
    };
    __decorate([
        Autowired('columnModel')
    ], HeaderGroupCellCtrl.prototype, "columnModel", void 0);
    __decorate([
        Autowired('dragAndDropService')
    ], HeaderGroupCellCtrl.prototype, "dragAndDropService", void 0);
    __decorate([
        Autowired('gridApi')
    ], HeaderGroupCellCtrl.prototype, "gridApi", void 0);
    __decorate([
        Autowired('columnApi')
    ], HeaderGroupCellCtrl.prototype, "columnApi", void 0);
    return HeaderGroupCellCtrl;
}(AbstractHeaderCellCtrl));
export { HeaderGroupCellCtrl };
