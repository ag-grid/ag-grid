"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getExcelColumnName = exports.createXmlPart = exports.setExcelImageTotalHeight = exports.setExcelImageTotalWidth = exports.getHeightFromProperty = exports.getFontFamilyId = exports.pixelsToEMU = exports.pointsToPixel = exports.pixelsToPoint = void 0;
var csv_export_1 = require("@ag-grid-community/csv-export");
var excelConstants_1 = require("./excelConstants");
exports.pixelsToPoint = function (pixels) {
    return Math.round(pixels * 72 / 96);
};
exports.pointsToPixel = function (points) {
    return Math.round(points * 96 / 72);
};
exports.pixelsToEMU = function (value) {
    return Math.ceil(value * excelConstants_1.INCH_TO_EMU);
};
exports.getFontFamilyId = function (name) {
    if (name === undefined) {
        return;
    }
    var families = ['Automatic', 'Roman', 'Swiss', 'Modern', 'Script', 'Decorative'];
    var pos = families.indexOf(name || 'Automatic');
    return Math.max(pos, 0);
};
exports.getHeightFromProperty = function (rowIndex, height) {
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
    return exports.pixelsToPoint(finalHeight);
};
exports.setExcelImageTotalWidth = function (image, columnsToExport) {
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
exports.setExcelImageTotalHeight = function (image, rowHeight) {
    var _a = image.position, rowSpan = _a.rowSpan, row = _a.row;
    if (image.height) {
        if (rowSpan) {
            var totalHeight = 0;
            var counter = 0;
            for (var i = row; i < row + rowSpan; i++) {
                var nextRowHeight = exports.pointsToPixel(exports.getHeightFromProperty(i, rowHeight) || 20);
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
exports.createXmlPart = function (body) {
    var header = csv_export_1.XmlFactory.createHeader({
        encoding: 'UTF-8',
        standalone: 'yes'
    });
    var xmlBody = csv_export_1.XmlFactory.createXml(body);
    return "" + header + xmlBody;
};
exports.getExcelColumnName = function (colIdx) {
    var startCode = 65;
    var tableWidth = 26;
    var fromCharCode = String.fromCharCode;
    var pos = Math.floor(colIdx / tableWidth);
    var tableIdx = colIdx % tableWidth;
    if (!pos || colIdx === tableWidth) {
        return fromCharCode(startCode + colIdx - 1);
    }
    if (!tableIdx) {
        return exports.getExcelColumnName(pos - 1) + 'Z';
    }
    if (pos < tableWidth) {
        return fromCharCode(startCode + pos - 1) + fromCharCode(startCode + tableIdx - 1);
    }
    return exports.getExcelColumnName(pos) + fromCharCode(startCode + tableIdx - 1);
};
