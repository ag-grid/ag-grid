"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@ag-grid-community/core");
var column_1 = require("./column");
var row_1 = require("./row");
var mergeCell_1 = require("./mergeCell");
var excelXlsxFactory_1 = require("../../excelXlsxFactory");
var excelUtils_1 = require("../../assets/excelUtils");
var getMergedCellsAndAddColumnGroups = function (rows, cols) {
    var mergedCells = [];
    var cellsWithCollapsibleGroups = [];
    rows.forEach(function (currentRow, rowIdx) {
        var cells = currentRow.cells;
        var merges = 0;
        currentRow.index = rowIdx + 1;
        var lastCol;
        cells.forEach(function (currentCell, cellIdx) {
            var min = cellIdx + merges + 1;
            var start = excelUtils_1.getExcelColumnName(min);
            var outputRow = rowIdx + 1;
            if (currentCell.mergeAcross) {
                merges += currentCell.mergeAcross;
                var end = excelUtils_1.getExcelColumnName(cellIdx + merges + 1);
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
                children: columns.map(function (column) { return column_1.default.getTemplate(column); })
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
                children: rows.map(function (row, idx) { return row_1.default.getTemplate(row, idx, sheetNumber); })
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
                children: mergeCells.map(function (mergedCell) { return mergeCell_1.default.getTemplate(mergedCell); })
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
    core_1._.iterateObject(map, function (key, val) {
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
        return "" + output + core_1._.escapeString(replaceHeaderFooterTokens(curr.value));
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
        core_1._.iterateObject(headerFooter, function (key, value) {
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
        if (excelXlsxFactory_1.ExcelXlsxFactory.worksheetImages.get(currentSheet)) {
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
        var createWorksheetChildren = core_1._.compose(addSheetPr(), addSheetFormatPr(rows), addColumns(columns), addSheetData(rows, currentSheet + 1), addMergeCells(mergedCells), addPageMargins(margins), addPageSetup(pageSetup), addHeaderFooter(headerFooterConfig), addDrawingRel(currentSheet));
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
exports.default = worksheetFactory;
