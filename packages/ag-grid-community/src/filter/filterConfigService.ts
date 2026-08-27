import { _hasOwn } from 'ag-stack';

import type { NamedBean } from '../context/bean';
import { BeanStub } from '../context/beanStub';
import type { AgColumn } from '../entities/agColumn';
import {
    FILTER_CONFIG_STATE_DEFERRED,
    FILTER_CONFIG_STATE_PENDING,
    FILTER_CONFIG_STATE_SETTLED,
} from '../entities/agColumn';
import type { ColDef } from '../entities/colDef';
import { _isClientSideRowModel } from '../gridOptionsUtils';
import type { Column } from '../interfaces/iColumn';
import type { IFilterDef } from '../interfaces/iFilter';
import { isColumnFilterComp } from '../interfaces/iFilter';
import type { IMultiFilterDef, IMultiFilterParams } from '../interfaces/iMultiFilter';
import type { ISetFilterParams } from '../interfaces/iSetFilter';
import { FILTER_HANDLER_MAP, _getMultiFilterDefs } from './columnFilterUtils';
import type { IProvidedFilterParams } from './provided/iProvidedFilter';
import type { ISimpleFilterParams, SimpleFilterType } from './provided/iSimpleFilter';
import {
    ResolvedFilterConfig,
    ResolvedMultiFilterConfig,
    ResolvedSimpleFilterConfig,
    _handedFilterConfig,
} from './provided/resolvedFilterConfig';

/**
 * A Multi Filter child: what it was declared as, and what that declaration resolved to.
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export interface MultiFilterChild {
    readonly def: IMultiFilterDef;
    /** Absent where the tree was deferred, and the child then resolves and reports its own. */
    readonly config: ResolvedFilterConfig | undefined;
}

/** Shared, so a column naming no `filterParams` does not allocate one to be read for absent values. */
const NO_PARAMS: ISimpleFilterParams = {};

/** The filters whose params this can resolve in full. The others have only the shared params to report. */
const SIMPLE_FILTER_TYPES: { [filter: string]: SimpleFilterType } = {
    agTextColumnFilter: 'text',
    agNumberColumnFilter: 'number',
    agBigIntColumnFilter: 'bigint',
    agDateColumnFilter: 'date',
};

/**
 * A Set Filter builds its keys with the Key Creator and displays them with the Value Formatter, so a Key
 * Creator without one leaves nothing readable to show. A tree list formats its own path parts instead.
 * Shared so the report and the filter that acts on it cannot describe different configurations.
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export const _setFilterNeedsValueFormatter = (params: ISetFilterParams<any, any>, colDef: ColDef): boolean =>
    !params.valueFormatter && !!(params.keyCreator ?? colDef.keyCreator) && !params.treeList;

/**
 * Resolves what every column's `filterParams` decide as the definitions are read, so a column whose filter
 * is never opened still reports its mistakes - and the filters read that same resolution.
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export class FilterConfigService extends BeanStub implements NamedBean {
    beanName = 'filterConfigSvc' as const;

    public postConstruct(): void {
        const buildAll = this.buildAll.bind(this);
        this.addManagedEventListeners({
            // Each is a moment a column can arrive unresolved.
            newColumnsLoaded: buildAll,
            gridColumnsChanged: buildAll,
            dataTypesInferred: buildAll,
        });
    }

    /** Cheap to call whenever a column may have changed, as `setColDef` discards the config of one that did. */
    public buildAll(): void {
        // Every column the grid knows, not just the displayed list: a warning lost is worse than one early.
        const cols = this.beans.colModel.getAllCols();
        for (let i = 0, len = cols.length; i < len; ++i) {
            const column = cols[i];
            if (column.filterConfigState === FILTER_CONFIG_STATE_PENDING) {
                this.buildColumn(column);
            }
        }
        this.reportButtons();
    }

    /** Resolves the column's filter, and a Multi Filter's children onto the config that owns them. */
    private buildColumn(column: AgColumn): void {
        const colDef = column.getColDef();
        // Resolving a `filter: true` column before inference would resolve the wrong filter's options, so it
        // is left for the `dataTypesInferred` pass.
        if (colDef.filter === true && this.beans.dataTypeSvc?.isPendingInference) {
            return;
        }
        column.filterConfigState = FILTER_CONFIG_STATE_SETTLED;
        column.filterConfig = null;
        if (!column.isFilterAllowed()) {
            return;
        }
        // Calling it would run a user callback at a new time, on a grid with no row data, and again when the
        // factory builds the component. Left to the filter, which is handed the applied result.
        const filterParams = colDef.filterParams;
        if (typeof filterParams === 'function') {
            column.filterConfigState = FILTER_CONFIG_STATE_DEFERRED;
            return;
        }
        const filter = this.resolveFilterName(column, colDef);
        if (filter !== 'agMultiColumnFilter') {
            column.filterConfig = this.buildOne(column, filter, filterParams);
            return;
        }

        // A Multi Filter naming no children still has two, and their inherited params still report.
        const defs = _getMultiFilterDefs(filterParams);
        // A child's function defers the whole tree: resolving the others would leave a config claiming to
        // describe children it could not read. Each child then resolves and reports its own.
        if (defs.some((def) => typeof def.filterParams === 'function')) {
            column.filterConfigState = FILTER_CONFIG_STATE_DEFERRED;
            return;
        }
        // Only the handlers implementation renders one button bar for the whole filter; without it a child
        // keeps its own, so saying they are ignored would be false.
        const childButtonsIgnored = this.gos.get('enableFilterHandlers');
        const children: ResolvedFilterConfig[] = [];
        for (let i = 0, len = defs.length; i < len; ++i) {
            const child = defs[i];
            const childParams = child.filterParams;
            if (childButtonsIgnored && childParams?.buttons) {
                this.beans.log.warn(292, { colId: column.colId }); // child `buttons` ignored; the parent's stand
            }
            // A child naming no params of its own is configured by the Multi Filter's, under its own type.
            let params = childParams ?? filterParams;
            // Judging a child on `buttons` it will never be handed would report an apply button it lacks.
            if (childButtonsIgnored && params?.buttons) {
                params = { ...params, buttons: undefined };
            }
            children.push(this.buildOne(column, this.resolveFilterName(column, child), params));
        }
        column.filterConfig = this.buildOne(column, filter, filterParams, children);
    }

    /**
     * The Filters Tool Panel's own buttons stand in for every column's, so a column naming none is only a
     * problem once the panel has said so. One report for the grid rather than one per column: the panel's
     * configuration is the cause, so the fix usually is too.
     */
    public reportButtons(): void {
        if (!this.beans.colFilter?.isGlobalButtons) {
            return;
        }
        const cols = this.beans.colModel.getAllCols();
        const colIds: string[] = [];
        for (let i = 0, len = cols.length; i < len; ++i) {
            const column = cols[i];
            const config = column.filterConfig;
            if (config && !config.hasButtons) {
                colIds.push(column.colId);
            }
        }
        if (colIds.length) {
            this.beans.log.warn(281, { colIds });
        }
    }

    /**
     * A filter can be created before the column event that resolves the definitions, so asking for a
     * resolution is what makes one - `buildAll` then has nothing left to do for this column.
     */
    private built(column: AgColumn): ResolvedFilterConfig | null {
        if (column.filterConfigState === FILTER_CONFIG_STATE_PENDING) {
            this.buildColumn(column);
        }
        return column.filterConfig;
    }

    /**
     * The provided filter a definition names. `{ component }` is the shape a definition takes once it carries
     * a handler, so the name sits one level in; anything that is not a name is an inline custom component.
     */
    private resolveFilterName(column: AgColumn, filterDef: IFilterDef): string | undefined {
        const declared = filterDef.filter;
        const providedFilter = isColumnFilterComp(declared) ? declared.component : declared;
        if (typeof providedFilter === 'string') {
            return providedFilter;
        }
        return providedFilter === true || providedFilter == null
            ? this.beans.colFilter?.getDefaultFilter(column)
            : undefined;
    }

    /**
     * Every filterable definition resolves, a custom component's included: `buttons` are read by the
     * wrapper whatever the filter is. Only the four simple filters have their options resolved as well.
     */
    private buildOne(
        column: AgColumn,
        filter: string | undefined,
        filterParams: any,
        /** A Multi Filter's resolved children, so the parent is reported like any other definition. */
        children?: readonly ResolvedFilterConfig[]
    ): ResolvedFilterConfig {
        // Only a filter the grid implements reads `filterParams` under the documented meanings.
        const provided = !!filter && _hasOwn(FILTER_HANDLER_MAP, filter);

        const written = filterParams ?? NO_PARAMS;
        // A module may default some params from others before its filter ever sees them - the Set Filter's
        // `excelMode` sets `buttons` and `debounceMs` - so what the filter will be handed is what this judges.
        // Copied, as those hooks mutate what they are given.
        const processParams = filter ? this.beans.registry.getDefaultProcessParams(filter) : undefined;
        const params = processParams ? processParams({ ...written }, this.beans) : written;

        const log = this.beans.log;
        const filterType = provided ? SIMPLE_FILTER_TYPES[filter!] : undefined;
        let config: ResolvedFilterConfig;
        if (children) {
            config = new ResolvedMultiFilterConfig(column, params, children, log);
        } else if (filterType) {
            config = new ResolvedSimpleFilterConfig(column, params, filterType, log);
        } else {
            config = new ResolvedFilterConfig(column, params, log);
        }

        this.report(column, filter, written, config);
        return config;
    }

    /**
     * Every mistake a definition can be held to. Judged on what the column wrote rather than what a module
     * made of it, since `excelMode` corrects some of these itself and would erase the evidence. A definition
     * the factory had to apply is only ever seen corrected, so it is judged on that.
     */
    private report(
        column: AgColumn,
        filter: string | undefined,
        params: IProvidedFilterParams,
        config: ResolvedFilterConfig
    ): void {
        // Only a filter the grid implements reads `filterParams` under the documented meanings.
        if (!filter || !_hasOwn(FILTER_HANDLER_MAP, filter)) {
            return;
        }
        const log = this.beans.log;
        const colId = column.colId;
        if (params.debounceMs != null && config.useApplyButton) {
            log.warn(71, { colId }); // ignored, an apply button defers instead
        }
        if (filter === 'agSetColumnFilter') {
            // Judged here rather than in the Set Filter's module: these are property reads rather than Set Filter
            // logic, and a mistake in `filterParams` is one whether or not that module was ever registered.
            const setParams = params as ISetFilterParams;
            if (setParams.excelMode && setParams.defaultToNothingSelected) {
                log.warn(207, { colId }); // ignored, `excelMode` decides the initial selection itself
            }
            if (_setFilterNeedsValueFormatter(setParams, column.getColDef())) {
                log.error(249, { colId }); // a Key Creator with nothing to render its keys with
            }
            // Only the client-side row model holds every row for the filter to take values from, and the row
            // model cannot change once the grid is built.
            if (setParams.values == null && !_isClientSideRowModel(this.gos)) {
                log.error(113, { colId }); // no values given, and no rows to take them from
            }
        }
    }

    /**
     * A Multi Filter's children, each paired with the resolution it was built under. Both come from one
     * reading of the definition, so a child cannot be created against another child's configuration.
     */
    public getChildren(column: Column, params: IMultiFilterParams | null | undefined): MultiFilterChild[] {
        const config = this.built(column as AgColumn);
        const children = config instanceof ResolvedMultiFilterConfig ? config.children : undefined;
        return _getMultiFilterDefs(params).map((def, index) => ({ def, config: children?.[index] }));
    }

    /** The resolution a simple filter should use, resolved here where the definition could not be identified. */
    public getSimple(
        column: Column,
        params: ISimpleFilterParams,
        filterType: SimpleFilterType
    ): ResolvedSimpleFilterConfig {
        const handed = _handedFilterConfig(params);
        if (handed instanceof ResolvedSimpleFilterConfig) {
            return handed;
        }
        const agColumn = column as AgColumn;
        const config = this.built(agColumn);
        if (config instanceof ResolvedSimpleFilterConfig) {
            return config;
        }
        // Only a deferred definition reports here, and the first filter to resolve one keeps it. Anything
        // else reaching this is a Multi Filter child its owner handed nothing, already reported by the tree.
        const deferred = agColumn.filterConfigState === FILTER_CONFIG_STATE_DEFERRED;
        const resolved = new ResolvedSimpleFilterConfig(
            agColumn,
            params,
            filterType,
            deferred ? this.beans.log : undefined
        );
        if (deferred && agColumn.filterConfig == null) {
            agColumn.filterConfig = resolved;
            this.report(agColumn, this.resolveFilterName(agColumn, agColumn.getColDef()), params, resolved);
        }
        return resolved;
    }

    /** The resolution any filter should use, holding only what every filter's shared params decide. */
    public get(column: Column, params: IProvidedFilterParams): ResolvedFilterConfig {
        // What an owner handed this filter outranks the column's - a Multi Filter gives each child its own.
        const handed = _handedFilterConfig(params);
        if (handed) {
            return handed;
        }
        const agColumn = column as AgColumn;
        const config = this.built(agColumn);
        // A Multi Filter's own resolution is nobody's child, so a child that reaches here - one its owner did
        // not hand a resolution - resolves from its own params rather than adopting the parent's.
        if (config && !(config instanceof ResolvedMultiFilterConfig)) {
            return config;
        }
        const deferred = agColumn.filterConfigState === FILTER_CONFIG_STATE_DEFERRED;
        const resolved = new ResolvedFilterConfig(agColumn, params, deferred ? this.beans.log : undefined);
        if (deferred && agColumn.filterConfig == null) {
            agColumn.filterConfig = resolved;
            this.report(agColumn, this.resolveFilterName(agColumn, agColumn.getColDef()), params, resolved);
        }
        return resolved;
    }
}
