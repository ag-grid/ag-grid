/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v5.0.6
 * @link http://www.ag-grid.com/
 * @license MIT
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var utils_1 = require("../utils");
var column_1 = require("../entities/column");
var filterManager_1 = require("../filter/filterManager");
var columnController_1 = require("../columnController/columnController");
var headerTemplateLoader_1 = require("./headerTemplateLoader");
var gridOptionsWrapper_1 = require("../gridOptionsWrapper");
var horizontalDragService_1 = require("./horizontalDragService");
var gridCore_1 = require("../gridCore");
var context_1 = require("../context/context");
var cssClassApplier_1 = require("./cssClassApplier");
var dragAndDropService_1 = require("../dragAndDrop/dragAndDropService");
var sortController_1 = require("../sortController");
var setLeftFeature_1 = require("../rendering/features/setLeftFeature");
var RenderedHeaderCell = (function () {
    function RenderedHeaderCell(column, eRoot, dragSourceDropTarget) {
        // for better structured code, anything we need to do when this column gets destroyed,
        // we put a function in here. otherwise we would have a big destroy function with lots
        // of 'if / else' mapping to things that got created.
        this.destroyFunctions = [];
        this.column = column;
        this.eRoot = eRoot;
        this.dragSourceDropTarget = dragSourceDropTarget;
    }
    RenderedHeaderCell.prototype.getColumn = function () {
        return this.column;
    };
    RenderedHeaderCell.prototype.init = function () {
        this.eHeaderCell = this.headerTemplateLoader.createHeaderElement(this.column);
        utils_1.Utils.addCssClass(this.eHeaderCell, 'ag-header-cell');
        this.createScope();
        this.addAttributes();
        cssClassApplier_1.CssClassApplier.addHeaderClassesFromCollDef(this.column.getColDef(), this.eHeaderCell, this.gridOptionsWrapper);
        // label div
        var eHeaderCellLabel = this.eHeaderCell.querySelector('#agHeaderCellLabel');
        this.displayName = this.columnController.getDisplayNameForCol(this.column, true);
        this.setupMovingCss();
        this.setupTooltip();
        this.setupResize();
        this.setupMove(eHeaderCellLabel);
        this.setupMenu();
        this.setupSort(eHeaderCellLabel);
        this.setupFilterIcon();
        this.setupText();
        this.setupWidth();
        var setLeftFeature = new setLeftFeature_1.SetLeftFeature(this.column, this.eHeaderCell);
        this.destroyFunctions.push(setLeftFeature.destroy.bind(setLeftFeature));
    };
    RenderedHeaderCell.prototype.setupTooltip = function () {
        var colDef = this.column.getColDef();
        // add tooltip if exists
        if (colDef.headerTooltip) {
            this.eHeaderCell.title = colDef.headerTooltip;
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
        var eText = this.eHeaderCell.querySelector('#agText');
        if (eText) {
            if (headerCellRenderer) {
                this.useRenderer(this.displayName, headerCellRenderer, eText);
            }
            else {
                // no renderer, default text render
                eText.className = 'ag-header-cell-text';
                eText.innerHTML = this.displayName;
            }
        }
    };
    RenderedHeaderCell.prototype.setupFilterIcon = function () {
        var _this = this;
        var eFilterIcon = this.eHeaderCell.querySelector('#agFilter');
        if (!eFilterIcon) {
            return;
        }
        var filterChangedListener = function () {
            var filterPresent = _this.column.isFilterActive();
            utils_1.Utils.addOrRemoveCssClass(_this.eHeaderCell, 'ag-header-cell-filtered', filterPresent);
            utils_1.Utils.addOrRemoveCssClass(eFilterIcon, 'ag-hidden', !filterPresent);
        };
        this.column.addEventListener(column_1.Column.EVENT_FILTER_ACTIVE_CHANGED, filterChangedListener);
        this.destroyFunctions.push(function () {
            _this.column.removeEventListener(column_1.Column.EVENT_FILTER_ACTIVE_CHANGED, filterChangedListener);
        });
        filterChangedListener();
    };
    RenderedHeaderCell.prototype.setupWidth = function () {
        var _this = this;
        var widthChangedListener = function () {
            _this.eHeaderCell.style.width = _this.column.getActualWidth() + 'px';
        };
        this.column.addEventListener(column_1.Column.EVENT_WIDTH_CHANGED, widthChangedListener);
        this.destroyFunctions.push(function () {
            _this.column.removeEventListener(column_1.Column.EVENT_WIDTH_CHANGED, widthChangedListener);
        });
        widthChangedListener();
    };
    RenderedHeaderCell.prototype.getGui = function () {
        return this.eHeaderCell;
    };
    RenderedHeaderCell.prototype.destroy = function () {
        this.destroyFunctions.forEach(function (func) {
            func();
        });
    };
    RenderedHeaderCell.prototype.createScope = function () {
        var _this = this;
        if (this.gridOptionsWrapper.isAngularCompileHeaders()) {
            this.childScope = this.$scope.$new();
            this.childScope.colDef = this.column.getColDef();
            this.childScope.colDefWrapper = this.column;
            this.childScope.context = this.gridOptionsWrapper.getContext();
            this.destroyFunctions.push(function () {
                _this.childScope.$destroy();
            });
        }
    };
    RenderedHeaderCell.prototype.addAttributes = function () {
        this.eHeaderCell.setAttribute("colId", this.column.getColId());
    };
    RenderedHeaderCell.prototype.setupMenu = function () {
        var _this = this;
        var eMenu = this.eHeaderCell.querySelector('#agMenu');
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
            this.eHeaderCell.addEventListener('mouseover', function () {
                eMenu.style.opacity = '1';
            });
            this.eHeaderCell.addEventListener('mouseout', function () {
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
        var _this = this;
        // this function adds or removes the moving css, based on if the col is moving
        var addMovingCssFunc = function () {
            if (_this.column.isMoving()) {
                utils_1.Utils.addCssClass(_this.eHeaderCell, 'ag-header-cell-moving');
            }
            else {
                utils_1.Utils.removeCssClass(_this.eHeaderCell, 'ag-header-cell-moving');
            }
        };
        // call it now once, so the col is set up correctly
        addMovingCssFunc();
        // then call it every time we are informed of a moving state change in the col
        this.column.addEventListener(column_1.Column.EVENT_MOVING_CHANGED, addMovingCssFunc);
        // finally we remove the listener when this cell is no longer rendered
        this.destroyFunctions.push(function () {
            _this.column.removeEventListener(column_1.Column.EVENT_MOVING_CHANGED, addMovingCssFunc);
        });
    };
    RenderedHeaderCell.prototype.setupMove = function (eHeaderCellLabel) {
        var suppressMove = this.gridOptionsWrapper.isSuppressMovableColumns()
            || this.column.getColDef().suppressMovable
            || this.gridOptionsWrapper.isForPrint()
            || this.columnController.isPivotMode();
        if (suppressMove) {
            return;
        }
        if (eHeaderCellLabel) {
            var dragSource = {
                eElement: eHeaderCellLabel,
                dragItem: [this.column],
                dragItemName: this.displayName,
                dragSourceDropTarget: this.dragSourceDropTarget
            };
            this.dragAndDropService.addDragSource(dragSource);
        }
    };
    RenderedHeaderCell.prototype.setupResize = function () {
        var _this = this;
        var colDef = this.column.getColDef();
        var eResize = this.eHeaderCell.querySelector('#agResizeBar');
        // if no eResize in template, do nothing
        if (!eResize) {
            return;
        }
        var weWantResize = this.gridOptionsWrapper.isEnableColResize() && !colDef.suppressResize;
        if (!weWantResize) {
            utils_1.Utils.removeFromParent(eResize);
            return;
        }
        this.dragService.addDragHandling({
            eDraggableElement: eResize,
            eBody: this.eRoot,
            cursor: 'col-resize',
            startAfterPixels: 0,
            onDragStart: this.onDragStart.bind(this),
            onDragging: this.onDragging.bind(this)
        });
        var weWantAutoSize = !this.gridOptionsWrapper.isSuppressAutoSize() && !colDef.suppressAutoSize;
        if (weWantAutoSize) {
            eResize.addEventListener('dblclick', function () {
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
            eHeaderCell: this.eHeaderCell
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
        if (!enableSorting) {
            utils_1.Utils.removeFromParent(this.eHeaderCell.querySelector('#agSortAsc'));
            utils_1.Utils.removeFromParent(this.eHeaderCell.querySelector('#agSortDesc'));
            utils_1.Utils.removeFromParent(this.eHeaderCell.querySelector('#agNoSort'));
            return;
        }
        // add sortable class for styling
        utils_1.Utils.addCssClass(this.eHeaderCell, 'ag-header-cell-sortable');
        // add the event on the header, so when clicked, we do sorting
        if (eHeaderCellLabel) {
            eHeaderCellLabel.addEventListener("click", function (event) {
                _this.sortController.progressSort(_this.column, event.shiftKey);
            });
        }
        // add listener for sort changing, and update the icons accordingly
        var eSortAsc = this.eHeaderCell.querySelector('#agSortAsc');
        var eSortDesc = this.eHeaderCell.querySelector('#agSortDesc');
        var eSortNone = this.eHeaderCell.querySelector('#agNoSort');
        var sortChangedListener = function () {
            utils_1.Utils.addOrRemoveCssClass(_this.eHeaderCell, 'ag-header-cell-sorted-asc', _this.column.isSortAscending());
            utils_1.Utils.addOrRemoveCssClass(_this.eHeaderCell, 'ag-header-cell-sorted-desc', _this.column.isSortDescending());
            utils_1.Utils.addOrRemoveCssClass(_this.eHeaderCell, 'ag-header-cell-sorted-none', _this.column.isSortNone());
            if (eSortAsc) {
                utils_1.Utils.addOrRemoveCssClass(eSortAsc, 'ag-hidden', !_this.column.isSortAscending());
            }
            if (eSortDesc) {
                utils_1.Utils.addOrRemoveCssClass(eSortDesc, 'ag-hidden', !_this.column.isSortDescending());
            }
            if (eSortNone) {
                var alwaysHideNoSort = !_this.column.getColDef().unSortIcon && !_this.gridOptionsWrapper.isUnSortIcon();
                utils_1.Utils.addOrRemoveCssClass(eSortNone, 'ag-hidden', alwaysHideNoSort || !_this.column.isSortNone());
            }
        };
        this.column.addEventListener(column_1.Column.EVENT_SORT_CHANGED, sortChangedListener);
        this.destroyFunctions.push(function () {
            _this.column.removeEventListener(column_1.Column.EVENT_SORT_CHANGED, sortChangedListener);
        });
        sortChangedListener();
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
    __decorate([
        context_1.Autowired('context'), 
        __metadata('design:type', context_1.Context)
    ], RenderedHeaderCell.prototype, "context", void 0);
    __decorate([
        context_1.Autowired('filterManager'), 
        __metadata('design:type', filterManager_1.FilterManager)
    ], RenderedHeaderCell.prototype, "filterManager", void 0);
    __decorate([
        context_1.Autowired('columnController'), 
        __metadata('design:type', columnController_1.ColumnController)
    ], RenderedHeaderCell.prototype, "columnController", void 0);
    __decorate([
        context_1.Autowired('$compile'), 
        __metadata('design:type', Object)
    ], RenderedHeaderCell.prototype, "$compile", void 0);
    __decorate([
        context_1.Autowired('gridCore'), 
        __metadata('design:type', gridCore_1.GridCore)
    ], RenderedHeaderCell.prototype, "gridCore", void 0);
    __decorate([
        context_1.Autowired('headerTemplateLoader'), 
        __metadata('design:type', headerTemplateLoader_1.HeaderTemplateLoader)
    ], RenderedHeaderCell.prototype, "headerTemplateLoader", void 0);
    __decorate([
        context_1.Autowired('horizontalDragService'), 
        __metadata('design:type', horizontalDragService_1.HorizontalDragService)
    ], RenderedHeaderCell.prototype, "dragService", void 0);
    __decorate([
        context_1.Autowired('menuFactory'), 
        __metadata('design:type', Object)
    ], RenderedHeaderCell.prototype, "menuFactory", void 0);
    __decorate([
        context_1.Autowired('gridOptionsWrapper'), 
        __metadata('design:type', gridOptionsWrapper_1.GridOptionsWrapper)
    ], RenderedHeaderCell.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        context_1.Autowired('dragAndDropService'), 
        __metadata('design:type', dragAndDropService_1.DragAndDropService)
    ], RenderedHeaderCell.prototype, "dragAndDropService", void 0);
    __decorate([
        context_1.Autowired('sortController'), 
        __metadata('design:type', sortController_1.SortController)
    ], RenderedHeaderCell.prototype, "sortController", void 0);
    __decorate([
        context_1.Autowired('$scope'), 
        __metadata('design:type', Object)
    ], RenderedHeaderCell.prototype, "$scope", void 0);
    __decorate([
        context_1.PostConstruct, 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', []), 
        __metadata('design:returntype', void 0)
    ], RenderedHeaderCell.prototype, "init", null);
    return RenderedHeaderCell;
})();
exports.RenderedHeaderCell = RenderedHeaderCell;
