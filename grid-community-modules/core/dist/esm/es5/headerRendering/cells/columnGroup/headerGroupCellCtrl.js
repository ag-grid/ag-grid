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
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
import { Events } from "../../../events";
import { ProvidedColumnGroup } from "../../../entities/providedColumnGroup";
import { SetLeftFeature } from "../../../rendering/features/setLeftFeature";
import { last, removeFromArray } from "../../../utils/array";
import { ManagedFocusFeature } from "../../../widgets/managedFocusFeature";
import { TooltipFeature } from "../../../widgets/tooltipFeature";
import { AbstractHeaderCellCtrl } from "../abstractCell/abstractHeaderCellCtrl";
import { CssClassApplier } from "../cssClassApplier";
import { HoverFeature } from "../hoverFeature";
import { GroupResizeFeature } from "./groupResizeFeature";
import { GroupWidthFeature } from "./groupWidthFeature";
import { HorizontalDirection } from "../../../constants/direction";
import { ColumnMoveHelper } from "../../columnMoveHelper";
var HeaderGroupCellCtrl = /** @class */ (function (_super) {
    __extends(HeaderGroupCellCtrl, _super);
    function HeaderGroupCellCtrl(columnGroup, parentRowCtrl) {
        var _this = _super.call(this, columnGroup, parentRowCtrl) || this;
        _this.onSuppressColMoveChange = function () {
            if (_this.isSuppressMoving()) {
                _this.removeDragSource();
            }
            else {
                if (!_this.dragSource) {
                    var eGui = _this.getGui();
                    _this.setDragSource(eGui);
                }
            }
        };
        _this.column = columnGroup;
        return _this;
    }
    HeaderGroupCellCtrl.prototype.setComp = function (comp, eGui, eResize) {
        this.comp = comp;
        this.setGui(eGui);
        this.displayName = this.columnModel.getDisplayNameForColumnGroup(this.column, 'header');
        this.addClasses();
        this.setupMovingCss();
        this.setupExpandable();
        this.setupTooltip();
        this.setupUserComp();
        var pinned = this.getParentRowCtrl().getPinned();
        var leafCols = this.column.getProvidedColumnGroup().getLeafColumns();
        this.createManagedBean(new HoverFeature(leafCols, eGui));
        this.createManagedBean(new SetLeftFeature(this.column, eGui, this.beans));
        this.createManagedBean(new GroupWidthFeature(comp, this.column));
        this.resizeFeature = this.createManagedBean(new GroupResizeFeature(comp, eResize, pinned, this.column));
        this.createManagedBean(new ManagedFocusFeature(eGui, {
            shouldStopEventPropagation: this.shouldStopEventPropagation.bind(this),
            onTabKeyDown: function () { return undefined; },
            handleKeyDown: this.handleKeyDown.bind(this),
            onFocusIn: this.onFocusIn.bind(this)
        }));
        this.addManagedPropertyListener(Events.EVENT_SUPPRESS_COLUMN_MOVE_CHANGED, this.onSuppressColMoveChange);
        this.addResizeAndMoveKeyboardListeners();
    };
    HeaderGroupCellCtrl.prototype.resizeHeader = function (direction, shiftKey) {
        // check to avoid throwing when a component has not been setup yet (React 18)
        if (!this.resizeFeature) {
            return;
        }
        var isLeft = direction === HorizontalDirection.Left;
        var diff = (isLeft ? -1 : 1) * this.resizeMultiplier;
        var initialValues = this.resizeFeature.getInitialValues(shiftKey);
        this.resizeFeature.resizeColumns(initialValues, initialValues.resizeStartWidth + diff, 'uiColumnResized', true);
    };
    HeaderGroupCellCtrl.prototype.moveHeader = function (hDirection) {
        var _a = this, eGui = _a.eGui, column = _a.column, columnModel = _a.columnModel, gridOptionsService = _a.gridOptionsService, ctrlsService = _a.ctrlsService;
        var isRtl = gridOptionsService.get('enableRtl');
        var isLeft = hDirection === HorizontalDirection.Left;
        var pinned = this.getPinned();
        var rect = eGui.getBoundingClientRect();
        var left = rect.left;
        var width = rect.width;
        var xPosition = ColumnMoveHelper.normaliseX(isLeft !== isRtl ? (left - 20) : (left + width + 20), pinned, true, gridOptionsService, ctrlsService);
        var id = column.getGroupId();
        var headerPosition = this.focusService.getFocusedHeader();
        ColumnMoveHelper.attemptMoveColumns({
            allMovingColumns: this.column.getLeafColumns(),
            isFromHeader: true,
            hDirection: hDirection,
            xPosition: xPosition,
            pinned: pinned,
            fromEnter: false,
            fakeEvent: false,
            gridOptionsService: gridOptionsService,
            columnModel: columnModel
        });
        var displayedLeafColumns = column.getDisplayedLeafColumns();
        var targetColumn = isLeft ? displayedLeafColumns[0] : last(displayedLeafColumns);
        this.ctrlsService.getGridBodyCtrl().getScrollFeature().ensureColumnVisible(targetColumn, 'auto');
        if (!this.isAlive() && headerPosition) {
            this.restoreFocus(id, column, headerPosition);
        }
    };
    HeaderGroupCellCtrl.prototype.restoreFocus = function (groupId, previousColumnGroup, previousPosition) {
        var leafCols = previousColumnGroup.getLeafColumns();
        if (!leafCols.length) {
            return;
        }
        var parent = leafCols[0].getParent();
        if (!parent) {
            return;
        }
        var newColumnGroup = this.findGroupWidthId(parent, groupId);
        if (newColumnGroup) {
            this.focusService.focusHeaderPosition({
                headerPosition: __assign(__assign({}, previousPosition), { column: newColumnGroup })
            });
        }
    };
    HeaderGroupCellCtrl.prototype.findGroupWidthId = function (columnGroup, id) {
        while (columnGroup) {
            if (columnGroup.getGroupId() === id) {
                return columnGroup;
            }
            columnGroup = columnGroup.getParent();
        }
        return null;
    };
    HeaderGroupCellCtrl.prototype.resizeLeafColumnsToFit = function (source) {
        // check to avoid throwing when a component has not been setup yet (React 18)
        if (!this.resizeFeature) {
            return;
        }
        this.resizeFeature.resizeLeafColumnsToFit(source);
    };
    HeaderGroupCellCtrl.prototype.setupUserComp = function () {
        var _this = this;
        var params = {
            displayName: this.displayName,
            columnGroup: this.column,
            setExpanded: function (expanded) {
                _this.columnModel.setColumnGroupOpened(_this.column.getProvidedColumnGroup(), expanded, "gridInitializing");
            },
            api: this.gridOptionsService.api,
            columnApi: this.gridOptionsService.columnApi,
            context: this.gridOptionsService.context
        };
        var compDetails = this.userComponentFactory.getHeaderGroupCompDetails(params);
        this.comp.setUserCompDetails(compDetails);
    };
    HeaderGroupCellCtrl.prototype.setupTooltip = function () {
        var _this = this;
        var colGroupDef = this.column.getColGroupDef();
        var tooltipCtrl = {
            getColumn: function () { return _this.column; },
            getGui: function () { return _this.eGui; },
            getLocation: function () { return 'headerGroup'; },
            getTooltipValue: function () { return colGroupDef && colGroupDef.headerTooltip; }
        };
        if (colGroupDef) {
            tooltipCtrl.getColDef = function () { return colGroupDef; };
        }
        var tooltipFeature = this.createManagedBean(new TooltipFeature(tooltipCtrl, this.beans));
        tooltipFeature.setComp(this.eGui);
    };
    HeaderGroupCellCtrl.prototype.setupExpandable = function () {
        var providedColGroup = this.column.getProvidedColumnGroup();
        this.refreshExpanded();
        this.addManagedListener(providedColGroup, ProvidedColumnGroup.EVENT_EXPANDABLE_CHANGED, this.refreshExpanded.bind(this));
        this.addManagedListener(providedColGroup, ProvidedColumnGroup.EVENT_EXPANDED_CHANGED, this.refreshExpanded.bind(this));
    };
    HeaderGroupCellCtrl.prototype.refreshExpanded = function () {
        var column = this.column;
        this.expandable = column.isExpandable();
        var expanded = column.isExpanded();
        if (this.expandable) {
            this.comp.setAriaExpanded(expanded ? 'true' : 'false');
        }
        else {
            this.comp.setAriaExpanded(undefined);
        }
    };
    HeaderGroupCellCtrl.prototype.getColId = function () {
        return this.column.getUniqueId();
    };
    HeaderGroupCellCtrl.prototype.addClasses = function () {
        var _this = this;
        var colGroupDef = this.column.getColGroupDef();
        var classes = CssClassApplier.getHeaderClassesFromColDef(colGroupDef, this.gridOptionsService, null, this.column);
        // having different classes below allows the style to not have a bottom border
        // on the group header, if no group is specified
        if (this.column.isPadding()) {
            classes.push('ag-header-group-cell-no-group');
            var leafCols = this.column.getLeafColumns();
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
        var providedColumnGroup = this.column.getProvidedColumnGroup();
        var leafColumns = providedColumnGroup.getLeafColumns();
        // this function adds or removes the moving css, based on if the col is moving.
        // this is what makes the header go dark when it is been moved (gives impression to
        // user that the column was picked up).
        var listener = function () { return _this.comp.addOrRemoveCssClass('ag-header-cell-moving', _this.column.isMoving()); };
        leafColumns.forEach(function (col) {
            _this.addManagedListener(col, Column.EVENT_MOVING_CHANGED, listener);
        });
        listener();
    };
    HeaderGroupCellCtrl.prototype.onFocusIn = function (e) {
        if (!this.eGui.contains(e.relatedTarget)) {
            var rowIndex = this.getRowIndex();
            this.beans.focusService.setFocusedHeader(rowIndex, this.column);
        }
    };
    HeaderGroupCellCtrl.prototype.handleKeyDown = function (e) {
        _super.prototype.handleKeyDown.call(this, e);
        var wrapperHasFocus = this.getWrapperHasFocus();
        if (!this.expandable || !wrapperHasFocus) {
            return;
        }
        if (e.key === KeyCode.ENTER) {
            var column = this.column;
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
        this.removeDragSource();
        if (!eHeaderGroup) {
            return;
        }
        var _a = this, column = _a.column, columnModel = _a.columnModel, displayName = _a.displayName, gridOptionsService = _a.gridOptionsService, dragAndDropService = _a.dragAndDropService;
        var allLeafColumns = column.getProvidedColumnGroup().getLeafColumns();
        var hideColumnOnExit = !gridOptionsService.get('suppressDragLeaveHidesColumns');
        var dragSource = this.dragSource = {
            type: DragSourceType.HeaderCell,
            eElement: eHeaderGroup,
            getDefaultIconName: function () { return hideColumnOnExit ? DragAndDropService.ICON_HIDE : DragAndDropService.ICON_NOT_ALLOWED; },
            dragItemName: displayName,
            // we add in the original group leaf columns, so we move both visible and non-visible items
            getDragItem: function () { return _this.getDragItemForGroup(column); },
            onDragStarted: function () {
                hideColumnOnExit = !gridOptionsService.get('suppressDragLeaveHidesColumns');
                allLeafColumns.forEach(function (col) { return col.setMoving(true, "uiColumnDragged"); });
            },
            onDragStopped: function () { return allLeafColumns.forEach(function (col) { return col.setMoving(false, "uiColumnDragged"); }); },
            onGridEnter: function (dragItem) {
                var _a;
                if (hideColumnOnExit) {
                    var unlockedColumns = ((_a = dragItem === null || dragItem === void 0 ? void 0 : dragItem.columns) === null || _a === void 0 ? void 0 : _a.filter(function (col) { return !col.getColDef().lockVisible; })) || [];
                    columnModel.setColumnsVisible(unlockedColumns, true, "uiColumnMoved");
                }
            },
            onGridExit: function (dragItem) {
                var _a;
                if (hideColumnOnExit) {
                    var unlockedColumns = ((_a = dragItem === null || dragItem === void 0 ? void 0 : dragItem.columns) === null || _a === void 0 ? void 0 : _a.filter(function (col) { return !col.getColDef().lockVisible; })) || [];
                    columnModel.setColumnsVisible(unlockedColumns, false, "uiColumnMoved");
                }
            },
        };
        dragAndDropService.addDragSource(dragSource, true);
    };
    // when moving the columns, we want to move all the columns (contained within the DragItem) in this group in one go,
    // and in the order they are currently in the screen.
    HeaderGroupCellCtrl.prototype.getDragItemForGroup = function (columnGroup) {
        var allColumnsOriginalOrder = columnGroup.getProvidedColumnGroup().getLeafColumns();
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
        this.column.getLeafColumns().forEach(function (column) {
            if (column.getColDef().suppressMovable || column.getColDef().lockPosition) {
                childSuppressesMoving = true;
            }
        });
        var result = childSuppressesMoving || this.gridOptionsService.get('suppressMovableColumns');
        return result;
    };
    __decorate([
        Autowired('columnModel')
    ], HeaderGroupCellCtrl.prototype, "columnModel", void 0);
    return HeaderGroupCellCtrl;
}(AbstractHeaderCellCtrl));
export { HeaderGroupCellCtrl };
