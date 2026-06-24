import type { BeanCollection } from '../context/context';
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
    const { column, comp } = cellCtrl;
    const colDef = column.colDef;
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
}

export function _applyCellUserStyles(beans: BeanCollection, cellCtrl: CellCtrl): void {
    const colDef = cellCtrl.column.colDef;
    const cellStyle = colDef.cellStyle;

    if (!cellStyle) {
        return;
    }

    let styles: CellStyle | null | undefined;

    if (typeof cellStyle === 'function') {
        styles = cellStyle(getCellClassParams(beans, cellCtrl, colDef));
    } else {
        styles = cellStyle;
    }

    if (styles) {
        cellCtrl.comp.setUserStyles(styles);
    }
}

export function _applyCellClassesFromColDef(beans: BeanCollection, cellCtrl: CellCtrl): void {
    const { column, comp } = cellCtrl;
    const colDef = column.colDef;
    const cellClassParams = getCellClassParams(beans, cellCtrl, colDef);

    const prevClasses = cellCtrl.customStyleStaticClasses;
    if (prevClasses) {
        for (const className of prevClasses) {
            comp.toggleCss(className, false);
        }
    }

    const newStaticClasses = beans.cellStyles!.getStaticCellClasses(colDef, cellClassParams);
    cellCtrl.customStyleStaticClasses = newStaticClasses;

    for (const className of newStaticClasses) {
        comp.toggleCss(className, true);
    }
}

function getCellClassParams(beans: BeanCollection, cellCtrl: CellCtrl, colDef: ColDef): CellClassParams {
    const { value, rowNode, column } = cellCtrl;
    return _addGridCommonParams(beans.gos, {
        value,
        data: rowNode.data,
        node: rowNode,
        colDef,
        column,
        rowIndex: rowNode.rowIndex!,
    });
}
