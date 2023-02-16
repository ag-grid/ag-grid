/**
 * @ag-grid-community/core - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue
 * @version v29.1.0
 * @link https://www.ag-grid.com/
 * @license MIT
 */
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.GroupResizeFeature = void 0;
var beanStub_1 = require("../../../context/beanStub");
var context_1 = require("../../../context/context");
var GroupResizeFeature = /** @class */ (function (_super) {
    __extends(GroupResizeFeature, _super);
    function GroupResizeFeature(comp, eResize, pinned, columnGroup) {
        var _this = _super.call(this) || this;
        _this.eResize = eResize;
        _this.comp = comp;
        _this.pinned = pinned;
        _this.columnGroup = columnGroup;
        return _this;
    }
    GroupResizeFeature.prototype.postConstruct = function () {
        var _this = this;
        if (!this.columnGroup.isResizable()) {
            this.comp.setResizableDisplayed(false);
            return;
        }
        var finishedWithResizeFunc = this.horizontalResizeService.addResizeBar({
            eResizeBar: this.eResize,
            onResizeStart: this.onResizeStart.bind(this),
            onResizing: this.onResizing.bind(this, false),
            onResizeEnd: this.onResizing.bind(this, true)
        });
        this.addDestroyFunc(finishedWithResizeFunc);
        if (!this.gridOptionsService.is('suppressAutoSize')) {
            var skipHeaderOnAutoSize_1 = this.gridOptionsService.is('skipHeaderOnAutoSize');
            this.eResize.addEventListener('dblclick', function () {
                // get list of all the column keys we are responsible for
                var keys = [];
                var leafCols = _this.columnGroup.getDisplayedLeafColumns();
                leafCols.forEach(function (column) {
                    // not all cols in the group may be participating with auto-resize
                    if (!column.getColDef().suppressAutoSize) {
                        keys.push(column.getColId());
                    }
                });
                if (keys.length > 0) {
                    _this.columnModel.autoSizeColumns({
                        columns: keys,
                        skipHeader: skipHeaderOnAutoSize_1,
                        stopAtGroup: _this.columnGroup,
                        source: 'uiColumnResized'
                    });
                }
                _this.resizeLeafColumnsToFit();
            });
        }
    };
    GroupResizeFeature.prototype.onResizeStart = function (shiftKey) {
        var _this = this;
        this.calculateInitialValues();
        var takeFromGroup = null;
        if (shiftKey) {
            takeFromGroup = this.columnModel.getDisplayedGroupAfter(this.columnGroup);
        }
        if (takeFromGroup) {
            var takeFromLeafCols = takeFromGroup.getDisplayedLeafColumns();
            this.resizeTakeFromCols = takeFromLeafCols.filter(function (col) { return col.isResizable(); });
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
        this.comp.addOrRemoveCssClass('ag-column-resizing', true);
    };
    GroupResizeFeature.prototype.onResizing = function (finished, resizeAmount) {
        var resizeAmountNormalised = this.normaliseDragChange(resizeAmount);
        var width = this.resizeStartWidth + resizeAmountNormalised;
        this.resizeColumns(width, finished);
    };
    GroupResizeFeature.prototype.resizeLeafColumnsToFit = function () {
        var preferredSize = this.autoWidthCalculator.getPreferredWidthForColumnGroup(this.columnGroup);
        this.calculateInitialValues();
        if (preferredSize > this.resizeStartWidth) {
            this.resizeColumns(preferredSize, true);
        }
    };
    GroupResizeFeature.prototype.resizeColumns = function (totalWidth, finished) {
        if (finished === void 0) { finished = true; }
        var resizeSets = [];
        resizeSets.push({
            columns: this.resizeCols,
            ratios: this.resizeRatios,
            width: totalWidth
        });
        if (this.resizeTakeFromCols) {
            var diff = totalWidth - this.resizeStartWidth;
            resizeSets.push({
                columns: this.resizeTakeFromCols,
                ratios: this.resizeTakeFromRatios,
                width: this.resizeTakeFromStartWidth - diff
            });
        }
        this.columnModel.resizeColumnSets({
            resizeSets: resizeSets,
            finished: finished,
            source: 'uiColumnDragged'
        });
        if (finished) {
            this.comp.addOrRemoveCssClass('ag-column-resizing', false);
        }
    };
    GroupResizeFeature.prototype.calculateInitialValues = function () {
        var _this = this;
        var leafCols = this.columnGroup.getDisplayedLeafColumns();
        this.resizeCols = leafCols.filter(function (col) { return col.isResizable(); });
        this.resizeStartWidth = 0;
        this.resizeCols.forEach(function (col) { return _this.resizeStartWidth += col.getActualWidth(); });
        this.resizeRatios = [];
        this.resizeCols.forEach(function (col) { return _this.resizeRatios.push(col.getActualWidth() / _this.resizeStartWidth); });
    };
    // optionally inverts the drag, depending on pinned and RTL
    // note - this method is duplicated in RenderedHeaderCell - should refactor out?
    GroupResizeFeature.prototype.normaliseDragChange = function (dragChange) {
        var result = dragChange;
        if (this.gridOptionsService.is('enableRtl')) {
            // for RTL, dragging left makes the col bigger, except when pinning left
            if (this.pinned !== 'left') {
                result *= -1;
            }
        }
        else if (this.pinned === 'right') {
            // for LTR (ie normal), dragging left makes the col smaller, except when pinning right
            result *= -1;
        }
        return result;
    };
    __decorate([
        context_1.Autowired('horizontalResizeService')
    ], GroupResizeFeature.prototype, "horizontalResizeService", void 0);
    __decorate([
        context_1.Autowired('autoWidthCalculator')
    ], GroupResizeFeature.prototype, "autoWidthCalculator", void 0);
    __decorate([
        context_1.Autowired('columnModel')
    ], GroupResizeFeature.prototype, "columnModel", void 0);
    __decorate([
        context_1.PostConstruct
    ], GroupResizeFeature.prototype, "postConstruct", null);
    return GroupResizeFeature;
}(beanStub_1.BeanStub));
exports.GroupResizeFeature = GroupResizeFeature;
