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
import { _ } from "@ag-grid-community/core";
import { BaseGridSerializingSession, RowType } from "@ag-grid-community/csv-export";
import { getHeightFromProperty } from "./assets/excelUtils";
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
                height: getHeightFromProperty(rowLen, row.height || _this.config.rowHeight),
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
            height: getHeightFromProperty(this.rows.length + 1, this.config.headerRowHeight)
        });
        return {
            onColumn: function (columnGroup, header, index, span, collapsibleRanges) {
                var styleIds = _this.config.styleLinker({ rowType: RowType.HEADER_GROUPING, rowIndex: 1, value: "grouping-" + header, columnGroup: columnGroup });
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
        var currentRow = _.last(this.rows);
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
            var styleIds = _this.config.styleLinker({ rowType: RowType.HEADER, rowIndex: rowIndex, value: nameForCol, column: column });
            currentCells.push(_this.createCell(_this.getStyleId(styleIds), _this.getDataTypeForValue('string'), nameForCol));
        };
    };
    BaseExcelSerializingSession.prototype.onNewRow = function (onNewColumnAccumulator, height) {
        var currentCells = [];
        this.rows.push({
            cells: currentCells,
            height: getHeightFromProperty(this.rows.length + 1, height)
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
            var styleIds = _this.config.styleLinker({ rowType: RowType.BODY, rowIndex: rowIndex, value: valueForCell, column: column, node: node });
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
                    _.mergeDeep(resultantStyle, _.deepCloneObject(excelStyle));
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
}(BaseGridSerializingSession));
export { BaseExcelSerializingSession };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFzZUV4Y2VsU2VyaWFsaXppbmdTZXNzaW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2V4Y2VsRXhwb3J0L2Jhc2VFeGNlbFNlcmlhbGl6aW5nU2Vzc2lvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLE9BQU8sRUFlSCxDQUFDLEVBQ0osTUFBTSx5QkFBeUIsQ0FBQztBQUVqQyxPQUFPLEVBQ0gsMEJBQTBCLEVBSTFCLE9BQU8sRUFDVixNQUFNLCtCQUErQixDQUFDO0FBQ3ZDLE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBbUM1RDtJQUE2RCwrQ0FBc0M7SUFhL0YscUNBQVksTUFBa0M7UUFBOUMsWUFDSSxrQkFBTSxNQUFNLENBQUMsU0FPaEI7UUFqQlMsaUJBQVcsR0FBdUMsRUFBRSxDQUFDO1FBQ3JELHVCQUFpQixHQUFXLENBQUMsQ0FBQztRQUk5QixVQUFJLEdBQWUsRUFBRSxDQUFDO1FBTTVCLEtBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDeEMsS0FBSSxDQUFDLFdBQVcsR0FBRyxFQUFFLENBQUM7UUFDdEIsS0FBSSxDQUFDLE1BQU0sQ0FBQyxlQUFlLENBQUMsT0FBTyxDQUFDLFVBQUEsS0FBSztZQUNyQyxLQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsR0FBRyxLQUFLLENBQUM7UUFDdkMsQ0FBQyxDQUFDLENBQUM7UUFDSCxLQUFJLENBQUMsV0FBVyw0QkFBTyxLQUFJLENBQUMsTUFBTSxDQUFDLGVBQWUsRUFBQyxDQUFDOztJQUN4RCxDQUFDO0lBU00sc0RBQWdCLEdBQXZCLFVBQXdCLGFBQXlCO1FBQWpELGlCQTJDQztRQTFDRyxhQUFhLENBQUMsT0FBTyxDQUFDLFVBQUEs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