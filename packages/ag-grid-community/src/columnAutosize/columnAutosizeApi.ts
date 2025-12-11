import type { BeanCollection } from '../context/context';
import type { ColKey } from '../entities/colDef';
import type {
    ISizeAllColumnsToContentParams,
    ISizeColumnsToContentParams,
    ISizeColumnsToFitParams,
} from '../interfaces/autoSize';

export function sizeColumnsToFit(beans: BeanCollection, paramsOrGridWidth?: ISizeColumnsToFitParams | number) {
    if (typeof paramsOrGridWidth === 'number') {
        beans.colAutosize?.sizeColumnsToFit(paramsOrGridWidth, 'api');
    } else {
        beans.colAutosize?.sizeColumnsToFitGridBody(paramsOrGridWidth);
    }
}

export function autoSizeColumns(beans: BeanCollection, keys: ColKey[], skipHeader?: boolean): void;
export function autoSizeColumns(beans: BeanCollection, params: ISizeColumnsToContentParams): void;
export function autoSizeColumns(
    { colAutosize, visibleCols }: BeanCollection,
    keysOrParams: ColKey[] | ISizeColumnsToContentParams,
    skipHeader?: boolean
): void {
    if (Array.isArray(keysOrParams)) {
        colAutosize?.autoSizeCols({ colKeys: keysOrParams, skipHeader, source: 'api' });
    } else {
        colAutosize?.autoSizeCols({
            ...keysOrParams,
            colKeys: keysOrParams.colIds ?? visibleCols.allCols,
            source: 'api',
        });
    }
}

export function autoSizeAllColumns(beans: BeanCollection, params: ISizeAllColumnsToContentParams): void;
export function autoSizeAllColumns(beans: BeanCollection, skipHeader?: boolean): void;
export function autoSizeAllColumns(
    beans: BeanCollection,
    paramsOrSkipHeader?: ISizeColumnsToContentParams | boolean
): void {
    if (paramsOrSkipHeader && typeof paramsOrSkipHeader === 'object') {
        autoSizeColumns(beans, paramsOrSkipHeader);
    } else {
        beans.colAutosize?.autoSizeAllColumns({ source: 'api', skipHeader: paramsOrSkipHeader });
    }
}
