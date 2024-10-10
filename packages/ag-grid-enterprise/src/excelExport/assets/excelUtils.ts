import type { AgColumn, RowHeightCallbackParams, XmlElement } from 'ag-grid-community';
import { _escapeString } from 'ag-grid-community';

import { INCH_TO_EMU } from './excelConstants';
import type { ExcelCalculatedImage } from './excelInterfaces';
import { createXml, createXmlHeader } from './xmlFactory';

export const pointsToPixel = (points: number): number => {
    return Math.round((points * 96) / 72);
};

export const pixelsToEMU = (value: number): number => {
    return Math.ceil(value * INCH_TO_EMU);
};

export const getFontFamilyId = (name?: string): number | undefined => {
    if (name === undefined) {
        return;
    }

    const families = ['Automatic', 'Roman', 'Swiss', 'Modern', 'Script', 'Decorative'];
    const pos = families.indexOf(name || 'Automatic');

    return Math.max(pos, 0);
};

export const getHeightFromProperty = (
    rowIndex: number,
    height?: number | ((params: RowHeightCallbackParams) => number)
): number | undefined => {
    if (!height) {
        return;
    }

    let finalHeight: number;

    if (typeof height === 'number') {
        finalHeight = height;
    } else {
        // eslint-disable-next-line @typescript-eslint/ban-types
        const heightFunc = height as Function;
        finalHeight = heightFunc({ rowIndex });
    }

    return finalHeight;
};

export const setExcelImageTotalWidth = (image: ExcelCalculatedImage, columnsToExport: AgColumn[]): void => {
    const { colSpan, column } = image.position!;

    if (!image.width) {
        return;
    }

    if (colSpan) {
        const columnsInSpan = columnsToExport.slice(column! - 1, column! + colSpan - 1);
        let totalWidth = 0;
        for (let i = 0; i < columnsInSpan.length; i++) {
            const colWidth = columnsInSpan[i].getActualWidth();
            if (image.width < totalWidth + colWidth) {
                image.position!.colSpan = i + 1;
                image.totalWidth = image.width;
                image.width = image.totalWidth - totalWidth;
                break;
            }
            totalWidth += colWidth;
        }
    } else {
        image.totalWidth = image.width;
    }
};

export const setExcelImageTotalHeight = (
    image: ExcelCalculatedImage,
    rowHeight?: number | ((params: RowHeightCallbackParams) => number)
): void => {
    const { rowSpan, row } = image.position!;

    if (!image.height) {
        return;
    }

    if (rowSpan) {
        let totalHeight = 0;
        let counter = 0;
        for (let i = row!; i < row! + rowSpan; i++) {
            const nextRowHeight = pointsToPixel(getHeightFromProperty(i, rowHeight) || 20);
            if (image.height < totalHeight + nextRowHeight) {
                image.position!.rowSpan = counter + 1;
                image.totalHeight = image.height;
                image.height = image.totalHeight - totalHeight;
                break;
            }
            totalHeight += nextRowHeight;
            counter++;
        }
    } else {
        image.totalHeight = image.height;
    }
};

export const createXmlPart = (body: XmlElement, skipHeader?: boolean): string => {
    const header = createXmlHeader({
        encoding: 'UTF-8',
        standalone: 'yes',
    });

    const xmlBody = createXml(body);

    if (skipHeader) {
        return xmlBody;
    }

    return `${header}${xmlBody}`;
};

export const getExcelColumnName = (colIdx: number): string => {
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

export const replaceInvisibleCharacters = (str: string | null): string | null => {
    if (str == null) {
        return null;
    }
    // Excel breaks when characters with code below 30 are exported
    // we use the loop below to wrap these characters between _x(code)_
    let newString = '';
    for (let i = 0; i < str.length; i++) {
        const point = str.charCodeAt(i);

        if (point >= 0 && point <= 31 && point !== 10) {
            const convertedCode = point.toString(16).toUpperCase();
            const paddedCode = convertedCode.padStart(4, '0');
            const newValue = `_x${paddedCode}_`;

            newString += newValue;
        } else {
            newString += str[i];
        }
    }
    return newString;
};

export const buildSharedString = (strMap: Map<string, number>): XmlElement[] => {
    const ret: XmlElement[] = [];

    for (const key of strMap.keys()) {
        const textNode = key.toString();

        const child: XmlElement = {
            name: 't',
            textNode: _escapeString(replaceInvisibleCharacters(textNode), false),
        };

        // if we have leading or trailing spaces, instruct Excel not to trim them
        const preserveSpaces = textNode.trim().length !== textNode.length;

        if (preserveSpaces) {
            child.properties = {
                rawMap: {
                    'xml:space': 'preserve',
                },
            };
        }
        ret.push({
            name: 'si',
            children: [child],
        });
    }

    return ret;
};
