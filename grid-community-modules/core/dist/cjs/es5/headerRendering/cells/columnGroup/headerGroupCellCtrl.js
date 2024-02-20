"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.HeaderGroupCellCtrl = void 0;
var keyCode_1 = require("../../../constants/keyCode");
var dragAndDropService_1 = require("../../../dragAndDrop/dragAndDropService");
var column_1 = require("../../../entities/column");
var events_1 = require("../../../events");
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
var direction_1 = require("../../../constants/direction");
var columnMoveHelper_1 = require("../../columnMoveHelper");
var HeaderGroupCellCtrl = /** @class */ (function (_super) {
    __extends(HeaderGroupCellCtrl, _super);
    function HeaderGroupCellCtrl(columnGroup, beans, parentRowCtrl) {
        var _this = _super.call(this, columnGroup, beans, parentRowCtrl) || this;
        _this.onSuppressColMoveChange = function () {
            if (!_this.isAlive() || _this.isSuppressMoving()) {
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
        this.displayName = this.beans.columnModel.getDisplayNameForColumnGroup(this.column, 'header');
        this.addClasses();
        this.setupMovingCss();
        this.setupExpandable();
        this.setupTooltip();
        this.setupUserComp();
        this.addHeaderMouseListeners();
        var pinned = this.getParentRowCtrl().getPinned();
        var leafCols = this.column.getProvidedColumnGroup().getLeafColumns();
        this.createManagedBean(new hoverFeature_1.HoverFeature(leafCols, eGui));
        this.createManagedBean(new setLeftFeature_1.SetLeftFeature(this.column, eGui, this.beans));
        this.createManagedBean(new groupWidthFeature_1.GroupWidthFeature(comp, this.column));
        this.resizeFeature = this.createManagedBean(new groupResizeFeature_1.GroupResizeFeature(comp, eResize, pinned, this.column));
        this.createManagedBean(new managedFocusFeature_1.ManagedFocusFeature(eGui, {
            shouldStopEventPropagation: this.shouldStopEventPropagation.bind(this),
            onTabKeyDown: function () { return undefined; },
            handleKeyDown: this.handleKeyDown.bind(this),
            onFocusIn: this.onFocusIn.bind(this)
        }));
        this.addManagedPropertyListener(events_1.Events.EVENT_SUPPRESS_COLUMN_MOVE_CHANGED, this.onSuppressColMoveChange);
        this.addResizeAndMoveKeyboardListeners();
    };
    HeaderGroupCellCtrl.prototype.resizeHeader = function (delta, shiftKey) {
        // check to avoid throwing when a component has not been setup yet (React 18)
        if (!this.resizeFeature) {
            return;
        }
        var initialValues = this.resizeFeature.getInitialValues(shiftKey);
        this.resizeFeature.resizeColumns(initialValues, initialValues.resizeStartWidth + delta, 'uiColumnResized', true);
    };
    HeaderGroupCellCtrl.prototype.moveHeader = function (hDirection) {
        var _a = this, beans = _a.beans, eGui = _a.eGui, column = _a.column, gridOptionsService = _a.gridOptionsService, ctrlsService = _a.ctrlsService;
        var isRtl = gridOptionsService.get('enableRtl');
        var isLeft = hDirection === direction_1.HorizontalDirection.Left;
        var pinned = this.getPinned();
        var rect = eGui.getBoundingClientRect();
        var left = rect.left;
        var width = rect.width;
        var xPosition = columnMoveHelper_1.ColumnMoveHelper.normaliseX(isLeft !== isRtl ? (left - 20) : (left + width + 20), pinned, true, gridOptionsService, ctrlsService);
        var id = column.getGroupId();
        var headerPosition = this.focusService.getFocusedHeader();
        columnMoveHelper_1.ColumnMoveHelper.attemptMoveColumns({
            allMovingColumns: this.column.getLeafColumns(),
            isFromHeader: true,
            hDirection: hDirection,
            xPosition: xPosition,
            pinned: pinned,
            fromEnter: false,
            fakeEvent: false,
            gridOptionsService: gridOptionsService,
            columnModel: beans.columnModel
        });
        var displayedLeafColumns = column.getDisplayedLeafColumns();
        var targetColumn = isLeft ? displayedLeafColumns[0] : (0, array_1.last)(displayedLeafColumns);
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
        var params = this.gridOptionsService.addGridCommonParams({
            displayName: this.displayName,
            columnGroup: this.column,
            setExpanded: function (expanded) {
                _this.beans.columnModel.setColumnGroupOpened(_this.column.getProvidedColumnGroup(), expanded, "gridInitializing");
            }
        });
        var compDetails = this.userComponentFactory.getHeaderGroupCompDetails(params);
        this.comp.setUserCompDetails(compDetails);
    };
    HeaderGroupCellCtrl.prototype.addHeaderMouseListeners = function () {
        var _this = this;
        var listener = function (e) { return _this.handleMouseOverChange(e.type === 'mouseenter'); };
        var clickListener = function () { return _this.dispatchColumnMouseEvent(events_1.Events.EVENT_COLUMN_HEADER_CLICKED, _this.column.getProvidedColumnGroup()); };
        var contextMenuListener = function (event) { return _this.handleContextMenuMouseEvent(event, undefined, _this.column.getProvidedColumnGroup()); };
        this.addManagedListener(this.getGui(), 'mouseenter', listener);
        this.addManagedListener(this.getGui(), 'mouseleave', listener);
        this.addManagedListener(this.getGui(), 'click', clickListener);
        this.addManagedListener(this.getGui(), 'contextmenu', contextMenuListener);
    };
    HeaderGroupCellCtrl.prototype.handleMouseOverChange = function (isMouseOver) {
        var eventType = isMouseOver ?
            events_1.Events.EVENT_COLUMN_HEADER_MOUSE_OVER :
            events_1.Events.EVENT_COLUMN_HEADER_MOUSE_LEAVE;
        var event = {
            type: eventType,
            column: this.column.getProvidedColumnGroup(),
        };
        this.eventService.dispatchEvent(event);
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
        var tooltipFeature = this.createManagedBean(new tooltipFeature_1.TooltipFeature(tooltipCtrl, this.beans));
        tooltipFeature.setComp(this.eGui);
    };
    HeaderGroupCellCtrl.prototype.setupExpandable = function () {
        var providedColGroup = this.column.getProvidedColumnGroup();
        this.refreshExpanded();
        this.addManagedListener(providedColGroup, providedColumnGroup_1.ProvidedColumnGroup.EVENT_EXPANDABLE_CHANGED, this.refreshExpanded.bind(this));
        this.addManagedListener(providedColGroup, providedColumnGroup_1.ProvidedColumnGroup.EVENT_EXPANDED_CHANGED, this.refreshExpanded.bind(this));
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
        var classes = cssClassApplier_1.CssClassApplier.getHeaderClassesFromColDef(colGroupDef, this.gridOptionsService, null, this.column);
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
            _this.addManagedListener(col, column_1.Column.EVENT_MOVING_CHANGED, listener);
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
        if (e.key === keyCode_1.KeyCode.ENTER) {
            var column = this.column;
            var newExpandedValue = !column.isExpanded();
            this.beans.columnModel.setColumnGroupOpened(column.getProvidedColumnGroup(), newExpandedValue, "uiColumnExpanded");
        }
    };
    // unlike columns, this will only get called once, as we don't react on props on column groups
    // (we will always destroy and recreate this comp if something changes)
    HeaderGroupCellCtrl.prototype.setDragSource = function (eHeaderGroup) {
        var _this = this;
        if (!this.isAlive() || this.isSuppressMoving()) {
            return;
        }
        this.removeDragSource();
        if (!eHeaderGroup) {
            return;
        }
        var _a = this, beans = _a.beans, column = _a.column, displayName = _a.displayName, gridOptionsService = _a.gridOptionsService, dragAndDropService = _a.dragAndDropService;
        var columnModel = beans.columnModel;
        var allLeafColumns = column.getProvidedColumnGroup().getLeafColumns();
        var hideColumnOnExit = !gridOptionsService.get('suppressDragLeaveHidesColumns');
        var dragSource = this.dragSource = {
            type: dragAndDropService_1.DragSourceType.HeaderCell,
            eElement: eHeaderGroup,
            getDefaultIconName: function () { return hideColumnOnExit ? dragAndDropService_1.DragAndDropService.ICON_HIDE : dragAndDropService_1.DragAndDropService.ICON_NOT_ALLOWED; },
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
        this.beans.columnModel.getAllDisplayedColumns().forEach(function (column) {
            if (allColumnsOriginalOrder.indexOf(column) >= 0) {
                allColumnsCurrentOrder.push(column);
                (0, array_1.removeFromArray)(allColumnsOriginalOrder, column);
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
    return HeaderGroupCellCtrl;
}(abstractHeaderCellCtrl_1.AbstractHeaderCellCtrl));
exports.HeaderGroupCellCtrl = HeaderGroupCellCtrl;
