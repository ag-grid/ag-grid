import type { BeanCollection } from '../context/context';
import type { Column } from '../interfaces/iColumn';
import type { FilterModel, IFilter } from '../interfaces/iFilter';
export declare function isColumnFilterPresent(beans: BeanCollection): boolean;
/** @deprecated v31.1 */
export declare function getFilterInstance<TFilter extends IFilter>(beans: BeanCollection, key: string | Column, callback?: (filter: TFilter | null) => void): undefined;
export declare function getColumnFilterInstance<TFilter extends IFilter>(beans: BeanCollection, key: string | Column): Promise<TFilter | null | undefined>;
export declare function destroyFilter(beans: BeanCollection, key: string | Column): void;
export declare function setFilterModel(beans: BeanCollection, model: FilterModel | null): void;
export declare function getFilterModel(beans: BeanCollection): FilterModel;
export declare function getColumnFilterModel<TModel>(beans: BeanCollection, column: string | Column): TModel | null;
export declare function setColumnFilterModel<TModel>(beans: BeanCollection, column: string | Column, model: TModel | null): Promise<void>;
export declare function showColumnFilter(beans: BeanCollection, colKey: string | Column): void;
