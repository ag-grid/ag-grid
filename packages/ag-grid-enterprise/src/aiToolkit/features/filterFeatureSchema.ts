import type { BeanCollection } from 'ag-grid-community';

import type { MultiFilterHandler } from '../../multiFilter/multiFilterHandler';
import type { SetFilterHandler } from '../../setFilter/setFilterHandler';
import type { SchemaBuilder } from '../schemaBuilder';
import { s } from '../schemaBuilder';
import type { StructuredSchemaParams } from '../structuredSchema';
import { buildAdvancedFilterFeatureSchema } from './advancedFilterFeatureSchema';

const TextFilterKey = 'agTextColumnFilter';
const NumberFilterKey = 'agNumberColumnFilter';
const DateFilterKey = 'agDateColumnFilter';

const SetFilterKey = 'agSetColumnFilter';

const MultiFilterKey = 'agMultiColumnFilter';

const SimpleFilterKeys = [TextFilterKey, NumberFilterKey, DateFilterKey];

export const buildFilterFeatureSchema = (beans: BeanCollection, params?: StructuredSchemaParams) => {
    const { advancedFilter } = beans;

    if (advancedFilter.isEnabled()) {
        return buildAdvancedFilterFeatureSchema(beans);
    } else {
        return buildColumnFilterFeatureSchema(beans, params);
    }
};

export const buildColumnFilterFeatureSchema = (beans: BeanCollection, params?: StructuredSchemaParams) => {
    const { gos, colFilter, colModel } = beans;

    if (!colFilter) {
        return;
    }

    const columns = colModel.getCols();
    const filterableColumns = columns.filter((col) => col.isFilterAllowed());

    if (filterableColumns.length === 0) {
        return;
    }

    const useSetFilters = gos.isModuleRegistered('SetFilter') && !gos.get('suppressSetFilterByDefault');

    const filterSchemas: Record<string, SchemaBuilder> = {};
    const enableFilterHandlers = gos.get('enableFilterHandlers');

    for (const column of filterableColumns) {
        const columnParams = params?.columns ? params.columns[column.getColId()] : undefined;

        const colDef = column.getColDef();
        const defaultFilter = useSetFilters ? SetFilterKey : colFilter!.getDefaultFilter(column);
        const includeSetValues = columnParams?.includeSetValues ?? false;

        const filter = buildColumnFilterSchema(
            colDef.filter,
            colDef.filterParams,
            defaultFilter,
            (isMulti: boolean = false, multiIndex: number = 0) => {
                if (!includeSetValues) return [];

                let handler: SetFilterHandler | undefined = undefined;
                if (!isMulti) {
                    handler = colFilter.getHandler(column, true) as SetFilterHandler;
                } else if (enableFilterHandlers) {
                    const multiHandler = colFilter.getHandler(column, true) as MultiFilterHandler;
                    handler = multiHandler.getHandler(multiIndex) as SetFilterHandler;
                }

                if (!handler) {
                    return [];
                }

                return handler.getFilterKeys();
            }
        );

        if (filter) {
            filterSchemas[column.colId] = filter.nullable();
        }
    }

    return s.object({
        filterModel: s.object(filterSchemas),
    });
};

export function buildColumnFilterSchema(
    filter: any,
    filterParams: any | undefined,
    defaultFilter: string,
    getKeys?: (isMulti?: boolean, index?: number) => (string | null)[]
) {
    let filterKey: string;

    if (typeof filter === 'string') {
        filterKey = filter as string;
    } else if (typeof filter === 'object' && typeof filter.component === 'string') {
        filterKey = filter.component as string;
    } else {
        filterKey = defaultFilter;
    }

    if (SimpleFilterKeys.includes(filterKey)) {
        const maxConditions = filterParams?.maxNumConditions;
        const filterOptions = filterParams?.filterOptions
            ? filterParams.filterOptions
                  .map((option: any) => {
                      if (typeof option === 'string') return option;
                      if (typeof option === 'object' && option.displayKey) return option.displayKey;
                      return null;
                  })
                  .filter(Boolean)
            : undefined;
        const useIsoSeparator = filterParams?.useIsoSeparator || false;

        return buildSimpleFilterSchema(filterKey, { maxConditions, filterOptions, useIsoSeparator });
    } else if (filterKey === SetFilterKey) {
        return buildSetFilterSchema(getKeys);
    } else if (filterKey === MultiFilterKey) {
        return buildMultiFilterSchema(filterParams.filters, defaultFilter, getKeys);
    }

    return null;
}

type SimpleFilterSchemaParams = {
    filterOptions?: string[];
    maxConditions?: number;
    useIsoSeparator: boolean;
};

const buildSimpleFilterSchema = (filterKey: string, params: SimpleFilterSchemaParams) => {
    if (filterKey === DateFilterKey) {
        return buildDateFilterSchema(params);
    } else if (filterKey === NumberFilterKey) {
        return buildNumberFilterSchema(params);
    } else {
        return buildTextFilterSchema(params);
    }
};

const buildJoinSchema = (schema: SchemaBuilder, filterType: string, maxConditions: number = 2) => {
    if (maxConditions === 1) return schema;

    return s.object({
        filterType: s.literal(filterType),
        operator: s.enum(['AND', 'OR']),
        conditions: s.array(schema).minItems(2).maxItems(maxConditions),
    });
};

const buildTextFilterSchema = (params: SimpleFilterSchemaParams) => {
    const options = params.filterOptions ?? [
        'contains',
        'notContains',
        'equals',
        'notEqual',
        'startsWith',
        'endsWith',
        'blank',
        'notBlank',
    ];

    const schema = s.object({
        filterType: s.literal('text'),
        type: s.enum(options),
        filter: s.string('Primary filter value'),
        filterTo: s.string('Secondary filter value for range operations'),
    });

    return buildJoinSchema(schema, 'text', params.maxConditions);
};

const buildNumberFilterSchema = (params: SimpleFilterSchemaParams) => {
    const options = params.filterOptions ?? [
        'equals',
        'notEqual',
        'greaterThan',
        'greaterThanOrEqual',
        'lessThan',
        'lessThanOrEqual',
        'inRange',
        'blank',
        'notBlank',
    ];

    const schema = s.object({
        filterType: s.literal('number'),
        type: s.enum(options),
        filter: s.number('Primary filter value'),
        filterTo: s.number('Secondary filter value for range operations'),
    });

    return buildJoinSchema(schema, 'number', params.maxConditions);
};

const buildDateFilterSchema = (params: SimpleFilterSchemaParams) => {
    const options = params.filterOptions ?? [
        'equals',
        'notEqual',
        'lessThan',
        'greaterThan',
        'inRange',
        'blank',
        'notBlank',
    ];

    const pattern = params.useIsoSeparator
        ? '^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}$'
        : '^\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2}$';

    const schema = s.object({
        filterType: s.literal('text'),
        type: s.enum(options),
        dateFrom: s.string({ pattern, description: 'Primary filter value' }),
        dateTo: s.string({ pattern, description: 'Secondary filter value for range operations' }),
    });

    return buildJoinSchema(schema, 'text', params.maxConditions);
};

const buildSetFilterSchema = (getKeys?: () => (string | null)[]) => {
    return s.object({
        filterType: s.literal('set'),
        values: s.array(getKeys ? s.enum(getKeys().filter(Boolean) as string[]) : s.string()),
    });
};

const buildMultiFilterSchema = (
    filters: any,
    defaultFilter: string,
    getKeys: (isMulti: boolean, index?: number) => (string | null)[] = () => []
) => {
    return s.object({
        filterType: s.literal('multi'),
        filterModels: s.array(
            s
                .union(
                    filters.map((filter: any, index: number) =>
                        buildColumnFilterSchema(filter.filter, filter.filterParams, defaultFilter, () =>
                            getKeys(true, index)
                        )
                    )
                )
                .nullable()
        ),
    });
};
