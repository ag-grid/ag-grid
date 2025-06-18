import type { BeanCollection } from '../context/context';
import type { AgColumn } from '../entities/agColumn';
import type { Column } from '../interfaces/iColumn';
import type { FilterActionParams, FilterHandler, FilterModel, IFilter } from '../interfaces/iFilter';
import { _error, _warn } from '../validation/logging';

export function isColumnFilterPresent(beans: BeanCollection): boolean {
    const filterManager = beans.filterManager;
    return !!filterManager?.isColumnFilterPresent() || !!filterManager?.isAggregateFilterPresent();
}

export function getColumnFilterInstance<TFilter extends IFilter>(
    beans: BeanCollection,
    key: string | Column
): Promise<TFilter | null | undefined> {
    return beans.filterManager?.getColumnFilterInstance(key as string | AgColumn) ?? Promise.resolve(undefined);
}

export function destroyFilter(beans: BeanCollection, key: string | Column) {
    const column = beans.colModel.getColDefCol(key);
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
        _warn(288);
        useUnapplied = false;
    }
    const column = colModel.getColDefCol(key) as AgColumn | null;
    return column ? colFilter?.getModelForColumn(column, useUnapplied) ?? null : null;
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
        _error(12, { colKey });
        return;
    }
    beans.menuSvc?.showFilterMenu({
        column,
        containerType: 'columnFilter',
        positionBy: 'auto',
    });
}

export function getColumnFilterHandler(beans: BeanCollection, colKey: string | Column): FilterHandler | undefined {
    const column = beans.colModel.getCol(colKey);
    if (!column) {
        // Column not found, can't show filter
        _error(12, { colKey });
        return undefined;
    }
    return beans.colFilter?.getHandler(column, true);
}

export function doFilterAction(beans: BeanCollection, params: FilterActionParams): void {
    const { colModel, colFilter, gos } = beans;
    if (!gos.get('enableFilterHandlers')) {
        _warn(287);
        return;
    }
    const { colId, action } = params;
    if (colId) {
        const column = colModel.getColById(colId);
        if (column) {
            colFilter?.updateModel(column, action);
        }
    } else {
        colFilter?.updateAllModels(action);
    }
}
