import type { BeanCollection } from '../context/context';
import type { AgColumn } from '../entities/agColumn';
import type { Column } from '../interfaces/iColumn';
import type { FilterAction, FilterActionParams, FilterHandler, FilterModel, IFilter } from '../interfaces/iFilter';
import { _getRowHandler } from './pairedFilterHandler';

export function isColumnFilterPresent(beans: BeanCollection): boolean {
    const filterManager = beans.filterManager;
    return !!filterManager?.isColumnFilterPresent() || !!filterManager?.isAggregateFilterPresent();
}

export function getColumnFilterInstance<TFilter = IFilter>(
    beans: BeanCollection,
    key: string | Column
): Promise<TFilter | null | undefined> {
    return (
        (beans.filterManager?.getColumnFilterInstance(key as string | AgColumn) as any) ?? Promise.resolve(undefined)
    );
}

export function destroyFilter(beans: BeanCollection, key: string | Column) {
    const column = beans.colModel.getCol(key);
    if (column) {
        return beans.colFilter?.destroyFilter(column, 'api');
    }
}

export function setFilterModel(beans: BeanCollection, model: FilterModel | null): void {
    beans.frameworkOverrides.wrapIncoming(() => beans.filterManager?.setFilterModel(model));
}

export function getFilterModel(beans: BeanCollection): FilterModel {
    return beans.filterManager?.getFilterModel() ?? {};
}

export function getColumnFilterModel<TModel>(
    beans: BeanCollection,
    key: string | Column,
    useUnapplied?: boolean
): TModel | null {
    const { gos, colModel, colFilter } = beans;
    if (useUnapplied && !gos.get('enableFilterHandlers')) {
        beans.log.warn(288);
        useUnapplied = false;
    }
    const column = colModel.getCol(key);
    return column ? (colFilter?.getModelForColumn(column, useUnapplied) ?? null) : null;
}

export function setColumnFilterModel<TModel>(
    beans: BeanCollection,
    column: string | Column,
    model: TModel | null
): Promise<void> {
    return beans.filterManager?.setColumnFilterModel(column as string | AgColumn, model) ?? Promise.resolve();
}

export function showColumnFilter(beans: BeanCollection, colKey: string | Column): void {
    const column = beans.colModel.getCol(colKey);
    if (!column) {
        // Column not found, can't show filter
        beans.log.error(12, { colKey });
        return;
    }
    beans.menuSvc?.showFilterMenu({
        column,
        containerType: 'columnFilter',
        positionBy: 'auto',
    });
}

export function hideColumnFilter(beans: BeanCollection): void {
    beans.menuSvc?.hideFilterMenu();
}

export function getColumnFilterHandler(beans: BeanCollection, colKey: string | Column): FilterHandler | undefined {
    const column = beans.colModel.getCol(colKey);
    if (!column) {
        // Column not found, can't show filter
        beans.log.error(12, { colKey });
        return undefined;
    }
    return _getRowHandler(beans.colFilter?.getHandler(column, true));
}

export function doFilterAction(beans: BeanCollection, params: FilterActionParams): void {
    const { colId, action } = params;
    if (action === 'clearPreservedValues' || action === 'clearUnselectedPreservedValues') {
        // Set Filters keep these with or without filter handlers, the Advanced Filter's included.
        beans.setFilterSvc?.clearPreservedValues(colId, action === 'clearUnselectedPreservedValues');
        return;
    }
    if (!beans.gos.get('enableFilterHandlers')) {
        beans.log.warn(287);
        return;
    }
    if (!colId) {
        beans.colFilter?.updateAllModels(action);
    } else if (typeof colId === 'string') {
        updateColumnModel(beans, colId, action);
    } else {
        for (let i = 0, len = colId.length; i < len; ++i) {
            updateColumnModel(beans, colId[i], action);
        }
    }
}

function updateColumnModel(beans: BeanCollection, colId: string, action: FilterAction): void {
    const column = beans.colModel.colsById[colId];
    if (column) {
        beans.colFilter?.updateModel(column, action);
    }
}
