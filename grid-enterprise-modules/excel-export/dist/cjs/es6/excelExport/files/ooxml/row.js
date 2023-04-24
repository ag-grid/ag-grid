"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const excelUtils_1 = require("../../assets/excelUtils");
const cell_1 = require("./cell");
const addEmptyCells = (cells, rowIdx) => {
    const mergeMap = [];
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
            const mergedCells = [];
            const cell = cells[mergeMap[i].pos];
            for (let j = 1; j <= cell.mergeAcross; j++) {
                mergedCells.push({
                    ref: `${excelUtils_1.getExcelColumnName(mergeMap[i].excelPos + 1 + j)}${rowIdx + 1}`,
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
const shouldDisplayCell = (cell) => { var _a; return ((_a = cell.data) === null || _a === void 0 ? void 0 : _a.value) !== '' || cell.styleId !== undefined; };
const rowFactory = {
    getTemplate(config, idx, currentSheet) {
        const { collapsed, hidden, height, outlineLevel, cells = [] } = config;
        addEmptyCells(cells, idx);
        const children = cells.filter(shouldDisplayCell).map((cell, idx) => cell_1.default.getTemplate(cell, idx, currentSheet));
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
exports.default = rowFactory;
