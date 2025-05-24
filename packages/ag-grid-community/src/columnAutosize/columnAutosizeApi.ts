import type { BeanCollection } from '../context/context';
import type { ColDef } from '../entities/colDef';
import type { ISizeColumnsToContentParams, ISizeColumnsToFitParams } from '../interfaces/autoSize';
import type { Column } from '../interfaces/iColumn';

export function sizeColumnsToFit(beans: BeanCollection, paramsOrGridWidth?: ISizeColumnsToFitParams | number) {
    if (typeof paramsOrGridWidth === 'number') {
        beans.colAutosize?.sizeColumnsToFit(paramsOrGridWidth, 'api');
    } else {
        beans.colAutosize?.sizeColumnsToFitGridBody(paramsOrGridWidth);
    }
}

export function autoSizeColumns(beans: BeanCollection, keys: (string | ColDef | Column)[], skipHeader?: boolean): void;
export function autoSizeColumns(beans: BeanCollection, params: ISizeColumnsToContentParams): void;
export function autoSizeColumns(
    beans: BeanCollection,
    keysOrParams: (string | ColDef | Column)[] | ISizeColumnsToContentParams,
    skipHeader?: boolean
): void {
    const params = Array.isArray(keysOrParams)
        ? { colKeys: keysOrParams, skipHeader, source: 'api' as const }
        : {
              colKeys: keysOrParams.colIds ?? beans.visibleCols.allCols,
              skipHeader: keysOrParams.skipHeader,
              defaultMaxWidth: keysOrParams.defaultMaxWidth,
              defaultMinWidth: keysOrParams.defaultMinWidth,
              columnLimits: keysOrParams.columnLimits,
              source: 'api' as const,
          };
    beans.colAutosize?.autoSizeCols(params);
}

export function autoSizeAllColumns(beans: BeanCollection, skipHeader?: boolean): void {
    beans.colAutosize?.autoSizeAllColumns('api', skipHeader);
}
