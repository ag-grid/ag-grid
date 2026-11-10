import { _getLocaleTextFunc, _jsonEquals } from 'ag-stack';

import type { BeanCollection } from '../context/context';
import type { AgColumn } from '../entities/agColumn';
import type { ColDef } from '../entities/colDef';
import type { BaseCellDataType, CoreDataTypeDefinition, DataTypeFormatValueFunc } from '../entities/dataType';
import { _isSetFilterByDefault } from '../gridOptionsUtils';
import type { FilterValueGetter, IFilterDef } from '../interfaces/iFilter';
import { isColumnFilterComp } from '../interfaces/iFilter';
import {
    _getDefaultSimpleFilter,
    _getFilterParamsForDataType,
    _hasFilterParamsForDataType,
} from './filterDataTypeUtils';

/** A column, Multi Filter or Selectable Filter definition, each of which can name its own filter value getter. */
export type FilterDefWithGetter = IFilterDef & { filterValueGetter?: FilterValueGetter };

/** The Multi Filter a child without a getter of its own reads through. */
export interface FilterParent {
    filterValueGetter: FilterValueGetter | undefined;
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface ResolvedFilter {
    /** What the filter is built from: a Selectable Filter's choice or a function laid over its data type's params. */
    readonly def: FilterDefWithGetter;
    /** What `filter: true` builds where the definition sits. */
    readonly defaultFilter: string;
    /** The filter name it gives, `true` resolved, or `undefined` for none or a component class of the author's. */
    readonly key: string | undefined;
    readonly filterValueGetter: FilterValueGetter | undefined;
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _resolveFilter(
    beans: BeanCollection,
    column: AgColumn,
    filterDef: FilterDefWithGetter = column.colDef,
    defaultFilter: string = _getDefaultFilter(beans, column),
    parent?: FilterParent
): ResolvedFilter {
    const choice = beans.selectableFilter?.getFilterDef(column, filterDef);
    const def = withRegisteredFilter(beans, withoutHandlerForm(beans, column, choice ?? filterDef));
    const filter = def.filter;
    const component = typeof filter === 'object' && filter != null ? filter.component : filter;
    let key: string | undefined;
    if (component === true) {
        key = defaultFilter;
    } else if (typeof component === 'string') {
        key = component;
    }
    const getter = def.filterValueGetter || (parent ? parent.filterValueGetter : column.colDef.filterValueGetter);
    // the grid's `object` getter reads formatted text; a Set Filter keys by the formatter instead
    const filterValueGetter =
        key === 'agSetColumnFilter' && getter === beans.dataTypeSvc?.objectFilterValueGetter ? undefined : getter;
    return {
        def: layerOverDataType(beans, column, def, key, filterValueGetter, !!choice),
        defaultFilter,
        key,
        filterValueGetter,
    };
}

/** Without filter handlers, the `{ component }` form builds its component, or what `true` does when it gives logic. */
function withoutHandlerForm(beans: BeanCollection, column: AgColumn, def: FilterDefWithGetter): FilterDefWithGetter {
    const filter = def.filter;
    if (!isColumnFilterComp(filter) || beans.gos.get('enableFilterHandlers')) {
        return def;
    }
    if (filter.handler || filter.doesFilterPass) {
        beans.log.warn(335, { colId: column.getColId() });
        return { ...def, filter: true };
    }
    return { ...def, filter: filter.component };
}

/** A name nothing is registered under (a stale `'set'`, a typo) builds what `true` does, so the column stays usable. */
function withRegisteredFilter(beans: BeanCollection, def: FilterDefWithGetter): FilterDefWithGetter {
    const filter = def.filter;
    if (isUnregistered(beans, filter)) {
        return { ...def, filter: true };
    }
    if (typeof filter === 'object' && filter != null && isUnregistered(beans, filter.component)) {
        return { ...def, filter: { ...filter, component: true } };
    }
    return def;
}

/** A string `filter` may name an application filter handler, or the Selectable Filter, which is no component. */
function isUnregistered(beans: BeanCollection, name: unknown): boolean {
    if (typeof name !== 'string' || beans.gos.get('filterHandlers')?.[name]) {
        return false;
    }
    if (name === 'agSelectableColumnFilter' && beans.selectableFilter) {
        return false;
    }
    return !beans.registry.hasUserComponent('filter', name);
}

/**
 * A column's own and a Multi Filter child's object params are merged with the definitions; a Selectable Filter's
 * choice and a function, each named by a string or `true`, are laid over their data type's params once resolved.
 */
function layerOverDataType(
    beans: BeanCollection,
    column: AgColumn,
    def: FilterDefWithGetter,
    name: string | undefined,
    filterValueGetter: FilterValueGetter | undefined,
    isChoice: boolean
): FilterDefWithGetter {
    const filterParams = def.filterParams;
    const isFunc = typeof filterParams === 'function';
    if (typeof name !== 'string' || !(isChoice || isFunc)) {
        return def;
    }
    const dataTypeSvc = beans.dataTypeSvc;
    const dataTypeDefinition = dataTypeSvc?.getDataTypeDefinition(column);
    const cellDataType = column.colDef.cellDataType;
    const formatValue = typeof cellDataType === 'string' ? dataTypeSvc?.getFormatValue(cellDataType) : undefined;
    if (!dataTypeDefinition || !formatValue) {
        return def;
    }
    const layer = (params: any) =>
        getParamsForDataType(beans, name, params, filterValueGetter, dataTypeDefinition, formatValue);
    if (isFunc) {
        return { ...def, filterParams: (params: any) => layer(filterParams(params)).filterParams };
    }
    return { ...def, ...layer(filterParams) };
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export function _getDefaultFilter(beans: BeanCollection, column: AgColumn): string {
    return getDefaultFilterFromDataType(beans, beans.dataTypeSvc?.getBaseDataType(column));
}

function getDefaultFilterFromDataType(beans: BeanCollection, cellDataType: BaseCellDataType | undefined): string {
    return _isSetFilterByDefault(beans.gos) ? 'agSetColumnFilter' : _getDefaultSimpleFilter(cellDataType);
}

/** A Multi Filter's children are laid over by the Multi Filter service, a function's once it is resolved. */
function getParamsForDataType(
    beans: BeanCollection,
    filter: string,
    filterParams: any,
    filterValueGetter: FilterValueGetter | undefined,
    dataTypeDefinition: CoreDataTypeDefinition,
    formatValue: DataTypeFormatValueFunc
): { filterParams?: any; filterValueGetter?: FilterValueGetter } {
    if (filter !== 'agMultiColumnFilter') {
        return _getFilterParamsForDataType(
            filter,
            filterParams,
            filterValueGetter,
            dataTypeDefinition,
            formatValue,
            beans,
            _getLocaleTextFunc(beans.localeSvc)
        );
    }
    if (typeof filterParams === 'function') {
        return { filterParams };
    }
    return (
        beans.multiFilter?.getParamsForDataType(filterParams, filterValueGetter, dataTypeDefinition, formatValue) ?? {}
    );
}

/** Logic comes with a display component, which cannot be a filter on its own. */
function isLogicWithoutHandlers(beans: BeanCollection, filter: unknown): boolean {
    return (
        isColumnFilterComp(filter) &&
        !!(filter.handler || filter.doesFilterPass) &&
        !beans.gos.get('enableFilterHandlers')
    );
}

/** The filter `filter` builds: the component its `{ component }` form names, or else itself. */
const getFilterComp = (filter: unknown): unknown => (isColumnFilterComp(filter) ? filter.component : filter);

/**
 * The filter `filter` builds: `true`, a name nothing is registered under and logic without filter handlers build
 * `defaultFilter`, the `{ component }` form the filter it names; `undefined` for none or a component of the author's.
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export function _getFilterKey(beans: BeanCollection, filter: unknown, defaultFilter: string): string | undefined {
    const named = getFilterComp(filter);
    if (named === true || isUnregistered(beans, named) || isLogicWithoutHandlers(beans, filter)) {
        return defaultFilter;
    }
    return typeof named === 'string' ? named : undefined;
}

/**
 * Whether changing the base data type of `column` from `from` to `to`, and so its filter definition from `fromDef`
 * to `toDef`, changes the filter built on it: a different filter, different params, or params of either data
 * type's, any of which can invalidate the filter's model. A Selectable Filter is judged by its active choice, a
 * Multi Filter by its children.
 */
export function _isFilterChangedByDataType(
    beans: BeanCollection,
    column: AgColumn,
    fromDef: IFilterDef,
    toDef: IFilterDef,
    from: BaseCellDataType | undefined,
    to: BaseCellDataType | undefined
): boolean {
    const selectableFilter = beans.selectableFilter;
    const { filter, filterParams } = selectableFilter?.getFilterDef(column, fromDef) ?? fromDef;
    const toFilterDef = selectableFilter?.getFilterDef(column, toDef) ?? toDef;
    const toFilter = toFilterDef.filter;
    const key = _getFilterKey(beans, filter, getDefaultFilterFromDataType(beans, from));
    if (
        key !== _getFilterKey(beans, toFilter, getDefaultFilterFromDataType(beans, to)) ||
        // components of the author's own have no key, so are told apart by the component itself
        (key === undefined && getFilterComp(filter) !== getFilterComp(toFilter))
    ) {
        return true;
    }
    // column types the data type brings can give the filter params of their own
    if (!areFilterParamsEqual(filterParams, toFilterDef.filterParams)) {
        return true;
    }
    if (from === to) {
        return false;
    }
    if (key === 'agMultiColumnFilter') {
        return !!beans.multiFilter?.areChildFiltersChangedByDataType(filterParams, from, to);
    }
    // a filter of the author's own takes no params from the data type
    return key !== undefined && (_hasFilterParamsForDataType(key, from) || _hasFilterParamsForDataType(key, to));
}

/** A function's params are only known once it is called, so two functions are equal only when the same one. */
function areFilterParamsEqual(params: unknown, otherParams: unknown): boolean {
    if (typeof params === 'function' || typeof otherParams === 'function') {
        return params === otherParams;
    }
    return _jsonEquals(params, otherParams);
}

export function _setColDefPropsForDataType(
    beans: BeanCollection,
    colDef: ColDef,
    dataTypeDefinition: CoreDataTypeDefinition,
    formatValue: DataTypeFormatValueFunc
): void {
    const defaultFilter = getDefaultFilterFromDataType(beans, dataTypeDefinition.baseDataType);
    const filter = _getFilterKey(beans, colDef.filter, defaultFilter);
    if (filter === undefined) {
        return;
    }
    const { filterParams, filterValueGetter } = getParamsForDataType(
        beans,
        filter,
        colDef.filterParams,
        colDef.filterValueGetter,
        dataTypeDefinition,
        formatValue
    );
    colDef.filterParams = filterParams;
    if (filterValueGetter) {
        colDef.filterValueGetter = filterValueGetter;
    }
}
