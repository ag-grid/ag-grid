// ag-grid-enterprise v16.0.1
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var main_1 = require("ag-grid/main");
var main_2 = require("ag-grid/main");
var main_3 = require("ag-grid/main");
var LINE_SEPARATOR = '\r\n';
/**
 * See https://msdn.microsoft.com/en-us/library/aa140066(v=office.10).aspx
 */
var ExcelXmlFactory = (function () {
    function ExcelXmlFactory() {
    }
    ExcelXmlFactory.prototype.createExcelXml = function (styles, worksheets) {
        var documentProperties = this.documentProperties();
        var excelWorkbook = this.excelWorkbook();
        return this.excelXmlHeader() +
            this.xmlFactory.createXml(this.workbook(documentProperties, excelWorkbook, styles, worksheets), function (boolean) { return boolean ? "1" : "0"; });
    };
    ExcelXmlFactory.prototype.workbook = function (documentProperties, excelWorkbook, styles, worksheets) {
        var _this = this;
        var children = [
            documentProperties,
            excelWorkbook,
            this.stylesXmlElement(styles)
        ];
        main_3.Utils.map(worksheets, function (it) {
            return _this.worksheetXmlElement(it);
        }).forEach(function (it) {
            children.push(it);
        });
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
            },
            children: children
        };
    };
    ExcelXmlFactory.prototype.excelXmlHeader = function () {
        // need to take out the question mark, otherwise it bothers php when have < and ? beside each
        // other in a string, as php thinks it's a directive for php
        var QUESTION_MARK = '?';
        return '<' + QUESTION_MARK + 'xml version="1.0"' + QUESTION_MARK + '>' + LINE_SEPARATOR +
            '<' + QUESTION_MARK + 'mso-application progid="Excel.Sheet"' + QUESTION_MARK + '>' + LINE_SEPARATOR;
    };
    ExcelXmlFactory.prototype.stylesXmlElement = function (styles) {
        var _this = this;
        return {
            name: 'Styles',
            children: styles ? main_3.Utils.map(styles, function (it) {
                return _this.styleXmlElement(it);
            }) : []
        };
    };
    ExcelXmlFactory.prototype.styleXmlElement = function (style) {
        var borders = [];
        if (style.borders) {
            [
                style.borders.borderBottom,
                style.borders.borderLeft,
                style.borders.borderRight,
                style.borders.borderTop
            ].forEach(function (it, index) {
                var current = index == 0 ? "Bottom" : index == 1 ? "Left" : index == 2 ? "Right" : "Top";
                borders.push({
                    name: "Border",
                    properties: {
                        prefixedAttributes: [{
                                prefix: "ss:",
                                map: {
                                    Position: current,
                                    LineStyle: it.lineStyle,
                                    Weight: it.weight,
                                    Color: it.color
                                }
                            }]
                    }
                });
            });
        }
        var children = [];
        if (style.alignment) {
            children.push({
                name: "Alignment",
                properties: {
                    prefixedAttributes: [{
                            prefix: "ss:",
                            map: {
                                Vertical: style.alignment.vertical,
                                Horizontal: style.alignment.horizontal,
                                Indent: style.alignment.indent,
                                ReadingOrder: style.alignment.readingOrder,
                                Rotate: style.alignment.rotate,
                                ShrinkToFit: style.alignment.shrinkToFit,
                                VerticalText: style.alignment.verticalText,
                                WrapText: style.alignment.wrapText
                            }
                        }]
                }
            });
        }
        if (style.borders) {
            children.push({
                name: "Borders",
                children: borders
            });
        }
        if (style.font) {
            children.push({
                name: "Font",
                properties: {
                    prefixedAttributes: [{
                            prefix: "ss:",
                            map: {
                                Bold: style.font.bold,
                                FontName: style.font.fontName,
                                Italic: style.font.italic,
                                Color: style.font.color,
                                Outline: style.font.outline,
                                Shadow: style.font.shadow,
                                Size: style.font.size,
                                StrikeThrough: style.font.strikeThrough,
                                Underline: style.font.underline,
                                VerticalAlign: style.font.verticalAlign
                            }
                        }, {
                            prefix: "x:",
                            map: {
                                CharSet: style.font.charSet,
                                Family: style.font.family
                            }
                        }]
                }
            });
        }
        if (style.interior) {
            children.push({
                name: "Interior",
                properties: {
                    prefixedAttributes: [{
                            prefix: "ss:",
                            map: {
                                Color: style.interior.color,
                                Pattern: style.interior.pattern,
                                PatternColor: style.interior.patternColor
                            }
                        }]
                }
            });
        }
        if (style.protection) {
            children.push({
                name: "Protection",
                properties: {
                    prefixedAttributes: [{
                            prefix: "ss:",
                            map: {
                                Protected: style.protection.protected,
                                HideFormula: style.protection.hideFormula
                            }
                        }]
                }
            });
        }
        if (style.numberFormat) {
            children.push({
                name: "NumberFormat",
                properties: {
                    prefixedAttributes: [{
                            prefix: "ss:",
                            map: {
                                Format: style.numberFormat.format
                            }
                        }]
                }
            });
        }
        return {
            name: "Style",
            properties: {
                prefixedAttributes: [{
                        prefix: "ss:",
                        map: {
                            ID: style.id,
                            Name: (style.name) ? style.name : style.id
                        }
                    }]
            },
            children: children
        };
    };
    ExcelXmlFactory.prototype.worksheetXmlElement = function (worksheet) {
        var _this = this;
        var children = [];
        main_3.Utils.map(worksheet.table.columns, function (it) {
            return _this.columnXmlElement(it);
        }).forEach(function (it) {
            children.push(it);
        });
        main_3.Utils.map(worksheet.table.rows, function (it) {
            return _this.rowXmlElement(it);
        }).forEach(function (it) {
            children.push(it);
        });
        return {
            name: "Worksheet",
            children: [{
                    name: "Table",
                    children: children
                }],
            properties: {
                prefixedAttributes: [{
                        prefix: "ss:",
                        map: {
                            Name: worksheet.name
                        }
                    }]
            }
        };
    };
    ExcelXmlFactory.prototype.columnXmlElement = function (column) {
        return {
            name: "Column",
            properties: {
                prefixedAttributes: [{
                        prefix: "ss:",
                        map: {
                            Width: column.width
                        }
                    }]
            }
        };
    };
    ExcelXmlFactory.prototype.rowXmlElement = function (row) {
        var _this = this;
        return {
            name: "Row",
            children: main_3.Utils.map(row.cells, function (it) {
                return _this.rowCellXmlElement(it);
            })
        };
    };
    ExcelXmlFactory.prototype.rowCellXmlElement = function (cell) {
        var properties = {};
        if (cell.mergeAcross) {
            properties['MergeAcross'] = cell.mergeAcross;
        }
        if (cell.styleId) {
            properties['StyleID'] = cell.styleId;
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
                                    Type: cell.data.type
                                }
                            }]
                    },
                    textNode: cell.data.value
                }]
        };
    };
    ExcelXmlFactory.prototype.excelWorkbook = function () {
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
    };
    ExcelXmlFactory.prototype.documentProperties = function () {
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
    };
    __decorate([
        main_2.Autowired('xmlFactory'),
        __metadata("design:type", main_1.XmlFactory)
    ], ExcelXmlFactory.prototype, "xmlFactory", void 0);
    ExcelXmlFactory = __decorate([
        main_2.Bean('excelXmlFactory')
    ], ExcelXmlFactory);
    return ExcelXmlFactory;
}());
exports.ExcelXmlFactory = ExcelXmlFactory;
