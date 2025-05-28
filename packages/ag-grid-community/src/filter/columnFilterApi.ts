import type { BeanCollection } from '../context/context';
import type { AgColumn } from '../entities/agColumn';
import type { Column } from '../interfaces/iColumn';
import type { FilterHandler, FilterModel, IFilter } from '../interfaces/iFilter';
import { _error } from '../validation/logging';

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

export function getColumnFilterModel<TModel>(beans: BeanCollection, key: string | Column): TModel | null {
    const column = beans.colModel.getColDefCol(key) as AgColumn | null;
    return column ? beans.colFilter?.getModelForColumn(column) ?? null : null;
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
    return beans.colFilter?.getHandler(column);
}
