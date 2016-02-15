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
var svgFactory_1 = require("../svgFactory");
var renderedHeaderElement_1 = require("./renderedHeaderElement");
var svgFactory = svgFactory_1.default.getInstance();
var RenderedHeaderGroupCell = (function (_super) {
    __extends(RenderedHeaderGroupCell, _super);
    function RenderedHeaderGroupCell(columnGroup, gridOptionsWrapper, columnController, eRoot, parentScope, filterManager, $compile, dragService) {
        _super.call(this, gridOptionsWrapper);
        this.columnController = columnController;
        this.columnGroup = columnGroup;
        this.parentScope = parentScope;
        this.filterManager = filterManager;
        this.$compile = $compile;
        this.setupComponents(eRoot, dragService);
    }
    RenderedHeaderGroupCell.prototype.getGui = function () {
        return this.eHeaderGroupCell;
    };
    RenderedHeaderGroupCell.prototype.onIndividualColumnResized = function (column) {
        if (this.columnGroup.isChildInThisGroupDeepSearch(column)) {
            this.setWidthOfGroupHeaderCell();
        }
    };
    RenderedHeaderGroupCell.prototype.setupComponents = function (eRoot, dragService) {
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
        this.addHeaderClassesFromCollDef(this.columnGroup.getColGroupDef(), this.eHeaderGroupCell);
        if (this.getGridOptionsWrapper().isEnableColResize()) {
            this.eHeaderCellResize = document.createElement("div");
            this.eHeaderCellResize.className = "ag-header-cell-resize";
            this.eHeaderGroupCell.appendChild(this.eHeaderCellResize);
            dragService.addDragHandling({
                eDraggableElement: this.eHeaderCellResize,
                eBody: eRoot,
                cursor: 'col-resize',
                startAfterPixels: 0,
                onDragStart: this.onDragStart.bind(this),
                onDragging: this.onDragging.bind(this)
            });
            if (!this.getGridOptionsWrapper().isSuppressAutoSize()) {
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
            if (utils_1.default.isBrowserSafari()) {
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
        this.eHeaderGroupCell.style.width = utils_1.default.formatWidth(this.columnGroup.getActualWidth());
    };
    RenderedHeaderGroupCell.prototype.addGroupExpandIcon = function (eGroupCellLabel) {
        var eGroupIcon;
        if (this.columnGroup.isExpanded()) {
            eGroupIcon = utils_1.default.createIcon('columnGroupOpened', this.getGridOptionsWrapper(), null, svgFactory.createArrowLeftSvg);
        }
        else {
            eGroupIcon = utils_1.default.createIcon('columnGroupClosed', this.getGridOptionsWrapper(), null, svgFactory.createArrowRightSvg);
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
        // set the new width to the group header
        //var newWidthPx = newWidth + "px";
        //this.eHeaderGroupCell.style.width = newWidthPx;
        //this.columnGroup.actualWidth = newWidth;
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
    return RenderedHeaderGroupCell;
})(renderedHeaderElement_1.default);
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = RenderedHeaderGroupCell;
