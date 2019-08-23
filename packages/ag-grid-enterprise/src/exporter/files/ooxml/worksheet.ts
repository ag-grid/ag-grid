import { ExcelOOXMLTemplate, ExcelWorksheet, ExcelRow, ExcelColumn, _ } from 'ag-grid-community';
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
        currentMin = Math.max(currentMin, prevCol.min);
    }
    col.min = Math.max(col.min, currentMin);
    col.max = Math.max(col.max, currentMin + range);
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

const worksheetFactory: ExcelOOXMLTemplate = {
    getTemplate(config: ExcelWorksheet) {
        const {table} = config;
        const {rows, columns} = table;

        const mergedCells = (columns && columns.length) ? getMergedCells(rows, columns) : [];

        const children = [];
        if (columns.length) {
            children.push({
                name: 'cols',
                children: _.map(columns, columnFactory.getTemplate)
            });
        }

        if (rows.length) {
            children.push({
                name: 'sheetData',
                children: _.map(rows, rowFactory.getTemplate)
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
                children: _.map(mergedCells, mergeCell.getTemplate)
            });
        }

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
