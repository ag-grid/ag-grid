import type { BeanCollection } from '../context/context';
import type { AgColumn } from '../entities/agColumn';
import type { Column } from '../interfaces/iColumn';
import type { FilterModel, IFilter } from '../interfaces/iFilter';
import { _errorOnce } from '../utils/function';

export function isColumnFilterPresent(beans: BeanCollection): boolean {
    return !!beans.filterManager?.isColumnFilterPresent() || !!beans.filterManager?.isAggregateFilterPresent();
}

/** @deprecated v31.1 */
export function getFilterInstance<TFilter extends IFilter>(
    beans: BeanCollection,
    key: string | Column,
    callback?: (filter: TFilter | null) => void
): TFilter | null | undefined {
    return beans.filterManager?.getFilterInstance(key as string | AgColumn, callback);
}

export function getColumnFilterInstance<TFilter extends IFilter>(
    beans: BeanCollection,
    key: string | Column
): Promise<TFilter | null | undefined> {
    return beans.filterManager?.getColumnFilterInstance(key as string | AgColumn) ?? Promise.resolve(undefined);
}

export function destroyFilter(beans: BeanCollection, key: string | Column) {
    const column = beans.columnModel.getColDefCol(key);
    if (column) {
        return beans.filterManager?.destroyFilter(column, 'api');
    }
}

export function setFilterModel(beans: BeanCollection, model: FilterModel | null): void {
    beans.frameworkOverrides.wrapIncoming(() => beans.filterManager?.setFilterModel(model));
}

export function getFilterModel(beans: BeanCollection): FilterModel {
    return beans.filterManager?.getFilterModel() ?? {};
}

export function getColumnFilterModel<TModel>(beans: BeanCollection, column: string | Column): TModel | null {
    return beans.filterManager?.getColumnFilterModel(column as string | AgColumn) ?? null;
}

export function setColumnFilterModel<TModel>(
    beans: BeanCollection,
    column: string | Column,
    model: TModel | null
): Promise<void> {
    return beans.filterManager?.setColumnFilterModel(column as string | AgColumn, model) ?? Promise.resolve();
}

export function showColumnFilter(beans: BeanCollection, colKey: string | Column): void {
    const column = beans.columnModel.getCol(colKey);
    if (!column) {
        _errorOnce(`column '${colKey}' not found`);
        return;
    }
    beans.menuService.showFilterMenu({
        column,
        containerType: 'columnFilter',
        positionBy: 'auto',
    });
}
