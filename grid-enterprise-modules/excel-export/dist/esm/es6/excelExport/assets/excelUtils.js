import { XmlFactory } from "@ag-grid-community/csv-export";
import { INCH_TO_EMU } from "./excelConstants";
export const pixelsToPoint = (pixels) => {
    return Math.round(pixels * 72 / 96);
};
export const pointsToPixel = (points) => {
    return Math.round(points * 96 / 72);
};
export const pixelsToEMU = (value) => {
    return Math.ceil(value * INCH_TO_EMU);
};
export const getFontFamilyId = (name) => {
    if (name === undefined) {
        return;
    }
    const families = ['Automatic', 'Roman', 'Swiss', 'Modern', 'Script', 'Decorative'];
    const pos = families.indexOf(name || 'Automatic');
    return Math.max(pos, 0);
};
export const getHeightFromProperty = (rowIndex, height) => {
    if (!height) {
        return;
    }
    let finalHeight;
    if (typeof height === 'number') {
        finalHeight = height;
    }
    else {
        const heightFunc = height;
        finalHeight = heightFunc({ rowIndex });
    }
    return pixelsToPoint(finalHeight);
};
export const setExcelImageTotalWidth = (image, columnsToExport) => {
    const { colSpan, column } = image.position;
    if (image.width) {
        if (colSpan) {
            const columnsInSpan = columnsToExport.slice(column - 1, column + colSpan - 1);
            let totalWidth = 0;
            for (let i = 0; i < columnsInSpan.length; i++) {
                const colWidth = columnsInSpan[i].getActualWidth();
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
export const setExcelImageTotalHeight = (image, rowHeight) => {
    const { rowSpan, row } = image.position;
    if (image.height) {
        if (rowSpan) {
            let totalHeight = 0;
            let counter = 0;
            for (let i = row; i < row + rowSpan; i++) {
                const nextRowHeight = pointsToPixel(getHeightFromProperty(i, rowHeight) || 20);
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
export const createXmlPart = (body) => {
    const header = XmlFactory.createHeader({
        encoding: 'UTF-8',
        standalone: 'yes'
    });
    const xmlBody = XmlFactory.createXml(body);
    return `${header}${xmlBody}`;
};
export const getExcelColumnName = (colIdx) => {
    const startCode = 65;
    const tableWidth = 26;
    const fromCharCode = String.fromCharCode;
    const pos = Math.floor(colIdx / tableWidth);
    const tableIdx = colIdx % tableWidth;
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
