import { _ } from '@ag-grid-community/core';
import columnFactory from './column';
import rowFactory from './row';
import mergeCellFactory from './mergeCell';
import { ExcelXlsxFactory } from '../../excelXlsxFactory';
import { getExcelColumnName } from '../../assets/excelUtils';
var getMergedCellsAndAddColumnGroups = function (rows, cols, suppressColumnOutline) {
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
            outlineLevel: suppressColumnOutline ? undefined : (currentOutlineLevel || 1),
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
    _.iterateObject(map, function (key, val) {
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
        return "" + output + _.escapeString(replaceHeaderFooterTokens(curr.value));
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
        _.iterateObject(headerFooter, function (key, value) {
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
        var worksheet = params.worksheet, currentSheet = params.currentSheet, config = params.config;
        var _a = config.margins, margins = _a === void 0 ? {} : _a, pageSetup = config.pageSetup, headerFooterConfig = config.headerFooterConfig, suppressColumnOutline = config.suppressColumnOutline;
        var table = worksheet.table;
        var rows = table.rows, columns = table.columns;
        var mergedCells = (columns && columns.length) ? getMergedCellsAndAddColumnGroups(rows, columns, !!suppressColumnOutline) : [];
        var createWorksheetChildren = _.compose(addSheetPr(), addSheetFormatPr(rows), addColumns(columns), addSheetData(rows, currentSheet + 1), addMergeCells(mergedCells), addPageMargins(margins), addPageSetup(pageSetup), addHeaderFooter(headerFooterConfig), addDrawingRel(currentSheet));
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
export default worksheetFactory;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29ya3NoZWV0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL2V4Y2VsRXhwb3J0L2ZpbGVzL29veG1sL3dvcmtzaGVldC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBWUgsQ0FBQyxFQUNKLE1BQU0seUJBQXlCLENBQUM7QUFFakMsT0FBTyxhQUFhLE1BQU0sVUFBVSxDQUFDO0FBQ3JDLE9BQU8sVUFBVSxNQUFNLE9BQU8sQ0FBQztBQUMvQixPQUFPLGdCQUFnQixNQUFNLGFBQWEsQ0FBQztBQUMzQyxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQUMxRCxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUc3RCxJQUFNLGdDQUFnQyxHQUFHLFVBQUMsSUFBZ0IsRUFBRSxJQUFtQixFQUFFLHFCQUE4QjtJQUMzRyxJQUFNLFdBQVcsR0FBYSxFQUFFLENBQUM7SUFDakMsSUFBTSwwQkFBMEIsR0FBZSxFQUFFLENBQUM7SUFFbEQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFDLFVBQVUsRUFBRSxNQUFNO1FBQzVCLElBQU0sS0FBSyxHQUFHLFVBQVUsQ0FBQyxLQUFLLENBQUM7UUFDL0IsSUFBSSxNQUFNLEdBQUcsQ0FBQyxDQUFDO1FBQ2YsSUFBSSxPQUFvQixDQUFDO1FBRXpCLEtBQUssQ0FBQyxPQUFPLENBQUMsVUFBQyxXQUFzQixFQUFFLE9BQWU7WUFDbEQsSUFBTSxHQUFHLEdBQUcsT0FBTyxHQUFHLE1BQU0sR0FBRyxDQUFDLENBQUM7WUFDakMsSUFBTSxLQUFLLEdBQUcsa0JBQWtCLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDdEMsSUFBTSxTQUFTLEdBQUcsTUFBTSxHQUFHLENBQUMsQ0FBQztZQUU3QixJQUFJLFdBQVcsQ0FBQyxXQUFXLEVBQUU7Z0JBQ3pCLE1BQU0sSUFBSSxXQUFXLENBQUMsV0FBVyxDQUFDO2dCQUNsQyxJQUFN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