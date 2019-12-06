import columnFactory from './column';
import rowFactory from './row';
import mergeCell from './mergeCell';
var updateColMinMax = function (col, min, range, prevCol) {
    if (!col.min) {
        col.min = min;
        col.max = min + range;
        return;
    }
    var currentMin = min;
    if (prevCol) {
        currentMin = Math.max(currentMin, prevCol.min);
    }
    col.min = Math.max(col.min, currentMin);
    col.max = Math.max(col.max, currentMin + range);
};
var getMergedCells = function (rows, cols) {
    var mergedCells = [];
    rows.forEach(function (currentRow, rowIdx) {
        var cells = currentRow.cells;
        var merges = 0;
        currentRow.index = rowIdx + 1;
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
            updateColMinMax(cols[min - 1], min, merges, lastCol);
            lastCol = cols[min - 1];
            currentCell.ref = "" + start + outputRow;
        });
    });
    return mergedCells;
};
export var getExcelColumnName = function (colIdx) {
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
var worksheetFactory = {
    getTemplate: function (config) {
        var table = config.table;
        var rows = table.rows, columns = table.columns;
        var mergedCells = (columns && columns.length) ? getMergedCells(rows, columns) : [];
        var children = [];
        if (columns.length) {
            children.push({
                name: 'cols',
                children: columns.map(columnFactory.getTemplate)
            });
        }
        if (rows.length) {
            children.push({
                name: 'sheetData',
                children: rows.map(rowFactory.getTemplate)
            });
        }
        if (mergedCells.length) {
            children.push({
                name: 'mergeCells',
                properties: {
                    rawMap: {
                        count: mergedCells.length
                    }
                },
                children: mergedCells.map(mergeCell.getTemplate)
            });
        }
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
