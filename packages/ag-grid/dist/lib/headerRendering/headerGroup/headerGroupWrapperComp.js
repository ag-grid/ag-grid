/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v18.1.2
 * @link http://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var component_1 = require("../../widgets/component");
var column_1 = require("../../entities/column");
var utils_1 = require("../../utils");
var columnGroup_1 = require("../../entities/columnGroup");
var columnApi_1 = require("../../columnController/columnApi");
var columnController_1 = require("../../columnController/columnController");
var gridOptionsWrapper_1 = require("../../gridOptionsWrapper");
var horizontalResizeService_1 = require("../horizontalResizeService");
var context_1 = require("../../context/context");
var cssClassApplier_1 = require("../cssClassApplier");
var dragAndDropService_1 = require("../../dragAndDrop/dragAndDropService");
var setLeftFeature_1 = require("../../rendering/features/setLeftFeature");
var gridApi_1 = require("../../gridApi");
var componentRecipes_1 = require("../../components/framework/componentRecipes");
var beans_1 = require("../../rendering/beans");
var hoverFeature_1 = require("../hoverFeature");
var HeaderGroupWrapperComp = (function (_super) {
    __extends(HeaderGroupWrapperComp, _super);
    function HeaderGroupWrapperComp(columnGroup, dragSourceDropTarget, pinned) {
        var _this = _super.call(this, HeaderGroupWrapperComp.TEMPLATE) || this;
        // the children can change, we keep destroy functions related to listening to the children here
        _this.childColumnsDestroyFuncs = [];
        _this.columnGroup = columnGroup;
        _this.dragSourceDropTarget = dragSourceDropTarget;
        _this.pinned = pinned;
        return _this;
    }
    HeaderGroupWrapperComp.prototype.postConstruct = function () {
        cssClassApplier_1.CssClassApplier.addHeaderClassesFromColDef(this.columnGroup.getColGroupDef(), this.getGui(), this.gridOptionsWrapper, null, this.columnGroup);
        var displayName = this.columnController.getDisplayNameForColumnGroup(this.columnGroup, 'header');
        this.appendHeaderGroupComp(displayName);
        this.setupResize();
        this.addClasses();
        this.setupWidth();
        this.addAttributes();
        this.setupMovingCss();
        this.setupTooltip();
        this.addFeature(this.context, new hoverFeature_1.HoverFeature(this.columnGroup.getOriginalColumnGroup().getLeafColumns(), this.getGui()));
        var setLeftFeature = new setLeftFeature_1.SetLeftFeature(this.columnGroup, this.getGui(), this.beans);
        setLeftFeature.init();
        this.addDestroyFunc(setLeftFeature.destroy.bind(setLeftFeature));
    };
    HeaderGroupWrapperComp.prototype.setupMovingCss = function () {
        var _this = this;
        var originalColumnGroup = this.columnGroup.getOriginalColumnGroup();
        var leafColumns = originalColumnGroup.getLeafColumns();
        leafColumns.forEach(function (col) {
            _this.addDestroyableEventListener(col, column_1.Column.EVENT_MOVING_CHANGED, _this.onColumnMovingChanged.bind(_this));
        });
        this.onColumnMovingChanged();
    };
    HeaderGroupWrapperComp.prototype.setupTooltip = function () {
        var colGroupDef = this.columnGroup.getColGroupDef();
        // add tooltip if exists
        if (colGroupDef && colGroupDef.headerTooltip) {
            this.getGui().title = colGroupDef.headerTooltip;
        }
    };
    HeaderGroupWrapperComp.prototype.onColumnMovingChanged = function () {
        // this function adds or removes the moving css, based on if the col is moving.
        // this is what makes the header go dark when it is been moved (gives impression to
        // user that the column was picked up).
        if (this.columnGroup.isMoving()) {
            utils_1.Utils.addCssClass(this.getGui(), 'ag-header-cell-moving');
        }
        else {
            utils_1.Utils.removeCssClass(this.getGui(), 'ag-header-cell-moving');
        }
    };
    HeaderGroupWrapperComp.prototype.addAttributes = function () {
        this.getGui().setAttribute("col-id", this.columnGroup.getUniqueId());
    };
    HeaderGroupWrapperComp.prototype.appendHeaderGroupComp = function (displayName) {
        var _this = this;
        var params = {
            displayName: displayName,
            columnGroup: this.columnGroup,
            setExpanded: function (expanded) {
                _this.columnController.setColumnGroupOpened(_this.columnGroup.getOriginalColumnGroup(), expanded, "gridInitializing");
            },
            api: this.gridApi,
            columnApi: this.columnApi,
            context: this.gridOptionsWrapper.getContext()
        };
        if (!displayName) {
            var leafCols = this.columnGroup.getLeafColumns();
            displayName = leafCols ? leafCols[0].getColDef().headerName : '';
        }
        var callback = this.afterHeaderCompCreated.bind(this, displayName);
        this.componentRecipes.newHeaderGroupComponent(params).then(callback);
    };
    HeaderGroupWrapperComp.prototype.afterHeaderCompCreated = function (displayName, headerGroupComp) {
        this.appendChild(headerGroupComp);
        this.setupMove(headerGroupComp.getGui(), displayName);
        if (headerGroupComp.destroy) {
            this.addDestroyFunc(headerGroupComp.destroy.bind(headerGroupComp));
        }
    };
    HeaderGroupWrapperComp.prototype.addClasses = function () {
        // having different classes below allows the style to not have a bottom border
        // on the group header, if no group is specified
        // columnGroup.getColGroupDef
        if (this.columnGroup.isPadding()) {
            this.addCssClass('ag-header-group-cell-no-group');
        }
        else {
            this.addCssClass('ag-header-group-cell-with-group');
        }
    };
    HeaderGroupWrapperComp.prototype.setupMove = function (eHeaderGroup, displayName) {
        var _this = this;
        if (!eHeaderGroup) {
            return;
        }
        if (this.isSuppressMoving()) {
            return;
        }
        var allLeafColumns = this.columnGroup.getOriginalColumnGroup().getLeafColumns();
        if (eHeaderGroup) {
            var dragSource_1 = {
                type: dragAndDropService_1.DragSourceType.HeaderCell,
                eElement: eHeaderGroup,
                dragItemName: displayName,
                // we add in the original group leaf columns, so we move both visible and non-visible items
                dragItemCallback: this.getDragItemForGroup.bind(this),
                dragSourceDropTarget: this.dragSourceDropTarget,
                dragStarted: function () { return allLeafColumns.forEach(function (col) { return col.setMoving(true, "uiColumnDragged"); }); },
                dragStopped: function () { return allLeafColumns.forEach(function (col) { return col.setMoving(false, "uiColumnDragged"); }); }
            };
            this.dragAndDropService.addDragSource(dragSource_1, true);
            this.addDestroyFunc(function () { return _this.dragAndDropService.removeDragSource(dragSource_1); });
        }
    };
    // when moving the columns, we want to move all the columns (contained within the DragItem) in this group in one go,
    // and in the order they are currently in the screen.
    HeaderGroupWrapperComp.prototype.getDragItemForGroup = function () {
        var allColumnsOriginalOrder = this.columnGroup.getOriginalColumnGroup().getLeafColumns();
        // capture visible state, used when reentering grid to dictate which columns should be visible
        var visibleState = {};
        allColumnsOriginalOrder.forEach(function (column) { return visibleState[column.getId()] = column.isVisible(); });
        var allColumnsCurrentOrder = [];
        this.columnController.getAllDisplayedColumns().forEach(function (column) {
            if (allColumnsOriginalOrder.indexOf(column) >= 0) {
                allColumnsCurrentOrder.push(column);
                utils_1.Utils.removeFromArray(allColumnsOriginalOrder, column);
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
        this.columnGroup.getLeafColumns().forEach(function (column) {
            if (column.getColDef().suppressMovable || column.isLockPosition()) {
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
        this.addDestroyableEventListener(this.columnGroup, columnGroup_1.ColumnGroup.EVENT_DISPLAYED_CHILDREN_CHANGED, this.onDisplayedChildrenChanged.bind(this));
        this.onWidthChanged();
        // the child listeners are not tied to this components lifecycle, as children can get added and removed
        // to the group - hence they are on a different lifecycle. so we must make sure the existing children
        // listeners are removed when we finally get destroyed
        this.addDestroyFunc(this.destroyListenersOnChildrenColumns.bind(this));
    };
    HeaderGroupWrapperComp.prototype.onDisplayedChildrenChanged = function () {
        this.addListenersToChildrenColumns();
        this.onWidthChanged();
    };
    HeaderGroupWrapperComp.prototype.addListenersToChildrenColumns = function () {
        var _this = this;
        // first destroy any old listeners
        this.destroyListenersOnChildrenColumns();
        // now add new listeners to the new set of children
        var widthChangedListener = this.onWidthChanged.bind(this);
        this.columnGroup.getLeafColumns().forEach(function (column) {
            column.addEventListener(column_1.Column.EVENT_WIDTH_CHANGED, widthChangedListener);
            column.addEventListener(column_1.Column.EVENT_VISIBLE_CHANGED, widthChangedListener);
            _this.childColumnsDestroyFuncs.push(function () {
                column.removeEventListener(column_1.Column.EVENT_WIDTH_CHANGED, widthChangedListener);
                column.removeEventListener(column_1.Column.EVENT_VISIBLE_CHANGED, widthChangedListener);
            });
        });
    };
    HeaderGroupWrapperComp.prototype.destroyListenersOnChildrenColumns = function () {
        this.childColumnsDestroyFuncs.forEach(function (func) { return func(); });
        this.childColumnsDestroyFuncs = [];
    };
    HeaderGroupWrapperComp.prototype.onWidthChanged = function () {
        this.getGui().style.width = this.columnGroup.getActualWidth() + 'px';
    };
    HeaderGroupWrapperComp.prototype.setupResize = function () {
        var _this = this;
        this.eHeaderCellResize = this.getRefElement('agResize');
        if (!this.columnGroup.isResizable()) {
            utils_1.Utils.removeFromParent(this.eHeaderCellResize);
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
            this.eHeaderCellResize.addEventListener('dblclick', function (event) {
                // get list of all the column keys we are responsible for
                var keys = [];
                _this.columnGroup.getDisplayedLeafColumns().forEach(function (column) {
                    // not all cols in the group may be participating with auto-resize
                    if (!column.getColDef().suppressAutoSize) {
                        keys.push(column.getColId());
                    }
                });
                if (keys.length > 0) {
                    _this.columnController.autoSizeColumns(keys, "uiColumnResized");
                }
            });
        }
    };
    HeaderGroupWrapperComp.prototype.onResizeStart = function (shiftKey) {
        var _this = this;
        var leafCols = this.columnGroup.getDisplayedLeafColumns();
        this.resizeCols = utils_1.Utils.filter(leafCols, function (col) { return col.isResizable(); });
        this.resizeStartWidth = 0;
        this.resizeCols.forEach(function (col) { return _this.resizeStartWidth += col.getActualWidth(); });
        this.resizeRatios = [];
        this.resizeCols.forEach(function (col) { return _this.resizeRatios.push(col.getActualWidth() / _this.resizeStartWidth); });
        var takeFromGroup = null;
        if (shiftKey) {
            takeFromGroup = this.columnController.getDisplayedGroupAfter(this.columnGroup);
        }
        if (takeFromGroup) {
            var takeFromLeafCols = takeFromGroup.getDisplayedLeafColumns();
            this.resizeTakeFromCols = utils_1.Utils.filter(takeFromLeafCols, function (col) { return col.isResizable(); });
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
    };
    // optionally inverts the drag, depending on pinned and RTL
    // note - this method is duplicated in RenderedHeaderCell - should refactor out?
    HeaderGroupWrapperComp.prototype.normaliseDragChange = function (dragChange) {
        var result = dragChange;
        if (this.gridOptionsWrapper.isEnableRtl()) {
            // for RTL, dragging left makes the col bigger, except when pinning left
            if (this.pinned !== column_1.Column.PINNED_LEFT) {
                result *= -1;
            }
        }
        else {
            // for LTR (ie normal), dragging left makes the col smaller, except when pinning right
            if (this.pinned === column_1.Column.PINNED_RIGHT) {
                result *= -1;
            }
        }
        return result;
    };
    HeaderGroupWrapperComp.TEMPLATE = '<div class="ag-header-group-cell">' +
        '<div ref="agResize" class="ag-header-cell-resize"></div>' +
        '</div>';
    __decorate([
        context_1.Autowired('gridOptionsWrapper'),
        __metadata("design:type", gridOptionsWrapper_1.GridOptionsWrapper)
    ], HeaderGroupWrapperComp.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        context_1.Autowired('columnController'),
        __metadata("design:type", columnController_1.ColumnController)
    ], HeaderGroupWrapperComp.prototype, "columnController", void 0);
    __decorate([
        context_1.Autowired('horizontalResizeService'),
        __metadata("design:type", horizontalResizeService_1.HorizontalResizeService)
    ], HeaderGroupWrapperComp.prototype, "horizontalResizeService", void 0);
    __decorate([
        context_1.Autowired('dragAndDropService'),
        __metadata("design:type", dragAndDropService_1.DragAndDropService)
    ], HeaderGroupWrapperComp.prototype, "dragAndDropService", void 0);
    __decorate([
        context_1.Autowired('context'),
        __metadata("design:type", context_1.Context)
    ], HeaderGroupWrapperComp.prototype, "context", void 0);
    __decorate([
        context_1.Autowired('componentRecipes'),
        __metadata("design:type", componentRecipes_1.ComponentRecipes)
    ], HeaderGroupWrapperComp.prototype, "componentRecipes", void 0);
    __decorate([
        context_1.Autowired('gridApi'),
        __metadata("design:type", gridApi_1.GridApi)
    ], HeaderGroupWrapperComp.prototype, "gridApi", void 0);
    __decorate([
        context_1.Autowired('columnApi'),
        __metadata("design:type", columnApi_1.ColumnApi)
    ], HeaderGroupWrapperComp.prototype, "columnApi", void 0);
    __decorate([
        context_1.Autowired('beans'),
        __metadata("design:type", beans_1.Beans)
    ], HeaderGroupWrapperComp.prototype, "beans", void 0);
    __decorate([
        context_1.PostConstruct,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], HeaderGroupWrapperComp.prototype, "postConstruct", null);
    return HeaderGroupWrapperComp;
}(component_1.Component));
exports.HeaderGroupWrapperComp = HeaderGroupWrapperComp;
