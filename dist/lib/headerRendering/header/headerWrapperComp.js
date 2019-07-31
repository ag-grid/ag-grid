/**
 * ag-grid-community - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v21.1.1
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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var component_1 = require("../../widgets/component");
var context_1 = require("../../context/context");
var column_1 = require("../../entities/column");
var dragAndDropService_1 = require("../../dragAndDrop/dragAndDropService");
var columnApi_1 = require("../../columnController/columnApi");
var columnController_1 = require("../../columnController/columnController");
var horizontalResizeService_1 = require("../horizontalResizeService");
var gridOptionsWrapper_1 = require("../../gridOptionsWrapper");
var cssClassApplier_1 = require("../cssClassApplier");
var setLeftFeature_1 = require("../../rendering/features/setLeftFeature");
var gridApi_1 = require("../../gridApi");
var sortController_1 = require("../../sortController");
var eventService_1 = require("../../eventService");
var userComponentFactory_1 = require("../../components/framework/userComponentFactory");
var agCheckbox_1 = require("../../widgets/agCheckbox");
var componentAnnotations_1 = require("../../widgets/componentAnnotations");
var selectAllFeature_1 = require("./selectAllFeature");
var events_1 = require("../../events");
var columnHoverService_1 = require("../../rendering/columnHoverService");
var beans_1 = require("../../rendering/beans");
var hoverFeature_1 = require("../hoverFeature");
var touchListener_1 = require("../../widgets/touchListener");
var utils_1 = require("../../utils");
var HeaderWrapperComp = /** @class */ (function (_super) {
    __extends(HeaderWrapperComp, _super);
    function HeaderWrapperComp(column, dragSourceDropTarget, pinned) {
        var _this = _super.call(this, HeaderWrapperComp.TEMPLATE) || this;
        _this.column = column;
        _this.dragSourceDropTarget = dragSourceDropTarget;
        _this.pinned = pinned;
        return _this;
    }
    HeaderWrapperComp.prototype.getColumn = function () {
        return this.column;
    };
    HeaderWrapperComp.prototype.getComponentHolder = function () {
        return this.column.getColDef();
    };
    HeaderWrapperComp.prototype.init = function () {
        var colDef = this.getComponentHolder();
        var displayName = this.columnController.getDisplayNameForColumn(this.column, 'header', true);
        var enableSorting = colDef.sortable;
        var enableMenu = this.menuFactory.isMenuEnabled(this.column) && !colDef.suppressMenu;
        this.appendHeaderComp(displayName, enableSorting, enableMenu);
        this.setupWidth();
        this.setupMovingCss();
        this.setupTooltip();
        this.setupResize();
        this.setupMenuClass();
        this.setupSortableClass(enableSorting);
        this.addColumnHoverListener();
        this.addFeature(this.getContext(), new hoverFeature_1.HoverFeature([this.column], this.getGui()));
        this.addDestroyableEventListener(this.column, column_1.Column.EVENT_FILTER_ACTIVE_CHANGED, this.onFilterChanged.bind(this));
        this.onFilterChanged();
        this.addFeature(this.getContext(), new selectAllFeature_1.SelectAllFeature(this.cbSelectAll, this.column));
        var setLeftFeature = new setLeftFeature_1.SetLeftFeature(this.column, this.getGui(), this.beans);
        setLeftFeature.init();
        this.addDestroyFunc(setLeftFeature.destroy.bind(setLeftFeature));
        this.addAttributes();
        cssClassApplier_1.CssClassApplier.addHeaderClassesFromColDef(colDef, this.getGui(), this.gridOptionsWrapper, this.column, null);
    };
    HeaderWrapperComp.prototype.addColumnHoverListener = function () {
        this.addDestroyableEventListener(this.eventService, events_1.Events.EVENT_COLUMN_HOVER_CHANGED, this.onColumnHover.bind(this));
        this.onColumnHover();
    };
    HeaderWrapperComp.prototype.onColumnHover = function () {
        var isHovered = this.columnHoverService.isHovered(this.column);
        utils_1._.addOrRemoveCssClass(this.getGui(), 'ag-column-hover', isHovered);
    };
    HeaderWrapperComp.prototype.setupSortableClass = function (enableSorting) {
        if (enableSorting) {
            var element = this.getGui();
            utils_1._.addCssClass(element, 'ag-header-cell-sortable');
        }
    };
    HeaderWrapperComp.prototype.onFilterChanged = function () {
        var filterPresent = this.column.isFilterActive();
        utils_1._.addOrRemoveCssClass(this.getGui(), 'ag-header-cell-filtered', filterPresent);
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
                _this.sortController.progressSort(_this.column, !!multiSort, "uiColumnSorted");
            },
            setSort: function (sort, multiSort) {
                _this.sortController.setSortForColumn(_this.column, sort, !!multiSort, "uiColumnSorted");
            },
            api: this.gridApi,
            columnApi: this.columnApi,
            context: this.gridOptionsWrapper.getContext()
        };
        var callback = this.afterHeaderCompCreated.bind(this, displayName);
        this.userComponentFactory.newHeaderComponent(params).then(callback);
    };
    HeaderWrapperComp.prototype.afterHeaderCompCreated = function (displayName, headerComp) {
        this.appendChild(headerComp);
        this.setupMove(headerComp.getGui(), displayName);
    };
    HeaderWrapperComp.prototype.onColumnMovingChanged = function () {
        // this function adds or removes the moving css, based on if the col is moving.
        // this is what makes the header go dark when it is been moved (gives impression to
        // user that the column was picked up).
        if (this.column.isMoving()) {
            utils_1._.addCssClass(this.getGui(), 'ag-header-cell-moving');
        }
        else {
            utils_1._.removeCssClass(this.getGui(), 'ag-header-cell-moving');
        }
    };
    HeaderWrapperComp.prototype.setupMove = function (eHeaderCellLabel, displayName) {
        var _this = this;
        var suppressMove = this.gridOptionsWrapper.isSuppressMovableColumns()
            || this.getComponentHolder().suppressMovable
            || this.column.getColDef().lockPosition;
        if (suppressMove) {
            return;
        }
        if (eHeaderCellLabel) {
            var dragSource_1 = {
                type: dragAndDropService_1.DragSourceType.HeaderCell,
                eElement: eHeaderCellLabel,
                dragItemCallback: function () { return _this.createDragItem(); },
                dragItemName: displayName,
                dragSourceDropTarget: this.dragSourceDropTarget,
                dragStarted: function () { return _this.column.setMoving(true, "uiColumnMoved"); },
                dragStopped: function () { return _this.column.setMoving(false, "uiColumnMoved"); }
            };
            this.dragAndDropService.addDragSource(dragSource_1, true);
            this.addDestroyFunc(function () { return _this.dragAndDropService.removeDragSource(dragSource_1); });
        }
    };
    HeaderWrapperComp.prototype.createDragItem = function () {
        var visibleState = {};
        visibleState[this.column.getId()] = this.column.isVisible();
        return {
            columns: [this.column],
            visibleState: visibleState
        };
    };
    HeaderWrapperComp.prototype.setupResize = function () {
        var _this = this;
        var colDef = this.getComponentHolder();
        // if no eResize in template, do nothing
        if (!this.eResize) {
            return;
        }
        if (!this.column.isResizable()) {
            utils_1._.removeFromParent(this.eResize);
            return;
        }
        var finishedWithResizeFunc = this.horizontalResizeService.addResizeBar({
            eResizeBar: this.eResize,
            onResizeStart: this.onResizeStart.bind(this),
            onResizing: this.onResizing.bind(this, false),
            onResizeEnd: this.onResizing.bind(this, true)
        });
        this.addDestroyFunc(finishedWithResizeFunc);
        var weWantAutoSize = !this.gridOptionsWrapper.isSuppressAutoSize() && !colDef.suppressAutoSize;
        if (weWantAutoSize) {
            this.addDestroyableEventListener(this.eResize, 'dblclick', function () {
                _this.columnController.autoSizeColumn(_this.column, "uiColumnResized");
            });
            var touchListener = new touchListener_1.TouchListener(this.eResize);
            this.addDestroyableEventListener(touchListener, touchListener_1.TouchListener.EVENT_DOUBLE_TAP, function () {
                _this.columnController.autoSizeColumn(_this.column, "uiColumnResized");
            });
            this.addDestroyFunc(touchListener.destroy.bind(touchListener));
        }
    };
    HeaderWrapperComp.prototype.onResizing = function (finished, resizeAmount) {
        var resizeAmountNormalised = this.normaliseResizeAmount(resizeAmount);
        var newWidth = this.resizeStartWidth + resizeAmountNormalised;
        this.columnController.setColumnWidth(this.column, newWidth, this.resizeWithShiftKey, finished, "uiColumnDragged");
        if (finished) {
            utils_1._.removeCssClass(this.getGui(), 'ag-column-resizing');
        }
    };
    HeaderWrapperComp.prototype.onResizeStart = function (shiftKey) {
        this.resizeStartWidth = this.column.getActualWidth();
        this.resizeWithShiftKey = shiftKey;
        utils_1._.addCssClass(this.getGui(), 'ag-column-resizing');
    };
    HeaderWrapperComp.prototype.getTooltipText = function () {
        var colDef = this.getComponentHolder();
        return colDef.headerTooltip;
    };
    HeaderWrapperComp.prototype.setupTooltip = function () {
        var tooltipText = this.getTooltipText();
        // add tooltip if exists
        if (tooltipText == null) {
            return;
        }
        if (this.gridOptionsWrapper.isEnableBrowserTooltips()) {
            this.getGui().setAttribute('title', tooltipText);
        }
        else {
            this.beans.tooltipManager.registerTooltip(this);
        }
    };
    HeaderWrapperComp.prototype.setupMovingCss = function () {
        this.addDestroyableEventListener(this.column, column_1.Column.EVENT_MOVING_CHANGED, this.onColumnMovingChanged.bind(this));
        this.onColumnMovingChanged();
    };
    HeaderWrapperComp.prototype.addAttributes = function () {
        this.getGui().setAttribute("col-id", this.column.getColId());
    };
    HeaderWrapperComp.prototype.setupWidth = function () {
        this.addDestroyableEventListener(this.column, column_1.Column.EVENT_WIDTH_CHANGED, this.onColumnWidthChanged.bind(this));
        this.onColumnWidthChanged();
    };
    HeaderWrapperComp.prototype.setupMenuClass = function () {
        this.addDestroyableEventListener(this.column, column_1.Column.EVENT_MENU_VISIBLE_CHANGED, this.onMenuVisible.bind(this));
        this.onColumnWidthChanged();
    };
    HeaderWrapperComp.prototype.onMenuVisible = function () {
        this.addOrRemoveCssClass('ag-column-menu-visible', this.column.isMenuVisible());
    };
    HeaderWrapperComp.prototype.onColumnWidthChanged = function () {
        this.getGui().style.width = this.column.getActualWidth() + 'px';
    };
    // optionally inverts the drag, depending on pinned and RTL
    // note - this method is duplicated in RenderedHeaderGroupCell - should refactor out?
    HeaderWrapperComp.prototype.normaliseResizeAmount = function (dragChange) {
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
    HeaderWrapperComp.TEMPLATE = '<div class="ag-header-cell" role="presentation" unselectable="on">' +
        '<div ref="eResize" class="ag-header-cell-resize" role="presentation"></div>' +
        '<ag-checkbox ref="cbSelectAll" class="ag-header-select-all" role="presentation"></ag-checkbox>' +
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
        context_1.Autowired('horizontalResizeService'),
        __metadata("design:type", horizontalResizeService_1.HorizontalResizeService)
    ], HeaderWrapperComp.prototype, "horizontalResizeService", void 0);
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
        __metadata("design:type", columnApi_1.ColumnApi)
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
        context_1.Autowired('userComponentFactory'),
        __metadata("design:type", userComponentFactory_1.UserComponentFactory)
    ], HeaderWrapperComp.prototype, "userComponentFactory", void 0);
    __decorate([
        context_1.Autowired('columnHoverService'),
        __metadata("design:type", columnHoverService_1.ColumnHoverService)
    ], HeaderWrapperComp.prototype, "columnHoverService", void 0);
    __decorate([
        context_1.Autowired('beans'),
        __metadata("design:type", beans_1.Beans)
    ], HeaderWrapperComp.prototype, "beans", void 0);
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
    return HeaderWrapperComp;
}(component_1.Component));
exports.HeaderWrapperComp = HeaderWrapperComp;
