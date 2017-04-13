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
var context_1 = require("../../context/context");
var column_1 = require("../../entities/column");
var utils_1 = require("../../utils");
var dragAndDropService_1 = require("../../dragAndDrop/dragAndDropService");
var columnController_1 = require("../../columnController/columnController");
var horizontalDragService_1 = require("../horizontalDragService");
var gridOptionsWrapper_1 = require("../../gridOptionsWrapper");
var cssClassApplier_1 = require("../cssClassApplier");
var setLeftFeature_1 = require("../../rendering/features/setLeftFeature");
var gridApi_1 = require("../../gridApi");
var sortController_1 = require("../../sortController");
var eventService_1 = require("../../eventService");
var componentProvider_1 = require("../../componentProvider");
var agCheckbox_1 = require("../../widgets/agCheckbox");
var componentAnnotations_1 = require("../../widgets/componentAnnotations");
var selectAllFeature_1 = require("./selectAllFeature");
var events_1 = require("../../events");
var columnHoverService_1 = require("../../rendering/columnHoverService");
var HeaderWrapperComp = (function (_super) {
    __extends(HeaderWrapperComp, _super);
    function HeaderWrapperComp(column, eRoot, dragSourceDropTarget, pinned) {
        var _this = _super.call(this, HeaderWrapperComp.TEMPLATE) || this;
        _this.column = column;
        _this.eRoot = eRoot;
        _this.dragSourceDropTarget = dragSourceDropTarget;
        _this.pinned = pinned;
        return _this;
    }
    HeaderWrapperComp.prototype.getColumn = function () {
        return this.column;
    };
    HeaderWrapperComp.prototype.init = function () {
        this.instantiate(this.context);
        var displayName = this.columnController.getDisplayNameForColumn(this.column, 'header', true);
        var enableSorting = this.gridOptionsWrapper.isEnableSorting() && !this.column.getColDef().suppressSorting;
        var enableMenu = this.menuFactory.isMenuEnabled(this.column) && !this.column.getColDef().suppressMenu;
        var headerComp = this.appendHeaderComp(displayName, enableSorting, enableMenu);
        this.setupWidth();
        this.setupMovingCss();
        this.setupTooltip();
        this.setupResize();
        this.setupMove(headerComp.getGui(), displayName);
        this.setupSortableClass(enableSorting);
        this.addColumnHoverListener();
        this.addDestroyableEventListener(this.column, column_1.Column.EVENT_FILTER_ACTIVE_CHANGED, this.onFilterChanged.bind(this));
        this.onFilterChanged();
        this.addFeature(this.context, new setLeftFeature_1.SetLeftFeature(this.column, this.getGui()));
        this.addFeature(this.context, new selectAllFeature_1.SelectAllFeature(this.cbSelectAll, this.column));
        this.addAttributes();
        cssClassApplier_1.CssClassApplier.addHeaderClassesFromColDef(this.column.getColDef(), this.getGui(), this.gridOptionsWrapper, this.column, null);
    };
    HeaderWrapperComp.prototype.addColumnHoverListener = function () {
        this.addDestroyableEventListener(this.eventService, events_1.Events.EVENT_COLUMN_HOVER_CHANGED, this.onColumnHover.bind(this));
        this.onColumnHover();
    };
    HeaderWrapperComp.prototype.onColumnHover = function () {
        var isHovered = this.columnHoverService.isHovered(this.column);
        utils_1.Utils.addOrRemoveCssClass(this.getGui(), 'ag-column-hover', isHovered);
    };
    HeaderWrapperComp.prototype.setupSortableClass = function (enableSorting) {
        if (enableSorting) {
            var eGui = this.getGui();
            utils_1.Utils.addCssClass(eGui, 'ag-header-cell-sortable');
        }
    };
    HeaderWrapperComp.prototype.onFilterChanged = function () {
        var filterPresent = this.column.isFilterActive();
        utils_1.Utils.addOrRemoveCssClass(this.getGui(), 'ag-header-cell-filtered', filterPresent);
    };
    HeaderWrapperComp.prototype.appendHeaderComp = function (displayName, enableSorting, enableMenu) {
        var _this = this;
        var params = {
            column: this.column,
            displayName: displayName,
            enableSorting: enableSorting,
            enableMenu: enableMenu,
            showColumnMenu: function (source) {
                _this.gridApi.showColumnMenuAfterButtonClick(_this.column, source);
            },
            progressSort: function (multiSort) {
                _this.sortController.progressSort(_this.column, !!multiSort);
            },
            setSort: function (sort, multiSort) {
                _this.sortController.setSortForColumn(_this.column, sort, !!multiSort);
            },
            api: this.gridApi,
            columnApi: this.columnApi,
            context: this.gridOptionsWrapper.getContext()
        };
        var headerComp = this.componentProvider.newHeaderComponent(params);
        this.appendChild(headerComp);
        return headerComp;
    };
    HeaderWrapperComp.prototype.onColumnMovingChanged = function () {
        // this function adds or removes the moving css, based on if the col is moving.
        // this is what makes the header go dark when it is been moved (gives impression to
        // user that the column was picked up).
        if (this.column.isMoving()) {
            utils_1.Utils.addCssClass(this.getGui(), 'ag-header-cell-moving');
        }
        else {
            utils_1.Utils.removeCssClass(this.getGui(), 'ag-header-cell-moving');
        }
    };
    HeaderWrapperComp.prototype.setupMove = function (eHeaderCellLabel, displayName) {
        var _this = this;
        var suppressMove = this.gridOptionsWrapper.isSuppressMovableColumns()
            || this.column.getColDef().suppressMovable
            || this.gridOptionsWrapper.isForPrint();
        if (suppressMove) {
            return;
        }
        if (eHeaderCellLabel) {
            var dragSource = {
                type: dragAndDropService_1.DragSourceType.HeaderCell,
                eElement: eHeaderCellLabel,
                dragItem: [this.column],
                dragItemName: displayName,
                dragSourceDropTarget: this.dragSourceDropTarget
            };
            this.dragAndDropService.addDragSource(dragSource, true);
            this.addDestroyFunc(function () { return _this.dragAndDropService.removeDragSource(dragSource); });
        }
    };
    HeaderWrapperComp.prototype.setupResize = function () {
        var _this = this;
        var colDef = this.column.getColDef();
        // if no eResize in template, do nothing
        if (!this.eResize) {
            return;
        }
        var weWantResize = this.gridOptionsWrapper.isEnableColResize() && !colDef.suppressResize;
        if (!weWantResize) {
            utils_1.Utils.removeFromParent(this.eResize);
            return;
        }
        this.horizontalDragService.addDragHandling({
            eDraggableElement: this.eResize,
            eBody: this.eRoot,
            cursor: 'col-resize',
            startAfterPixels: 0,
            onDragStart: this.onDragStart.bind(this),
            onDragging: this.onDragging.bind(this)
        });
        var weWantAutoSize = !this.gridOptionsWrapper.isSuppressAutoSize() && !colDef.suppressAutoSize;
        if (weWantAutoSize) {
            this.addDestroyableEventListener(this.eResize, 'dblclick', function () {
                _this.columnController.autoSizeColumn(_this.column);
            });
        }
    };
    HeaderWrapperComp.prototype.onDragging = function (dragChange, finished) {
        var dragChangeNormalised = this.normaliseDragChange(dragChange);
        var newWidth = this.startWidth + dragChangeNormalised;
        this.columnController.setColumnWidth(this.column, newWidth, finished);
    };
    HeaderWrapperComp.prototype.onDragStart = function () {
        this.startWidth = this.column.getActualWidth();
    };
    HeaderWrapperComp.prototype.setupTooltip = function () {
        var colDef = this.column.getColDef();
        // add tooltip if exists
        if (colDef.headerTooltip) {
            this.getGui().title = colDef.headerTooltip;
        }
    };
    HeaderWrapperComp.prototype.setupMovingCss = function () {
        this.addDestroyableEventListener(this.column, column_1.Column.EVENT_MOVING_CHANGED, this.onColumnMovingChanged.bind(this));
        this.onColumnMovingChanged();
    };
    HeaderWrapperComp.prototype.addAttributes = function () {
        this.getGui().setAttribute("colId", this.column.getColId());
    };
    HeaderWrapperComp.prototype.setupWidth = function () {
        this.addDestroyableEventListener(this.column, column_1.Column.EVENT_WIDTH_CHANGED, this.onColumnWidthChanged.bind(this));
        this.onColumnWidthChanged();
    };
    HeaderWrapperComp.prototype.onColumnWidthChanged = function () {
        this.getGui().style.width = this.column.getActualWidth() + 'px';
    };
    // optionally inverts the drag, depending on pinned and RTL
    // note - this method is duplicated in RenderedHeaderGroupCell - should refactor out?
    HeaderWrapperComp.prototype.normaliseDragChange = function (dragChange) {
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
    return HeaderWrapperComp;
}(component_1.Component));
HeaderWrapperComp.TEMPLATE = '<div class="ag-header-cell">' +
    '<div ref="eResize" class="ag-header-cell-resize"></div>' +
    '<ag-checkbox ref="cbSelectAll" class="ag-header-select-all"></ag-checkbox>' +
    // <inner component goes here>
    '</div>';
__decorate([
    context_1.Autowired('gridOptionsWrapper'),
    __metadata("design:type", gridOptionsWrapper_1.GridOptionsWrapper)
], HeaderWrapperComp.prototype, "gridOptionsWrapper", void 0);
__decorate([
    context_1.Autowired('dragAndDropService'),
    __metadata("design:type", dragAndDropService_1.DragAndDropService)
], HeaderWrapperComp.prototype, "dragAndDropService", void 0);
__decorate([
    context_1.Autowired('columnController'),
    __metadata("design:type", columnController_1.ColumnController)
], HeaderWrapperComp.prototype, "columnController", void 0);
__decorate([
    context_1.Autowired('horizontalDragService'),
    __metadata("design:type", horizontalDragService_1.HorizontalDragService)
], HeaderWrapperComp.prototype, "horizontalDragService", void 0);
__decorate([
    context_1.Autowired('context'),
    __metadata("design:type", context_1.Context)
], HeaderWrapperComp.prototype, "context", void 0);
__decorate([
    context_1.Autowired('menuFactory'),
    __metadata("design:type", Object)
], HeaderWrapperComp.prototype, "menuFactory", void 0);
__decorate([
    context_1.Autowired('gridApi'),
    __metadata("design:type", gridApi_1.GridApi)
], HeaderWrapperComp.prototype, "gridApi", void 0);
__decorate([
    context_1.Autowired('columnApi'),
    __metadata("design:type", columnController_1.ColumnApi)
], HeaderWrapperComp.prototype, "columnApi", void 0);
__decorate([
    context_1.Autowired('sortController'),
    __metadata("design:type", sortController_1.SortController)
], HeaderWrapperComp.prototype, "sortController", void 0);
__decorate([
    context_1.Autowired('eventService'),
    __metadata("design:type", eventService_1.EventService)
], HeaderWrapperComp.prototype, "eventService", void 0);
__decorate([
    context_1.Autowired('componentProvider'),
    __metadata("design:type", componentProvider_1.ComponentProvider)
], HeaderWrapperComp.prototype, "componentProvider", void 0);
__decorate([
    context_1.Autowired('columnHoverService'),
    __metadata("design:type", columnHoverService_1.ColumnHoverService)
], HeaderWrapperComp.prototype, "columnHoverService", void 0);
__decorate([
    componentAnnotations_1.RefSelector('eResize'),
    __metadata("design:type", HTMLElement)
], HeaderWrapperComp.prototype, "eResize", void 0);
__decorate([
    componentAnnotations_1.RefSelector('cbSelectAll'),
    __metadata("design:type", agCheckbox_1.AgCheckbox)
], HeaderWrapperComp.prototype, "cbSelectAll", void 0);
__decorate([
    context_1.PostConstruct,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], HeaderWrapperComp.prototype, "init", null);
exports.HeaderWrapperComp = HeaderWrapperComp;
