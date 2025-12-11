import type { BeanCollection, ColKey, IAggFunc } from 'ag-grid-community';

import type { ValueColsSvc } from './valueColsSvc';

export function addAggFuncs(beans: BeanCollection, aggFuncs: { [key: string]: IAggFunc }): void {
    if (beans.aggFuncSvc) {
        beans.aggFuncSvc.addAggFuncs(aggFuncs);
    }
}

export function clearAggFuncs(beans: BeanCollection): void {
    if (beans.aggFuncSvc) {
        beans.aggFuncSvc.clear();
    }
}

export function setColumnAggFunc(
    beans: BeanCollection,
    key: ColKey,
    aggFunc: string | IAggFunc | null | undefined
): void {
    (beans.valueColsSvc as ValueColsSvc)?.setColumnAggFunc?.(key, aggFunc, 'api');
}
