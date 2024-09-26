import type { BeanCollection } from '../context/context';
import type { ColDef } from '../entities/colDef';
import type { ISizeColumnsToFitParams } from '../interfaces/autoSize';
import type { Column } from '../interfaces/iColumn';

export function sizeColumnsToFit(beans: BeanCollection, paramsOrGridWidth?: ISizeColumnsToFitParams | number) {
    if (typeof paramsOrGridWidth === 'number') {
        beans.columnAutosizeService?.sizeColumnsToFit(paramsOrGridWidth, 'api');
    } else {
        beans.columnAutosizeService?.sizeColumnsToFitGridBody(paramsOrGridWidth);
    }
}

/** @deprecated v31.1 */
export function autoSizeColumn(beans: BeanCollection, key: string | ColDef | Column, skipHeader?: boolean): void {
    return beans.columnAutosizeService?.autoSizeCols({ colKeys: [key], skipHeader: skipHeader, source: 'api' });
}

export function autoSizeColumns(beans: BeanCollection, keys: (string | ColDef | Column)[], skipHeader?: boolean): void {
    beans.columnAutosizeService?.autoSizeCols({ colKeys: keys, skipHeader: skipHeader, source: 'api' });
}

export function autoSizeAllColumns(beans: BeanCollection, skipHeader?: boolean): void {
    beans.columnAutosizeService?.autoSizeAllColumns('api', skipHeader);
}
