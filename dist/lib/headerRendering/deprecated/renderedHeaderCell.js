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
var utils_1 = require("../../utils");
var column_1 = require("../../entities/column");
var filterManager_1 = require("../../filter/filterManager");
var columnController_1 = require("../../columnController/columnController");
var headerTemplateLoader_1 = require("./headerTemplateLoader");
var gridOptionsWrapper_1 = require("../../gridOptionsWrapper");
var horizontalDragService_1 = require("../horizontalDragService");
var gridCore_1 = require("../../gridCore");
var context_1 = require("../../context/context");
var cssClassApplier_1 = require("../cssClassApplier");
var dragAndDropService_1 = require("../../dragAndDrop/dragAndDropService");
var sortController_1 = require("../../sortController");
var setLeftFeature_1 = require("../../rendering/features/setLeftFeature");
var touchListener_1 = require("../../widgets/touchListener");
var component_1 = require("../../widgets/component");
var RenderedHeaderCell = (function (_super) {
    __extends(RenderedHeaderCell, _super);
    function RenderedHeaderCell(column, eRoot, dragSourceDropTarget, pinned) {
        var _this = _super.call(this) || this;
        _this.column = column;
        _this.eRoot = eRoot;
        _this.dragSourceDropTarget = dragSourceDropTarget;
        _this.pinned = pinned;
        return _this;
    }
    RenderedHeaderCell.prototype.getColumn = function () {
        return this.column;
    };
    RenderedHeaderCell.prototype.init = function () {
        var eGui = this.headerTemplateLoader.createHeaderElement(this.column);
        this.setGui(eGui);
        utils_1.Utils.addCssClass(eGui, 'ag-header-cell');
        this.createScope();
        this.addAttributes();
        cssClassApplier_1.CssClassApplier.addHeaderClassesFromColDef(this.column.getColDef(), eGui, this.gridOptionsWrapper, this.column, null);
        // label div
        var eHeaderCellLabel = eGui.querySelector('#agHeaderCellLabel');
        this.displayName = this.columnController.getDisplayNameForColumn(this.column, 'header', true);
        this.setupMovingCss();
        this.setupTooltip();
        this.setupResize();
        this.setupTap();
        this.setupMove(eHeaderCellLabel);
        this.setupMenu();
        this.setupSort(eHeaderCellLabel);
        this.setupFilterIcon();
        this.setupText();
        this.setupWidth();
        this.addFeature(this.context, new setLeftFeature_1.SetLeftFeature(this.column, eGui));
    };
    RenderedHeaderCell.prototype.setupTooltip = function () {
        var colDef = this.column.getColDef();
        // add tooltip if exists
        if (colDef.headerTooltip) {
            this.getGui().title = colDef.headerTooltip;
        }
    };
    RenderedHeaderCell.prototype.setupText = function () {
        var colDef = this.column.getColDef();
        // render the cell, use a renderer if one is provided
        var headerCellRenderer;
        if (colDef.headerCellRenderer) {
            headerCellRenderer = colDef.headerCellRenderer;
        }
        else if (this.gridOptionsWrapper.getHeaderCellRenderer()) {
            headerCellRenderer = this.gridOptionsWrapper.getHeaderCellRenderer();
        }
        var eText = this.queryForHtmlElement('#agText');
        if (eText) {
            if (headerCellRenderer) {
                this.useRenderer(this.displayName, headerCellRenderer, eText);
            }
            else {
                // no renderer, default text render
                eText.innerHTML = this.displayName;
                // i don't remember why this is here, take it out???
                utils_1.Utils.addCssClass(eText, 'ag-header-cell-text');
            }
        }
    };
    RenderedHeaderCell.prototype.setupFilterIcon = function () {
        this.eFilterIcon = this.queryForHtmlElement('#agFilter');
        if (!this.eFilterIcon) {
            return;
        }
        this.addDestroyableEventListener(this.column, column_1.Column.EVENT_FILTER_CHANGED, this.onFilterChanged.bind(this));
        this.onFilterChanged();
    };
    RenderedHeaderCell.prototype.onFilterChanged = function () {
        var filterPresent = this.column.isFilterActive();
        utils_1.Utils.addOrRemoveCssClass(this.getGui(), 'ag-header-cell-filtered', filterPresent);
        utils_1.Utils.addOrRemoveCssClass(this.eFilterIcon, 'ag-hidden', !filterPresent);
    };
    RenderedHeaderCell.prototype.setupWidth = function () {
        this.addDestroyableEventListener(this.column, column_1.Column.EVENT_WIDTH_CHANGED, this.onColumnWidthChanged.bind(this));
        this.onColumnWidthChanged();
    };
    RenderedHeaderCell.prototype.onColumnWidthChanged = function () {
        this.getGui().style.width = this.column.getActualWidth() + 'px';
    };
    RenderedHeaderCell.prototype.createScope = function () {
        var _this = this;
        if (this.gridOptionsWrapper.isAngularCompileHeaders()) {
            this.childScope = this.$scope.$new();
            this.childScope.colDef = this.column.getColDef();
            this.childScope.colDefWrapper = this.column;
            this.childScope.context = this.gridOptionsWrapper.getContext();
            this.addDestroyFunc(function () {
                _this.childScope.$destroy();
            });
        }
    };
    RenderedHeaderCell.prototype.addAttributes = function () {
        this.getGui().setAttribute("colId", this.column.getColId());
    };
    RenderedHeaderCell.prototype.setupMenu = function () {
        var _this = this;
        var eMenu = this.queryForHtmlElement('#agMenu');
        // if no menu provided in template, do nothing
        if (!eMenu) {
            return;
        }
        var skipMenu = !this.menuFactory.isMenuEnabled(this.column) || this.column.getColDef().suppressMenu;
        if (skipMenu) {
            utils_1.Utils.removeFromParent(eMenu);
            return;
        }
        eMenu.addEventListener('click', function () { return _this.showMenu(eMenu); });
        if (!this.gridOptionsWrapper.isSuppressMenuHide()) {
            eMenu.style.opacity = '0';
            this.addGuiEventListener('mouseover', function () {
                eMenu.style.opacity = '1';
            });
            this.addGuiEventListener('mouseout', function () {
                eMenu.style.opacity = '0';
            });
        }
        var style = eMenu.style;
        style['transition'] = 'opacity 0.2s, border 0.2s';
        style['-webkit-transition'] = 'opacity 0.2s, border 0.2s';
    };
    RenderedHeaderCell.prototype.showMenu = function (eventSource) {
        this.menuFactory.showMenuAfterButtonClick(this.column, eventSource);
    };
    RenderedHeaderCell.prototype.setupMovingCss = function () {
        this.addDestroyableEventListener(this.column, column_1.Column.EVENT_MOVING_CHANGED, this.onColumnMovingChanged.bind(this));
        this.onColumnMovingChanged();
    };
    RenderedHeaderCell.prototype.onColumnMovingChanged = function () {
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
    RenderedHeaderCell.prototype.setupMove = function (eHeaderCellLabel) {
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
                dragItemName: this.displayName,
                dragSourceDropTarget: this.dragSourceDropTarget
            };
            this.dragAndDropService.addDragSource(dragSource, true);
            this.addDestroyFunc(function () { return _this.dragAndDropService.removeDragSource(dragSource); });
        }
    };
    RenderedHeaderCell.prototype.setupTap = function () {
        var _this = this;
        if (this.gridOptionsWrapper.isSuppressTouch()) {
            return;
        }
        var touchListener = new touchListener_1.TouchListener(this.getGui());
        var tapListener = function () {
            _this.sortController.progressSort(_this.column, false);
        };
        var longTapListener = function (touch) {
            _this.gridOptionsWrapper.getApi().showColumnMenuAfterMouseClick(_this.column, touch);
        };
        this.addDestroyableEventListener(touchListener, touchListener_1.TouchListener.EVENT_TAP, tapListener);
        this.addDestroyableEventListener(touchListener, touchListener_1.TouchListener.EVENT_LONG_TAP, longTapListener);
        this.addDestroyFunc(function () { return touchListener.destroy(); });
    };
    RenderedHeaderCell.prototype.setupResize = function () {
        var _this = this;
        var colDef = this.column.getColDef();
        var eResize = this.queryForHtmlElement('#agResizeBar');
        // if no eResize in template, do nothing
        if (!eResize) {
            return;
        }
        var weWantResize = this.gridOptionsWrapper.isEnableColResize() && !colDef.suppressResize;
        if (!weWantResize) {
            utils_1.Utils.removeFromParent(eResize);
            return;
        }
        this.horizontalDragService.addDragHandling({
            eDraggableElement: eResize,
            eBody: this.eRoot,
            cursor: 'col-resize',
            startAfterPixels: 0,
            onDragStart: this.onDragStart.bind(this),
            onDragging: this.onDragging.bind(this)
        });
        var weWantAutoSize = !this.gridOptionsWrapper.isSuppressAutoSize() && !colDef.suppressAutoSize;
        if (weWantAutoSize) {
            this.addDestroyableEventListener(eResize, 'dblclick', function () {
                _this.columnController.autoSizeColumn(_this.column);
            });
        }
    };
    RenderedHeaderCell.prototype.useRenderer = function (headerNameValue, headerCellRenderer, eText) {
        // renderer provided, use it
        var cellRendererParams = {
            colDef: this.column.getColDef(),
            $scope: this.childScope,
            context: this.gridOptionsWrapper.getContext(),
            value: headerNameValue,
            api: this.gridOptionsWrapper.getApi(),
            eHeaderCell: this.getGui()
        };
        var cellRendererResult = headerCellRenderer(cellRendererParams);
        var childToAppend;
        if (utils_1.Utils.isNodeOrElement(cellRendererResult)) {
            // a dom node or element was returned, so add child
            childToAppend = cellRendererResult;
        }
        else {
            // otherwise assume it was html, so just insert
            var eTextSpan = document.createElement("span");
            eTextSpan.innerHTML = cellRendererResult;
            childToAppend = eTextSpan;
        }
        // angular compile header if option is turned on
        if (this.gridOptionsWrapper.isAngularCompileHeaders()) {
            var childToAppendCompiled = this.$compile(childToAppend)(this.childScope)[0];
            eText.appendChild(childToAppendCompiled);
        }
        else {
            eText.appendChild(childToAppend);
        }
    };
    RenderedHeaderCell.prototype.setupSort = function (eHeaderCellLabel) {
        var _this = this;
        var enableSorting = this.gridOptionsWrapper.isEnableSorting() && !this.column.getColDef().suppressSorting;
        var eGui = this.getGui();
        if (!enableSorting) {
            utils_1.Utils.removeFromParent(eGui.querySelector('#agSortAsc'));
            utils_1.Utils.removeFromParent(eGui.querySelector('#agSortDesc'));
            utils_1.Utils.removeFromParent(eGui.querySelector('#agNoSort'));
            return;
        }
        // add sortable class for styling
        utils_1.Utils.addCssClass(eGui, 'ag-header-cell-sortable');
        // add the event on the header, so when clicked, we do sorting
        if (eHeaderCellLabel) {
            eHeaderCellLabel.addEventListener("click", function (event) {
                _this.sortController.progressSort(_this.column, event.shiftKey);
            });
        }
        // add listener for sort changing, and update the icons accordingly
        this.eSortAsc = this.queryForHtmlElement('#agSortAsc');
        this.eSortDesc = this.queryForHtmlElement('#agSortDesc');
        this.eSortNone = this.queryForHtmlElement('#agNoSort');
        this.addDestroyableEventListener(this.column, column_1.Column.EVENT_SORT_CHANGED, this.onSortChanged.bind(this));
        this.onSortChanged();
    };
    RenderedHeaderCell.prototype.onSortChanged = function () {
        utils_1.Utils.addOrRemoveCssClass(this.getGui(), 'ag-header-cell-sorted-asc', this.column.isSortAscending());
        utils_1.Utils.addOrRemoveCssClass(this.getGui(), 'ag-header-cell-sorted-desc', this.column.isSortDescending());
        utils_1.Utils.addOrRemoveCssClass(this.getGui(), 'ag-header-cell-sorted-none', this.column.isSortNone());
        if (this.eSortAsc) {
            utils_1.Utils.addOrRemoveCssClass(this.eSortAsc, 'ag-hidden', !this.column.isSortAscending());
        }
        if (this.eSortDesc) {
            utils_1.Utils.addOrRemoveCssClass(this.eSortDesc, 'ag-hidden', !this.column.isSortDescending());
        }
        if (this.eSortNone) {
            var alwaysHideNoSort = !this.column.getColDef().unSortIcon && !this.gridOptionsWrapper.isUnSortIcon();
            utils_1.Utils.addOrRemoveCssClass(this.eSortNone, 'ag-hidden', alwaysHideNoSort || !this.column.isSortNone());
        }
    };
    RenderedHeaderCell.prototype.onDragStart = function () {
        this.startWidth = this.column.getActualWidth();
    };
    // optionally inverts the drag, depending on pinned and RTL
    // note - this method is duplicated in RenderedHeaderGroupCell - should refactor out?
    RenderedHeaderCell.prototype.normaliseDragChange = function (dragChange) {
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
    RenderedHeaderCell.prototype.onDragging = function (dragChange, finished) {
        var dragChangeNormalised = this.normaliseDragChange(dragChange);
        var newWidth = this.startWidth + dragChangeNormalised;
        this.columnController.setColumnWidth(this.column, newWidth, finished);
    };
    return RenderedHeaderCell;
}(component_1.Component));
__decorate([
    context_1.Autowired('context'),
    __metadata("design:type", context_1.Context)
], RenderedHeaderCell.prototype, "context", void 0);
__decorate([
    context_1.Autowired('filterManager'),
    __metadata("design:type", filterManager_1.FilterManager)
], RenderedHeaderCell.prototype, "filterManager", void 0);
__decorate([
    context_1.Autowired('columnController'),
    __metadata("design:type", columnController_1.ColumnController)
], RenderedHeaderCell.prototype, "columnController", void 0);
__decorate([
    context_1.Autowired('$compile'),
    __metadata("design:type", Object)
], RenderedHeaderCell.prototype, "$compile", void 0);
__decorate([
    context_1.Autowired('gridCore'),
    __metadata("design:type", gridCore_1.GridCore)
], RenderedHeaderCell.prototype, "gridCore", void 0);
__decorate([
    context_1.Autowired('headerTemplateLoader'),
    __metadata("design:type", headerTemplateLoader_1.HeaderTemplateLoader)
], RenderedHeaderCell.prototype, "headerTemplateLoader", void 0);
__decorate([
    context_1.Autowired('horizontalDragService'),
    __metadata("design:type", horizontalDragService_1.HorizontalDragService)
], RenderedHeaderCell.prototype, "horizontalDragService", void 0);
__decorate([
    context_1.Autowired('menuFactory'),
    __metadata("design:type", Object)
], RenderedHeaderCell.prototype, "menuFactory", void 0);
__decorate([
    context_1.Autowired('gridOptionsWrapper'),
    __metadata("design:type", gridOptionsWrapper_1.GridOptionsWrapper)
], RenderedHeaderCell.prototype, "gridOptionsWrapper", void 0);
__decorate([
    context_1.Autowired('dragAndDropService'),
    __metadata("design:type", dragAndDropService_1.DragAndDropService)
], RenderedHeaderCell.prototype, "dragAndDropService", void 0);
__decorate([
    context_1.Autowired('sortController'),
    __metadata("design:type", sortController_1.SortController)
], RenderedHeaderCell.prototype, "sortController", void 0);
__decorate([
    context_1.Autowired('$scope'),
    __metadata("design:type", Object)
], RenderedHeaderCell.prototype, "$scope", void 0);
__decorate([
    context_1.PostConstruct,
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], RenderedHeaderCell.prototype, "init", null);
exports.RenderedHeaderCell = RenderedHeaderCell;
