import { XmlFactory } from "@ag-grid-community/csv-export";
import { INCH_TO_EMU } from "./excelConstants";
export var pixelsToPoint = function (pixels) {
    return Math.round(pixels * 72 / 96);
};
export var pointsToPixel = function (points) {
    return Math.round(points * 96 / 72);
};
export var pixelsToEMU = function (value) {
    return Math.ceil(value * INCH_TO_EMU);
};
export var getFontFamilyId = function (name) {
    if (name === undefined) {
        return;
    }
    var families = ['Automatic', 'Roman', 'Swiss', 'Modern', 'Script', 'Decorative'];
    var pos = families.indexOf(name || 'Automatic');
    return Math.max(pos, 0);
};
export var getHeightFromProperty = function (rowIndex, height) {
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
export var setExcelImageTotalWidth = function (image, columnsToExport) {
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
export var setExcelImageTotalHeight = function (image, rowHeight) {
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
export var createXmlPart = function (body) {
    var header = XmlFactory.createHeader({
        encoding: 'UTF-8',
        standalone: 'yes'
    });
    var xmlBody = XmlFactory.createXml(body);
    return "" + header + xmlBody;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhjZWxVdGlscy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9leGNlbEV4cG9ydC9hc3NldHMvZXhjZWxVdGlscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sK0JBQStCLENBQUM7QUFDM0QsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLGtCQUFrQixDQUFDO0FBRy9DLE1BQU0sQ0FBQyxJQUFNLGFBQWEsR0FBRyxVQUFDLE1BQWM7SUFDeEMsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUM7QUFDeEMsQ0FBQyxDQUFDO0FBRUYsTUFBTSxDQUFDLElBQU0sYUFBYSxHQUFHLFVBQUMsTUFBYztJQUN4QyxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQztBQUN4QyxDQUFDLENBQUM7QUFFRixNQUFNLENBQUMsSUFBTSxXQUFXLEdBQUcsVUFBQyxLQUFhO0lBQ3JDLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLEdBQUcsV0FBVyxDQUFDLENBQUM7QUFDMUMsQ0FBQyxDQUFDO0FBRUYsTUFBTSxDQUFDLElBQU0sZUFBZSxHQUFHLFVBQUMsSUFBYTtJQUN6QyxJQUFJLElBQUksS0FBSyxTQUFTLEVBQUU7UUFBRSxPQUFPO0tBQUU7SUFFbkMsSUFBTSxRQUFRLEdBQUcsQ0FBQyxXQUFXLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLFlBQVksQ0FBQyxDQUFDO0lBQ25GLElBQU0sR0FBRyxHQUFHLFFBQVEsQ0FBQyxPQUFPLENBQUMsSUFBSSxJQUFJLFdBQVcsQ0FBQyxDQUFDO0lBRWxELE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDNUIsQ0FBQyxDQUFDO0FB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