import { ExcelOOXMLTemplate, ExcelRow, ExcelCell, _ } from 'ag-grid-community';
import { getExcelColumnName } from './worksheet';
import cellFactory from './cell';

const addEmptyCells = (cells: ExcelCell[], rowIdx: number): void => {
    const mergeMap: {pos: number, excelPos: number}[] = [];
    let posCounter = 0;
    for (let i = 0; i < cells.length; i++) {
        const cell = cells[i];
        if (cell.mergeAcross) {
            mergeMap.push({
                pos: i,
                excelPos: posCounter
            });
            posCounter += cells[i].mergeAcross as number;
        }
        posCounter++;
    }

    if (mergeMap.length) {
        for (let i = mergeMap.length - 1; i >= 0; i--) {
            const mergedCells: ExcelCell[] = [];
            const cell = cells[mergeMap[i].pos];
            for (let j = 1; j <= (cell.mergeAcross as number); j++) {
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

const rowFactory: ExcelOOXMLTemplate = {
    getTemplate(config: ExcelRow, idx: number) {
        const {index, collapsed, hidden, height, s, cells = []} = config;
        addEmptyCells(cells, idx);
        const children = _.map(cells, cellFactory.getTemplate);

        return {
            name: "row",
            properties: {
                rawMap: {
                    r: index,
                    collapsed,
                    hidden: hidden ? '1' : '0',
                    ht: height,
                    customHeight: height != null ? '1' : '0',
                    s,
                    customFormat: s != null ? '1' : '0'
                }
            },
            children
        };
    }
};

export default rowFactory;
