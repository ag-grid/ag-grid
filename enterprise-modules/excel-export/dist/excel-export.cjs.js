/**
          * @ag-grid-enterprise/excel-export - Advanced Data Grid / Data Table supporting Javascript / Typescript / React / Angular / Vue * @version v28.2.0
          * @link https://www.ag-grid.com/
          * @license Commercial
          */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var core = require('@ag-grid-community/core');
var core$1 = require('@ag-grid-enterprise/core');
var csvExport = require('@ag-grid-community/csv-export');

var workbook = {
    getTemplate: function () {
        return {
            name: "Workbook",
            properties: {
                prefixedAttributes: [{
                        prefix: "xmlns:",
                        map: {
                            o: "urn:schemas-microsoft-com:office:office",
                            x: "urn:schemas-microsoft-com:office:excel",
                            ss: "urn:schemas-microsoft-com:office:spreadsheet",
                            html: "http://www.w3.org/TR/REC-html40"
                        },
                    }],
                rawMap: {
                    xmlns: "urn:schemas-microsoft-com:office:spreadsheet"
                }
            }
        };
    }
};

var excelWorkbook = {
    getTemplate: function () {
        return {
            name: "ExcelWorkbook",
            properties: {
                rawMap: {
                    xmlns: "urn:schemas-microsoft-com:office:excel"
                }
            },
            children: [{
                    name: "WindowHeight",
                    textNode: "8130"
                }, {
                    name: "WindowWidth",
                    textNode: "15135"
                }, {
                    name: "WindowHeight",
                    textNode: "8130"
                }, {
                    name: "WindowTopX",
                    textNode: "120"
                }, {
                    name: "WindowTopY",
                    textNode: "45"
                }, {
                    name: "ProtectStructure",
                    textNode: "False"
                }, {
                    name: "ProtectWindow",
                    textNode: "False"
                }]
        };
    }
};

var column = {
    getTemplate: function (c) {
        var width = c.width;
        return {
            name: "Column",
            properties: {
                prefixedAttributes: [{
                        prefix: "ss:",
                        map: {
                            Width: width
                        }
                    }]
            }
        };
    }
};

var cell = {
    getTemplate: function (c) {
        var _a, _b;
        var mergeAcross = c.mergeAcross, styleId = c.styleId, data = c.data;
        var properties = {};
        if (mergeAcross) {
            properties.MergeAcross = mergeAcross;
        }
        if (styleId) {
            properties.StyleID = styleId;
        }
        return {
            name: "Cell",
            properties: {
                prefixedAttributes: [{
                        prefix: "ss:",
                        map: properties
                    }]
            },
            children: [{
                    name: "Data",
                    properties: {
                        prefixedAttributes: [{
                                prefix: "ss:",
                                map: {
                                    Type: (_a = data) === null || _a === void 0 ? void 0 : _a.type
                                }
                            }]
                    },
                    textNode: (_b = data) === null || _b === void 0 ? void 0 : _b.value
                }]
        };
    }
};

var row = {
    getTemplate: function (r) {
        var cells = r.cells;
        return {
            name: "Row",
            children: cells.map(function (it) { return cell.getTemplate(it); })
        };
    }
};

var worksheet = {
    getTemplate: function (ws) {
        var table = ws.table, name = ws.name;
        var columns = table.columns, rows = table.rows;
        var c = columns.map(function (it) { return column.getTemplate(it); });
        var r = rows.map(function (it) { return row.getTemplate(it); });
        return {
            name: "Worksheet",
            children: [{
                    name: "Table",
                    children: c.concat(r)
                }],
            properties: {
                prefixedAttributes: [{
                        prefix: "ss:",
                        map: {
                            Name: name
                        }
                    }]
            }
        };
    }
};

var documentProperties = {
    getTemplate: function () {
        return {
            name: "DocumentProperties",
            properties: {
                rawMap: {
                    xmlns: "urn:schemas-microsoft-com:office:office"
                }
            },
            children: [{
                    name: "Version",
                    textNode: "12.00"
                }]
        };
    }
};

var alignment = {
    getTemplate: function (styleProperties) {
        var _a = styleProperties.alignment, vertical = _a.vertical, horizontal = _a.horizontal, indent = _a.indent, readingOrder = _a.readingOrder, rotate = _a.rotate, shrinkToFit = _a.shrinkToFit, verticalText = _a.verticalText, wrapText = _a.wrapText;
        return {
            name: 'Alignment',
            properties: {
                prefixedAttributes: [{
                        prefix: "ss:",
                        map: {
                            Vertical: vertical,
                            Horizontal: horizontal,
                            Indent: indent,
                            ReadingOrder: readingOrder,
                            Rotate: rotate,
                            ShrinkToFit: shrinkToFit,
                            VerticalText: verticalText,
                            WrapText: wrapText
                        }
                    }]
            }
        };
    }
};

var borders = {
    getTemplate: function (styleProperties) {
        var _a = styleProperties.borders, borderBottom = _a.borderBottom, borderLeft = _a.borderLeft, borderRight = _a.borderRight, borderTop = _a.borderTop;
        return {
            name: 'Borders',
            children: [borderBottom, borderLeft, borderRight, borderTop].map(function (it, index) {
                var current = index == 0 ? "Bottom" : index == 1 ? "Left" : index == 2 ? "Right" : "Top";
                return {
                    name: 'Border',
                    properties: {
                        prefixedAttributes: [{
                                prefix: 'ss:',
                                map: {
                                    Position: current,
                                    LineStyle: it.lineStyle,
                                    Weight: it.weight,
                                    Color: it.color
                                }
                            }]
                    }
                };
            })
        };
    }
};

var font = {
    getTemplate: function (styleProperties) {
        var _a = styleProperties.font, bold = _a.bold, fontName = _a.fontName, italic = _a.italic, color = _a.color, outline = _a.outline, shadow = _a.shadow, size = _a.size, strikeThrough = _a.strikeThrough, underline = _a.underline, verticalAlign = _a.verticalAlign, charSet = _a.charSet, family = _a.family;
        return {
            name: "Font",
            properties: {
                prefixedAttributes: [{
                        prefix: "ss:",
                        map: {
                            Bold: bold,
                            FontName: fontName,
                            Italic: italic,
                            Color: color,
                            Outline: outline,
                            Shadow: shadow,
                            Size: size,
                            StrikeThrough: strikeThrough,
                            Underline: underline,
                            VerticalAlign: verticalAlign
                        }
                    }, {
                        prefix: "x:",
                        map: {
                            CharSet: charSet,
                            Family: family
                        }
                    }]
            }
        };
    }
};

var interior = {
    getTemplate: function (styleProperties) {
        var _a = styleProperties.interior, color = _a.color, pattern = _a.pattern, patternColor = _a.patternColor;
        return {
            name: "Interior",
            properties: {
                prefixedAttributes: [{
                        prefix: "ss:",
                        map: {
                            Color: color,
                            Pattern: pattern,
                            PatternColor: patternColor
                        }
                    }]
            }
        };
    }
};

var protection = {
    getTemplate: function (styleProperties) {
        return {
            name: "Protection",
            properties: {
                prefixedAttributes: [{
                        prefix: "ss:",
                        map: {
                            Protected: styleProperties.protection.protected,
                            HideFormula: styleProperties.protection.hideFormula
                        }
                    }]
            }
        };
    }
};

var numberFormat = {
    getTemplate: function (styleProperties) {
        var format = styleProperties.numberFormat.format;
        return {
            name: "NumberFormat",
            properties: {
                prefixedAttributes: [{
                        prefix: "ss:",
                        map: {
                            Format: format
                        }
                    }]
            }
        };
    }
};

var style = {
    getTemplate: function (styleProperties) {
        var id = styleProperties.id, name = styleProperties.name;
        return {
            name: 'Style',
            properties: {
                prefixedAttributes: [{
                        prefix: "ss:",
                        map: {
                            ID: id,
                            Name: name ? name : id
                        }
                    }]
            }
        };
    }
};

/**
 * See https://msdn.microsoft.com/en-us/library/aa140066(v=office.10).aspx
 */
var ExcelXmlFactory = /** @class */ (function () {
    function ExcelXmlFactory() {
    }
    ExcelXmlFactory.createExcel = function (styles, currentWorksheet) {
        var header = this.excelXmlHeader();
        var docProps = documentProperties.getTemplate();
        var eWorkbook = excelWorkbook.getTemplate();
        var wb = this.workbook(docProps, eWorkbook, styles, currentWorksheet);
        return "" + header + csvExport.XmlFactory.createXml(wb, function (boolean) { return boolean ? '1' : '0'; });
    };
    ExcelXmlFactory.workbook = function (docProperties, eWorkbook, styles, currentWorksheet) {
        var children = [
            docProperties,
            eWorkbook,
            this.stylesXmlElement(styles)
        ].concat(worksheet.getTemplate(currentWorksheet));
        return Object.assign({}, workbook.getTemplate(), { children: children });
    };
    ExcelXmlFactory.excelXmlHeader = function () {
        return "<?xml version=\"1.0\" ?>\n        <?mso-application progid=\"Excel.Sheet\" ?>\n        ";
    };
    ExcelXmlFactory.stylesXmlElement = function (styles) {
        var _this = this;
        return {
            name: 'Styles',
            children: styles ? styles.map(function (it) { return _this.styleXmlElement(it); }) : []
        };
    };
    ExcelXmlFactory.styleXmlElement = function (styleProperties) {
        var children = core._.compose(this.addProperty('alignment', styleProperties), this.addProperty('borders', styleProperties), this.addProperty('font', styleProperties), this.addProperty('interior', styleProperties), this.addProperty('protection', styleProperties), this.addProperty('numberFormat', styleProperties))([]);
        return Object.assign({}, style.getTemplate(styleProperties), { children: children });
    };
    ExcelXmlFactory.addProperty = function (property, styleProperties) {
        return function (children) {
            if (!styleProperties[property]) {
                return children;
            }
            var options = {
                alignment: alignment,
                borders: borders,
                font: font,
                interior: interior,
                numberFormat: numberFormat,
                protection: protection
            };
            return children.concat(options[property].getTemplate(styleProperties));
        };
    };
    ExcelXmlFactory.factoryMode = core.ExcelFactoryMode.SINGLE_SHEET;
    return ExcelXmlFactory;
}());

var INCH_TO_EMU = 9525;
var numberFormatMap = {
    '0': 1,
    '0.00': 2,
    '#,##0': 3,
    '#,##0.00': 4,
    '0%': 9,
    '0.00%': 10,
    '0.00E+00': 11,
    '# ?/?': 12,
    '# ??/??': 13,
    'mm-dd-yy': 14,
    'd-mmm-yy': 15,
    'd-mmm': 16,
    'mmm-yy': 17,
    'h:mm AM/PM': 18,
    'h:mm:ss AM/PM': 19,
    'h:mm': 20,
    'h:mm:ss': 21,
    'm/d/yy h:mm': 22,
    '#,##0 ;(#,##0)': 37,
    '#,##0 ;[Red](#,##0)': 38,
    '#,##0.00;(#,##0.00)': 39,
    '#,##0.00;[Red](#,##0.00)': 40,
    'mm:ss': 45,
    '[h]:mm:ss': 46,
    'mmss.0': 47,
    '##0.0E+0': 48,
    '@': 49
};

var pixelsToPoint = function (pixels) {
    return Math.round(pixels * 72 / 96);
};
var pointsToPixel = function (points) {
    return Math.round(points * 96 / 72);
};
var pixelsToEMU = function (value) {
    return Math.ceil(value * INCH_TO_EMU);
};
var getFontFamilyId = function (name) {
    if (name === undefined) {
        return;
    }
    var families = ['Automatic', 'Roman', 'Swiss', 'Modern', 'Script', 'Decorative'];
    var pos = families.indexOf(name || 'Automatic');
    return Math.max(pos, 0);
};
var getHeightFromProperty = function (rowIndex, height) {
    if (!height) {
        return;
    }
    var finalHeight;
    if (typeof height === 'number') {
        finalHeight = height;
    }
    else {
        var heightFunc = height;
        finalHeight = heightFunc({ rowIndex: rowIndex });
    }
    return pixelsToPoint(finalHeight);
};
var setExcelImageTotalWidth = function (image, columnsToExport) {
    var _a = image.position, colSpan = _a.colSpan, column = _a.column;
    if (image.width) {
        if (colSpan) {
            var columnsInSpan = columnsToExport.slice(column - 1, column + colSpan - 1);
            var totalWidth = 0;
            for (var i = 0; i < columnsInSpan.length; i++) {
                var colWidth = columnsInSpan[i].getActualWidth();
                if (image.width < totalWidth + colWidth) {
                    image.position.colSpan = i + 1;
                    image.totalWidth = image.width;
                    image.width = image.totalWidth - totalWidth;
                    break;
                }
                totalWidth += colWidth;
            }
        }
        else {
            image.totalWidth = image.width;
        }
    }
};
var setExcelImageTotalHeight = function (image, rowHeight) {
    var _a = image.position, rowSpan = _a.rowSpan, row = _a.row;
    if (image.height) {
        if (rowSpan) {
            var totalHeight = 0;
            var counter = 0;
            for (var i = row; i < row + rowSpan; i++) {
                var nextRowHeight = pointsToPixel(getHeightFromProperty(i, rowHeight) || 20);
                if (image.height < totalHeight + nextRowHeight) {
                    image.position.rowSpan = counter + 1;
                    image.totalHeight = image.height;
                    image.height = image.totalHeight - totalHeight;
                    break;
                }
                totalHeight += nextRowHeight;
                counter++;
            }
        }
        else {
            image.totalHeight = image.height;
        }
    }
};
var createXmlPart = function (body) {
    var header = csvExport.XmlFactory.createHeader({
        encoding: 'UTF-8',
        standalone: 'yes'
    });
    var xmlBody = csvExport.XmlFactory.createXml(body);
    return "" + header + xmlBody;
};
var getExcelColumnName = function (colIdx) {
    var startCode = 65;
    var tableWidth = 26;
    var fromCharCode = String.fromCharCode;
    var pos = Math.floor(colIdx / tableWidth);
    var tableIdx = colIdx % tableWidth;
    if (!pos || colIdx === tableWidth) {
        return fromCharCode(startCode + colIdx - 1);
    }
    if (!tableIdx) {
        return getExcelColumnName(pos - 1) + 'Z';
    }
    if (pos < tableWidth) {
        return fromCharCode(startCode + pos - 1) + fromCharCode(startCode + tableIdx - 1);
    }
    return getExcelColumnName(pos) + fromCharCode(startCode + tableIdx - 1);
};

var __extends$3 = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign$2 = (undefined && undefined.__assign) || function () {
    __assign$2 = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign$2.apply(this, arguments);
};
var __read$6 = (undefined && undefined.__read) || function (o, n) {
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
var __spread$3 = (undefined && undefined.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read$6(arguments[i]));
    return ar;
};
var BaseExcelSerializingSession = /** @class */ (function (_super) {
    __extends$3(BaseExcelSerializingSession, _super);
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
        _this.excelStyles = __spread$3(_this.config.baseExcelStyles);
        return _this;
    }
    BaseExcelSerializingSession.prototype.addCustomContent = function (customContent) {
        var _this = this;
        customContent.forEach(function (row) {
            var rowLen = _this.rows.length + 1;
            var rowObj = {
                height: getHeightFromProperty(rowLen, row.height || _this.config.rowHeight),
                cells: (row.cells || []).map(function (cell, idx) {
                    var _a;
                    var image = _this.addImage(rowLen, _this.columnsToExport[idx], (_a = cell.data) === null || _a === void 0 ? void 0 : _a.value);
                    var ret = __assign$2({}, cell);
                    if (image) {
                        ret.data = {};
                        if (image.value != null) {
                            ret.data.value = image.value;
                        }
                        else {
                            ret.data.type = 'e';
                            ret.data.value = null;
                        }
                    }
                    return ret;
                }),
                outlineLevel: row.outlineLevel || undefined
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
                var styleIds = _this.config.styleLinker({ rowType: csvExport.RowType.HEADER_GROUPING, rowIndex: 1, value: "grouping-" + header, columnGroup: columnGroup });
                currentCells.push(__assign$2(__assign$2({}, _this.createMergedCell(_this.getStyleId(styleIds), _this.getDataTypeForValue('string'), header, span)), { collapsibleRanges: collapsibleRanges }));
            }
        };
    };
    BaseExcelSerializingSession.prototype.onNewHeaderRow = function () {
        return this.onNewRow(this.onNewHeaderColumn, this.config.headerRowHeight);
    };
    BaseExcelSerializingSession.prototype.onNewBodyRow = function () {
        return this.onNewRow(this.onNewBodyColumn, this.config.rowHeight);
    };
    BaseExcelSerializingSession.prototype.prepare = function (columnsToExport) {
        var _this = this;
        _super.prototype.prepare.call(this, columnsToExport);
        this.columnsToExport = __spread$3(columnsToExport);
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
            var styleIds = _this.config.styleLinker({ rowType: csvExport.RowType.HEADER, rowIndex: rowIndex, value: nameForCol, column: column });
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
            if (!_this.config.gridOptionsWrapper.isGroupHideOpenParents() && node.level) {
                core._.last(_this.rows).outlineLevel = node.level;
            }
            var valueForCell = _this.extractRowCellValue(column, index, rowIndex, core.Constants.EXPORT_TYPE_EXCEL, node);
            var styleIds = _this.config.styleLinker({ rowType: csvExport.RowType.BODY, rowIndex: rowIndex, value: valueForCell, column: column, node: node });
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
                    core._.mergeDeep(resultantStyle, core._.deepCloneObject(excelStyle));
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
}(csvExport.BaseGridSerializingSession));

var __extends$2 = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var ExcelXmlSerializingSession = /** @class */ (function (_super) {
    __extends$2(ExcelXmlSerializingSession, _super);
    function ExcelXmlSerializingSession() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ExcelXmlSerializingSession.prototype.createExcel = function (data) {
        return ExcelXmlFactory.createExcel(this.excelStyles, data);
    };
    ExcelXmlSerializingSession.prototype.getDataTypeForValue = function (valueForCell) {
        return core._.isNumeric(valueForCell) ? 'Number' : 'String';
    };
    ExcelXmlSerializingSession.prototype.getType = function (type, style, value) {
        if (this.isFormula(value)) {
            return 'Formula';
        }
        if (style && style.dataType) {
            switch (style.dataType.toLocaleLowerCase()) {
                case 'string':
                    return 'Formula';
                case 'number':
                    return 'Number';
                case 'datetime':
                    return 'DateTime';
                case 'error':
                    return 'Error';
                case 'boolean':
                    return 'Boolean';
                default:
                    console.warn("AG Grid: Unrecognized data type for excel export [" + style.id + ".dataType=" + style.dataType + "]");
            }
        }
        return type;
    };
    ExcelXmlSerializingSession.prototype.addImage = function () {
        return;
    };
    ExcelXmlSerializingSession.prototype.createCell = function (styleId, type, value) {
        var actualStyle = this.getStyleById(styleId);
        var typeTransformed = (this.getType(type, actualStyle, value) || type);
        return {
            styleId: !!actualStyle ? styleId : undefined,
            data: {
                type: typeTransformed,
                value: this.getValueTransformed(typeTransformed, value)
            }
        };
    };
    ExcelXmlSerializingSession.prototype.getValueTransformed = function (typeTransformed, value) {
        var _this = this;
        var wrapText = function (val) {
            if (_this.config.suppressTextAsCDATA) {
                return core._.escapeString(val);
            }
            var cdataStart = '<![CDATA[';
            var cdataEnd = ']]>';
            var cdataEndRegex = new RegExp(cdataEnd, "g");
            return cdataStart
                // CDATA sections are closed by the character sequence ']]>' and there is no
                // way of escaping this, so if the text contains the offending sequence, emit
                // multiple CDATA sections and split the characters between them.
                + String(val).replace(cdataEndRegex, ']]' + cdataEnd + cdataStart + '>')
                + cdataEnd;
        };
        var convertBoolean = function (val) {
            if (!val || val === '0' || val === 'false') {
                return '0';
            }
            return '1';
        };
        switch (typeTransformed) {
            case 'String':
                return wrapText(value);
            case 'Number':
                return Number(value).valueOf() + '';
            case 'Boolean':
                return convertBoolean(value);
            default:
                return value;
        }
    };
    ExcelXmlSerializingSession.prototype.createMergedCell = function (styleId, type, value, numOfCells) {
        return {
            styleId: !!this.getStyleById(styleId) ? styleId : undefined,
            data: {
                type: type,
                value: value
            },
            mergeAcross: numOfCells
        };
    };
    return ExcelXmlSerializingSession;
}(BaseExcelSerializingSession));

var coreFactory = {
    getTemplate: function (author) {
        var dt = new Date();
        var jsonDate = dt.toJSON();
        return {
            name: 'cp:coreProperties',
            properties: {
                prefixedAttributes: [{
                        prefix: "xmlns:",
                        map: {
                            cp: "http://schemas.openxmlformats.org/package/2006/metadata/core-properties",
                            dc: 'http://purl.org/dc/elements/1.1/',
                            dcterms: 'http://purl.org/dc/terms/',
                            dcmitype: 'http://purl.org/dc/dcmitype/',
                            xsi: 'http://www.w3.org/2001/XMLSchema-instance'
                        }
                    }]
            },
            children: [{
                    name: 'dc:creator',
                    textNode: author
                }, {
                    name: 'dc:title',
                    textNode: 'Workbook'
                }, {
                    name: 'dcterms:created',
                    properties: {
                        rawMap: {
                            'xsi:type': 'dcterms:W3CDTF'
                        }
                    },
                    textNode: jsonDate
                }, {
                    name: 'dcterms:modified',
                    properties: {
                        rawMap: {
                            'xsi:type': 'dcterms:W3CDTF'
                        }
                    },
                    textNode: jsonDate
                }]
        };
    }
};

var contentTypeFactory = {
    getTemplate: function (config) {
        var name = config.name, ContentType = config.ContentType, Extension = config.Extension, PartName = config.PartName;
        return {
            name: name,
            properties: {
                rawMap: {
                    Extension: Extension,
                    PartName: PartName,
                    ContentType: ContentType
                }
            }
        };
    }
};

var __read$5 = (undefined && undefined.__read) || function (o, n) {
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
var __spread$2 = (undefined && undefined.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read$5(arguments[i]));
    return ar;
};
var contentTypesFactory = {
    getTemplate: function (sheetLen) {
        var worksheets = new Array(sheetLen).fill(undefined).map(function (v, i) { return ({
            name: 'Override',
            ContentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml',
            PartName: "/xl/worksheets/sheet" + (i + 1) + ".xml"
        }); });
        var sheetsWithImages = ExcelXlsxFactory.worksheetImages.size;
        var imageTypesObject = {};
        ExcelXlsxFactory.workbookImageIds.forEach(function (v) {
            imageTypesObject[v.type] = true;
        });
        var imageDocs = new Array(sheetsWithImages).fill(undefined).map(function (v, i) { return ({
            name: 'Override',
            ContentType: 'application/vnd.openxmlformats-officedocument.drawing+xml',
            PartName: "/xl/drawings/drawing" + (i + 1) + ".xml"
        }); });
        var imageTypes = Object.keys(imageTypesObject).map(function (ext) { return ({
            name: 'Default',
            ContentType: "image/" + ext,
            Extension: ext
        }); });
        var children = __spread$2(imageTypes, [
            {
                name: 'Default',
                Extension: 'rels',
                ContentType: 'application/vnd.openxmlformats-package.relationships+xml'
            }, {
                name: 'Default',
                ContentType: 'application/xml',
                Extension: 'xml'
            }, {
                name: 'Override',
                ContentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml',
                PartName: "/xl/workbook.xml"
            }
        ], worksheets, [
            {
                name: 'Override',
                ContentType: 'application/vnd.openxmlformats-officedocument.theme+xml',
                PartName: '/xl/theme/theme1.xml'
            }, {
                name: 'Override',
                ContentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml',
                PartName: '/xl/styles.xml'
            }, {
                name: 'Override',
                ContentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml',
                PartName: '/xl/sharedStrings.xml'
            }
        ], imageDocs, [
            {
                name: 'Override',
                ContentType: 'application/vnd.openxmlformats-package.core-properties+xml',
                PartName: '/docProps/core.xml'
            }
        ]).map(function (contentType) { return contentTypeFactory.getTemplate(contentType); });
        return {
            name: "Types",
            properties: {
                rawMap: {
                    xmlns: "http://schemas.openxmlformats.org/package/2006/content-types"
                }
            },
            children: children
        };
    }
};

var getAnchor = function (name, imageAnchor) { return ({
    name: "xdr:" + name,
    children: [{
            name: 'xdr:col',
            textNode: (imageAnchor.col).toString()
        }, {
            name: 'xdr:colOff',
            textNode: imageAnchor.offsetX.toString()
        }, {
            name: 'xdr:row',
            textNode: imageAnchor.row.toString()
        }, {
            name: 'xdr:rowOff',
            textNode: imageAnchor.offsetY.toString()
        }]
}); };
var getExt = function (image) {
    var children = [{
            name: 'a:ext',
            properties: {
                rawMap: {
                    uri: '{FF2B5EF4-FFF2-40B4-BE49-F238E27FC236}'
                }
            },
            children: [{
                    name: 'a16:creationId',
                    properties: {
                        rawMap: {
                            'id': '{822E6D20-D7BC-2841-A643-D49A6EF008A2}',
                            'xmlns:a16': 'http://schemas.microsoft.com/office/drawing/2014/main'
                        }
                    }
                }]
        }];
    var recolor = image.recolor && image.recolor.toLowerCase();
    switch (recolor) {
        case 'grayscale':
        case 'sepia':
        case 'washout':
            children.push({
                name: 'a:ext',
                properties: {
                    rawMap: {
                        uri: '{C183D7F6-B498-43B3-948B-1728B52AA6E4}'
                    }
                },
                children: [{
                        name: 'adec:decorative',
                        properties: {
                            rawMap: {
                                'val': '0',
                                'xmlns:adec': 'http://schemas.microsoft.com/office/drawing/2017/decorative'
                            }
                        }
                    }]
            });
    }
    return {
        name: 'a:extLst',
        children: children
    };
};
var getNvPicPr = function (image, index) { return ({
    name: 'xdr:nvPicPr',
    children: [{
            name: 'xdr:cNvPr',
            properties: {
                rawMap: {
                    id: index,
                    name: image.id,
                    descr: image.altText != null ? image.altText : undefined
                }
            },
            children: [getExt(image)]
        }, {
            name: 'xdr:cNvPicPr',
            properties: {
                rawMap: {
                    preferRelativeResize: '0'
                }
            },
            children: [{
                    name: 'a:picLocks'
                }]
        }]
}); };
var getColorDetails = function (color) {
    if (!color.saturation && !color.tint) {
        return;
    }
    var ret = [];
    if (color.saturation) {
        ret.push({
            name: 'a:satMod',
            properties: {
                rawMap: {
                    val: color.saturation * 1000
                }
            }
        });
    }
    if (color.tint) {
        ret.push({
            name: 'a:tint',
            properties: {
                rawMap: {
                    val: color.tint * 1000
                }
            }
        });
    }
    return ret;
};
var getDuoTone = function (primaryColor, secondaryColor) {
    return ({
        name: 'a:duotone',
        children: [{
                name: 'a:prstClr',
                properties: {
                    rawMap: {
                        val: primaryColor.color
                    }
                },
                children: getColorDetails(primaryColor)
            }, {
                name: 'a:srgbClr',
                properties: {
                    rawMap: {
                        val: secondaryColor.color
                    }
                },
                children: getColorDetails(secondaryColor)
            }]
    });
};
var getBlipFill = function (image, index) {
    var blipChildren;
    if (image.transparency) {
        var transparency = Math.min(Math.max(image.transparency, 0), 100);
        blipChildren = [{
                name: 'a:alphaModFix',
                properties: {
                    rawMap: {
                        amt: 100000 - Math.round(transparency * 1000),
                    }
                }
            }];
    }
    if (image.recolor) {
        if (!blipChildren) {
            blipChildren = [];
        }
        switch (image.recolor.toLocaleLowerCase()) {
            case 'grayscale':
                blipChildren.push({ name: 'a:grayscl' });
                break;
            case 'sepia':
                blipChildren.push(getDuoTone({ color: 'black' }, { color: 'D9C3A5', tint: 50, saturation: 180 }));
                break;
            case 'washout':
                blipChildren.push({
                    name: 'a:lum',
                    properties: {
                        rawMap: {
                            bright: '70000',
                            contrast: '-70000'
                        }
                    }
                });
                break;
        }
    }
    return ({
        name: 'xdr:blipFill',
        children: [{
                name: 'a:blip',
                properties: {
                    rawMap: {
                        'cstate': 'print',
                        'r:embed': "rId" + index,
                        'xmlns:r': 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'
                    }
                },
                children: blipChildren
            }, {
                name: 'a:stretch',
                children: [{
                        name: 'a:fillRect'
                    }]
            }]
    });
};
var getSpPr = function (image, imageBoxSize) {
    var xfrm = {
        name: 'a:xfrm',
        children: [{
                name: 'a:off',
                properties: {
                    rawMap: {
                        x: 0,
                        y: 0
                    }
                }
            }, {
                name: 'a:ext',
                properties: {
                    rawMap: {
                        cx: imageBoxSize.width,
                        cy: imageBoxSize.height
                    }
                }
            }]
    };
    if (image.rotation) {
        var rotation = image.rotation;
        xfrm.properties = {
            rawMap: {
                rot: Math.min(Math.max(rotation, 0), 360) * 60000
            }
        };
    }
    var prstGeom = {
        name: 'a:prstGeom',
        properties: {
            rawMap: {
                prst: 'rect'
            }
        },
        children: [{ name: 'a:avLst' }]
    };
    var ret = {
        name: 'xdr:spPr',
        children: [xfrm, prstGeom]
    };
    return ret;
};
var getImageBoxSize = function (image) {
    image.fitCell = !!image.fitCell || (!image.width || !image.height);
    var _a = image.position, position = _a === void 0 ? {} : _a, fitCell = image.fitCell, _b = image.width, width = _b === void 0 ? 0 : _b, _c = image.height, height = _c === void 0 ? 0 : _c, totalHeight = image.totalHeight, totalWidth = image.totalWidth;
    var _d = position.offsetX, offsetX = _d === void 0 ? 0 : _d, _e = position.offsetY, offsetY = _e === void 0 ? 0 : _e, _f = position.row, row = _f === void 0 ? 1 : _f, _g = position.rowSpan, rowSpan = _g === void 0 ? 1 : _g, _h = position.column, column = _h === void 0 ? 1 : _h, _j = position.colSpan, colSpan = _j === void 0 ? 1 : _j;
    return {
        from: {
            row: row - 1,
            col: column - 1,
            offsetX: pixelsToEMU(offsetX),
            offsetY: pixelsToEMU(offsetY)
        },
        to: {
            row: (row - 1) + (fitCell ? 1 : rowSpan - 1),
            col: (column - 1) + (fitCell ? 1 : colSpan - 1),
            offsetX: pixelsToEMU(width + offsetX),
            offsetY: pixelsToEMU(height + offsetY)
        },
        height: pixelsToEMU(totalHeight || height),
        width: pixelsToEMU(totalWidth || width)
    };
};
var getPicture = function (image, currentIndex, worksheetImageIndex, imageBoxSize) {
    return {
        name: 'xdr:pic',
        children: [
            getNvPicPr(image, currentIndex + 1),
            getBlipFill(image, worksheetImageIndex + 1),
            getSpPr(image, imageBoxSize)
        ]
    };
};
var drawingFactory = {
    getTemplate: function (config) {
        var sheetIndex = config.sheetIndex;
        var sheetImages = ExcelXlsxFactory.worksheetImages.get(sheetIndex);
        var sheetImageIds = ExcelXlsxFactory.worksheetImageIds.get(sheetIndex);
        var children = sheetImages.map(function (image, idx) {
            var boxSize = getImageBoxSize(image);
            return ({
                name: 'xdr:twoCellAnchor',
                properties: {
                    rawMap: {
                        editAs: 'absolute'
                    }
                },
                children: [
                    getAnchor('from', boxSize.from),
                    getAnchor('to', boxSize.to),
                    getPicture(image, idx, sheetImageIds.get(image.id).index, boxSize),
                    { name: 'xdr:clientData' }
                ]
            });
        });
        return {
            name: 'xdr:wsDr',
            properties: {
                rawMap: {
                    'xmlns:a': 'http://schemas.openxmlformats.org/drawingml/2006/main',
                    'xmlns:xdr': 'http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing'
                }
            },
            children: children
        };
    }
};

var __read$4 = (undefined && undefined.__read) || function (o, n) {
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
var getColorChildren = function (props) {
    var _a = __read$4(props, 4), type = _a[0], innerType = _a[1], val = _a[2], lastClr = _a[3];
    return {
        name: "a:" + type,
        children: [{
                name: "a:" + innerType,
                properties: {
                    rawMap: {
                        val: val,
                        lastClr: lastClr
                    }
                }
            }]
    };
};
var colorScheme = {
    getTemplate: function () {
        return {
            name: "a:clrScheme",
            properties: {
                rawMap: {
                    name: "Office"
                }
            },
            children: [
                getColorChildren(['dk1', 'sysClr', 'windowText', '000000']),
                getColorChildren(['lt1', 'sysClr', 'window', 'FFFFFF']),
                getColorChildren(['dk2', 'srgbClr', '44546A']),
                getColorChildren(['lt2', 'srgbClr', 'E7E6E6']),
                getColorChildren(['accent1', 'srgbClr', '4472C4']),
                getColorChildren(['accent2', 'srgbClr', 'ED7D31']),
                getColorChildren(['accent3', 'srgbClr', 'A5A5A5']),
                getColorChildren(['accent4', 'srgbClr', 'FFC000']),
                getColorChildren(['accent5', 'srgbClr', '5B9BD5']),
                getColorChildren(['accent6', 'srgbClr', '70AD47']),
                getColorChildren(['hlink', 'srgbClr', '0563C1']),
                getColorChildren(['folHlink', 'srgbClr', '954F72'])
            ]
        };
    }
};

var __read$3 = (undefined && undefined.__read) || function (o, n) {
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
var getFont = function (props) {
    var _a = __read$3(props, 4), type = _a[0], typeface = _a[1], script = _a[2], panose = _a[3];
    return {
        name: "a:" + type,
        properties: {
            rawMap: {
                script: script,
                typeface: typeface,
                panose: panose
            }
        }
    };
};
var fontScheme = {
    getTemplate: function () {
        var utf8_encode = core._.utf8_encode;
        return {
            name: "a:fontScheme",
            properties: {
                rawMap: {
                    name: "Office"
                }
            },
            children: [{
                    name: 'a:majorFont',
                    children: [
                        getFont(['latin', 'Calibri Light', undefined, '020F0302020204030204']),
                        getFont(['ea', '']),
                        getFont(['cs', '']),
                        getFont(['font', utf8_encode('游ゴシック Light'), 'Jpan']),
                        getFont(['font', utf8_encode('맑은 고딕'), 'Hang']),
                        getFont(['font', utf8_encode('等线 Light'), 'Hans']),
                        getFont(['font', utf8_encode('新細明體'), 'Hant']),
                        getFont(['font', 'Times New Roman', 'Arab']),
                        getFont(['font', 'Times New Roman', 'Hebr']),
                        getFont(['font', 'Tahoma', 'Thai']),
                        getFont(['font', 'Nyala', 'Ethi']),
                        getFont(['font', 'Vrinda', 'Beng']),
                        getFont(['font', 'Shruti', 'Gujr']),
                        getFont(['font', 'MoolBoran', 'Khmr']),
                        getFont(['font', 'Tunga', 'Knda']),
                        getFont(['font', 'Raavi', 'Guru']),
                        getFont(['font', 'Euphemia', 'Cans']),
                        getFont(['font', 'Plantagenet Cherokee', 'Cher']),
                        getFont(['font', 'Microsoft Yi Baiti', 'Yiii']),
                        getFont(['font', 'Microsoft Himalaya', 'Tibt']),
                        getFont(['font', 'MV Boli', 'Thaa']),
                        getFont(['font', 'Mangal', 'Deva']),
                        getFont(['font', 'Gautami', 'Telu']),
                        getFont(['font', 'Latha', 'Taml']),
                        getFont(['font', 'Estrangelo Edessa', 'Syrc']),
                        getFont(['font', 'Kalinga', 'Orya']),
                        getFont(['font', 'Kartika', 'Mlym']),
                        getFont(['font', 'DokChampa', 'Laoo']),
                        getFont(['font', 'Iskoola Pota', 'Sinh']),
                        getFont(['font', 'Mongolian Baiti', 'Mong']),
                        getFont(['font', 'Times New Roman', 'Viet']),
                        getFont(['font', 'Microsoft Uighur', 'Uigh']),
                        getFont(['font', 'Sylfaen', 'Geor']),
                        getFont(['font', 'Arial', 'Armn']),
                        getFont(['font', 'Leelawadee UI', 'Bugi']),
                        getFont(['font', 'Microsoft JhengHei', 'Bopo']),
                        getFont(['font', 'Javanese Text', 'Java']),
                        getFont(['font', 'Segoe UI', 'Lisu']),
                        getFont(['font', 'Myanmar Text', 'Mymr']),
                        getFont(['font', 'Ebrima', 'Nkoo']),
                        getFont(['font', 'Nirmala UI', 'Olck']),
                        getFont(['font', 'Ebrima', 'Osma']),
                        getFont(['font', 'Phagspa', 'Phag']),
                        getFont(['font', 'Estrangelo Edessa', 'Syrn']),
                        getFont(['font', 'Estrangelo Edessa', 'Syrj']),
                        getFont(['font', 'Estrangelo Edessa', 'Syre']),
                        getFont(['font', 'Nirmala UI', 'Sora']),
                        getFont(['font', 'Microsoft Tai Le', 'Tale']),
                        getFont(['font', 'Microsoft New Tai Lue', 'Talu']),
                        getFont(['font', 'Ebrima', 'Tfng'])
                    ]
                }, {
                    name: 'a:minorFont',
                    children: [
                        getFont(['latin', 'Calibri', undefined, '020F0502020204030204']),
                        getFont(['ea', '']),
                        getFont(['cs', '']),
                        getFont(['font', utf8_encode('游ゴシック'), 'Jpan']),
                        getFont(['font', utf8_encode('맑은 고딕'), 'Hang']),
                        getFont(['font', utf8_encode('等线'), 'Hans']),
                        getFont(['font', utf8_encode('新細明體'), 'Hant']),
                        getFont(['font', 'Arial', 'Arab']),
                        getFont(['font', 'Arial', 'Hebr']),
                        getFont(['font', 'Tahoma', 'Thai']),
                        getFont(['font', 'Nyala', 'Ethi']),
                        getFont(['font', 'Vrinda', 'Beng']),
                        getFont(['font', 'Shruti', 'Gujr']),
                        getFont(['font', 'DaunPenh', 'Khmr']),
                        getFont(['font', 'Tunga', 'Knda']),
                        getFont(['font', 'Raavi', 'Guru']),
                        getFont(['font', 'Euphemia', 'Cans']),
                        getFont(['font', 'Plantagenet Cherokee', 'Cher']),
                        getFont(['font', 'Microsoft Yi Baiti', 'Yiii']),
                        getFont(['font', 'Microsoft Himalaya', 'Tibt']),
                        getFont(['font', 'MV Boli', 'Thaa']),
                        getFont(['font', 'Mangal', 'Deva']),
                        getFont(['font', 'Gautami', 'Telu']),
                        getFont(['font', 'Latha', 'Taml']),
                        getFont(['font', 'Estrangelo Edessa', 'Syrc']),
                        getFont(['font', 'Kalinga', 'Orya']),
                        getFont(['font', 'Kartika', 'Mlym']),
                        getFont(['font', 'DokChampa', 'Laoo']),
                        getFont(['font', 'Iskoola Pota', 'Sinh']),
                        getFont(['font', 'Mongolian Baiti', 'Mong']),
                        getFont(['font', 'Arial', 'Viet']),
                        getFont(['font', 'Microsoft Uighur', 'Uigh']),
                        getFont(['font', 'Sylfaen', 'Geor']),
                        getFont(['font', 'Arial', 'Armn']),
                        getFont(['font', 'Leelawadee UI', 'Bugi']),
                        getFont(['font', 'Microsoft JhengHei', 'Bopo']),
                        getFont(['font', 'Javanese Text', 'Java']),
                        getFont(['font', 'Segoe UI', 'Lisu']),
                        getFont(['font', 'Myanmar Text', 'Mymr']),
                        getFont(['font', 'Ebrima', 'Nkoo']),
                        getFont(['font', 'Nirmala UI', 'Olck']),
                        getFont(['font', 'Ebrima', 'Osma']),
                        getFont(['font', 'Phagspa', 'Phag']),
                        getFont(['font', 'Estrangelo Edessa', 'Syrn']),
                        getFont(['font', 'Estrangelo Edessa', 'Syrj']),
                        getFont(['font', 'Estrangelo Edessa', 'Syre']),
                        getFont(['font', 'Nirmala UI', 'Sora']),
                        getFont(['font', 'Microsoft Tai Le', 'Tale']),
                        getFont(['font', 'Microsoft New Tai Lue', 'Talu']),
                        getFont(['font', 'Ebrima', 'Tfng'])
                    ]
                }]
        };
    }
};

var __read$2 = (undefined && undefined.__read) || function (o, n) {
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
var getPropertyVal = function (name, val, children) { return ({
    name: "a:" + name,
    properties: {
        rawMap: {
            val: val
        }
    },
    children: children
}); };
var getGs = function (props) {
    var _a = __read$2(props, 6), pos = _a[0], schemeColor = _a[1], satMod = _a[2], lumMod = _a[3], tint = _a[4], shade = _a[5];
    var children = [];
    children.push(getPropertyVal('satMod', satMod));
    if (lumMod) {
        children.push(getPropertyVal('lumMod', lumMod));
    }
    if (tint) {
        children.push(getPropertyVal('tint', tint));
    }
    if (shade) {
        children.push(getPropertyVal('shade', shade));
    }
    return {
        name: 'a:gs',
        properties: {
            rawMap: {
                pos: pos
            }
        },
        children: [{
                name: 'a:schemeClr',
                properties: {
                    rawMap: {
                        val: schemeColor
                    }
                },
                children: children
            }]
    };
};
var getSolidFill = function (val, children) { return ({
    name: 'a:solidFill',
    children: [getPropertyVal('schemeClr', val, children)]
}); };
var getGradFill = function (props) {
    var _a = __read$2(props, 5), rotWithShape = _a[0], gs1 = _a[1], gs2 = _a[2], gs3 = _a[3], lin = _a[4];
    var _b = __read$2(lin, 2), ang = _b[0], scaled = _b[1];
    return {
        name: 'a:gradFill',
        properties: {
            rawMap: {
                rotWithShape: rotWithShape
            }
        },
        children: [{
                name: 'a:gsLst',
                children: [
                    getGs(gs1),
                    getGs(gs2),
                    getGs(gs3)
                ]
            }, {
                name: 'a:lin',
                properties: {
                    rawMap: {
                        ang: ang,
                        scaled: scaled
                    }
                }
            }]
    };
};
var getLine = function (props) {
    var _a = __read$2(props, 4), w = _a[0], cap = _a[1], cmpd = _a[2], algn = _a[3];
    return {
        name: 'a:ln',
        properties: {
            rawMap: { w: w, cap: cap, cmpd: cmpd, algn: algn }
        },
        children: [
            getSolidFill('phClr'),
            getPropertyVal('prstDash', 'solid'),
            {
                name: 'a:miter',
                properties: {
                    rawMap: {
                        lim: '800000'
                    }
                }
            }
        ]
    };
};
var getEffectStyle = function (shadow) {
    var children = [];
    if (shadow) {
        var _a = __read$2(shadow, 5), blurRad = _a[0], dist = _a[1], dir = _a[2], algn = _a[3], rotWithShape = _a[4];
        children.push({
            name: 'a:outerShdw',
            properties: {
                rawMap: { blurRad: blurRad, dist: dist, dir: dir, algn: algn, rotWithShape: rotWithShape }
            },
            children: [
                getPropertyVal('srgbClr', '000000', [getPropertyVal('alpha', '63000')])
            ]
        });
    }
    return {
        name: 'a:effectStyle',
        children: [Object.assign({}, {
                name: 'a:effectLst'
            }, children.length ? { children: children } : {})]
    };
};
var getFillStyleList = function () { return ({
    name: 'a:fillStyleLst',
    children: [
        getSolidFill('phClr'),
        getGradFill([
            '1',
            ['0', 'phClr', '105000', '110000', '67000'],
            ['50000', 'phClr', '103000', '105000', '73000'],
            ['100000', 'phClr', '109000', '105000', '81000'],
            ['5400000', '0']
        ]),
        getGradFill([
            '1',
            ['0', 'phClr', '103000', '102000', '94000'],
            ['50000', 'phClr', '110000', '100000', undefined, '100000'],
            ['100000', 'phClr', '120000', '99000', undefined, '78000'],
            ['5400000', '0']
        ])
    ]
}); };
var getLineStyleList = function () { return ({
    name: 'a:lnStyleLst',
    children: [
        getLine(['6350', 'flat', 'sng', 'ctr']),
        getLine(['12700', 'flat', 'sng', 'ctr']),
        getLine(['19050', 'flat', 'sng', 'ctr'])
    ]
}); };
var getEffectStyleList = function () { return ({
    name: 'a:effectStyleLst',
    children: [
        getEffectStyle(),
        getEffectStyle(),
        getEffectStyle(['57150', '19050', '5400000', 'ctr', '0'])
    ]
}); };
var getBgFillStyleList = function () { return ({
    name: 'a:bgFillStyleLst',
    children: [
        getSolidFill('phClr'),
        getSolidFill('phClr', [
            getPropertyVal('tint', '95000'),
            getPropertyVal('satMod', '170000'),
        ]),
        getGradFill([
            '1',
            ['0', 'phClr', '150000', '102000', '93000', '98000'],
            ['50000', 'phClr', '130000', '103000', '98000', '90000'],
            ['100000', 'phClr', '120000', undefined, undefined, '63000'],
            ['5400000', '0']
        ])
    ]
}); };
var formatScheme = {
    getTemplate: function () {
        return {
            name: "a:fmtScheme",
            properties: {
                rawMap: {
                    name: "Office"
                }
            },
            children: [
                getFillStyleList(),
                getLineStyleList(),
                getEffectStyleList(),
                getBgFillStyleList()
            ]
        };
    }
};

var themeElements = {
    getTemplate: function () {
        return {
            name: "a:themeElements",
            children: [
                colorScheme.getTemplate(),
                fontScheme.getTemplate(),
                formatScheme.getTemplate()
            ]
        };
    }
};

var officeTheme = {
    getTemplate: function () {
        return {
            name: "a:theme",
            properties: {
                prefixedAttributes: [{
                        prefix: "xmlns:",
                        map: {
                            a: "http://schemas.openxmlformats.org/drawingml/2006/main"
                        },
                    }],
                rawMap: {
                    name: "Office Theme"
                }
            },
            children: [
                themeElements.getTemplate(),
                {
                    name: 'a:objectDefaults'
                },
                {
                    name: 'a:extraClrSchemeLst'
                }
            ]
        };
    }
};

var buildSharedString = function (strMap) {
    var ret = [];
    strMap.forEach(function (val, key) {
        var textNode = key.toString();
        var child = {
            name: 't',
            textNode: core._.utf8_encode(core._.escapeString(textNode))
        };
        // if we have leading or trailing spaces, instruct Excel not to trim them
        var preserveSpaces = textNode.trim().length !== textNode.length;
        if (preserveSpaces) {
            child.properties = {
                rawMap: {
                    "xml:space": "preserve"
                }
            };
        }
        ret.push({
            name: 'si',
            children: [child]
        });
    });
    return ret;
};
var sharedStrings = {
    getTemplate: function (strings) {
        return {
            name: "sst",
            properties: {
                rawMap: {
                    xmlns: 'http://schemas.openxmlformats.org/spreadsheetml/2006/main',
                    count: strings.size,
                    uniqueCount: strings.size
                }
            },
            children: buildSharedString(strings)
        };
    }
};

var numberFormatFactory = {
    getTemplate: function (numberFormat) {
        var formatCode = numberFormat.formatCode, numFmtId = numberFormat.numFmtId;
        return {
            name: "numFmt",
            properties: {
                rawMap: {
                    formatCode: formatCode,
                    numFmtId: numFmtId
                }
            }
        };
    }
};

var numberFormatsFactory = {
    getTemplate: function (numberFormats) {
        return {
            name: "numFmts",
            properties: {
                rawMap: {
                    count: numberFormats.length
                }
            },
            children: numberFormats.map(function (numberFormat) { return numberFormatFactory.getTemplate(numberFormat); })
        };
    }
};

var fontFactory = {
    getTemplate: function (font) {
        var size = font.size, colorTheme = font.colorTheme, _a = font.color, color = _a === void 0 ? 'FF000000' : _a, _b = font.fontName, fontName = _b === void 0 ? 'Calibri' : _b, family = font.family, scheme = font.scheme, italic = font.italic, bold = font.bold, strikeThrough = font.strikeThrough, outline = font.outline, shadow = font.shadow, underline = font.underline, verticalAlign = font.verticalAlign;
        var children = [
            { name: 'sz', properties: { rawMap: { val: size } } },
            { name: 'color', properties: { rawMap: { theme: colorTheme, rgb: color } } },
            { name: 'name', properties: { rawMap: { val: fontName } } }
        ];
        if (family) {
            children.push({ name: 'family', properties: { rawMap: { val: family } } });
        }
        if (scheme) {
            children.push({ name: 'scheme', properties: { rawMap: { val: scheme } } });
        }
        if (italic) {
            children.push({ name: 'i' });
        }
        if (bold) {
            children.push({ name: 'b' });
        }
        if (strikeThrough) {
            children.push({ name: 'strike' });
        }
        if (outline) {
            children.push({ name: 'outline' });
        }
        if (shadow) {
            children.push({ name: 'shadow' });
        }
        if (underline) {
            children.push({ name: 'u', properties: { rawMap: { val: underline } } });
        }
        if (verticalAlign) {
            children.push({ name: 'vertAlign', properties: { rawMap: { val: verticalAlign } } });
        }
        return { name: "font", children: children };
    }
};

var fontsFactory = {
    getTemplate: function (fonts) {
        return {
            name: "fonts",
            properties: {
                rawMap: {
                    count: fonts.length
                }
            },
            children: fonts.map(function (font) { return fontFactory.getTemplate(font); })
        };
    }
};

var fillFactory = {
    getTemplate: function (fill) {
        var patternType = fill.patternType, fgTheme = fill.fgTheme, fgTint = fill.fgTint, fgRgb = fill.fgRgb, bgRgb = fill.bgRgb, bgIndexed = fill.bgIndexed;
        var pf = {
            name: 'patternFill',
            properties: {
                rawMap: {
                    patternType: patternType
                }
            }
        };
        if (fgTheme || fgTint || fgRgb) {
            pf.children = [{
                    name: 'fgColor',
                    properties: {
                        rawMap: {
                            theme: fgTheme,
                            tint: fgTint,
                            rgb: fgRgb
                        }
                    }
                }];
        }
        if (bgIndexed || bgRgb) {
            if (!pf.children) {
                pf.children = [];
            }
            pf.children.push({
                name: 'bgColor',
                properties: {
                    rawMap: {
                        indexed: bgIndexed,
                        rgb: bgRgb
                    }
                }
            });
        }
        return {
            name: "fill",
            children: [pf]
        };
    }
};

var fillsFactory = {
    getTemplate: function (fills) {
        return {
            name: "fills",
            properties: {
                rawMap: {
                    count: fills.length
                }
            },
            children: fills.map(function (fill) { return fillFactory.getTemplate(fill); })
        };
    }
};

var getWeightName = function (value) {
    switch (value) {
        case 1: return 'thin';
        case 2: return 'medium';
        case 3: return 'thick';
        default: return 'hair';
    }
};
var mappedBorderNames = {
    None: 'None',
    Dot: 'Dotted',
    Dash: 'Dashed',
    Double: 'Double',
    DashDot: 'DashDot',
    DashDotDot: 'DashDotDot',
    SlantDashDot: 'SlantDashDot'
};
var mediumBorders = ['Dashed', 'DashDot', 'DashDotDot'];
var colorMap = {
    None: 'none',
    Solid: 'solid',
    Gray50: 'mediumGray',
    Gray75: 'darkGray',
    Gray25: 'lightGray',
    HorzStripe: 'darkHorizontal',
    VertStripe: 'darkVertical',
    ReverseDiagStripe: 'darkDown',
    DiagStripe: 'darkUp',
    DiagCross: 'darkGrid',
    ThickDiagCross: 'darkTrellis',
    ThinHorzStripe: 'lightHorizontal',
    ThinVertStripe: 'lightVertical',
    ThinReverseDiagStripe: 'lightDown',
    ThinDiagStripe: 'lightUp',
    ThinHorzCross: 'lightGrid',
    ThinDiagCross: 'lightTrellis',
    Gray125: 'gray125',
    Gray0625: 'gray0625'
};
var horizontalAlignmentMap = {
    Automatic: 'general',
    Left: 'left',
    Center: 'center',
    Right: 'right',
    Fill: 'fill',
    Justify: 'justify',
    CenterAcrossSelection: 'centerContinuous',
    Distributed: 'distributed',
    JustifyDistributed: 'justify'
};
var verticalAlignmentMap = {
    Automatic: undefined,
    Top: 'top',
    Bottom: 'bottom',
    Center: 'center',
    Justify: 'justify',
    Distributed: 'distributed',
    JustifyDistributed: 'justify'
};
var convertLegacyPattern = function (name) {
    if (!name) {
        return 'none';
    }
    return colorMap[name] || name;
};
var convertLegacyColor = function (color) {
    if (color == undefined) {
        return color;
    }
    if (color.charAt(0) === '#') {
        color = color.substr(1);
    }
    return color.length === 6 ? 'FF' + color : color;
};
var convertLegacyBorder = function (type, weight) {
    if (!type) {
        return 'thin';
    }
    // Legacy Types are: None, Continuous, Dash, Dot, DashDot, DashDotDot, SlantDashDot, and Double
    // Weight represents: 0—Hairline, 1—Thin , 2—Medium, 3—Thick
    // New types: none, thin, medium, dashed, dotted, thick, double, hair, mediumDashed, dashDot, mediumDashDot,
    // dashDotDot, mediumDashDotDot, slantDashDot
    var namedWeight = getWeightName(weight);
    var mappedName = mappedBorderNames[type];
    if (type === 'Continuous') {
        return namedWeight;
    }
    if (namedWeight === 'medium' && mediumBorders.indexOf(mappedName) !== -1) {
        return "medium" + mappedName;
    }
    return mappedName.charAt(0).toLowerCase() + mappedName.substr(1);
};
var convertLegacyHorizontalAlignment = function (alignment) {
    return horizontalAlignmentMap[alignment] || 'general';
};
var convertLegacyVerticalAlignment = function (alignment) {
    return verticalAlignmentMap[alignment] || undefined;
};

var getBorderColor = function (color) {
    return {
        name: 'color',
        properties: {
            rawMap: {
                rgb: convertLegacyColor(color || '#000000')
            }
        }
    };
};
var borderFactory$1 = {
    getTemplate: function (border) {
        var left = border.left, right = border.right, top = border.top, bottom = border.bottom, diagonal = border.diagonal;
        var leftChildren = left ? [getBorderColor(left.color)] : undefined;
        var rightChildren = right ? [getBorderColor(right.color)] : undefined;
        var topChildren = top ? [getBorderColor(top.color)] : undefined;
        var bottomChildren = bottom ? [getBorderColor(bottom.color)] : undefined;
        var diagonalChildren = diagonal ? [getBorderColor(diagonal.color)] : undefined;
        return {
            name: 'border',
            children: [{
                    name: 'left',
                    properties: { rawMap: { style: left && left.style } },
                    children: leftChildren
                }, {
                    name: 'right',
                    properties: { rawMap: { style: right && right.style } },
                    children: rightChildren
                }, {
                    name: 'top',
                    properties: { rawMap: { style: top && top.style } },
                    children: topChildren
                }, {
                    name: 'bottom',
                    properties: { rawMap: { style: bottom && bottom.style } },
                    children: bottomChildren
                }, {
                    name: 'diagonal',
                    properties: { rawMap: { style: diagonal && diagonal.style } },
                    children: diagonalChildren
                }]
        };
    }
};

var bordersFactory = {
    getTemplate: function (borders) {
        return {
            name: "borders",
            properties: {
                rawMap: {
                    count: borders.length
                }
            },
            children: borders.map(function (border) { return borderFactory$1.getTemplate(border); })
        };
    }
};

var getReadingOrderId = function (readingOrder) {
    var order = ['Context', 'LeftToRight', 'RightToLeft'];
    var pos = order.indexOf(readingOrder);
    return Math.max(pos, 0);
};
var alignmentFactory = {
    getTemplate: function (alignment) {
        var horizontal = alignment.horizontal, indent = alignment.indent, readingOrder = alignment.readingOrder, rotate = alignment.rotate, shrinkToFit = alignment.shrinkToFit, vertical = alignment.vertical, wrapText = alignment.wrapText;
        return {
            name: 'alignment',
            properties: {
                rawMap: {
                    horizontal: horizontal && convertLegacyHorizontalAlignment(horizontal),
                    indent: indent,
                    readingOrder: readingOrder && getReadingOrderId(readingOrder),
                    textRotation: rotate,
                    shrinkToFit: shrinkToFit,
                    vertical: vertical && convertLegacyVerticalAlignment(vertical),
                    wrapText: wrapText
                }
            }
        };
    }
};

var protectionFactory = {
    getTemplate: function (protection) {
        var locked = protection.protected === false ? 0 : 1;
        var hidden = protection.hideFormula === true ? 1 : 0;
        return {
            name: 'protection',
            properties: {
                rawMap: {
                    hidden: hidden,
                    locked: locked
                }
            }
        };
    }
};

var xfFactory = {
    getTemplate: function (xf) {
        var alignment = xf.alignment, borderId = xf.borderId, fillId = xf.fillId, fontId = xf.fontId, numFmtId = xf.numFmtId, protection = xf.protection, xfId = xf.xfId;
        var children = [];
        if (alignment) {
            children.push(alignmentFactory.getTemplate(alignment));
        }
        if (protection) {
            children.push(protectionFactory.getTemplate(protection));
        }
        return {
            name: "xf",
            properties: {
                rawMap: {
                    applyAlignment: alignment ? 1 : undefined,
                    applyProtection: protection ? 1 : undefined,
                    applyBorder: borderId ? 1 : undefined,
                    applyFill: fillId ? 1 : undefined,
                    borderId: borderId,
                    fillId: fillId,
                    applyFont: fontId ? 1 : undefined,
                    fontId: fontId,
                    applyNumberFormat: numFmtId ? 1 : undefined,
                    numFmtId: numFmtId,
                    xfId: xfId
                }
            },
            children: children.length ? children : undefined
        };
    }
};

var cellStylesXfsFactory = {
    getTemplate: function (xfs) {
        return {
            name: "cellStyleXfs",
            properties: {
                rawMap: {
                    count: xfs.length
                }
            },
            children: xfs.map(function (xf) { return xfFactory.getTemplate(xf); })
        };
    }
};

var cellXfsFactory = {
    getTemplate: function (xfs) {
        return {
            name: "cellXfs",
            properties: {
                rawMap: {
                    count: xfs.length
                }
            },
            children: xfs.map(function (xf) { return xfFactory.getTemplate(xf); })
        };
    }
};

var borderFactory = {
    getTemplate: function (cellStyle) {
        var builtinId = cellStyle.builtinId, name = cellStyle.name, xfId = cellStyle.xfId;
        return {
            name: "cellStyle",
            properties: {
                rawMap: {
                    builtinId: builtinId,
                    name: name,
                    xfId: xfId
                }
            }
        };
    }
};

var cellStylesFactory = {
    getTemplate: function (cellStyles) {
        return {
            name: "cellStyles",
            properties: {
                rawMap: {
                    count: cellStyles.length
                }
            },
            children: cellStyles.map(function (cellStyle) { return borderFactory.getTemplate(cellStyle); })
        };
    }
};

var __assign$1 = (undefined && undefined.__assign) || function () {
    __assign$1 = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign$1.apply(this, arguments);
};
var stylesMap;
var registeredNumberFmts;
var registeredFonts;
var registeredFills;
var registeredBorders;
var registeredCellStyleXfs;
var registeredCellXfs;
var registeredCellStyles;
var currentSheet;
var getStyleName = function (name, currentSheet) {
    if (name.indexOf('mixedStyle') !== -1 && currentSheet > 1) {
        name += "_" + currentSheet;
    }
    return name;
};
var resetStylesheetValues = function () {
    stylesMap = { base: 0 };
    registeredNumberFmts = [];
    registeredFonts = [{ fontName: 'Calibri', colorTheme: '1', family: '2', scheme: 'minor' }];
    registeredFills = [{ patternType: 'none', }, { patternType: 'gray125' }];
    registeredBorders = [{ left: undefined, right: undefined, top: undefined, bottom: undefined, diagonal: undefined }];
    registeredCellStyleXfs = [{ borderId: 0, fillId: 0, fontId: 0, numFmtId: 0 }];
    registeredCellXfs = [{ borderId: 0, fillId: 0, fontId: 0, numFmtId: 0, xfId: 0 }];
    registeredCellStyles = [{ builtinId: 0, name: 'Normal', xfId: 0 }];
};
var registerFill = function (fill) {
    var convertedPattern = convertLegacyPattern(fill.pattern);
    var convertedFillColor = convertLegacyColor(fill.color);
    var convertedPatternColor = convertLegacyColor(fill.patternColor);
    var pos = registeredFills.findIndex(function (currentFill) {
        var patternType = currentFill.patternType, fgRgb = currentFill.fgRgb, bgRgb = currentFill.bgRgb;
        if (patternType != convertedPattern ||
            fgRgb != convertedFillColor ||
            bgRgb != convertedPatternColor) {
            return false;
        }
        return true;
    });
    if (pos === -1) {
        pos = registeredFills.length;
        registeredFills.push({ patternType: convertedPattern, fgRgb: convertedFillColor, bgRgb: convertedPatternColor });
    }
    return pos;
};
var registerNumberFmt = function (format) {
    format = core._.utf8_encode(format);
    if (numberFormatMap[format]) {
        return numberFormatMap[format];
    }
    var pos = registeredNumberFmts.findIndex(function (currentFormat) { return currentFormat.formatCode === format; });
    if (pos === -1) {
        pos = registeredNumberFmts.length + 164;
        registeredNumberFmts.push({ formatCode: format, numFmtId: pos });
    }
    else {
        pos = registeredNumberFmts[pos].numFmtId;
    }
    return pos;
};
var registerBorders = function (borders) {
    var borderBottom = borders.borderBottom, borderTop = borders.borderTop, borderLeft = borders.borderLeft, borderRight = borders.borderRight;
    var bottomStyle;
    var topStyle;
    var leftStyle;
    var rightStyle;
    var bottomColor;
    var topColor;
    var leftColor;
    var rightColor;
    if (borderLeft) {
        leftStyle = convertLegacyBorder(borderLeft.lineStyle, borderLeft.weight);
        leftColor = convertLegacyColor(borderLeft.color);
    }
    if (borderRight) {
        rightStyle = convertLegacyBorder(borderRight.lineStyle, borderRight.weight);
        rightColor = convertLegacyColor(borderRight.color);
    }
    if (borderBottom) {
        bottomStyle = convertLegacyBorder(borderBottom.lineStyle, borderBottom.weight);
        bottomColor = convertLegacyColor(borderBottom.color);
    }
    if (borderTop) {
        topStyle = convertLegacyBorder(borderTop.lineStyle, borderTop.weight);
        topColor = convertLegacyColor(borderTop.color);
    }
    var pos = registeredBorders.findIndex(function (currentBorder) {
        var left = currentBorder.left, right = currentBorder.right, top = currentBorder.top, bottom = currentBorder.bottom;
        if (!left && (leftStyle || leftColor)) {
            return false;
        }
        if (!right && (rightStyle || rightColor)) {
            return false;
        }
        if (!top && (topStyle || topColor)) {
            return false;
        }
        if (!bottom && (bottomStyle || bottomColor)) {
            return false;
        }
        var _a = left || {}, clS = _a.style, clC = _a.color;
        var _b = right || {}, crS = _b.style, crC = _b.color;
        var _c = top || {}, ctS = _c.style, ctC = _c.color;
        var _d = bottom || {}, cbS = _d.style, cbC = _d.color;
        if (clS != leftStyle || clC != leftColor) {
            return false;
        }
        if (crS != rightStyle || crC != rightColor) {
            return false;
        }
        if (ctS != topStyle || ctC != topColor) {
            return false;
        }
        if (cbS != bottomStyle || cbC != bottomColor) {
            return false;
        }
        return true;
    });
    if (pos === -1) {
        pos = registeredBorders.length;
        registeredBorders.push({
            left: {
                style: leftStyle, color: leftColor
            },
            right: {
                style: rightStyle, color: rightColor
            },
            top: {
                style: topStyle, color: topColor
            },
            bottom: {
                style: bottomStyle, color: bottomColor
            },
            diagonal: {
                style: undefined,
                color: undefined
            }
        });
    }
    return pos;
};
var registerFont = function (font) {
    var _a = font.fontName, name = _a === void 0 ? 'Calibri' : _a, color = font.color, size = font.size, bold = font.bold, italic = font.italic, outline = font.outline, shadow = font.shadow, strikeThrough = font.strikeThrough, underline = font.underline, family = font.family, verticalAlign = font.verticalAlign;
    var utf8Name = name ? core._.utf8_encode(name) : name;
    var convertedColor = convertLegacyColor(color);
    var familyId = getFontFamilyId(family);
    var convertedUnderline = underline ? underline.toLocaleLowerCase() : undefined;
    var convertedVerticalAlign = verticalAlign ? verticalAlign.toLocaleLowerCase() : undefined;
    var pos = registeredFonts.findIndex(function (currentFont) {
        if (currentFont.fontName != utf8Name ||
            currentFont.color != convertedColor ||
            currentFont.size != size ||
            currentFont.bold != bold ||
            currentFont.italic != italic ||
            currentFont.outline != outline ||
            currentFont.shadow != shadow ||
            currentFont.strikeThrough != strikeThrough ||
            currentFont.underline != convertedUnderline ||
            currentFont.verticalAlign != convertedVerticalAlign ||
            // @ts-ignore
            currentFont.family != familyId) {
            return false;
        }
        return true;
    });
    if (pos === -1) {
        pos = registeredFonts.length;
        registeredFonts.push({
            fontName: utf8Name,
            color: convertedColor,
            size: size,
            bold: bold,
            italic: italic,
            outline: outline,
            shadow: shadow,
            strikeThrough: strikeThrough,
            underline: convertedUnderline,
            verticalAlign: convertedVerticalAlign,
            family: familyId != null ? familyId.toString() : undefined
        });
    }
    return pos;
};
var registerStyle = function (config) {
    var alignment = config.alignment, borders = config.borders, font = config.font, interior = config.interior, numberFormat = config.numberFormat, protection = config.protection;
    var id = config.id;
    var currentFill = 0;
    var currentBorder = 0;
    var currentFont = 0;
    var currentNumberFmt = 0;
    if (!id) {
        return;
    }
    id = getStyleName(id, currentSheet);
    if (stylesMap[id] != undefined) {
        return;
    }
    if (interior) {
        currentFill = registerFill(interior);
    }
    if (borders) {
        currentBorder = registerBorders(borders);
    }
    if (font) {
        currentFont = registerFont(font);
    }
    if (numberFormat) {
        currentNumberFmt = registerNumberFmt(numberFormat.format);
    }
    stylesMap[id] = registeredCellXfs.length;
    registeredCellXfs.push({
        alignment: alignment,
        borderId: currentBorder || 0,
        fillId: currentFill || 0,
        fontId: currentFont || 0,
        numFmtId: currentNumberFmt || 0,
        protection: protection,
        xfId: 0
    });
};
var stylesheetFactory = {
    getTemplate: function (defaultFontSize) {
        var numberFormats = numberFormatsFactory.getTemplate(registeredNumberFmts);
        var fonts = fontsFactory.getTemplate(registeredFonts.map(function (font) { return (__assign$1(__assign$1({}, font), { size: font.size != null ? font.size : defaultFontSize })); }));
        var fills = fillsFactory.getTemplate(registeredFills);
        var borders = bordersFactory.getTemplate(registeredBorders);
        var cellStylesXfs = cellStylesXfsFactory.getTemplate(registeredCellStyleXfs);
        var cellXfs = cellXfsFactory.getTemplate(registeredCellXfs);
        var cellStyles = cellStylesFactory.getTemplate(registeredCellStyles);
        resetStylesheetValues();
        return {
            name: 'styleSheet',
            properties: {
                rawMap: {
                    'mc:Ignorable': 'x14ac x16r2 xr',
                    'xmlns': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main',
                    'xmlns:mc': 'http://schemas.openxmlformats.org/markup-compatibility/2006',
                    'xmlns:x14ac': 'http://schemas.microsoft.com/office/spreadsheetml/2009/9/ac',
                    'xmlns:x16r2': 'http://schemas.microsoft.com/office/spreadsheetml/2015/02/main',
                    'xmlns:xr': 'http://schemas.microsoft.com/office/spreadsheetml/2014/revision'
                }
            },
            children: [
                numberFormats,
                fonts,
                fills,
                borders,
                cellStylesXfs,
                cellXfs,
                cellStyles,
                {
                    name: 'tableStyles',
                    properties: {
                        rawMap: {
                            count: 0,
                            defaultPivotStyle: 'PivotStyleLight16',
                            defaultTableStyle: 'TableStyleMedium2'
                        }
                    }
                }
            ]
        };
    }
};
var getStyleId = function (name, currentSheet) {
    return stylesMap[getStyleName(name, currentSheet)] || 0;
};
var registerStyles = function (styles, _currentSheet) {
    currentSheet = _currentSheet;
    if (currentSheet === 1) {
        resetStylesheetValues();
    }
    styles.forEach(registerStyle);
};

var sheetFactory = {
    getTemplate: function (name, idx) {
        var sheetId = (idx + 1).toString();
        return {
            name: "sheet",
            properties: {
                rawMap: {
                    "name": name,
                    "sheetId": sheetId,
                    "r:id": "rId" + sheetId
                }
            }
        };
    }
};

var sheetsFactory = {
    getTemplate: function (names) {
        return {
            name: "sheets",
            children: names.map(function (sheet, idx) { return sheetFactory.getTemplate(sheet, idx); })
        };
    }
};

var workbookFactory = {
    getTemplate: function (names) {
        return {
            name: "workbook",
            properties: {
                prefixedAttributes: [{
                        prefix: "xmlns:",
                        map: {
                            r: "http://schemas.openxmlformats.org/officeDocument/2006/relationships"
                        },
                    }],
                rawMap: {
                    xmlns: "http://schemas.openxmlformats.org/spreadsheetml/2006/main"
                }
            },
            children: [sheetsFactory.getTemplate(names)]
        };
    }
};

// https://docs.microsoft.com/en-us/office/troubleshoot/excel/determine-column-widths
var getExcelCellWidth = function (width) { return Math.ceil((width - 12) / 7 + 1); };
var columnFactory = {
    getTemplate: function (config) {
        var min = config.min, max = config.max, outlineLevel = config.outlineLevel, s = config.s, width = config.width, hidden = config.hidden, bestFit = config.bestFit;
        var excelWidth = 1;
        var customWidth = '0';
        if (width > 1) {
            excelWidth = getExcelCellWidth(width);
            customWidth = '1';
        }
        return {
            name: 'col',
            properties: {
                rawMap: {
                    min: min,
                    max: max,
                    outlineLevel: outlineLevel != null ? outlineLevel : undefined,
                    width: excelWidth,
                    style: s,
                    hidden: hidden ? '1' : '0',
                    bestFit: bestFit ? '1' : '0',
                    customWidth: customWidth
                }
            }
        };
    }
};

var convertLegacyType = function (type) {
    var t = type.charAt(0).toLowerCase();
    return t === 's' ? 'inlineStr' : t;
};
var cellFactory = {
    getTemplate: function (config, idx, currentSheet) {
        var ref = config.ref, data = config.data, styleId = config.styleId;
        var _a = data || { type: 'empty', value: null }, type = _a.type, value = _a.value;
        var convertedType = type;
        if (type === 'f') {
            convertedType = 'str';
        }
        else if (type.charAt(0) === type.charAt(0).toUpperCase()) {
            convertedType = convertLegacyType(type);
        }
        var obj = {
            name: 'c',
            properties: {
                rawMap: {
                    r: ref,
                    t: convertedType === 'empty' ? undefined : convertedType,
                    s: styleId ? getStyleId(styleId, currentSheet) : undefined
                }
            }
        };
        if (convertedType === 'empty') {
            return obj;
        }
        var children;
        if (convertedType === 'str' && type === 'f') {
            children = [{
                    name: 'f',
                    textNode: core._.escapeString(core._.utf8_encode(value))
                }];
        }
        else if (convertedType === 'inlineStr') {
            children = [{
                    name: 'is',
                    children: [{
                            name: 't',
                            textNode: core._.escapeString(core._.utf8_encode(value))
                        }]
                }];
        }
        else {
            children = [{
                    name: 'v',
                    textNode: value
                }];
        }
        return Object.assign({}, obj, { children: children });
    }
};

var __read$1 = (undefined && undefined.__read) || function (o, n) {
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
var __spread$1 = (undefined && undefined.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read$1(arguments[i]));
    return ar;
};
var addEmptyCells = function (cells, rowIdx) {
    var mergeMap = [];
    var posCounter = 0;
    for (var i = 0; i < cells.length; i++) {
        var cell = cells[i];
        if (cell.mergeAcross) {
            mergeMap.push({
                pos: i,
                excelPos: posCounter
            });
            posCounter += cell.mergeAcross;
        }
        posCounter++;
    }
    if (mergeMap.length) {
        for (var i = mergeMap.length - 1; i >= 0; i--) {
            var mergedCells = [];
            var cell = cells[mergeMap[i].pos];
            for (var j = 1; j <= cell.mergeAcross; j++) {
                mergedCells.push({
                    ref: "" + getExcelColumnName(mergeMap[i].excelPos + 1 + j) + (rowIdx + 1),
                    styleId: cell.styleId,
                    data: { type: 'empty', value: null }
                });
            }
            if (mergedCells.length) {
                cells.splice.apply(cells, __spread$1([mergeMap[i].pos + 1, 0], mergedCells));
            }
        }
    }
};
var shouldDisplayCell = function (cell) { var _a; return ((_a = cell.data) === null || _a === void 0 ? void 0 : _a.value) !== '' || cell.styleId !== undefined; };
var rowFactory = {
    getTemplate: function (config, idx, currentSheet) {
        var collapsed = config.collapsed, hidden = config.hidden, height = config.height, outlineLevel = config.outlineLevel, _a = config.cells, cells = _a === void 0 ? [] : _a;
        addEmptyCells(cells, idx);
        var children = cells.filter(shouldDisplayCell).map(function (cell, idx) { return cellFactory.getTemplate(cell, idx, currentSheet); });
        return {
            name: "row",
            properties: {
                rawMap: {
                    r: idx + 1,
                    collapsed: collapsed,
                    hidden: hidden ? '1' : '0',
                    ht: height,
                    customHeight: height != null ? '1' : '0',
                    spans: '1:1',
                    outlineLevel: outlineLevel || undefined
                }
            },
            children: children
        };
    }
};

var mergeCellFactory = {
    getTemplate: function (ref) {
        return {
            name: 'mergeCell',
            properties: {
                rawMap: {
                    ref: ref
                }
            }
        };
    }
};

var getMergedCellsAndAddColumnGroups = function (rows, cols) {
    var mergedCells = [];
    var cellsWithCollapsibleGroups = [];
    rows.forEach(function (currentRow, rowIdx) {
        var cells = currentRow.cells;
        var merges = 0;
        var lastCol;
        cells.forEach(function (currentCell, cellIdx) {
            var min = cellIdx + merges + 1;
            var start = getExcelColumnName(min);
            var outputRow = rowIdx + 1;
            if (currentCell.mergeAcross) {
                merges += currentCell.mergeAcross;
                var end = getExcelColumnName(cellIdx + merges + 1);
                mergedCells.push("" + start + outputRow + ":" + end + outputRow);
            }
            if (!cols[min - 1]) {
                cols[min - 1] = {};
            }
            var collapsibleRanges = currentCell.collapsibleRanges;
            if (collapsibleRanges) {
                collapsibleRanges.forEach(function (range) {
                    cellsWithCollapsibleGroups.push([min + range[0], min + range[1]]);
                });
            }
            lastCol = cols[min - 1];
            lastCol.min = min;
            lastCol.max = min;
            currentCell.ref = "" + start + outputRow;
        });
    });
    cellsWithCollapsibleGroups.sort(function (a, b) {
        if (a[0] !== b[0]) {
            return a[0] - b[0];
        }
        return b[1] - a[1];
    });
    var rangeMap = new Map();
    var outlineLevel = new Map();
    cellsWithCollapsibleGroups.filter(function (currentRange) {
        var rangeString = currentRange.toString();
        var inMap = rangeMap.get(rangeString);
        if (inMap) {
            return false;
        }
        rangeMap.set(rangeString, true);
        return true;
    }).forEach(function (range) {
        var refCol = cols.find(function (col) { return col.min == range[0] && col.max == range[1]; });
        var currentOutlineLevel = outlineLevel.get(range[0]);
        cols.push({
            min: range[0],
            max: range[1],
            outlineLevel: currentOutlineLevel || 1,
            width: (refCol || { width: 100 }).width
        });
        outlineLevel.set(range[0], (currentOutlineLevel || 0) + 1);
    });
    return mergedCells;
};
var getPageOrientation = function (orientation) {
    if (!orientation || (orientation !== 'Portrait' && orientation !== 'Landscape')) {
        return 'portrait';
    }
    return orientation.toLocaleLowerCase();
};
var getPageSize = function (pageSize) {
    if (pageSize == null) {
        return 1;
    }
    var positions = ['Letter', 'Letter Small', 'Tabloid', 'Ledger', 'Legal', 'Statement', 'Executive', 'A3', 'A4', 'A4 Small', 'A5', 'A6', 'B4', 'B5', 'Folio', 'Envelope', 'Envelope DL', 'Envelope C5', 'Envelope B5', 'Envelope C3', 'Envelope C4', 'Envelope C6', 'Envelope Monarch', 'Japanese Postcard', 'Japanese Double Postcard'];
    var pos = positions.indexOf(pageSize);
    return pos === -1 ? 1 : (pos + 1);
};
var addColumns = function (columns) {
    return function (children) {
        if (columns.length) {
            children.push({
                name: 'cols',
                children: columns.map(function (column) { return columnFactory.getTemplate(column); })
            });
        }
        return children;
    };
};
var addSheetData = function (rows, sheetNumber) {
    return function (children) {
        if (rows.length) {
            children.push({
                name: 'sheetData',
                children: rows.map(function (row, idx) { return rowFactory.getTemplate(row, idx, sheetNumber); })
            });
        }
        return children;
    };
};
var addMergeCells = function (mergeCells) {
    return function (children) {
        if (mergeCells.length) {
            children.push({
                name: 'mergeCells',
                properties: {
                    rawMap: {
                        count: mergeCells.length
                    }
                },
                children: mergeCells.map(function (mergedCell) { return mergeCellFactory.getTemplate(mergedCell); })
            });
        }
        return children;
    };
};
var addPageMargins = function (margins) {
    return function (children) {
        var _a = margins.top, top = _a === void 0 ? 0.75 : _a, _b = margins.right, right = _b === void 0 ? 0.7 : _b, _c = margins.bottom, bottom = _c === void 0 ? 0.75 : _c, _d = margins.left, left = _d === void 0 ? 0.7 : _d, _e = margins.header, header = _e === void 0 ? 0.3 : _e, _f = margins.footer, footer = _f === void 0 ? 0.3 : _f;
        children.push({
            name: 'pageMargins',
            properties: {
                rawMap: { bottom: bottom, footer: footer, header: header, left: left, right: right, top: top }
            }
        });
        return children;
    };
};
var addPageSetup = function (pageSetup) {
    return function (children) {
        if (pageSetup) {
            children.push({
                name: 'pageSetup',
                properties: {
                    rawMap: {
                        horizontalDpi: 0,
                        verticalDpi: 0,
                        orientation: getPageOrientation(pageSetup.orientation),
                        paperSize: getPageSize(pageSetup.pageSize)
                    }
                }
            });
        }
        return children;
    };
};
var replaceHeaderFooterTokens = function (value) {
    var map = {
        '&[Page]': '&P',
        '&[Pages]': '&N',
        '&[Date]': '&D',
        '&[Time]': '&T',
        '&[Tab]': '&A',
        '&[Path]': '&Z',
        '&[File]': '&F'
    };
    core._.iterateObject(map, function (key, val) {
        value = value.replace(key, val);
    });
    return value;
};
var getHeaderPosition = function (position) {
    if (position === 'Center') {
        return 'C';
    }
    if (position === 'Right') {
        return 'R';
    }
    return 'L';
};
var applyHeaderFontStyle = function (headerString, font) {
    if (!font) {
        return headerString;
    }
    headerString += '&amp;&quot;';
    headerString += font.fontName || 'Calibri';
    if (font.bold !== font.italic) {
        headerString += font.bold ? ',Bold' : ',Italic';
    }
    else if (font.bold) {
        headerString += ',Bold Italic';
    }
    else {
        headerString += ',Regular';
    }
    headerString += '&quot;';
    if (font.size) {
        headerString += "&amp;" + font.size;
    }
    if (font.strikeThrough) {
        headerString += '&amp;S';
    }
    if (font.underline) {
        headerString += "&amp;" + (font.underline === 'Double' ? 'E' : 'U');
    }
    if (font.color) {
        headerString += "&amp;K" + font.color.replace('#', '').toUpperCase();
    }
    return headerString;
};
var processHeaderFooterContent = function (content) {
    return content.reduce(function (prev, curr) {
        var pos = getHeaderPosition(curr.position);
        var output = applyHeaderFontStyle(prev + "&amp;" + pos, curr.font);
        return "" + output + core._.escapeString(replaceHeaderFooterTokens(curr.value));
    }, '');
};
var buildHeaderFooter = function (headerFooterConfig) {
    var rules = ['all', 'first', 'even'];
    var headersAndFooters = [];
    rules.forEach(function (rule) {
        var headerFooter = headerFooterConfig[rule];
        var namePrefix = rule === 'all' ? 'odd' : rule;
        if (!headerFooter || (!headerFooter.header && !headerFooter.footer)) {
            return;
        }
        core._.iterateObject(headerFooter, function (key, value) {
            var nameSuffix = "" + key.charAt(0).toUpperCase() + key.slice(1);
            if (value) {
                headersAndFooters.push({
                    name: "" + namePrefix + nameSuffix,
                    properties: {
                        rawMap: {
                            'xml:space': 'preserve'
                        }
                    },
                    textNode: processHeaderFooterContent(value)
                });
            }
        });
    });
    return headersAndFooters;
};
var addHeaderFooter = function (headerFooterConfig) {
    return function (children) {
        if (!headerFooterConfig) {
            return children;
        }
        var differentFirst = headerFooterConfig.first != null ? 1 : 0;
        var differentOddEven = headerFooterConfig.even != null ? 1 : 0;
        children.push({
            name: 'headerFooter',
            properties: {
                rawMap: {
                    differentFirst: differentFirst,
                    differentOddEven: differentOddEven
                }
            },
            children: buildHeaderFooter(headerFooterConfig)
        });
        return children;
    };
};
var addDrawingRel = function (currentSheet) {
    return function (children) {
        if (ExcelXlsxFactory.worksheetImages.get(currentSheet)) {
            children.push({
                name: 'drawing',
                properties: {
                    rawMap: {
                        'r:id': 'rId1'
                    }
                }
            });
        }
        return children;
    };
};
var addSheetPr = function () {
    return function (children) {
        children.push({
            name: 'sheetPr',
            children: [{
                    name: 'outlinePr',
                    properties: {
                        rawMap: {
                            summaryBelow: 0
                        }
                    }
                }]
        });
        return children;
    };
};
var addSheetFormatPr = function (rows) {
    return function (children) {
        var maxOutline = rows.reduce(function (prev, row) {
            if (row.outlineLevel && row.outlineLevel > prev) {
                return row.outlineLevel;
            }
            return prev;
        }, 0);
        children.push({
            name: 'sheetFormatPr',
            properties: {
                rawMap: {
                    baseColWidth: 10,
                    defaultRowHeight: 16,
                    outlineLevelRow: maxOutline ? maxOutline : undefined
                }
            }
        });
        return children;
    };
};
var worksheetFactory = {
    getTemplate: function (params) {
        var worksheet = params.worksheet, currentSheet = params.currentSheet, _a = params.margins, margins = _a === void 0 ? {} : _a, pageSetup = params.pageSetup, headerFooterConfig = params.headerFooterConfig;
        var table = worksheet.table;
        var rows = table.rows, columns = table.columns;
        var mergedCells = (columns && columns.length) ? getMergedCellsAndAddColumnGroups(rows, columns) : [];
        var createWorksheetChildren = core._.compose(addSheetPr(), addSheetFormatPr(rows), addColumns(columns), addSheetData(rows, currentSheet + 1), addMergeCells(mergedCells), addPageMargins(margins), addPageSetup(pageSetup), addHeaderFooter(headerFooterConfig), addDrawingRel(currentSheet));
        var children = createWorksheetChildren([]);
        return {
            name: "worksheet",
            properties: {
                prefixedAttributes: [{
                        prefix: "xmlns:",
                        map: {
                            r: "http://schemas.openxmlformats.org/officeDocument/2006/relationships"
                        }
                    }],
                rawMap: {
                    xmlns: "http://schemas.openxmlformats.org/spreadsheetml/2006/main"
                }
            },
            children: children
        };
    }
};

var relationshipFactory = {
    getTemplate: function (config) {
        var Id = config.Id, Type = config.Type, Target = config.Target;
        return {
            name: "Relationship",
            properties: {
                rawMap: {
                    Id: Id,
                    Type: Type,
                    Target: Target
                }
            }
        };
    }
};

var relationshipsFactory = {
    getTemplate: function (c) {
        var children = c.map(function (relationship) { return relationshipFactory.getTemplate(relationship); });
        return {
            name: "Relationships",
            properties: {
                rawMap: {
                    xmlns: "http://schemas.openxmlformats.org/package/2006/relationships"
                }
            },
            children: children
        };
    }
};

var __read = (undefined && undefined.__read) || function (o, n) {
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
var __spread = (undefined && undefined.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
/**
 * See https://www.ecma-international.org/news/TC45_current_work/OpenXML%20White%20Paper.pdf
 */
var ExcelXlsxFactory = /** @class */ (function () {
    function ExcelXlsxFactory() {
    }
    ExcelXlsxFactory.createExcel = function (styles, worksheet, margins, pageSetup, headerFooterConfig) {
        this.addSheetName(worksheet);
        registerStyles(styles, this.sheetNames.length);
        return this.createWorksheet(worksheet, margins, pageSetup, headerFooterConfig);
    };
    ExcelXlsxFactory.buildImageMap = function (image, rowIndex, col, columnsToExport, rowHeight) {
        var currentSheetIndex = this.sheetNames.length;
        var registeredImage = this.images.get(image.id);
        if (!image.position || !image.position.row || !image.position.column) {
            if (!image.position) {
                image.position = {};
            }
            image.position = Object.assign({}, image.position, {
                row: rowIndex,
                column: columnsToExport.indexOf(col) + 1
            });
        }
        var calculatedImage = image;
        setExcelImageTotalWidth(calculatedImage, columnsToExport);
        setExcelImageTotalHeight(calculatedImage, rowHeight);
        if (registeredImage) {
            var currentSheetImages = registeredImage.find(function (currentImage) { return currentImage.sheetId === currentSheetIndex; });
            if (currentSheetImages) {
                currentSheetImages.image.push(calculatedImage);
            }
            else {
                registeredImage.push({
                    sheetId: currentSheetIndex,
                    image: [calculatedImage]
                });
            }
        }
        else {
            this.images.set(calculatedImage.id, [{ sheetId: currentSheetIndex, image: [calculatedImage] }]);
            this.workbookImageIds.set(calculatedImage.id, { type: calculatedImage.imageType, index: this.workbookImageIds.size });
        }
        this.buildSheetImageMap(currentSheetIndex, calculatedImage);
    };
    ExcelXlsxFactory.buildSheetImageMap = function (sheetIndex, image) {
        var worksheetImageIdMap = this.worksheetImageIds.get(sheetIndex);
        if (!worksheetImageIdMap) {
            worksheetImageIdMap = new Map();
            this.worksheetImageIds.set(sheetIndex, worksheetImageIdMap);
        }
        var sheetImages = this.worksheetImages.get(sheetIndex);
        if (!sheetImages) {
            this.worksheetImages.set(sheetIndex, [image]);
            worksheetImageIdMap.set(image.id, { index: 0, type: image.imageType });
        }
        else {
            sheetImages.push(image);
            if (!worksheetImageIdMap.get(image.id)) {
                worksheetImageIdMap.set(image.id, { index: worksheetImageIdMap.size, type: image.imageType });
            }
        }
    };
    ExcelXlsxFactory.addSheetName = function (worksheet) {
        var name = core._.escapeString(worksheet.name) || '';
        var append = '';
        while (this.sheetNames.indexOf("" + name + append) !== -1) {
            if (append === '') {
                append = '_1';
            }
            else {
                var curr = parseInt(append.slice(1), 10);
                append = "_" + (curr + 1);
            }
        }
        worksheet.name = "" + name + append;
        this.sheetNames.push(worksheet.name);
    };
    ExcelXlsxFactory.getStringPosition = function (str) {
        if (this.sharedStrings.has(str)) {
            return this.sharedStrings.get(str);
        }
        this.sharedStrings.set(str, this.sharedStrings.size);
        return this.sharedStrings.size - 1;
    };
    ExcelXlsxFactory.resetFactory = function () {
        this.sharedStrings = new Map();
        this.images = new Map();
        this.worksheetImages = new Map();
        this.workbookImageIds = new Map();
        this.worksheetImageIds = new Map();
        this.sheetNames = [];
        this.factoryMode = core.ExcelFactoryMode.SINGLE_SHEET;
    };
    ExcelXlsxFactory.createWorkbook = function () {
        return createXmlPart(workbookFactory.getTemplate(this.sheetNames));
    };
    ExcelXlsxFactory.createStylesheet = function (defaultFontSize) {
        return createXmlPart(stylesheetFactory.getTemplate(defaultFontSize));
    };
    ExcelXlsxFactory.createSharedStrings = function () {
        return createXmlPart(sharedStrings.getTemplate(this.sharedStrings));
    };
    ExcelXlsxFactory.createCore = function (author) {
        return createXmlPart(coreFactory.getTemplate(author));
    };
    ExcelXlsxFactory.createContentTypes = function (sheetLen) {
        return createXmlPart(contentTypesFactory.getTemplate(sheetLen));
    };
    ExcelXlsxFactory.createRels = function () {
        var rs = relationshipsFactory.getTemplate([{
                Id: 'rId1',
                Type: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument',
                Target: 'xl/workbook.xml'
            }, {
                Id: 'rId2',
                Type: 'http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties',
                Target: 'docProps/core.xml'
            }]);
        return createXmlPart(rs);
    };
    ExcelXlsxFactory.createTheme = function () {
        return createXmlPart(officeTheme.getTemplate());
    };
    ExcelXlsxFactory.createWorkbookRels = function (sheetLen) {
        var worksheets = new Array(sheetLen).fill(undefined).map(function (v, i) { return ({
            Id: "rId" + (i + 1),
            Type: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet',
            Target: "worksheets/sheet" + (i + 1) + ".xml"
        }); });
        var rs = relationshipsFactory.getTemplate(__spread(worksheets, [
            {
                Id: "rId" + (sheetLen + 1),
                Type: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme',
                Target: 'theme/theme1.xml'
            }, {
                Id: "rId" + (sheetLen + 2),
                Type: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles',
                Target: 'styles.xml'
            }, {
                Id: "rId" + (sheetLen + 3),
                Type: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings',
                Target: 'sharedStrings.xml'
            }
        ]));
        return createXmlPart(rs);
    };
    ExcelXlsxFactory.createDrawing = function (sheetIndex) {
        return createXmlPart(drawingFactory.getTemplate({ sheetIndex: sheetIndex }));
    };
    ExcelXlsxFactory.createDrawingRel = function (sheetIndex) {
        var _this = this;
        var worksheetImageIds = this.worksheetImageIds.get(sheetIndex);
        var XMLArr = [];
        worksheetImageIds.forEach(function (value, key) {
            XMLArr.push({
                Id: "rId" + (value.index + 1),
                Type: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/image',
                Target: "../media/image" + (_this.workbookImageIds.get(key).index + 1) + "." + value.type
            });
        });
        return createXmlPart(relationshipsFactory.getTemplate(XMLArr));
    };
    ExcelXlsxFactory.createWorksheetDrawingRel = function (currentRelationIndex) {
        var rs = relationshipsFactory.getTemplate([{
                Id: 'rId1',
                Type: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/drawing',
                Target: "../drawings/drawing" + (currentRelationIndex + 1) + ".xml"
            }]);
        return createXmlPart(rs);
    };
    ExcelXlsxFactory.createWorksheet = function (worksheet, margins, pageSetup, headerFooterConfig) {
        return createXmlPart(worksheetFactory.getTemplate({
            worksheet: worksheet,
            currentSheet: this.sheetNames.length - 1,
            margins: margins,
            pageSetup: pageSetup,
            headerFooterConfig: headerFooterConfig
        }));
    };
    ExcelXlsxFactory.sharedStrings = new Map();
    ExcelXlsxFactory.sheetNames = [];
    /** Maps images to sheet */
    ExcelXlsxFactory.images = new Map();
    /** Maps sheets to images */
    ExcelXlsxFactory.worksheetImages = new Map();
    /** Maps all workbook images to a global Id */
    ExcelXlsxFactory.workbookImageIds = new Map();
    /** Maps all sheet images to unique Ids */
    ExcelXlsxFactory.worksheetImageIds = new Map();
    ExcelXlsxFactory.factoryMode = core.ExcelFactoryMode.SINGLE_SHEET;
    return ExcelXlsxFactory;
}());

var __extends$1 = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var ExcelXlsxSerializingSession = /** @class */ (function (_super) {
    __extends$1(ExcelXlsxSerializingSession, _super);
    function ExcelXlsxSerializingSession() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ExcelXlsxSerializingSession.prototype.createExcel = function (data) {
        var _a = this, excelStyles = _a.excelStyles, config = _a.config;
        var margins = config.margins, pageSetup = config.pageSetup, headerFooterConfig = config.headerFooterConfig;
        return ExcelXlsxFactory.createExcel(excelStyles, data, margins, pageSetup, headerFooterConfig);
    };
    ExcelXlsxSerializingSession.prototype.getDataTypeForValue = function (valueForCell) {
        if (valueForCell === undefined) {
            return 'empty';
        }
        return core._.isNumeric(valueForCell) ? 'n' : 's';
    };
    ExcelXlsxSerializingSession.prototype.getType = function (type, style, value) {
        if (this.isFormula(value)) {
            return 'f';
        }
        if (style && style.dataType) {
            switch (style.dataType.toLocaleLowerCase()) {
                case 'formula':
                    return 'f';
                case 'string':
                    return 's';
                case 'number':
                    return 'n';
                case 'datetime':
                    return 'd';
                case 'error':
                    return 'e';
                case 'boolean':
                    return 'b';
                default:
                    console.warn("AG Grid: Unrecognized data type for excel export [" + style.id + ".dataType=" + style.dataType + "]");
            }
        }
        return type;
    };
    ExcelXlsxSerializingSession.prototype.addImage = function (rowIndex, column, value) {
        if (!this.config.addImageToCell) {
            return;
        }
        var addedImage = this.config.addImageToCell(rowIndex, column, value);
        if (!addedImage) {
            return;
        }
        ExcelXlsxFactory.buildImageMap(addedImage.image, rowIndex, column, this.columnsToExport, this.config.rowHeight);
        return addedImage;
    };
    ExcelXlsxSerializingSession.prototype.createCell = function (styleId, type, value) {
        var actualStyle = this.getStyleById(styleId);
        var typeTransformed = this.getType(type, actualStyle, value) || type;
        return {
            styleId: actualStyle ? styleId : undefined,
            data: {
                type: typeTransformed,
                value: this.getCellValue(typeTransformed, value)
            }
        };
    };
    ExcelXlsxSerializingSession.prototype.createMergedCell = function (styleId, type, value, numOfCells) {
        var valueToUse = value == null ? '' : value;
        return {
            styleId: !!this.getStyleById(styleId) ? styleId : undefined,
            data: {
                type: type,
                value: type === 's' ? ExcelXlsxFactory.getStringPosition(valueToUse).toString() : value
            },
            mergeAcross: numOfCells
        };
    };
    ExcelXlsxSerializingSession.prototype.getCellValue = function (type, value) {
        if (value == null) {
            return ExcelXlsxFactory.getStringPosition('').toString();
        }
        switch (type) {
            case 's':
                return value === '' ? '' : ExcelXlsxFactory.getStringPosition(value).toString();
            case 'f':
                return value.slice(1);
            case 'n':
                return Number(value).toString();
            default:
                return value;
        }
    };
    return ExcelXlsxSerializingSession;
}(BaseExcelSerializingSession));

var __extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (undefined && undefined.__assign) || function () {
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
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var getMultipleSheetsAsExcel = function (params) {
    var data = params.data, _a = params.fontSize, fontSize = _a === void 0 ? 11 : _a, _b = params.author, author = _b === void 0 ? 'AG Grid' : _b;
    var hasImages = ExcelXlsxFactory.images.size > 0;
    csvExport.ZipContainer.addFolders([
        '_rels/',
        'docProps/',
        'xl/',
        'xl/theme/',
        'xl/_rels/',
        'xl/worksheets/'
    ]);
    if (hasImages) {
        csvExport.ZipContainer.addFolders([
            'xl/worksheets/_rels',
            'xl/drawings/',
            'xl/drawings/_rels',
            'xl/media/',
        ]);
        var imgCounter_1 = 0;
        ExcelXlsxFactory.images.forEach(function (value) {
            var firstImage = value[0].image[0];
            var ext = firstImage.imageType;
            csvExport.ZipContainer.addFile("xl/media/image" + ++imgCounter_1 + "." + ext, firstImage.base64, true);
        });
    }
    if (!data || data.length === 0) {
        console.warn("AG Grid: Invalid params supplied to getMultipleSheetsAsExcel() - `ExcelExportParams.data` is empty.");
        ExcelXlsxFactory.resetFactory();
        return;
    }
    var sheetLen = data.length;
    var imageRelationCounter = 0;
    data.forEach(function (value, idx) {
        csvExport.ZipContainer.addFile("xl/worksheets/sheet" + (idx + 1) + ".xml", value);
        if (hasImages && ExcelXlsxFactory.worksheetImages.get(idx)) {
            createImageRelationsForSheet(idx, imageRelationCounter++);
        }
    });
    csvExport.ZipContainer.addFile('xl/workbook.xml', ExcelXlsxFactory.createWorkbook());
    csvExport.ZipContainer.addFile('xl/styles.xml', ExcelXlsxFactory.createStylesheet(fontSize));
    csvExport.ZipContainer.addFile('xl/sharedStrings.xml', ExcelXlsxFactory.createSharedStrings());
    csvExport.ZipContainer.addFile('xl/theme/theme1.xml', ExcelXlsxFactory.createTheme());
    csvExport.ZipContainer.addFile('xl/_rels/workbook.xml.rels', ExcelXlsxFactory.createWorkbookRels(sheetLen));
    csvExport.ZipContainer.addFile('docProps/core.xml', ExcelXlsxFactory.createCore(author));
    csvExport.ZipContainer.addFile('[Content_Types].xml', ExcelXlsxFactory.createContentTypes(sheetLen));
    csvExport.ZipContainer.addFile('_rels/.rels', ExcelXlsxFactory.createRels());
    ExcelXlsxFactory.resetFactory();
    var mimeType = params.mimeType || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    return csvExport.ZipContainer.getContent(mimeType);
};
var exportMultipleSheetsAsExcel = function (params) {
    var _a = params.fileName, fileName = _a === void 0 ? 'export.xlsx' : _a;
    var contents = getMultipleSheetsAsExcel(params);
    if (contents) {
        csvExport.Downloader.download(fileName, contents);
    }
};
var createImageRelationsForSheet = function (sheetIndex, currentRelationIndex) {
    var drawingFolder = 'xl/drawings';
    var drawingFileName = drawingFolder + "/drawing" + (currentRelationIndex + 1) + ".xml";
    var relFileName = drawingFolder + "/_rels/drawing" + (currentRelationIndex + 1) + ".xml.rels";
    var worksheetRelFile = "xl/worksheets/_rels/sheet" + (sheetIndex + 1) + ".xml.rels";
    csvExport.ZipContainer.addFile(relFileName, ExcelXlsxFactory.createDrawingRel(sheetIndex));
    csvExport.ZipContainer.addFile(drawingFileName, ExcelXlsxFactory.createDrawing(sheetIndex));
    csvExport.ZipContainer.addFile(worksheetRelFile, ExcelXlsxFactory.createWorksheetDrawingRel(currentRelationIndex));
};
var ExcelCreator = /** @class */ (function (_super) {
    __extends(ExcelCreator, _super);
    function ExcelCreator() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.exportMode = 'xlsx';
        return _this;
    }
    ExcelCreator.prototype.postConstruct = function () {
        this.setBeans({
            gridSerializer: this.gridSerializer,
            gridOptionsWrapper: this.gridOptionsWrapper
        });
    };
    ExcelCreator.prototype.getMergedParams = function (params) {
        var baseParams = this.gridOptionsWrapper.getDefaultExportParams('excel');
        return Object.assign({}, baseParams, params);
    };
    ExcelCreator.prototype.getData = function (params) {
        this.setExportMode(params.exportMode || 'xlsx');
        return _super.prototype.getData.call(this, params);
    };
    ExcelCreator.prototype.export = function (userParams) {
        if (this.isExportSuppressed()) {
            console.warn("AG Grid: Export cancelled. Export is not allowed as per your configuration.");
            return '';
        }
        var mergedParams = this.getMergedParams(userParams);
        var data = this.getData(mergedParams);
        var exportParams = {
            data: [data],
            fontSize: mergedParams.fontSize,
            author: mergedParams.author,
            mimeType: mergedParams.mimeType
        };
        var packageFile = this.packageFile(exportParams);
        if (packageFile) {
            csvExport.Downloader.download(this.getFileName(mergedParams.fileName), packageFile);
        }
        return data;
    };
    ExcelCreator.prototype.exportDataAsExcel = function (params) {
        return this.export(params);
    };
    ExcelCreator.prototype.getDataAsExcel = function (params) {
        var mergedParams = this.getMergedParams(params);
        var data = this.getData(mergedParams);
        if (params && params.exportMode === 'xml') {
            return data;
        }
        var exportParams = {
            data: [data],
            fontSize: mergedParams.fontSize,
            author: mergedParams.author,
            mimeType: mergedParams.mimeType
        };
        return this.packageFile(exportParams);
    };
    ExcelCreator.prototype.setFactoryMode = function (factoryMode, exportMode) {
        if (exportMode === void 0) { exportMode = 'xlsx'; }
        var factory = exportMode === 'xlsx' ? ExcelXlsxFactory : ExcelXmlFactory;
        factory.factoryMode = factoryMode;
    };
    ExcelCreator.prototype.getFactoryMode = function (exportMode) {
        var factory = exportMode === 'xlsx' ? ExcelXlsxFactory : ExcelXmlFactory;
        return factory.factoryMode;
    };
    ExcelCreator.prototype.getSheetDataForExcel = function (params) {
        var mergedParams = this.getMergedParams(params);
        var data = this.getData(mergedParams);
        return data;
    };
    ExcelCreator.prototype.getMultipleSheetsAsExcel = function (params) {
        return getMultipleSheetsAsExcel(params);
    };
    ExcelCreator.prototype.exportMultipleSheetsAsExcel = function (params) {
        return exportMultipleSheetsAsExcel(params);
    };
    ExcelCreator.prototype.getDefaultFileName = function () {
        return "export." + this.getExportMode();
    };
    ExcelCreator.prototype.getDefaultFileExtension = function () {
        return this.getExportMode();
    };
    ExcelCreator.prototype.createSerializingSession = function (params) {
        var _a = this, columnModel = _a.columnModel, valueService = _a.valueService, gridOptionsWrapper = _a.gridOptionsWrapper;
        var isXlsx = this.getExportMode() === 'xlsx';
        var sheetName = 'ag-grid';
        if (params.sheetName != null) {
            sheetName = core._.utf8_encode(params.sheetName.toString().substr(0, 31));
        }
        var config = __assign(__assign({}, params), { sheetName: sheetName,
            columnModel: columnModel,
            valueService: valueService,
            gridOptionsWrapper: gridOptionsWrapper, headerRowHeight: params.headerRowHeight || params.rowHeight, baseExcelStyles: this.gridOptions.excelStyles || [], styleLinker: this.styleLinker.bind(this) });
        return new (isXlsx ? ExcelXlsxSerializingSession : ExcelXmlSerializingSession)(config);
    };
    ExcelCreator.prototype.styleLinker = function (params) {
        var rowType = params.rowType, rowIndex = params.rowIndex, value = params.value, column = params.column, columnGroup = params.columnGroup, node = params.node;
        var isHeader = rowType === csvExport.RowType.HEADER;
        var isGroupHeader = rowType === csvExport.RowType.HEADER_GROUPING;
        var col = (isHeader ? column : columnGroup);
        var headerClasses = [];
        if (isHeader || isGroupHeader) {
            headerClasses.push('header');
            if (isGroupHeader) {
                headerClasses.push('headerGroup');
            }
            if (col) {
                headerClasses = headerClasses.concat(core.CssClassApplier.getHeaderClassesFromColDef(col.getDefinition(), this.gridOptionsWrapper, column || null, columnGroup || null));
            }
            return headerClasses;
        }
        var styles = this.gridOptions.excelStyles;
        var applicableStyles = ["cell"];
        if (!styles || !styles.length) {
            return applicableStyles;
        }
        var styleIds = styles.map(function (it) {
            return it.id;
        });
        this.stylingService.processAllCellClasses(column.getDefinition(), {
            value: value,
            data: node.data,
            node: node,
            colDef: column.getDefinition(),
            column: column,
            rowIndex: rowIndex,
            api: this.gridOptionsWrapper.getApi(),
            columnApi: this.gridOptionsWrapper.getColumnApi(),
            context: this.gridOptionsWrapper.getContext()
        }, function (className) {
            if (styleIds.indexOf(className) > -1) {
                applicableStyles.push(className);
            }
        });
        return applicableStyles.sort(function (left, right) {
            return (styleIds.indexOf(left) < styleIds.indexOf(right)) ? -1 : 1;
        });
    };
    ExcelCreator.prototype.isExportSuppressed = function () {
        return this.gridOptionsWrapper.isSuppressExcelExport();
    };
    ExcelCreator.prototype.setExportMode = function (exportMode) {
        this.exportMode = exportMode;
    };
    ExcelCreator.prototype.getExportMode = function () {
        return this.exportMode;
    };
    ExcelCreator.prototype.packageFile = function (params) {
        if (this.getExportMode() === 'xml') {
            var mimeType = params.mimeType || 'application/vnd.ms-excel';
            return new Blob(["\ufeff", params.data[0]], { type: mimeType });
        }
        return getMultipleSheetsAsExcel(params);
    };
    __decorate([
        core.Autowired('columnModel')
    ], ExcelCreator.prototype, "columnModel", void 0);
    __decorate([
        core.Autowired('valueService')
    ], ExcelCreator.prototype, "valueService", void 0);
    __decorate([
        core.Autowired('gridOptions')
    ], ExcelCreator.prototype, "gridOptions", void 0);
    __decorate([
        core.Autowired('stylingService')
    ], ExcelCreator.prototype, "stylingService", void 0);
    __decorate([
        core.Autowired('gridSerializer')
    ], ExcelCreator.prototype, "gridSerializer", void 0);
    __decorate([
        core.Autowired('gridOptionsWrapper')
    ], ExcelCreator.prototype, "gridOptionsWrapper", void 0);
    __decorate([
        core.PostConstruct
    ], ExcelCreator.prototype, "postConstruct", null);
    ExcelCreator = __decorate([
        core.Bean('excelCreator')
    ], ExcelCreator);
    return ExcelCreator;
}(csvExport.BaseCreator));

var ExcelExportModule = {
    moduleName: core.ModuleNames.ExcelExportModule,
    beans: [
        // beans in this module
        ExcelCreator,
        // these beans are part of CSV Export module
        csvExport.GridSerializer, csvExport.CsvCreator
    ],
    dependantModules: [
        csvExport.CsvExportModule,
        core$1.EnterpriseCoreModule
    ]
};

exports.ExcelExportModule = ExcelExportModule;
exports.exportMultipleSheetsAsExcel = exportMultipleSheetsAsExcel;
exports.getMultipleSheetsAsExcel = getMultipleSheetsAsExcel;
