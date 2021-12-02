import {
    ExcelOOXMLTemplate,
    ExcelWorksheet,
    ExcelRow,
    ExcelColumn,
    XmlElement,
    ExcelSheetMargin,
    ExcelSheetPageSetup,
    ExcelHeaderFooterContent,
    ExcelHeaderFooterConfig,
    _,
    ExcelFont
} from '@ag-grid-community/core';

import columnFactory from './column';
import rowFactory from './row';
import mergeCellFactory from './mergeCell';
import { ExcelXlsxFactory } from '../../excelXlsxFactory';
import { getExcelColumnName } from '../../assets/excelUtils';

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

const getPageOrientation = (orientation?: 'Portrait' | 'Landscape'): 'portrait' | 'landscape' => {
    if (!orientation || (orientation !== 'Portrait' && orientation !== 'Landscape')) {
        return 'portrait';
    }

    return orientation.toLocaleLowerCase() as 'portrait' | 'landscape';
};

const getPageSize = (pageSize?: string): number => {
    if (pageSize == null) { return 1; }

    const positions = ['Letter', 'Letter Small', 'Tabloid', 'Ledger', 'Legal', 'Statement', 'Executive', 'A3', 'A4', 'A4 Small', 'A5', 'A6', 'B4', 'B5', 'Folio', 'Envelope', 'Envelope DL', 'Envelope C5', 'Envelope B5', 'Envelope C3', 'Envelope C4', 'Envelope C6', 'Envelope Monarch', 'Japanese Postcard', 'Japanese Double Postcard'];
    const pos = positions.indexOf(pageSize);

    return pos === -1 ? 1 : (pos + 1);
};

const addColumns = (columns: ExcelColumn[]) => {
    return (children: XmlElement[]) => {
        if (columns.length) {
            children.push({
                name: 'cols',
                children: columns.map(column => columnFactory.getTemplate(column))
            });
        }
        return children;
    };
};

const addSheetData = (rows: ExcelRow[], sheetNumber: number) => {
    return (children: XmlElement[]) => {
        if (rows.length) {
            children.push({
                name: 'sheetData',
                children: rows.map((row, idx) => rowFactory.getTemplate(row, idx, sheetNumber))
            });
        }
        return children;
    };
};

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
                children: mergeCells.map(mergedCell => mergeCellFactory.getTemplate(mergedCell))
            });
        }
        return children;
    };
};

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
    };
};

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
            });
        }
        return children;
    };
};

const replaceHeaderFooterTokens = (value: string): string => {
    const map = {
        '&[Page]': '&P',
        '&[Pages]': '&N',
        '&[Date]': '&D',
        '&[Time]': '&T',
        '&[Tab]': '&A',
        '&[Path]': '&Z',
        '&[File]': '&F'
    };

    _.iterateObject<string>(map, (key, val) => {
        value = value.replace(key, val);
    });

    return value;
};

const getHeaderPosition = (position?: string): string => {
    if (position === 'Center') { return 'C'; }
    if (position === 'Right') { return 'R'; }

    return 'L';
};

const applyHeaderFontStyle = (headerString: string, font?: ExcelFont): string => {
    if (!font) { return headerString; }

    headerString += '&amp;&quot;';
    headerString += font.fontName || 'Calibri';

    if (font.bold !== font.italic) {
        headerString += font.bold ? ',Bold' : ',Italic';
    } else if (font.bold) {
        headerString += ',Bold Italic';
    } else {
        headerString += ',Regular';
    }
    headerString += '&quot;';

    if (font.size) { headerString += `&amp;${font.size}`; }
    if (font.strikeThrough) { headerString += '&amp;S'; }
    if (font.underline) {
        headerString += `&amp;${font.underline === 'Double' ? 'E' : 'U'}`;
     }
    if (font.color) { headerString += `&amp;K${font.color.replace('#', '').toUpperCase()}`; }

    return headerString;
};

const processHeaderFooterContent = (content: ExcelHeaderFooterContent[]): string =>
    content.reduce((prev, curr) => {
        const pos = getHeaderPosition(curr.position);
        const output = applyHeaderFontStyle(`${prev}&amp;${pos}`, curr.font);

        return `${output}${_.escapeString(replaceHeaderFooterTokens(curr.value))}`;
    }, '');

const buildHeaderFooter = (headerFooterConfig: ExcelHeaderFooterConfig): XmlElement[] => {
    const rules: ['all', 'first', 'even'] = ['all', 'first', 'even'];
    const headersAndFooters = [] as XmlElement[];

    rules.forEach(rule => {
        const headerFooter = headerFooterConfig[rule];
        const namePrefix = rule === 'all' ? 'odd' : rule;

        if (!headerFooter || (!headerFooter.header && !headerFooter.footer)) { return; }

        _.iterateObject<ExcelHeaderFooterContent[]>((headerFooter as any), (key: string, value: ExcelHeaderFooterContent[]) => {
            const nameSuffix = `${key.charAt(0).toUpperCase()}${key.slice(1)}`;

            if (value) {
                headersAndFooters.push({
                    name: `${namePrefix}${nameSuffix}`,
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

const addHeaderFooter = (headerFooterConfig?: ExcelHeaderFooterConfig) => {
    return (children: XmlElement[]) => {
        if (!headerFooterConfig) { return children; }

        const differentFirst = headerFooterConfig.first != null ? 1 : 0;
        const differentOddEven = headerFooterConfig.even != null ? 1 : 0;

        children.push({
            name: 'headerFooter',
            properties: {
                rawMap: {
                    differentFirst,
                    differentOddEven
                }
            },
            children: buildHeaderFooter(headerFooterConfig)
        });
        return children;
    };
};

const addDrawingRel = (currentSheet: number) => {
    return (children: XmlElement[]) => {
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

const worksheetFactory: ExcelOOXMLTemplate = {
    getTemplate(params: {
        worksheet: ExcelWorksheet,
        currentSheet: number,
        margins?: ExcelSheetMargin,
        pageSetup?: ExcelSheetPageSetup,
        headerFooterConfig?: ExcelHeaderFooterConfig
    }) {
        const { worksheet, currentSheet, margins = {}, pageSetup, headerFooterConfig } = params;
        const { table } = worksheet;
        const { rows, columns } = table;
        const mergedCells = (columns && columns.length) ? getMergedCells(rows, columns) : [];

        const createWorksheetChildren = _.compose(
            addColumns(columns),
            addSheetData(rows, currentSheet + 1),
            addMergeCells(mergedCells),
            addPageMargins(margins),
            addPageSetup(pageSetup),
            addHeaderFooter(headerFooterConfig),
            addDrawingRel(currentSheet)
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
