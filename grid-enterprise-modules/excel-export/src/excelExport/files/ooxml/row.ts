import { ExcelOOXMLTemplate, ExcelRow, ExcelCell } from '@ag-grid-community/core';
import { getExcelColumnName } from '../../assets/excelUtils';
import cellFactory from './cell';

const addEmptyCells = (cells: ExcelCell[], rowIdx: number): void => {
    const mergeMap: { pos: number, excelPos: number }[] = [];
    let posCounter = 0;
    for (let i = 0; i < cells.length; i++) {
        const cell = cells[i];
        if (cell.mergeAcross) {
            mergeMap.push({
                pos: i,
                excelPos: posCounter
            });
            posCounter += cell.mergeAcross;
        }
        posCounter++;
    }

    if (mergeMap.length) {
        for (let i = mergeMap.length - 1; i >= 0; i--) {
            const mergedCells: ExcelCell[] = [];
            const cell = cells[mergeMap[i].pos];
            for (let j = 1; j <= cell.mergeAcross!; j++) {
                mergedCells.push({
                    ref: `${getExcelColumnName(mergeMap[i].excelPos + 1 + j)}${rowIdx + 1}`,
                    styleId: cell.styleId,
                    data: { type: 'empty', value: null }
                });
            }
            if (mergedCells.length) {
                cells.splice(mergeMap[i].pos + 1, 0, ...mergedCells);
            }

        }
    }
};

const shouldDisplayCell = (cell: ExcelCell) => cell.data?.value !== '' || cell.styleId !== undefined;

const rowFactory: ExcelOOXMLTemplate = {
    getTemplate(config: ExcelRow, idx: number, currentSheet: number) {
        const { collapsed, hidden, height, outlineLevel, cells = [] } = config;
        addEmptyCells(cells, idx);
        const children = cells.filter(shouldDisplayCell).map((cell, idx) => cellFactory.getTemplate(cell, idx, currentSheet));

        return {
            name: "row",
            properties: {
                rawMap: {
                    r: idx + 1,
                    collapsed,
                    hidden: hidden ? '1' : '0',
                    ht: height,
                    customHeight: height != null ? '1' : '0',
                    spans: '1:1',
                    outlineLevel: outlineLevel || undefined
                }
            },
            children
        };
    }
};

export default rowFactory;
