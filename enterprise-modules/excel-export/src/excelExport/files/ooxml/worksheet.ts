import {
    ExcelOOXMLTemplate,
    ExcelWorksheet,
    ExcelRow,
    ExcelColumn,
    ExcelSheetConfig,
    ExcelHeaderFooter,
    XmlElement,
    ExcelSheetMargin,
    ExcelSheetPageSetup,
    ExcelHeaderFooterContent,
    _
} from '@ag-grid-community/core';

import columnFactory from './column';
import rowFactory from './row';
import mergeCell from './mergeCell';

const updateColMinMax = (col: ExcelColumn, min: number, range: number, prevCol?: ExcelColumn): void => {
    if (!col.min) {
        col.min = min;
        col.max = min + range;
        return;
    }
    let currentMin = min;
    if (prevCol) {
        currentMin = Math.max(currentMin, prevCol.min!);
    }
    col.min = Math.max(col.min, currentMin);
    col.max = Math.max(col.max!, currentMin + range);
};

const getMergedCells = (rows: ExcelRow[], cols: ExcelColumn[]): string[] => {
    const mergedCells: string[] = [];

    rows.forEach((currentRow, rowIdx) => {
        const cells = currentRow.cells;
        let merges = 0;
        currentRow.index = rowIdx + 1;
        let lastCol: ExcelColumn;

        cells.forEach((currentCell, cellIdx) => {
            const min = cellIdx + merges + 1;
            const start = getExcelColumnName(min);
            const outputRow = rowIdx + 1;

            if (currentCell.mergeAcross) {
                merges += currentCell.mergeAcross;
                const end = getExcelColumnName(cellIdx + merges + 1);

                mergedCells.push(`${start}${outputRow}:${end}${outputRow}`);
            }

            if (!cols[min - 1]) {
                cols[min - 1] = {} as ExcelColumn;
            }

            updateColMinMax(cols[min - 1], min, merges, lastCol);
            lastCol = cols[min - 1];
            currentCell.ref = `${start}${outputRow}`;
        });
    });

    return mergedCells;
};

export const getExcelColumnName = (colIdx: number): string => {
    const startCode = 65;
    const tableWidth = 26;
    const fromCharCode = String.fromCharCode;

    const pos = Math.floor(colIdx / tableWidth);
    const tableIdx = colIdx % tableWidth;

    if (!pos || colIdx === tableWidth) { return fromCharCode(startCode + colIdx - 1); }
    if (!tableIdx) { return getExcelColumnName(pos - 1) + 'Z'; }
    if (pos < tableWidth) { return fromCharCode(startCode + pos - 1) + fromCharCode(startCode + tableIdx - 1); }

    return getExcelColumnName(pos) + fromCharCode(startCode + tableIdx - 1);
};

const getPageOrientation = (orientation?: 'Portrait' | 'Landscape'): 'portrait' | 'landscape' => {
    if (!orientation || (orientation !== 'Portrait' && orientation !== 'Landscape')) { 
        return 'portrait'; 
    }

    return orientation.toLocaleLowerCase() as 'portrait' | 'landscape';
}

const getPageSize = (pageSize?: string): number => {
    if (pageSize == null) { return 1; }

    const positions = ['Letter', 'Letter Small', 'Tabloid', 'Ledger', 'Legal', 'Statement', 'Executive', 'A3', 'A4', 'A4 Small', 'A5', 'A6', 'B4', 'B5', 'Folio', 'Envelope', 'Envelope DL', 'Envelope C5', 'Envelope B5', 'Envelope C3', 'Envelope C4', 'Envelope C6', 'Envelope Monarch', 'Japanese Postcard', 'Japanese Double Postcard'];
    const pos = positions.indexOf(pageSize);

    return pos === -1 ? 1 : (pos + 1);
}

const addColumns = (columns: ExcelColumn[]) => {
    return (children: XmlElement[]) => {
        if (columns.length) {
            children.push({
                name: 'cols',
                children: columns.map(columnFactory.getTemplate)
            });
        }
        return children;
    }
}

const addSheetData = (rows: ExcelRow[]) => {
    return (children: XmlElement[]) => {
        if (rows.length) {
            children.push({
                name: 'sheetData',
                children: rows.map(rowFactory.getTemplate)
            });
        }
        return children;
    }
}

const addMergeCells = (mergeCells: string[]) => {
    return (children: XmlElement[]) => {
        if (mergeCells.length) {
            children.push({
                name: 'mergeCells',
                properties: {
                    rawMap: {
                        count: mergeCells.length
                    }
                },
                children: mergeCells.map(mergeCell.getTemplate)
            });
        }
        return children;
    }
}

const addPageMargins = (margins: ExcelSheetMargin) => {
    return (children: XmlElement[]) => {
        const { top = 0.75, right = 0.7, bottom = 0.75, left = 0.7, header = 0.3, footer = 0.3 } = margins;

        children.push({
            name: 'pageMargins',
            properties: {
                rawMap: { bottom, footer, header, left, right, top }
            }
        });

        return children;
    }
}

const addPageSetup = (pageSetup?: ExcelSheetPageSetup) => {
    return (children: XmlElement[]) => {
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
            })
        }
        return children;
    }
}

const hasDifferentFirstHeaderFooter = (header?: ExcelHeaderFooter, footer?: ExcelHeaderFooter): number => {
    if (header && header.first != null) { return 1; }
    if (footer && footer.first != null) { return 1; }

    return 0;
}

const hasDifferentOddEvenHeaderFooter = (header?: ExcelHeaderFooter, footer?: ExcelHeaderFooter): number => {
    if (header && header.even != null) { return 1; }
    if (footer && footer.even != null) { return 1; }

    return 0;
}

const processHeaderFooterContent = (content: ExcelHeaderFooterContent | ExcelHeaderFooterContent[]): string => {
    if (!Array.isArray(content)) {
        content = [content];
    }

    return content.reduce((prev, curr) => {
        const pos = curr.position === 'Center' ? 'C' : curr.position === 'Right' ? 'R' : 'L';
        let output = prev += `&amp;${pos}`;
        const font = curr.font;

        if (font) {
            output += '&amp;&quot;'
            output += font.fontName || 'Calibri';
            if (font.bold !== font.italic) {
                output += font.bold ? ',Bold' : ',Italic'
            } else if (font.bold) {
                output += ',Bold Italic'
            } else {
                output += ',Regular'
            }
            output += '&quot;'

            if (font.size) { output += `&amp;${font.size}` }
            if (font.strikeThrough) { output += '&amp;S' }
            if (font.underline) { 
                output += `&amp;${font.underline === 'Double' ? 'E' : 'U'}`;
             }
            if (font.color) { output += `&amp;K${font.color.replace('#', '').toUpperCase()}` }
        }

        output += _.escapeString(curr.value);

        return output;
    },'')
}

const buildHeaderFooter = (params: {
        header?: ExcelHeaderFooter,
        footer?: ExcelHeaderFooter
    }): XmlElement[] => {
    const rules: ['all', 'first', 'even'] = ['all', 'first', 'even'];
    const headersAndFooters = [] as XmlElement[];

    for (const [key, value] of Object.entries(params)) {
        const nameSuffix = `${key.charAt(0).toUpperCase()}${key.slice(1)}`;

        rules.forEach(rule => {
            if (!value) { return; }

            const content: ExcelHeaderFooterContent | ExcelHeaderFooterContent[] | undefined = value[rule];

            if (content) {
                const namePrefix = rule === 'all' ? 'odd' : rule;
                
                headersAndFooters.push({
                    name: `${namePrefix}${nameSuffix}`,
                    properties: {
                        rawMap: {
                            'xml:space': 'preserve',
                        }
                    },
                    textNode: processHeaderFooterContent(content)
                });
            }
        })
    }

    return headersAndFooters;
}

const addHeaderFooter = (header?: ExcelHeaderFooter, footer?: ExcelHeaderFooter) => {
    return (children: XmlElement[]) => {
        if (!header && !footer) { return children; }

        const differentFirst = hasDifferentFirstHeaderFooter(header, footer)
        const differentOddEven = hasDifferentOddEvenHeaderFooter(header, footer)

        children.push({
            name: 'headerFooter',
            properties: {
                rawMap: {
                    differentFirst: differentFirst ? 1 : 0,
                    differentOddEven: differentOddEven ? 1 : 0
                }
            },
            children: buildHeaderFooter({ header, footer })
        })
        return children;
    }
}

const worksheetFactory: ExcelOOXMLTemplate = {
    getTemplate(params: {
        worksheet: ExcelWorksheet,
        worksheetConfig?: ExcelSheetConfig,
        sheetHeader?: ExcelHeaderFooter,
        sheetFooter?: ExcelHeaderFooter
    }) {
        const { worksheet, worksheetConfig, sheetHeader, sheetFooter } = params;
        const { table } = worksheet;
        const { rows, columns } = table;
        const mergedCells = (columns && columns.length) ? getMergedCells(rows, columns) : [];
        const margins = (worksheetConfig && worksheetConfig.margins) || {};
        const pageSetup = worksheetConfig && worksheetConfig.setup;

        const createWorksheetChildren = _.compose(
            addColumns(columns),
            addSheetData(rows),
            addMergeCells(mergedCells),
            addPageMargins(margins),
            addPageSetup(pageSetup),
            addHeaderFooter(sheetHeader, sheetFooter)
        );

        const children = createWorksheetChildren([]);

        return {
            name: "worksheet",
            properties: {
                prefixedAttributes:[{
                    prefix: "xmlns:",
                    map: {
                        r: "http://schemas.openxmlformats.org/officeDocument/2006/relationships"
                    }
                }],
                rawMap: {
                    xmlns: "http://schemas.openxmlformats.org/spreadsheetml/2006/main"
                }
            },
            children
        };
    }
};

export default worksheetFactory;
