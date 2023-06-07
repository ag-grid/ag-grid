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
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseExcelSerializingSession = void 0;
var core_1 = require("@ag-grid-community/core");
var csv_export_1 = require("@ag-grid-community/csv-export");
var excelUtils_1 = require("./assets/excelUtils");
var BaseExcelSerializingSession = /** @class */ (function (_super) {
    __extends(BaseExcelSerializingSession, _super);
    function BaseExcelSerializingSession(config) {
        var _this = _super.call(this, config) || this;
        _this.mixedStyles = {};
        _this.mixedStyleCounter = 0;
        _this.rows = [];
        _this.config = Object.assign({}, config);
        _this.stylesByIds = {};
        _this.config.baseExcelStyles.forEach(function (style) {
            _this.stylesByIds[style.id] = style;
        });
        _this.excelStyles = __spreadArray([], __read(_this.config.baseExcelStyles));
        return _this;
    }
    BaseExcelSerializingSession.prototype.addCustomContent = function (customContent) {
        var _this = this;
        customContent.forEach(function (row) {
            var rowLen = _this.rows.length + 1;
            var outlineLevel;
            if (!_this.config.suppressRowOutline && row.outlineLevel != null) {
                outlineLevel = row.outlineLevel;
            }
            var rowObj = {
                height: excelUtils_1.getHeightFromProperty(rowLen, row.height || _this.config.rowHeight),
                cells: (row.cells || []).map(function (cell, idx) {
                    var _a, _b, _c;
                    var image = _this.addImage(rowLen, _this.columnsToExport[idx], (_a = cell.data) === null || _a === void 0 ? void 0 : _a.value);
                    var excelStyles = null;
                    if (cell.styleId) {
                        excelStyles = typeof cell.styleId === 'string' ? [cell.styleId] : cell.styleId;
                    }
                    var excelStyleId = _this.getStyleId(excelStyles);
                    if (image) {
                        return _this.createCell(excelStyleId, _this.getDataTypeForValue(image.value), image.value == null ? '' : image.value);
                    }
                    var value = (_c = (_b = cell.data) === null || _b === void 0 ? void 0 : _b.value) !== null && _c !== void 0 ? _c : '';
                    var type = _this.getDataTypeForValue(value);
                    if (cell.mergeAcross) {
                        return _this.createMergedCell(excelStyleId, type, value, cell.mergeAcross);
                    }
                    return _this.createCell(excelStyleId, type, value);
                }),
                outlineLevel: outlineLevel
            };
            if (row.collapsed != null) {
                rowObj.collapsed = row.collapsed;
            }
            if (row.hidden != null) {
                rowObj.hidden = row.hidden;
            }
            _this.rows.push(rowObj);
        });
    };
    BaseExcelSerializingSession.prototype.onNewHeaderGroupingRow = function () {
        var _this = this;
        var currentCells = [];
        this.rows.push({
            cells: currentCells,
            height: excelUtils_1.getHeightFromProperty(this.rows.length + 1, this.config.headerRowHeight)
        });
        return {
            onColumn: function (columnGroup, header, index, span, collapsibleRanges) {
                var styleIds = _this.config.styleLinker({ rowType: csv_export_1.RowType.HEADER_GROUPING, rowIndex: 1, value: "grouping-" + header, columnGroup: columnGroup });
                currentCells.push(__assign(__assign({}, _this.createMergedCell(_this.getStyleId(styleIds), _this.getDataTypeForValue('string'), header, span)), { collapsibleRanges: collapsibleRanges }));
            }
        };
    };
    BaseExcelSerializingSession.prototype.onNewHeaderRow = function () {
        return this.onNewRow(this.onNewHeaderColumn, this.config.headerRowHeight);
    };
    BaseExcelSerializingSession.prototype.onNewBodyRow = function (node) {
        var rowAccumulator = this.onNewRow(this.onNewBodyColumn, this.config.rowHeight);
        if (node) {
            this.addRowOutlineIfNecessary(node);
        }
        return rowAccumulator;
    };
    BaseExcelSerializingSession.prototype.addRowOutlineIfNecessary = function (node) {
        var _a = this.config, gridOptionsService = _a.gridOptionsService, suppressRowOutline = _a.suppressRowOutline, _b = _a.rowGroupExpandState, rowGroupExpandState = _b === void 0 ? 'expanded' : _b;
        var isGroupHideOpenParents = gridOptionsService.is('groupHideOpenParents');
        if (isGroupHideOpenParents || suppressRowOutline || node.level == null) {
            return;
        }
        var padding = node.footer ? 1 : 0;
        var currentRow = core_1._.last(this.rows);
        currentRow.outlineLevel = node.level + padding;
        if (rowGroupExpandState === 'expanded') {
            return;
        }
        var collapseAll = rowGroupExpandState === 'collapsed';
        if (node.isExpandable()) {
            var isExpanded = !collapseAll && node.expanded;
            currentRow.collapsed = !isExpanded;
        }
        currentRow.hidden =
            // always show the node if there is no parent to be expanded
            !!node.parent &&
                // or if it is a child of the root node
                node.parent.level !== -1 &&
                (collapseAll || this.isAnyParentCollapsed(node.parent));
    };
    BaseExcelSerializingSession.prototype.isAnyParentCollapsed = function (node) {
        while (node && node.level !== -1) {
            if (!node.expanded) {
                return true;
            }
            node = node.parent;
        }
        return false;
    };
    BaseExcelSerializingSession.prototype.prepare = function (columnsToExport) {
        var _this = this;
        _super.prototype.prepare.call(this, columnsToExport);
        this.columnsToExport = __spreadArray([], __read(columnsToExport));
        this.cols = columnsToExport.map(function (col, i) { return _this.convertColumnToExcel(col, i); });
    };
    BaseExcelSerializingSession.prototype.parse = function () {
        // adding custom content might have made some rows wider than the grid, so add new columns
        var longestRow = this.rows.reduce(function (a, b) { return Math.max(a, b.cells.length); }, 0);
        while (this.cols.length < longestRow) {
            this.cols.push(this.convertColumnToExcel(null, this.cols.length + 1));
        }
        var data = {
            name: this.config.sheetName,
            table: {
                columns: this.cols,
                rows: this.rows
            }
        };
        return this.createExcel(data);
    };
    BaseExcelSerializingSession.prototype.isFormula = function (value) {
        if (value == null) {
            return false;
        }
        return this.config.autoConvertFormulas && value.toString().startsWith('=');
    };
    BaseExcelSerializingSession.prototype.isNumerical = function (value) {
        if (typeof value === 'bigint') {
            return true;
        }
        return isFinite(value) && value !== '' && !isNaN(parseFloat(value));
    };
    BaseExcelSerializingSession.prototype.getStyleById = function (styleId) {
        if (styleId == null) {
            return null;
        }
        return this.stylesByIds[styleId] || null;
    };
    BaseExcelSerializingSession.prototype.convertColumnToExcel = function (column, index) {
        var columnWidth = this.config.columnWidth;
        if (columnWidth) {
            if (typeof columnWidth === 'number') {
                return { width: columnWidth };
            }
            return { width: columnWidth({ column: column, index: index }) };
        }
        if (column) {
            var smallestUsefulWidth = 75;
            return { width: Math.max(column.getActualWidth(), smallestUsefulWidth) };
        }
        return {};
    };
    BaseExcelSerializingSession.prototype.onNewHeaderColumn = function (rowIndex, currentCells) {
        var _this = this;
        return function (column, index) {
            var nameForCol = _this.extractHeaderValue(column);
            var styleIds = _this.config.styleLinker({ rowType: csv_export_1.RowType.HEADER, rowIndex: rowIndex, value: nameForCol, column: column });
            currentCells.push(_this.createCell(_this.getStyleId(styleIds), _this.getDataTypeForValue('string'), nameForCol));
        };
    };
    BaseExcelSerializingSession.prototype.onNewRow = function (onNewColumnAccumulator, height) {
        var currentCells = [];
        this.rows.push({
            cells: currentCells,
            height: excelUtils_1.getHeightFromProperty(this.rows.length + 1, height)
        });
        return {
            onColumn: onNewColumnAccumulator.bind(this, this.rows.length, currentCells)()
        };
    };
    BaseExcelSerializingSession.prototype.onNewBodyColumn = function (rowIndex, currentCells) {
        var _this = this;
        var skipCols = 0;
        return function (column, index, node) {
            if (skipCols > 0) {
                skipCols -= 1;
                return;
            }
            var valueForCell = _this.extractRowCellValue(column, index, rowIndex, 'excel', node);
            var styleIds = _this.config.styleLinker({ rowType: csv_export_1.RowType.BODY, rowIndex: rowIndex, value: valueForCell, column: column, node: node });
            var excelStyleId = _this.getStyleId(styleIds);
            var colSpan = column.getColSpan(node);
            var addedImage = _this.addImage(rowIndex, column, valueForCell);
            if (addedImage) {
                currentCells.push(_this.createCell(excelStyleId, _this.getDataTypeForValue(addedImage.value), addedImage.value == null ? '' : addedImage.value));
            }
            else if (colSpan > 1) {
                skipCols = colSpan - 1;
                currentCells.push(_this.createMergedCell(excelStyleId, _this.getDataTypeForValue(valueForCell), valueForCell, colSpan - 1));
            }
            else {
                currentCells.push(_this.createCell(excelStyleId, _this.getDataTypeForValue(valueForCell), valueForCell));
            }
        };
    };
    BaseExcelSerializingSession.prototype.getStyleId = function (styleIds) {
        if (!styleIds || !styleIds.length) {
            return null;
        }
        if (styleIds.length === 1) {
            return styleIds[0];
        }
        var key = styleIds.join("-");
        if (!this.mixedStyles[key]) {
            this.addNewMixedStyle(styleIds);
        }
        return this.mixedStyles[key].excelID;
    };
    BaseExcelSerializingSession.prototype.addNewMixedStyle = function (styleIds) {
        var _this = this;
        this.mixedStyleCounter += 1;
        var excelId = "mixedStyle" + this.mixedStyleCounter;
        var resultantStyle = {};
        styleIds.forEach(function (styleId) {
            _this.excelStyles.forEach(function (excelStyle) {
                if (excelStyle.id === styleId) {
                    core_1._.mergeDeep(resultantStyle, core_1._.deepCloneObject(excelStyle));
                }
            });
        });
        resultantStyle.id = excelId;
        resultantStyle.name = excelId;
        var key = styleIds.join("-");
        this.mixedStyles[key] = {
            excelID: excelId,
            key: key,
            result: resultantStyle
        };
        this.excelStyles.push(resultantStyle);
        this.stylesByIds[excelId] = resultantStyle;
    };
    return BaseExcelSerializingSession;
}(csv_export_1.BaseGridSerializingSession));
exports.BaseExcelSerializingSession = BaseExcelSerializingSession;
