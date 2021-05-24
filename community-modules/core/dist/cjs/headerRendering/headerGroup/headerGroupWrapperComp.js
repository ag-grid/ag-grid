/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v25.3.0
 * @link http://www.ag-grid.com/
 * @license MIT
 */
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
var column_1 = require("../../entities/column");
var columnGroup_1 = require("../../entities/columnGroup");
var constants_1 = require("../../constants/constants");
var context_1 = require("../../context/context");
var cssClassApplier_1 = require("../cssClassApplier");
var dragAndDropService_1 = require("../../dragAndDrop/dragAndDropService");
var setLeftFeature_1 = require("../../rendering/features/setLeftFeature");
var hoverFeature_1 = require("../hoverFeature");
var abstractHeaderWrapper_1 = require("../header/abstractHeaderWrapper");
var originalColumnGroup_1 = require("../../entities/originalColumnGroup");
var aria_1 = require("../../utils/aria");
var array_1 = require("../../utils/array");
var dom_1 = require("../../utils/dom");
var keyCode_1 = require("../../constants/keyCode");
var string_1 = require("../../utils/string");
var HeaderGroupWrapperComp = /** @class */ (function (_super) {
    __extends(HeaderGroupWrapperComp, _super);
    function HeaderGroupWrapperComp(columnGroup, pinned) {
        var _this = _super.call(this, HeaderGroupWrapperComp.TEMPLATE) || this;
        // the children can change, we keep destroy functions related to listening to the children here
        _this.removeChildListenersFuncs = [];
        _this.column = columnGroup;
        _this.pinned = pinned;
        return _this;
    }
    HeaderGroupWrapperComp.prototype.postConstruct = function () {
        _super.prototype.postConstruct.call(this);
        cssClassApplier_1.CssClassApplier.addHeaderClassesFromColDef(this.getComponentHolder(), this.getGui(), this.gridOptionsWrapper, null, this.column);
        var displayName = this.columnController.getDisplayNameForColumnGroup(this.column, 'header');
        this.appendHeaderGroupComp(displayName);
        this.setupResize();
        this.addClasses();
        this.setupWidth();
        this.addAttributes();
        this.setupMovingCss();
        this.setupTooltip();
        this.setupExpandable();
        this.createManagedBean(new hoverFeature_1.HoverFeature(this.column.getOriginalColumnGroup().getLeafColumns(), this.getGui()));
        this.createManagedBean(new setLeftFeature_1.SetLeftFeature(this.column, this.getGui(), this.beans));
    };
    HeaderGroupWrapperComp.prototype.onFocusIn = function (e) {
        if (!this.getGui().contains(e.relatedTarget)) {
            var headerRow = this.getParentComponent();
            this.beans.focusController.setFocusedHeader(headerRow.getRowIndex(), this.getColumn());
        }
    };
    HeaderGroupWrapperComp.prototype.handleKeyDown = function (e) {
        var activeEl = document.activeElement;
        var eGui = this.getGui();
        var wrapperHasFocus = activeEl === eGui;
        if (!this.expandable || !wrapperHasFocus) {
            return;
        }
        if (e.keyCode === keyCode_1.KeyCode.ENTER) {
            var column = this.getColumn();
            var newExpandedValue = !column.isExpanded();
            this.columnController.setColumnGroupOpened(column.getOriginalColumnGroup(), newExpandedValue, "uiColumnExpanded");
        }
    };
    HeaderGroupWrapperComp.prototype.onTabKeyDown = function () { };
    HeaderGroupWrapperComp.prototype.setupExpandable = function () {
        var column = this.getColumn();
        var originalColumnGroup = column.getOriginalColumnGroup();
        this.refreshExpanded();
        this.addManagedListener(originalColumnGroup, originalColumnGroup_1.OriginalColumnGroup.EVENT_EXPANDABLE_CHANGED, this.refreshExpanded.bind(this));
        this.addManagedListener(originalColumnGroup, originalColumnGroup_1.OriginalColumnGroup.EVENT_EXPANDED_CHANGED, this.refreshExpanded.bind(this));
    };
    HeaderGroupWrapperComp.prototype.refreshExpanded = function () {
        var column = this.getColumn();
        var eGui = this.getGui();
        var expandable = column.isExpandable();
        var expanded = column.isExpanded();
        this.expandable = expandable;
        if (!expandable) {
            eGui.removeAttribute('aria-expanded');
        }
        else {
            aria_1.setAriaExpanded(eGui, expanded);
        }
    };
    HeaderGroupWrapperComp.prototype.setupMovingCss = function () {
        var _this = this;
        var originalColumnGroup = this.column.getOriginalColumnGroup();
        var leafColumns = originalColumnGroup.getLeafColumns();
        leafColumns.forEach(function (col) {
            _this.addManagedListener(col, column_1.Column.EVENT_MOVING_CHANGED, _this.onColumnMovingChanged.bind(_this));
        });
        this.onColumnMovingChanged();
    };
    HeaderGroupWrapperComp.prototype.getComponentHolder = function () {
        return this.column.getColGroupDef();
    };
    HeaderGroupWrapperComp.prototype.getTooltipParams = function () {
        var res = _super.prototype.getTooltipParams.call(this);
        res.location = 'headerGroup';
        // this is wrong, but leaving it as i don't want to change code,
        // but the ColumnGroup does not have a ColDef or a Column (although it does have GroupDef and ColumnGroup)
        res.colDef = this.getComponentHolder();
        res.column = this.getColumn();
        return res;
    };
    HeaderGroupWrapperComp.prototype.setupTooltip = function () {
        var colGroupDef = this.getComponentHolder();
        var tooltipText = colGroupDef && colGroupDef.headerTooltip;
        if (tooltipText != null) {
            this.setTooltip(string_1.escapeString(tooltipText));
        }
    };
    HeaderGroupWrapperComp.prototype.onColumnMovingChanged = function () {
        // this function adds or removes the moving css, based on if the col is moving.
        // this is what makes the header go dark when it is been moved (gives impression to
        // user that the column was picked up).
        dom_1.addOrRemoveCssClass(this.getGui(), 'ag-header-cell-moving', this.column.isMoving());
    };
    HeaderGroupWrapperComp.prototype.addAttributes = function () {
        this.getGui().setAttribute("col-id", this.column.getUniqueId());
    };
    HeaderGroupWrapperComp.prototype.appendHeaderGroupComp = function (displayName) {
        var _this = this;
        var params = {
            displayName: displayName,
            columnGroup: this.column,
            setExpanded: function (expanded) {
                _this.columnController.setColumnGroupOpened(_this.column.getOriginalColumnGroup(), expanded, "gridInitializing");
            },
            api: this.gridApi,
            columnApi: this.columnApi,
            context: this.gridOptionsWrapper.getContext()
        };
        if (!displayName) {
            var columnGroup = this.column;
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
                displayName = leafCols ? this.columnController.getDisplayNameForColumn(leafCols[0], 'header', true) : '';
            }
        }
        var callback = this.afterHeaderCompCreated.bind(this, displayName);
        this.userComponentFactory.newHeaderGroupComponent(params).then(callback);
    };
    HeaderGroupWrapperComp.prototype.afterHeaderCompCreated = function (displayName, headerGroupComp) {
        var _this = this;
        this.getGui().appendChild(headerGroupComp.getGui());
        this.addDestroyFunc(function () {
            _this.getContext().destroyBean(headerGroupComp);
        });
        this.setupMove(headerGroupComp.getGui(), displayName);
    };
    HeaderGroupWrapperComp.prototype.addClasses = function () {
        // having different classes below allows the style to not have a bottom border
        // on the group header, if no group is specified
        // columnGroup.getColGroupDef
        var style = this.column.isPadding() ? 'no' : 'with';
        this.addCssClass("ag-header-group-cell-" + style + "-group");
    };
    HeaderGroupWrapperComp.prototype.setupMove = function (eHeaderGroup, displayName) {
        var _this = this;
        if (!eHeaderGroup) {
            return;
        }
        if (this.isSuppressMoving()) {
            return;
        }
        var allLeafColumns = this.column.getOriginalColumnGroup().getLeafColumns();
        var dragSource = {
            type: dragAndDropService_1.DragSourceType.HeaderCell,
            eElement: eHeaderGroup,
            defaultIconName: dragAndDropService_1.DragAndDropService.ICON_HIDE,
            dragItemName: displayName,
            // we add in the original group leaf columns, so we move both visible and non-visible items
            getDragItem: this.getDragItemForGroup.bind(this),
            onDragStarted: function () { return allLeafColumns.forEach(function (col) { return col.setMoving(true, "uiColumnDragged"); }); },
            onDragStopped: function () { return allLeafColumns.forEach(function (col) { return col.setMoving(false, "uiColumnDragged"); }); }
        };
        this.dragAndDropService.addDragSource(dragSource, true);
        this.addDestroyFunc(function () { return _this.dragAndDropService.removeDragSource(dragSource); });
    };
    // when moving the columns, we want to move all the columns (contained within the DragItem) in this group in one go,
    // and in the order they are currently in the screen.
    HeaderGroupWrapperComp.prototype.getDragItemForGroup = function () {
        var allColumnsOriginalOrder = this.column.getOriginalColumnGroup().getLeafColumns();
        // capture visible state, used when re-entering grid to dictate which columns should be visible
        var visibleState = {};
        allColumnsOriginalOrder.forEach(function (column) { return visibleState[column.getId()] = column.isVisible(); });
        var allColumnsCurrentOrder = [];
        this.columnController.getAllDisplayedColumns().forEach(function (column) {
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
    HeaderGroupWrapperComp.prototype.isSuppressMoving = function () {
        // if any child is fixed, then don't allow moving
        var childSuppressesMoving = false;
        this.column.getLeafColumns().forEach(function (column) {
            if (column.getColDef().suppressMovable || column.getColDef().lockPosition) {
                childSuppressesMoving = true;
            }
        });
        var result = childSuppressesMoving || this.gridOptionsWrapper.isSuppressMovableColumns();
        return result;
    };
    HeaderGroupWrapperComp.prototype.setupWidth = function () {
        // we need to listen to changes in child columns, as they impact our width
        this.addListenersToChildrenColumns();
        // the children belonging to this group can change, so we need to add and remove listeners as they change
        this.addManagedListener(this.column, columnGroup_1.ColumnGroup.EVENT_DISPLAYED_CHILDREN_CHANGED, this.onDisplayedChildrenChanged.bind(this));
        this.onWidthChanged();
        // the child listeners are not tied to this components life-cycle, as children can get added and removed
        // to the group - hence they are on a different life-cycle. so we must make sure the existing children
        // listeners are removed when we finally get destroyed
        this.addDestroyFunc(this.removeListenersOnChildrenColumns.bind(this));
    };
    HeaderGroupWrapperComp.prototype.onDisplayedChildrenChanged = function () {
        this.addListenersToChildrenColumns();
        this.onWidthChanged();
    };
    HeaderGroupWrapperComp.prototype.addListenersToChildrenColumns = function () {
        var _this = this;
        // first destroy any old listeners
        this.removeListenersOnChildrenColumns();
        // now add new listeners to the new set of children
        var widthChangedListener = this.onWidthChanged.bind(this);
        this.column.getLeafColumns().forEach(function (column) {
            column.addEventListener(column_1.Column.EVENT_WIDTH_CHANGED, widthChangedListener);
            column.addEventListener(column_1.Column.EVENT_VISIBLE_CHANGED, widthChangedListener);
            _this.removeChildListenersFuncs.push(function () {
                column.removeEventListener(column_1.Column.EVENT_WIDTH_CHANGED, widthChangedListener);
                column.removeEventListener(column_1.Column.EVENT_VISIBLE_CHANGED, widthChangedListener);
            });
        });
    };
    HeaderGroupWrapperComp.prototype.removeListenersOnChildrenColumns = function () {
        this.removeChildListenersFuncs.forEach(function (func) { return func(); });
        this.removeChildListenersFuncs = [];
    };
    HeaderGroupWrapperComp.prototype.onWidthChanged = function () {
        this.getGui().style.width = this.column.getActualWidth() + 'px';
    };
    HeaderGroupWrapperComp.prototype.setupResize = function () {
        var _this = this;
        this.eHeaderCellResize = this.getRefElement('agResize');
        if (!this.column.isResizable()) {
            dom_1.removeFromParent(this.eHeaderCellResize);
            return;
        }
        var finishedWithResizeFunc = this.horizontalResizeService.addResizeBar({
            eResizeBar: this.eHeaderCellResize,
            onResizeStart: this.onResizeStart.bind(this),
            onResizing: this.onResizing.bind(this, false),
            onResizeEnd: this.onResizing.bind(this, true)
        });
        this.addDestroyFunc(finishedWithResizeFunc);
        if (!this.gridOptionsWrapper.isSuppressAutoSize()) {
            var skipHeaderOnAutoSize_1 = this.gridOptionsWrapper.isSkipHeaderOnAutoSize();
            this.eHeaderCellResize.addEventListener('dblclick', function (event) {
                // get list of all the column keys we are responsible for
                var keys = [];
                _this.column.getDisplayedLeafColumns().forEach(function (column) {
                    // not all cols in the group may be participating with auto-resize
                    if (!column.getColDef().suppressAutoSize) {
                        keys.push(column.getColId());
                    }
                });
                if (keys.length > 0) {
                    _this.columnController.autoSizeColumns(keys, skipHeaderOnAutoSize_1, "uiColumnResized");
                }
            });
        }
    };
    HeaderGroupWrapperComp.prototype.onResizeStart = function (shiftKey) {
        var _this = this;
        var leafCols = this.column.getDisplayedLeafColumns();
        this.resizeCols = leafCols.filter(function (col) { return col.isResizable(); });
        this.resizeStartWidth = 0;
        this.resizeCols.forEach(function (col) { return _this.resizeStartWidth += col.getActualWidth(); });
        this.resizeRatios = [];
        this.resizeCols.forEach(function (col) { return _this.resizeRatios.push(col.getActualWidth() / _this.resizeStartWidth); });
        var takeFromGroup = null;
        if (shiftKey) {
            takeFromGroup = this.columnController.getDisplayedGroupAfter(this.column);
        }
        if (takeFromGroup) {
            var takeFromLeafCols = takeFromGroup.getDisplayedLeafColumns();
            this.resizeTakeFromCols = takeFromLeafCols.filter(function (col) { return col.isResizable(); });
            this.resizeTakeFromStartWidth = 0;
            this.resizeTakeFromCols.forEach(function (col) { return _this.resizeTakeFromStartWidth += col.getActualWidth(); });
            this.resizeTakeFromRatios = [];
            this.resizeTakeFromCols.forEach(function (col) { return _this.resizeTakeFromRatios.push(col.getActualWidth() / _this.resizeTakeFromStartWidth); });
        }
        else {
            this.resizeTakeFromCols = null;
            this.resizeTakeFromStartWidth = null;
            this.resizeTakeFromRatios = null;
        }
        dom_1.addCssClass(this.getGui(), 'ag-column-resizing');
    };
    HeaderGroupWrapperComp.prototype.onResizing = function (finished, resizeAmount) {
        var resizeSets = [];
        var resizeAmountNormalised = this.normaliseDragChange(resizeAmount);
        resizeSets.push({
            columns: this.resizeCols,
            ratios: this.resizeRatios,
            width: this.resizeStartWidth + resizeAmountNormalised
        });
        if (this.resizeTakeFromCols) {
            resizeSets.push({
                columns: this.resizeTakeFromCols,
                ratios: this.resizeTakeFromRatios,
                width: this.resizeTakeFromStartWidth - resizeAmountNormalised
            });
        }
        this.columnController.resizeColumnSets(resizeSets, finished, 'uiColumnDragged');
        if (finished) {
            dom_1.removeCssClass(this.getGui(), 'ag-column-resizing');
        }
    };
    // optionally inverts the drag, depending on pinned and RTL
    // note - this method is duplicated in RenderedHeaderCell - should refactor out?
    HeaderGroupWrapperComp.prototype.normaliseDragChange = function (dragChange) {
        var result = dragChange;
        if (this.gridOptionsWrapper.isEnableRtl()) {
            // for RTL, dragging left makes the col bigger, except when pinning left
            if (this.pinned !== constants_1.Constants.PINNED_LEFT) {
                result *= -1;
            }
        }
        else if (this.pinned === constants_1.Constants.PINNED_RIGHT) {
            // for LTR (ie normal), dragging left makes the col smaller, except when pinning right
            result *= -1;
        }
        return result;
    };
    HeaderGroupWrapperComp.TEMPLATE = "<div class=\"ag-header-group-cell\" role=\"columnheader\" tabindex=\"-1\">\n            <div ref=\"agResize\" class=\"ag-header-cell-resize\" role=\"presentation\"></div>\n        </div>";
    __decorate([
        context_1.Autowired('columnController')
    ], HeaderGroupWrapperComp.prototype, "columnController", void 0);
    __decorate([
        context_1.Autowired('horizontalResizeService')
    ], HeaderGroupWrapperComp.prototype, "horizontalResizeService", void 0);
    __decorate([
        context_1.Autowired('dragAndDropService')
    ], HeaderGroupWrapperComp.prototype, "dragAndDropService", void 0);
    __decorate([
        context_1.Autowired('userComponentFactory')
    ], HeaderGroupWrapperComp.prototype, "userComponentFactory", void 0);
    __decorate([
        context_1.Autowired('beans')
    ], HeaderGroupWrapperComp.prototype, "beans", void 0);
    __decorate([
        context_1.Autowired('gridApi')
    ], HeaderGroupWrapperComp.prototype, "gridApi", void 0);
    __decorate([
        context_1.Autowired('columnApi')
    ], HeaderGroupWrapperComp.prototype, "columnApi", void 0);
    return HeaderGroupWrapperComp;
}(abstractHeaderWrapper_1.AbstractHeaderWrapper));
exports.HeaderGroupWrapperComp = HeaderGroupWrapperComp;

//# sourceMappingURL=headerGroupWrapperComp.js.map
