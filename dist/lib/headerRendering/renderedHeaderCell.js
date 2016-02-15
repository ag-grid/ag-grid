/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v3.3.3
 * @link http://www.ag-grid.com/
 * @license MIT
 */
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var utils_1 = require('../utils');
var renderedHeaderElement_1 = require("./renderedHeaderElement");
var column_1 = require("../entities/column");
var moveColumnController_1 = require("./moveColumnController");
var RenderedHeaderCell = (function (_super) {
    __extends(RenderedHeaderCell, _super);
    function RenderedHeaderCell(column, parentGroup, gridOptionsWrapper, parentScope, filterManager, columnController, $compile, grid, eRoot, headerTemplateLoader, headerRenderer, dragService, gridPanel) {
        _super.call(this, gridOptionsWrapper);
        // for better structured code, anything we need to do when this column gets destroyed,
        // we put a function in here. otherwise we would have a big destroy function with lots
        // of 'if / else' mapping to things that got created.
        this.destroyFunctions = [];
        this.column = column;
        this.parentGroup = parentGroup;
        this.filterManager = filterManager;
        this.columnController = columnController;
        this.$compile = $compile;
        this.grid = grid;
        this.headerTemplateLoader = headerTemplateLoader;
        this.headerRenderer = headerRenderer;
        this.setupComponents(eRoot, parentScope, dragService, gridPanel);
    }
    RenderedHeaderCell.prototype.getGui = function () {
        return this.eHeaderCell;
    };
    RenderedHeaderCell.prototype.destroy = function () {
        this.destroyFunctions.forEach(function (func) {
            func();
        });
    };
    RenderedHeaderCell.prototype.createScope = function (parentScope) {
        var _this = this;
        if (this.getGridOptionsWrapper().isAngularCompileHeaders()) {
            this.childScope = parentScope.$new();
            this.childScope.colDef = this.column.getColDef();
            this.childScope.colDefWrapper = this.column;
            this.destroyFunctions.push(function () {
                _this.childScope.$destroy();
            });
        }
    };
    RenderedHeaderCell.prototype.addAttributes = function () {
        this.eHeaderCell.setAttribute("colId", this.column.getColId());
    };
    RenderedHeaderCell.prototype.addMenu = function () {
        var eMenu = this.eHeaderCell.querySelector('#agMenu');
        // if no menu provided in template, do nothing
        if (!eMenu) {
            return;
        }
        var weWantMenu = this.getGridOptionsWrapper().isEnableFilter() && !this.column.getColDef().suppressMenu;
        if (!weWantMenu) {
            utils_1.default.removeFromParent(eMenu);
            return;
        }
        var that = this;
        eMenu.addEventListener('click', function () {
            that.filterManager.showFilter(that.column, this);
        });
        if (!this.getGridOptionsWrapper().isSuppressMenuHide()) {
            eMenu.style.opacity = '0';
            this.eHeaderCell.addEventListener('mouseenter', function () {
                eMenu.style.opacity = '1';
            });
            this.eHeaderCell.addEventListener('mouseleave', function () {
                eMenu.style.opacity = '0';
            });
        }
        var style = eMenu.style;
        style['transition'] = 'opacity 0.5s, border 0.2s';
        style['-webkit-transition'] = 'opacity 0.5s, border 0.2s';
    };
    RenderedHeaderCell.prototype.removeSortIcons = function () {
        utils_1.default.removeFromParent(this.eHeaderCell.querySelector('#agSortAsc'));
        utils_1.default.removeFromParent(this.eHeaderCell.querySelector('#agSortDesc'));
        utils_1.default.removeFromParent(this.eHeaderCell.querySelector('#agNoSort'));
    };
    RenderedHeaderCell.prototype.addSortIcons = function () {
        this.eSortAsc = this.eHeaderCell.querySelector('#agSortAsc');
        this.eSortDesc = this.eHeaderCell.querySelector('#agSortDesc');
        this.eSortNone = this.eHeaderCell.querySelector('#agNoSort');
        if (this.eSortAsc) {
            this.eSortAsc.style.display = 'none';
        }
        if (this.eSortDesc) {
            this.eSortDesc.style.display = 'none';
        }
        var showingNoSortIcon = this.column.getColDef().unSortIcon || this.getGridOptionsWrapper().isUnSortIcon();
        // 'no sort' icon
        if (!showingNoSortIcon) {
            utils_1.default.removeFromParent(this.eSortNone);
        }
    };
    RenderedHeaderCell.prototype.addMovingCss = function () {
        var _this = this;
        // this function adds or removes the moving css, based on if the col is moving
        var addMovingCssFunc = function () {
            if (_this.column.isMoving()) {
                utils_1.default.addCssClass(_this.eHeaderCell, 'ag-header-cell-moving');
            }
            else {
                utils_1.default.removeCssClass(_this.eHeaderCell, 'ag-header-cell-moving');
            }
        };
        // call it now once, so the col is set up correctly
        addMovingCssFunc();
        // then call it every time we are informed of a moving state change in the col
        this.column.addEventListener(column_1.default.EVENT_MOVING_CHANGED, addMovingCssFunc);
        // finally we remove the listener when this cell is no longer rendered
        this.destroyFunctions.push(function () {
            _this.column.removeEventListener(column_1.default.EVENT_MOVING_CHANGED, addMovingCssFunc);
        });
    };
    RenderedHeaderCell.prototype.setupComponents = function (eRoot, parentScope, dragService, gridPanel) {
        this.eHeaderCell = this.headerTemplateLoader.createHeaderElement(this.column);
        utils_1.default.addCssClass(this.eHeaderCell, 'ag-header-cell');
        this.createScope(parentScope);
        this.addAttributes();
        this.addHeaderClassesFromCollDef(this.column.getColDef(), this.eHeaderCell);
        this.addMovingCss();
        var colDef = this.column.getColDef();
        // add tooltip if exists
        if (colDef.headerTooltip) {
            this.eHeaderCell.title = colDef.headerTooltip;
        }
        // label div
        this.eText = this.eHeaderCell.querySelector('#agText');
        this.eHeaderCellLabel = this.eHeaderCell.querySelector('#agHeaderCellLabel');
        this.addResize(eRoot, dragService);
        this.addMove(eRoot, dragService, gridPanel);
        this.addMenu();
        // add in sort icons
        this.addSort();
        // add in filter icon
        this.eFilterIcon = this.eHeaderCell.querySelector('#agFilter');
        // render the cell, use a renderer if one is provided
        var headerCellRenderer;
        if (colDef.headerCellRenderer) {
            headerCellRenderer = colDef.headerCellRenderer;
        }
        else if (this.getGridOptionsWrapper().getHeaderCellRenderer()) {
            headerCellRenderer = this.getGridOptionsWrapper().getHeaderCellRenderer();
        }
        var headerNameValue = this.columnController.getDisplayNameForCol(this.column);
        if (this.eText) {
            if (headerCellRenderer) {
                this.useRenderer(headerNameValue, headerCellRenderer);
            }
            else {
                // no renderer, default text render
                this.eText.className = 'ag-header-cell-text';
                this.eText.innerHTML = headerNameValue;
            }
        }
        this.eHeaderCell.style.width = utils_1.default.formatWidth(this.column.getActualWidth());
        this.refreshFilterIcon();
        this.refreshSortIcon();
    };
    RenderedHeaderCell.prototype.addSort = function () {
        var enableSorting = this.getGridOptionsWrapper().isEnableSorting() && !this.column.getColDef().suppressSorting;
        if (enableSorting) {
            this.addSortIcons();
            this.addSortHandling();
        }
        else {
            this.removeSortIcons();
        }
    };
    RenderedHeaderCell.prototype.addMove = function (eRoot, dragService, gridPanel) {
        if (this.getGridOptionsWrapper().isSuppressMovableColumns() || this.column.getColDef().suppressMovable) {
            return;
        }
        if (this.getGridOptionsWrapper().isForPrint()) {
            // don't allow moving of headers when forPrint, as the header overlay doesn't exist
            return;
        }
        if (this.eHeaderCellLabel) {
            new moveColumnController_1.MoveColumnController(this.column, this.eHeaderCellLabel, eRoot, this.eHeaderCell, this.headerRenderer, this.columnController, dragService, gridPanel, this.getGridOptionsWrapper());
        }
    };
    RenderedHeaderCell.prototype.addResize = function (eRoot, dragService) {
        var _this = this;
        var colDef = this.column.getColDef();
        var eResize = this.eHeaderCell.querySelector('#agResizeBar');
        // if no eResize in template, do nothing
        if (!eResize) {
            return;
        }
        var weWantResize = this.getGridOptionsWrapper().isEnableColResize() && !colDef.suppressResize;
        if (!weWantResize) {
            utils_1.default.removeFromParent(eResize);
            return;
        }
        dragService.addDragHandling({
            eDraggableElement: eResize,
            eBody: eRoot,
            cursor: 'col-resize',
            startAfterPixels: 0,
            onDragStart: this.onDragStart.bind(this),
            onDragging: this.onDragging.bind(this)
        });
        var weWantAutoSize = !this.getGridOptionsWrapper().isSuppressAutoSize() && !colDef.suppressAutoSize;
        if (weWantAutoSize) {
            eResize.addEventListener('dblclick', function (event) {
                _this.columnController.autoSizeColumn(_this.column);
            });
        }
    };
    RenderedHeaderCell.prototype.useRenderer = function (headerNameValue, headerCellRenderer) {
        // renderer provided, use it
        var cellRendererParams = {
            colDef: this.column.getColDef(),
            $scope: this.childScope,
            context: this.getGridOptionsWrapper().getContext(),
            value: headerNameValue,
            api: this.getGridOptionsWrapper().getApi(),
            eHeaderCell: this.eHeaderCell
        };
        var cellRendererResult = headerCellRenderer(cellRendererParams);
        var childToAppend;
        if (utils_1.default.isNodeOrElement(cellRendererResult)) {
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
        if (this.getGridOptionsWrapper().isAngularCompileHeaders()) {
            var childToAppendCompiled = this.$compile(childToAppend)(this.childScope)[0];
            this.eText.appendChild(childToAppendCompiled);
        }
        else {
            this.eText.appendChild(childToAppend);
        }
    };
    RenderedHeaderCell.prototype.refreshFilterIcon = function () {
        var filterPresent = this.filterManager.isFilterPresentForCol(this.column.getColId());
        if (this.eFilterIcon) {
            utils_1.default.addOrRemoveCssClass(this.eHeaderCell, 'ag-header-cell-filtered', filterPresent);
            this.eFilterIcon.style.display = filterPresent ? 'inline' : 'none';
        }
    };
    RenderedHeaderCell.prototype.refreshSortIcon = function () {
        // update visibility of icons
        var sortAscending = this.column.getSort() === column_1.default.SORT_ASC;
        var sortDescending = this.column.getSort() === column_1.default.SORT_DESC;
        var sortNone = this.column.getSort() !== column_1.default.SORT_DESC && this.column.getSort() !== column_1.default.SORT_ASC;
        if (this.eSortAsc) {
            utils_1.default.setVisible(this.eSortAsc, sortAscending);
        }
        if (this.eSortDesc) {
            utils_1.default.setVisible(this.eSortDesc, sortDescending);
        }
        if (this.eSortNone) {
            utils_1.default.setVisible(this.eSortNone, sortNone);
        }
        utils_1.default.addOrRemoveCssClass(this.eHeaderCell, 'ag-header-cell-sorted-asc', sortAscending);
        utils_1.default.addOrRemoveCssClass(this.eHeaderCell, 'ag-header-cell-sorted-desc', sortDescending);
        utils_1.default.addOrRemoveCssClass(this.eHeaderCell, 'ag-header-cell-sorted-none', sortNone);
    };
    RenderedHeaderCell.prototype.getNextSortDirection = function () {
        var sortingOrder;
        if (this.column.getColDef().sortingOrder) {
            sortingOrder = this.column.getColDef().sortingOrder;
        }
        else if (this.getGridOptionsWrapper().getSortingOrder()) {
            sortingOrder = this.getGridOptionsWrapper().getSortingOrder();
        }
        else {
            sortingOrder = RenderedHeaderCell.DEFAULT_SORTING_ORDER;
        }
        if (!Array.isArray(sortingOrder) || sortingOrder.length <= 0) {
            console.warn('ag-grid: sortingOrder must be an array with at least one element, currently it\'s ' + sortingOrder);
            return;
        }
        var currentIndex = sortingOrder.indexOf(this.column.getSort());
        var notInArray = currentIndex < 0;
        var lastItemInArray = currentIndex == sortingOrder.length - 1;
        var result;
        if (notInArray || lastItemInArray) {
            result = sortingOrder[0];
        }
        else {
            result = sortingOrder[currentIndex + 1];
        }
        // verify the sort type exists, as the user could provide the sortOrder, need to make sure it's valid
        if (RenderedHeaderCell.DEFAULT_SORTING_ORDER.indexOf(result) < 0) {
            console.warn('ag-grid: invalid sort type ' + result);
            return null;
        }
        return result;
    };
    RenderedHeaderCell.prototype.addSortHandling = function () {
        var _this = this;
        if (!this.eHeaderCellLabel) {
            return;
        }
        this.eHeaderCellLabel.addEventListener("click", function (event) {
            // update sort on current col
            _this.column.setSort(_this.getNextSortDirection());
            // sortedAt used for knowing order of cols when multi-col sort
            if (_this.column.getSort()) {
                _this.column.setSortedAt(new Date().valueOf());
            }
            else {
                _this.column.setSortedAt(null);
            }
            var doingMultiSort = !_this.getGridOptionsWrapper().isSuppressMultiSort() && event.shiftKey;
            // clear sort on all columns except this one, and update the icons
            if (!doingMultiSort) {
                _this.columnController.clearSortBarThisColumn(_this.column);
            }
            _this.grid.onSortingChanged();
        });
    };
    RenderedHeaderCell.prototype.onDragStart = function () {
        this.startWidth = this.column.getActualWidth();
    };
    RenderedHeaderCell.prototype.onDragging = function (dragChange, finished) {
        var newWidth = this.startWidth + dragChange;
        this.columnController.setColumnWidth(this.column, newWidth, finished);
    };
    RenderedHeaderCell.prototype.onIndividualColumnResized = function (column) {
        if (this.column !== column) {
            return;
        }
        var newWidthPx = column.getActualWidth() + "px";
        this.eHeaderCell.style.width = newWidthPx;
    };
    RenderedHeaderCell.DEFAULT_SORTING_ORDER = [column_1.default.SORT_ASC, column_1.default.SORT_DESC, null];
    return RenderedHeaderCell;
})(renderedHeaderElement_1.default);
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = RenderedHeaderCell;
