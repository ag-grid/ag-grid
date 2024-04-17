import {
    ExcelOOXMLTemplate,
    ExcelWorksheet,
    ExcelCell,
    ExcelRow,
    ExcelColumn,
    XmlElement,
    ExcelSheetMargin,
    ExcelSheetPageSetup,
    ExcelHeaderFooterContent,
    ExcelHeaderFooterConfig,
    ExcelFont,
    _
} from '@ag-grid-community/core';
import { ExcelDataTable } from '../../assets/excelInterfaces';

import columnFactory from './column';
import rowFactory from './row';
import mergeCellFactory from './mergeCell';
import { ExcelXlsxFactory } from '../../excelXlsxFactory';
import { getExcelColumnName } from '../../assets/excelUtils';
import { ExcelGridSerializingParams } from '../../excelSerializingSession';

const getMergedCellsAndAddColumnGroups = (rows: ExcelRow[], cols: ExcelColumn[], suppressColumnOutline: boolean): string[] => {
    const mergedCells: string[] = [];
    const cellsWithCollapsibleGroups: number[][] = [];

    rows.forEach((currentRow, rowIdx) => {
        const cells = currentRow.cells;
        let merges = 0;
        let lastCol: ExcelColumn;

        cells.forEach((currentCell: ExcelCell, cellIdx: number) => {
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
            
            const { collapsibleRanges } = currentCell;

            if (collapsibleRanges) {
                collapsibleRanges.forEach(range => {
                    cellsWithCollapsibleGroups.push([min + range[0], min + range[1]]);
                });
            }

            lastCol = cols[min - 1];
            lastCol.min = min;
            lastCol.max = min;
            currentCell.ref = `${start}${outputRow}`;
        });
    });

    cellsWithCollapsibleGroups.sort((a, b) => {
        if (a[0] !== b[0]) { return a[0] - b[0]}
        return b[1] - a[1];
    });

    const rangeMap = new Map<string, boolean>();
    const outlineLevel = new Map<number, number>();

    cellsWithCollapsibleGroups.filter(currentRange => {
        const rangeString = currentRange.toString();
        const inMap = rangeMap.get(rangeString);

        if (inMap) { return false; }
        rangeMap.set(rangeString, true);

        return  true;
    }).forEach(range => {
        const refCol = cols.find(col => col.min == range[0] && col.max == range[1]);
        const currentOutlineLevel = outlineLevel.get(range[0]);
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

        if (!headerFooter) { return; }

        for (const [key, value] of Object.entries<ExcelHeaderFooterContent[]>(headerFooter)) {
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
        }
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

const addExcelTableParts = (excelTable?: ExcelDataTable, index?: number) => {
    if (!excelTable) {
        return (children: XmlElement[]) => children;
    }

    const rId = ExcelXlsxFactory.getTableRelIdFromIndex(index || 0);
    return (children: XmlElement[]) => {
        children.push({
            name: 'tableParts',
            properties: {
                rawMap: {
                    count: '1',
                }
            },
            children: [{
                name: 'tablePart',
                properties: {
                    rawMap: {
                        'r:id': rId,
                    }
                }
            }],
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

const addSheetPr = () => {
    return (children: XmlElement[]) => {
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
    }
}

const addSheetFormatPr = (rows: ExcelRow[]) => {
    return (children: XmlElement[]) => {
        const maxOutline = rows.reduce((prev: number, row: ExcelRow) => {
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
    }
}

const worksheetFactory: ExcelOOXMLTemplate = {
    getTemplate(params: {
        worksheet: ExcelWorksheet,
        currentSheet: number,
        config: ExcelGridSerializingParams
    }) {
        const { worksheet, currentSheet, config } = params;
        const { margins = {}, pageSetup, headerFooterConfig, suppressColumnOutline } = config;

        const { table } = worksheet;
        const { rows, columns } = table;
        const mergedCells = (columns && columns.length) ? getMergedCellsAndAddColumnGroups(rows, columns, !!suppressColumnOutline) : [];

        const worksheetExcelTables = ExcelXlsxFactory.worksheetDataTables.get(currentSheet);

        const createWorksheetChildren = _.compose(
            addSheetPr(),
            addSheetFormatPr(rows),
            addColumns(columns),
            addSheetData(rows, currentSheet + 1),
            addMergeCells(mergedCells),
            addPageMargins(margins),
            addPageSetup(pageSetup),
            addHeaderFooter(headerFooterConfig),
            addDrawingRel(currentSheet),
            addExcelTableParts(worksheetExcelTables, currentSheet),
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
