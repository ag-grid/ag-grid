/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v4.0.5
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
var utils_1 = require('../utils');
var svgFactory_1 = require("../svgFactory");
var columnController_1 = require("../columnController/columnController");
var filterManager_1 = require("../filter/filterManager");
var gridOptionsWrapper_1 = require("../gridOptionsWrapper");
var column_1 = require("../entities/column");
var horizontalDragService_1 = require("./horizontalDragService");
var context_1 = require("../context/context");
var cssClassApplier_1 = require("./cssClassApplier");
var context_2 = require("../context/context");
var svgFactory = svgFactory_1.SvgFactory.getInstance();
var RenderedHeaderGroupCell = (function () {
    function RenderedHeaderGroupCell(columnGroup, eRoot, parentScope) {
        this.destroyFunctions = [];
        this.columnGroup = columnGroup;
        this.parentScope = parentScope;
        this.eRoot = eRoot;
        this.parentScope = parentScope;
    }
    // required by interface, but we don't use
    RenderedHeaderGroupCell.prototype.refreshFilterIcon = function () { };
    // required by interface, but we don't use
    RenderedHeaderGroupCell.prototype.refreshSortIcon = function () { };
    RenderedHeaderGroupCell.prototype.getGui = function () {
        return this.eHeaderGroupCell;
    };
    RenderedHeaderGroupCell.prototype.onIndividualColumnResized = function (column) {
        if (this.columnGroup.isChildInThisGroupDeepSearch(column)) {
            this.setWidthOfGroupHeaderCell();
        }
    };
    RenderedHeaderGroupCell.prototype.init = function () {
        var _this = this;
        this.eHeaderGroupCell = document.createElement('div');
        var classNames = ['ag-header-group-cell'];
        // having different classes below allows the style to not have a bottom border
        // on the group header, if no group is specified
        if (this.columnGroup.getColGroupDef()) {
            classNames.push('ag-header-group-cell-with-group');
        }
        else {
            classNames.push('ag-header-group-cell-no-group');
        }
        this.eHeaderGroupCell.className = classNames.join(' ');
        //this.eHeaderGroupCell.style.height = this.getGridOptionsWrapper().getHeaderHeight() + 'px';
        cssClassApplier_1.CssClassApplier.addHeaderClassesFromCollDef(this.columnGroup.getColGroupDef(), this.eHeaderGroupCell, this.gridOptionsWrapper);
        if (this.gridOptionsWrapper.isEnableColResize()) {
            this.eHeaderCellResize = document.createElement("div");
            this.eHeaderCellResize.className = "ag-header-cell-resize";
            this.eHeaderGroupCell.appendChild(this.eHeaderCellResize);
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
        }
        // no renderer, default text render
        var groupName = this.columnGroup.getHeaderName();
        if (groupName && groupName !== '') {
            var eGroupCellLabel = document.createElement("div");
            eGroupCellLabel.className = 'ag-header-group-cell-label';
            this.eHeaderGroupCell.appendChild(eGroupCellLabel);
            if (utils_1.Utils.isBrowserSafari()) {
                eGroupCellLabel.style.display = 'table-cell';
            }
            var eInnerText = document.createElement("span");
            eInnerText.className = 'ag-header-group-text';
            eInnerText.innerHTML = groupName;
            eGroupCellLabel.appendChild(eInnerText);
            if (this.columnGroup.isExpandable()) {
                this.addGroupExpandIcon(eGroupCellLabel);
            }
        }
        this.setWidthOfGroupHeaderCell();
    };
    RenderedHeaderGroupCell.prototype.setWidthOfGroupHeaderCell = function () {
        var _this = this;
        var widthChangedListener = function () {
            _this.eHeaderGroupCell.style.width = _this.columnGroup.getActualWidth() + 'px';
        };
        this.columnGroup.getLeafColumns().forEach(function (column) {
            column.addEventListener(column_1.Column.EVENT_WIDTH_CHANGED, widthChangedListener);
            _this.destroyFunctions.push(function () {
                column.removeEventListener(column_1.Column.EVENT_WIDTH_CHANGED, widthChangedListener);
            });
        });
        widthChangedListener();
    };
    RenderedHeaderGroupCell.prototype.destroy = function () {
        this.destroyFunctions.forEach(function (func) {
            func();
        });
    };
    RenderedHeaderGroupCell.prototype.addGroupExpandIcon = function (eGroupCellLabel) {
        var eGroupIcon;
        if (this.columnGroup.isExpanded()) {
            eGroupIcon = utils_1.Utils.createIcon('columnGroupOpened', this.gridOptionsWrapper, null, svgFactory.createArrowLeftSvg);
        }
        else {
            eGroupIcon = utils_1.Utils.createIcon('columnGroupClosed', this.gridOptionsWrapper, null, svgFactory.createArrowRightSvg);
        }
        eGroupIcon.className = 'ag-header-expand-icon';
        eGroupCellLabel.appendChild(eGroupIcon);
        var that = this;
        eGroupIcon.onclick = function () {
            var newExpandedValue = !that.columnGroup.isExpanded();
            that.columnController.setColumnGroupOpened(that.columnGroup, newExpandedValue);
        };
    };
    RenderedHeaderGroupCell.prototype.onDragStart = function () {
        var _this = this;
        this.groupWidthStart = this.columnGroup.getActualWidth();
        this.childrenWidthStarts = [];
        this.columnGroup.getDisplayedLeafColumns().forEach(function (column) {
            _this.childrenWidthStarts.push(column.getActualWidth());
        });
    };
    RenderedHeaderGroupCell.prototype.onDragging = function (dragChange, finished) {
        var _this = this;
        var newWidth = this.groupWidthStart + dragChange;
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
    __decorate([
        context_1.Autowired('filterManager'), 
        __metadata('design:type', filterManager_1.FilterManager)
    ], RenderedHeaderGroupCell.prototype, "filterManager", void 0);
    __decorate([
        context_1.Autowired('gridOptionsWrapper'), 
        __metadata('design:type', gridOptionsWrapper_1.GridOptionsWrapper)
    ], RenderedHeaderGroupCell.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        context_1.Autowired('$compile'), 
        __metadata('design:type', Object)
    ], RenderedHeaderGroupCell.prototype, "$compile", void 0);
    __decorate([
        context_1.Autowired('horizontalDragService'), 
        __metadata('design:type', horizontalDragService_1.HorizontalDragService)
    ], RenderedHeaderGroupCell.prototype, "dragService", void 0);
    __decorate([
        context_1.Autowired('columnController'), 
        __metadata('design:type', columnController_1.ColumnController)
    ], RenderedHeaderGroupCell.prototype, "columnController", void 0);
    __decorate([
        context_2.PostConstruct, 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', []), 
        __metadata('design:returntype', void 0)
    ], RenderedHeaderGroupCell.prototype, "init", null);
    return RenderedHeaderGroupCell;
})();
exports.RenderedHeaderGroupCell = RenderedHeaderGroupCell;
