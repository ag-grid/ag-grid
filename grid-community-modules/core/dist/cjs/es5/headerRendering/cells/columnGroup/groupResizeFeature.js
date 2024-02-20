"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
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
        if (!this.gridOptionsService.get('suppressAutoSize')) {
            var skipHeaderOnAutoSize_1 = this.gridOptionsService.get('skipHeaderOnAutoSize');
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
                _this.resizeLeafColumnsToFit('uiColumnResized');
            });
        }
    };
    GroupResizeFeature.prototype.onResizeStart = function (shiftKey) {
        var initialValues = this.getInitialValues(shiftKey);
        this.storeLocalValues(initialValues);
        this.toggleColumnResizing(true);
    };
    GroupResizeFeature.prototype.onResizing = function (finished, resizeAmount, source) {
        if (source === void 0) { source = 'uiColumnResized'; }
        var resizeAmountNormalised = this.normaliseDragChange(resizeAmount);
        var width = this.resizeStartWidth + resizeAmountNormalised;
        this.resizeColumnsFromLocalValues(width, source, finished);
    };
    GroupResizeFeature.prototype.getInitialValues = function (shiftKey) {
        var columnsToResize = this.getColumnsToResize();
        var resizeStartWidth = this.getInitialSizeOfColumns(columnsToResize);
        var resizeRatios = this.getSizeRatiosOfColumns(columnsToResize, resizeStartWidth);
        var columnSizeAndRatios = {
            columnsToResize: columnsToResize,
            resizeStartWidth: resizeStartWidth,
            resizeRatios: resizeRatios
        };
        var groupAfter = null;
        if (shiftKey) {
            groupAfter = this.columnModel.getDisplayedGroupAfter(this.columnGroup);
        }
        if (groupAfter) {
            var takeFromLeafCols = groupAfter.getDisplayedLeafColumns();
            var groupAfterColumns = columnSizeAndRatios.groupAfterColumns = takeFromLeafCols.filter(function (col) { return col.isResizable(); });
            var groupAfterStartWidth = columnSizeAndRatios.groupAfterStartWidth = this.getInitialSizeOfColumns(groupAfterColumns);
            columnSizeAndRatios.groupAfterRatios = this.getSizeRatiosOfColumns(groupAfterColumns, groupAfterStartWidth);
        }
        else {
            columnSizeAndRatios.groupAfterColumns = undefined;
            columnSizeAndRatios.groupAfterStartWidth = undefined;
            columnSizeAndRatios.groupAfterRatios = undefined;
        }
        return columnSizeAndRatios;
    };
    GroupResizeFeature.prototype.storeLocalValues = function (initialValues) {
        var columnsToResize = initialValues.columnsToResize, resizeStartWidth = initialValues.resizeStartWidth, resizeRatios = initialValues.resizeRatios, groupAfterColumns = initialValues.groupAfterColumns, groupAfterStartWidth = initialValues.groupAfterStartWidth, groupAfterRatios = initialValues.groupAfterRatios;
        this.resizeCols = columnsToResize;
        this.resizeStartWidth = resizeStartWidth;
        this.resizeRatios = resizeRatios;
        this.resizeTakeFromCols = groupAfterColumns;
        this.resizeTakeFromStartWidth = groupAfterStartWidth;
        this.resizeTakeFromRatios = groupAfterRatios;
    };
    GroupResizeFeature.prototype.clearLocalValues = function () {
        this.resizeCols = undefined;
        this.resizeRatios = undefined;
        this.resizeTakeFromCols = undefined;
        this.resizeTakeFromRatios = undefined;
    };
    GroupResizeFeature.prototype.resizeLeafColumnsToFit = function (source) {
        var preferredSize = this.autoWidthCalculator.getPreferredWidthForColumnGroup(this.columnGroup);
        var initialValues = this.getInitialValues();
        if (preferredSize > initialValues.resizeStartWidth) {
            this.resizeColumns(initialValues, preferredSize, source, true);
        }
    };
    GroupResizeFeature.prototype.resizeColumnsFromLocalValues = function (totalWidth, source, finished) {
        var _a, _b, _c;
        if (finished === void 0) { finished = true; }
        if (!this.resizeCols || !this.resizeRatios) {
            return;
        }
        var initialValues = {
            columnsToResize: this.resizeCols,
            resizeStartWidth: this.resizeStartWidth,
            resizeRatios: this.resizeRatios,
            groupAfterColumns: (_a = this.resizeTakeFromCols) !== null && _a !== void 0 ? _a : undefined,
            groupAfterStartWidth: (_b = this.resizeTakeFromStartWidth) !== null && _b !== void 0 ? _b : undefined,
            groupAfterRatios: (_c = this.resizeTakeFromRatios) !== null && _c !== void 0 ? _c : undefined
        };
        this.resizeColumns(initialValues, totalWidth, source, finished);
    };
    GroupResizeFeature.prototype.resizeColumns = function (initialValues, totalWidth, source, finished) {
        if (finished === void 0) { finished = true; }
        var columnsToResize = initialValues.columnsToResize, resizeStartWidth = initialValues.resizeStartWidth, resizeRatios = initialValues.resizeRatios, groupAfterColumns = initialValues.groupAfterColumns, groupAfterStartWidth = initialValues.groupAfterStartWidth, groupAfterRatios = initialValues.groupAfterRatios;
        var resizeSets = [];
        resizeSets.push({
            columns: columnsToResize,
            ratios: resizeRatios,
            width: totalWidth
        });
        if (groupAfterColumns) {
            var diff = totalWidth - resizeStartWidth;
            resizeSets.push({
                columns: groupAfterColumns,
                ratios: groupAfterRatios,
                width: groupAfterStartWidth - diff
            });
        }
        this.columnModel.resizeColumnSets({
            resizeSets: resizeSets,
            finished: finished,
            source: source
        });
        if (finished) {
            this.toggleColumnResizing(false);
        }
    };
    GroupResizeFeature.prototype.toggleColumnResizing = function (resizing) {
        this.comp.addOrRemoveCssClass('ag-column-resizing', resizing);
    };
    GroupResizeFeature.prototype.getColumnsToResize = function () {
        var leafCols = this.columnGroup.getDisplayedLeafColumns();
        return leafCols.filter(function (col) { return col.isResizable(); });
    };
    GroupResizeFeature.prototype.getInitialSizeOfColumns = function (columns) {
        return columns.reduce(function (totalWidth, column) { return totalWidth + column.getActualWidth(); }, 0);
    };
    GroupResizeFeature.prototype.getSizeRatiosOfColumns = function (columns, initialSizeOfColumns) {
        return columns.map(function (column) { return column.getActualWidth() / initialSizeOfColumns; });
    };
    // optionally inverts the drag, depending on pinned and RTL
    // note - this method is duplicated in RenderedHeaderCell - should refactor out?
    GroupResizeFeature.prototype.normaliseDragChange = function (dragChange) {
        var result = dragChange;
        if (this.gridOptionsService.get('enableRtl')) {
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
    GroupResizeFeature.prototype.destroy = function () {
        _super.prototype.destroy.call(this);
        this.clearLocalValues();
    };
    __decorate([
        (0, context_1.Autowired)('horizontalResizeService')
    ], GroupResizeFeature.prototype, "horizontalResizeService", void 0);
    __decorate([
        (0, context_1.Autowired)('autoWidthCalculator')
    ], GroupResizeFeature.prototype, "autoWidthCalculator", void 0);
    __decorate([
        (0, context_1.Autowired)('columnModel')
    ], GroupResizeFeature.prototype, "columnModel", void 0);
    __decorate([
        context_1.PostConstruct
    ], GroupResizeFeature.prototype, "postConstruct", null);
    return GroupResizeFeature;
}(beanStub_1.BeanStub));
exports.GroupResizeFeature = GroupResizeFeature;
