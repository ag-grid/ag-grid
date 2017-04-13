/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v9.0.3
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
var columnController_1 = require("../../columnController/columnController");
var gridOptionsWrapper_1 = require("../../gridOptionsWrapper");
var horizontalDragService_1 = require("../horizontalDragService");
var context_1 = require("../../context/context");
var cssClassApplier_1 = require("../cssClassApplier");
var dragAndDropService_1 = require("../../dragAndDrop/dragAndDropService");
var setLeftFeature_1 = require("../../rendering/features/setLeftFeature");
var componentProvider_1 = require("../../componentProvider");
var gridApi_1 = require("../../gridApi");
var HeaderGroupWrapperComp = (function (_super) {
    __extends(HeaderGroupWrapperComp, _super);
    function HeaderGroupWrapperComp(columnGroup, eRoot, dragSourceDropTarget, pinned) {
        var _this = _super.call(this, HeaderGroupWrapperComp.TEMPLATE) || this;
        // the children can change, we keep destroy functions related to listening to the children here
        _this.childColumnsDestroyFuncs = [];
        _this.columnGroup = columnGroup;
        _this.eRoot = eRoot;
        _this.dragSourceDropTarget = dragSourceDropTarget;
        _this.pinned = pinned;
        return _this;
    }
    HeaderGroupWrapperComp.prototype.postConstruct = function () {
        cssClassApplier_1.CssClassApplier.addHeaderClassesFromColDef(this.columnGroup.getColGroupDef(), this.getGui(), this.gridOptionsWrapper, null, this.columnGroup);
        var displayName = this.columnController.getDisplayNameForColumnGroup(this.columnGroup, 'header');
        var headerComponent = this.appendHeaderGroupComp(displayName);
        this.setupResize();
        this.addClasses();
        this.setupMove(headerComponent.getGui(), displayName);
        this.setupWidth();
        this.addAttributes();
        this.addFeature(this.context, new setLeftFeature_1.SetLeftFeature(this.columnGroup, this.getGui()));
    };
    HeaderGroupWrapperComp.prototype.addAttributes = function () {
        this.getGui().setAttribute("colId", this.columnGroup.getUniqueId());
    };
    HeaderGroupWrapperComp.prototype.appendHeaderGroupComp = function (displayName) {
        var _this = this;
        var params = {
            displayName: displayName,
            columnGroup: this.columnGroup,
            setExpanded: function (expanded) {
                _this.columnController.setColumnGroupOpened(_this.columnGroup, expanded);
            },
            api: this.gridApi,
            columnApi: this.columnApi,
            context: this.gridOptionsWrapper.getContext()
        };
        var headerComp = this.componentProvider.newHeaderGroupComponent(params);
        this.appendChild(headerComp);
        return headerComp;
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
        if (eHeaderGroup) {
            var dragSource = {
                type: dragAndDropService_1.DragSourceType.HeaderCell,
                eElement: eHeaderGroup,
                dragItemName: displayName,
                // we add in the original group leaf columns, so we move both visible and non-visible items
                dragItem: this.getAllColumnsInThisGroup(),
                dragSourceDropTarget: this.dragSourceDropTarget
            };
            this.dragAndDropService.addDragSource(dragSource, true);
            this.addDestroyFunc(function () { return _this.dragAndDropService.removeDragSource(dragSource); });
        }
    };
    // when moving the columns, we want to move all the columns in this group in one go, and in the order they
    // are currently in the screen.
    HeaderGroupWrapperComp.prototype.getAllColumnsInThisGroup = function () {
        var allColumnsOriginalOrder = this.columnGroup.getOriginalColumnGroup().getLeafColumns();
        var allColumnsCurrentOrder = [];
        this.columnController.getAllDisplayedColumns().forEach(function (column) {
            if (allColumnsOriginalOrder.indexOf(column) >= 0) {
                allColumnsCurrentOrder.push(column);
                utils_1.Utils.removeFromArray(allColumnsOriginalOrder, column);
            }
        });
        // we are left with non-visible columns, stick these in at the end
        allColumnsOriginalOrder.forEach(function (column) { return allColumnsCurrentOrder.push(column); });
        return allColumnsCurrentOrder;
    };
    HeaderGroupWrapperComp.prototype.isSuppressMoving = function () {
        // if any child is fixed, then don't allow moving
        var childSuppressesMoving = false;
        this.columnGroup.getLeafColumns().forEach(function (column) {
            if (column.getColDef().suppressMovable) {
                childSuppressesMoving = true;
            }
        });
        var result = childSuppressesMoving
            || this.gridOptionsWrapper.isSuppressMovableColumns()
            || this.gridOptionsWrapper.isForPrint();
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
        if (!this.gridOptionsWrapper.isEnableColResize()) {
            utils_1.Utils.removeFromParent(this.eHeaderCellResize);
            return;
        }
        this.dragService.addDragHandling({
            eDraggableElement: this.eHeaderCellResize,
            eBody: this.eRoot,
            cursor: 'col-resize',
            startAfterPixels: 0,
            onDragStart: this.onDragStart.bind(this),
            onDragging: this.onDragging.bind(this)
        });
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
                    _this.columnController.autoSizeColumns(keys);
                }
            });
        }
    };
    HeaderGroupWrapperComp.prototype.onDragStart = function () {
        var _this = this;
        this.groupWidthStart = this.columnGroup.getActualWidth();
        this.childrenWidthStarts = [];
        this.columnGroup.getDisplayedLeafColumns().forEach(function (column) {
            _this.childrenWidthStarts.push(column.getActualWidth());
        });
    };
    HeaderGroupWrapperComp.prototype.onDragging = function (dragChange, finished) {
        var _this = this;
        var dragChangeNormalised = this.normaliseDragChange(dragChange);
        var newWidth = this.groupWidthStart + dragChangeNormalised;
        var minWidth = this.columnGroup.getMinWidth();
        if (newWidth < minWidth) {
            newWidth = minWidth;
        }
        // distribute the new width to the child headers
        var changeRatio = newWidth / this.groupWidthStart;
        // keep track of pixels used, and last column gets the remaining,
        // to cater for rounding errors, and min width adjustments
        var pixelsToDistribute = newWidth;
        var displayedColumns = this.columnGroup.getDisplayedLeafColumns();
        displayedColumns.forEach(function (column, index) {
            var notLastCol = index !== (displayedColumns.length - 1);
            var newChildSize;
            if (notLastCol) {
                // if not the last col, calculate the column width as normal
                var startChildSize = _this.childrenWidthStarts[index];
                newChildSize = startChildSize * changeRatio;
                if (newChildSize < column.getMinWidth()) {
                    newChildSize = column.getMinWidth();
                }
                pixelsToDistribute -= newChildSize;
            }
            else {
                // if last col, give it the remaining pixels
                newChildSize = pixelsToDistribute;
            }
            _this.columnController.setColumnWidth(column, newChildSize, finished);
        });
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
    return HeaderGroupWrapperComp;
}(component_1.Component));
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
    context_1.Autowired('horizontalDragService'),
    __metadata("design:type", horizontalDragService_1.HorizontalDragService)
], HeaderGroupWrapperComp.prototype, "dragService", void 0);
__decorate([
    context_1.Autowired('dragAndDropService'),
    __metadata("design:type", dragAndDropService_1.DragAndDropService)
], HeaderGroupWrapperComp.prototype, "dragAndDropService", void 0);
__decorate([
    context_1.Autowired('context'),
    __metadata("design:type", context_1.Context)
], HeaderGroupWrapperComp.prototype, "context", void 0);
__decorate([
    context_1.Autowired('componentProvider'),
    __metadata("design:type", componentProvider_1.ComponentProvider)
], HeaderGroupWrapperComp.prototype, "componentProvider", void 0);
__decorate([
    context_1.Autowired('gridApi'),
    __metadata("design:type", gridApi_1.GridApi)
], HeaderGroupWrapperComp.prototype, "gridApi", void 0);
__decorate([
    context_1.Autowired('columnApi'),
    __metadata("design:type", columnController_1.ColumnApi)
], HeaderGroupWrapperComp.prototype, "columnApi", void 0);
__decorate([
    context_1.PostConstruct,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], HeaderGroupWrapperComp.prototype, "postConstruct", null);
exports.HeaderGroupWrapperComp = HeaderGroupWrapperComp;
