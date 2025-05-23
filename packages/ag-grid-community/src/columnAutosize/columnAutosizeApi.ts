import type { BeanCollection } from '../context/context';
import type { ColDef } from '../entities/colDef';
import type { ISizeColumnsToFitParams, SizeColumnsToContentStrategy } from '../interfaces/autoSize';
import type { Column } from '../interfaces/iColumn';

export function sizeColumnsToFit(beans: BeanCollection, paramsOrGridWidth?: ISizeColumnsToFitParams | number) {
    if (typeof paramsOrGridWidth === 'number') {
        beans.colAutosize?.sizeColumnsToFit(paramsOrGridWidth, 'api');
    } else {
        beans.colAutosize?.sizeColumnsToFitGridBody(paramsOrGridWidth);
    }
}

export function autoSizeColumns(beans: BeanCollection, keys: (string | ColDef | Column)[], skipHeader?: boolean): void;
export function autoSizeColumns(beans: BeanCollection, params: SizeColumnsToContentStrategy): void;
export function autoSizeColumns(
    beans: BeanCollection,
    keysOrParams: (string | ColDef | Column)[] | SizeColumnsToContentStrategy,
    skipHeader?: boolean
): void {
    if (Array.isArray(keysOrParams)) {
        beans.colAutosize?.autoSizeCols({ colKeys: keysOrParams, skipHeader, source: 'api' });
    } else {
        beans.colAutosize?.autoSizeCols({
            colKeys: keysOrParams.colIds ?? beans.visibleCols.allCols,
            skipHeader: keysOrParams.skipHeader,
            defaultMaxWidth: keysOrParams.defaultMaxWidth,
            defaultMinWidth: keysOrParams.defaultMinWidth,
            columnLimits: keysOrParams.columnLimits,
            source: 'api',
        });
    }
}

export function autoSizeAllColumns(beans: BeanCollection, skipHeader?: boolean): void {
    beans.colAutosize?.autoSizeAllColumns('api', skipHeader);
}
