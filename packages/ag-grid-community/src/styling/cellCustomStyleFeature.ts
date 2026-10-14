import type { BeanCollection } from '../context/context';
import type { AgColumn } from '../entities/agColumn';
import type { CellClassParams, CellStyle, ColDef } from '../entities/colDef';
import { _addGridCommonParams } from '../gridOptionsUtils';
import type { CellCtrl } from '../rendering/cell/cellCtrl';
import { processClassRules } from './stylingUtils';

export function _setupCellCustomStyle(beans: BeanCollection, cellCtrl: CellCtrl): void {
    _applyCellUserStyles(beans, cellCtrl);
    _applyCellClassRules(beans, cellCtrl);
    _applyCellClassesFromColDef(beans, cellCtrl);
}

export function _applyCellClassRules(beans: BeanCollection, cellCtrl: CellCtrl): void {
    const comp = cellCtrl.comp;
    const colDef = cellCtrl.getConfigCell().column.colDef;
    const cellClassRules = colDef.cellClassRules;
    const cellClassParams = getCellClassParams(beans, cellCtrl, colDef);

    processClassRules(
        beans.expressionSvc,
        // if current was previous, skip
        cellClassRules === cellCtrl.customStyleClassRules ? undefined : cellCtrl.customStyleClassRules,
        cellClassRules,
        cellClassParams,
        (className) => comp.toggleCss(className, true),
        (className) => comp.toggleCss(className, false)
    );
    cellCtrl.customStyleClassRules = cellClassRules;

    const recordColDef = getRecordColDef(cellCtrl);
    if (recordColDef) {
        const recordRules = recordColDef.cellClassRules;
        const previousRecordRules = cellCtrl.customStyleRecordClassRules;
        processClassRules(
            beans.expressionSvc,
            recordRules === previousRecordRules ? undefined : previousRecordRules,
            recordRules,
            getCellClassParams(beans, cellCtrl, recordColDef, cellCtrl.column),
            (className) => comp.toggleCss(className, true),
            (className) => comp.toggleCss(className, false)
        );
        cellCtrl.customStyleRecordClassRules = recordRules;
    }
}

export function _applyCellUserStyles(beans: BeanCollection, cellCtrl: CellCtrl): void {
    applyUserStyles(beans, cellCtrl, cellCtrl.getConfigCell().column.colDef);
    const recordColDef = getRecordColDef(cellCtrl);
    if (recordColDef) {
        applyUserStyles(beans, cellCtrl, recordColDef, cellCtrl.column);
    }
}

function applyUserStyles(beans: BeanCollection, cellCtrl: CellCtrl, colDef: ColDef, column?: AgColumn): void {
    const cellStyle = colDef.cellStyle;

    if (!cellStyle) {
        return;
    }

    let styles: CellStyle | null | undefined;

    if (typeof cellStyle === 'function') {
        styles = cellStyle(getCellClassParams(beans, cellCtrl, colDef, column));
    } else {
        styles = cellStyle;
    }

    if (styles) {
        cellCtrl.comp.setUserStyles(styles);
    }
}

/** Transposed view only: the record column's own colDef, whose styling layers on top of the field's. */
function getRecordColDef(cellCtrl: CellCtrl): ColDef | undefined {
    const displayedCol = cellCtrl.column;
    return displayedCol.transposeRecord === undefined ? undefined : displayedCol.colDef;
}

export function _applyCellClassesFromColDef(beans: BeanCollection, cellCtrl: CellCtrl): void {
    const comp = cellCtrl.comp;
    const colDef = cellCtrl.getConfigCell().column.colDef;
    const cellClassParams = getCellClassParams(beans, cellCtrl, colDef);

    const prevClasses = cellCtrl.customStyleStaticClasses;
    if (prevClasses) {
        for (const className of prevClasses) {
            comp.toggleCss(className, false);
        }
    }

    let newStaticClasses = beans.cellStyles!.getStaticCellClasses(colDef, cellClassParams);
    const recordColDef = getRecordColDef(cellCtrl);
    if (recordColDef) {
        const recordParams = getCellClassParams(beans, cellCtrl, recordColDef, cellCtrl.column);
        newStaticClasses = newStaticClasses.concat(beans.cellStyles!.getStaticCellClasses(recordColDef, recordParams));
    }
    cellCtrl.customStyleStaticClasses = newStaticClasses;

    for (const className of newStaticClasses) {
        comp.toggleCss(className, true);
    }
}

function getCellClassParams(
    beans: BeanCollection,
    cellCtrl: CellCtrl,
    colDef: ColDef,
    columnOverride?: AgColumn
): CellClassParams {
    const value = cellCtrl.value;
    const { rowNode, column } = cellCtrl.getConfigCell();
    return _addGridCommonParams(beans.gos, {
        value,
        data: rowNode.data,
        node: rowNode,
        colDef,
        column: columnOverride ?? column,
        rowIndex: rowNode.rowIndex!,
    });
}
