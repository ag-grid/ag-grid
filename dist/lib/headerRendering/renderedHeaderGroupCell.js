/**
 * ag-grid - Advanced Data Grid / Data Table supporting Javascript / React / AngularJS / Web Components
 * @version v5.0.2
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
var svgFactory_1 = require("../svgFactory");
var columnController_1 = require("../columnController/columnController");
var filterManager_1 = require("../filter/filterManager");
var gridOptionsWrapper_1 = require("../gridOptionsWrapper");
var column_1 = require("../entities/column");
var horizontalDragService_1 = require("./horizontalDragService");
var context_1 = require("../context/context");
var cssClassApplier_1 = require("./cssClassApplier");
var dragAndDropService_1 = require("../dragAndDrop/dragAndDropService");
var setLeftFeature_1 = require("../rendering/features/setLeftFeature");
var svgFactory = svgFactory_1.SvgFactory.getInstance();
var RenderedHeaderGroupCell = (function () {
    function RenderedHeaderGroupCell(columnGroup, eRoot, dragSourceDropTarget) {
        this.destroyFunctions = [];
        this.columnGroup = columnGroup;
        this.eRoot = eRoot;
        this.dragSourceDropTarget = dragSourceDropTarget;
    }
    RenderedHeaderGroupCell.prototype.getGui = function () {
        return this.eHeaderGroupCell;
    };
    RenderedHeaderGroupCell.prototype.onIndividualColumnResized = function (column) {
        if (this.columnGroup.isChildInThisGroupDeepSearch(column)) {
            this.setWidth();
        }
    };
    RenderedHeaderGroupCell.prototype.init = function () {
        this.eHeaderGroupCell = document.createElement('div');
        cssClassApplier_1.CssClassApplier.addHeaderClassesFromCollDef(this.columnGroup.getColGroupDef(), this.eHeaderGroupCell, this.gridOptionsWrapper);
        this.displayName = this.columnGroup.getHeaderName();
        this.setupResize();
        this.addClasses();
        this.setupLabel();
        this.setupMove();
        this.setWidth();
        var setLeftFeature = new setLeftFeature_1.SetLeftFeature(this.columnGroup, this.eHeaderGroupCell);
        this.destroyFunctions.push(setLeftFeature.destroy.bind(setLeftFeature));
    };
    RenderedHeaderGroupCell.prototype.setupLabel = function () {
        // no renderer, default text render
        if (this.displayName && this.displayName !== '') {
            var eGroupCellLabel = document.createElement("div");
            eGroupCellLabel.className = 'ag-header-group-cell-label';
            this.eHeaderGroupCell.appendChild(eGroupCellLabel);
            if (utils_1.Utils.isBrowserSafari()) {
                eGroupCellLabel.style.display = 'table-cell';
            }
            var eInnerText = document.createElement("span");
            eInnerText.className = 'ag-header-group-text';
            eInnerText.innerHTML = this.displayName;
            eGroupCellLabel.appendChild(eInnerText);
            if (this.columnGroup.isExpandable()) {
                this.addGroupExpandIcon(eGroupCellLabel);
            }
        }
    };
    RenderedHeaderGroupCell.prototype.addClasses = function () {
        utils_1.Utils.addCssClass(this.eHeaderGroupCell, 'ag-header-group-cell');
        // having different classes below allows the style to not have a bottom border
        // on the group header, if no group is specified
        if (this.columnGroup.getColGroupDef()) {
            utils_1.Utils.addCssClass(this.eHeaderGroupCell, 'ag-header-group-cell-with-group');
        }
        else {
            utils_1.Utils.addCssClass(this.eHeaderGroupCell, 'ag-header-group-cell-no-group');
        }
    };
    RenderedHeaderGroupCell.prototype.setupResize = function () {
        var _this = this;
        if (!this.gridOptionsWrapper.isEnableColResize()) {
            return;
        }
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
    };
    RenderedHeaderGroupCell.prototype.isSuppressMoving = function () {
        // if any child is fixed, then don't allow moving
        var childSuppressesMoving = false;
        this.columnGroup.getLeafColumns().forEach(function (column) {
            if (column.getColDef().suppressMovable) {
                childSuppressesMoving = true;
            }
        });
        var result = childSuppressesMoving
            || this.gridOptionsWrapper.isSuppressMovableColumns()
            || this.gridOptionsWrapper.isForPrint()
            || this.columnController.isPivotMode();
        return result;
    };
    RenderedHeaderGroupCell.prototype.setupMove = function () {
        var eLabel = this.eHeaderGroupCell.querySelector('.ag-header-group-cell-label');
        if (!eLabel) {
            return;
        }
        if (this.isSuppressMoving()) {
            return;
        }
        if (eLabel) {
            var dragSource = {
                eElement: eLabel,
                dragItemName: this.displayName,
                // we add in the original group leaf columns, so we move both visible and non-visible items
                dragItem: this.getAllColumnsInThisGroup(),
                dragSourceDropTarget: this.dragSourceDropTarget
            };
            this.dragAndDropService.addDragSource(dragSource);
        }
    };
    // when moving the columns, we want to move all the columns in this group in one go, and in the order they
    // are currently in the screen.
    RenderedHeaderGroupCell.prototype.getAllColumnsInThisGroup = function () {
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
    RenderedHeaderGroupCell.prototype.setWidth = function () {
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
            eGroupIcon = utils_1.Utils.createIcon('columnGroupOpened', this.gridOptionsWrapper, null, svgFactory.createGroupContractedIcon);
        }
        else {
            eGroupIcon = utils_1.Utils.createIcon('columnGroupClosed', this.gridOptionsWrapper, null, svgFactory.createGroupExpandedIcon);
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
        context_1.Autowired('horizontalDragService'), 
        __metadata('design:type', horizontalDragService_1.HorizontalDragService)
    ], RenderedHeaderGroupCell.prototype, "dragService", void 0);
    __decorate([
        context_1.Autowired('columnController'), 
        __metadata('design:type', columnController_1.ColumnController)
    ], RenderedHeaderGroupCell.prototype, "columnController", void 0);
    __decorate([
        context_1.Autowired('dragAndDropService'), 
        __metadata('design:type', dragAndDropService_1.DragAndDropService)
    ], RenderedHeaderGroupCell.prototype, "dragAndDropService", void 0);
    __decorate([
        context_1.PostConstruct, 
        __metadata('design:type', Function), 
        __metadata('design:paramtypes', []), 
        __metadata('design:returntype', void 0)
    ], RenderedHeaderGroupCell.prototype, "init", null);
    return RenderedHeaderGroupCell;
})();
exports.RenderedHeaderGroupCell = RenderedHeaderGroupCell;
