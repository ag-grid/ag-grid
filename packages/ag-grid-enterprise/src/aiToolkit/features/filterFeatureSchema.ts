import type { AgColumn, BeanCollection, ResolvedFilter, StructuredSchemaParams } from 'ag-grid-community';
import {
    _ADVANCED_FILTER_ONLY_OPTIONS,
    _classifyFilterOptions,
    _getDisplayHandler,
    _resolveFilter,
} from 'ag-grid-community';

import type { MultiFilterHandler } from '../../multiFilter/multiFilterHandler';
import { resolveMultiFilterChildren } from '../../multiFilter/multiFilterUtil';
import type { SetFilterHandler } from '../../setFilter/setFilterHandler';
import type { SchemaBuilder } from '../schemaBuilder';
import { s } from '../schemaBuilder';
import { buildAdvancedFilterFeatureSchema } from './advancedFilterFeatureSchema';

const TextFilterKey = 'agTextColumnFilter';
const NumberFilterKey = 'agNumberColumnFilter';
const BigIntFilterKey = 'agBigIntColumnFilter';
const DateFilterKey = 'agDateColumnFilter';

const SetFilterKey = 'agSetColumnFilter';

const MultiFilterKey = 'agMultiColumnFilter';

const SimpleFilterKeys = [TextFilterKey, NumberFilterKey, BigIntFilterKey, DateFilterKey];

export const buildFilterFeatureSchema = (beans: BeanCollection, params?: StructuredSchemaParams) => {
    const { advancedFilter } = beans;

    if (advancedFilter?.isEnabled()) {
        return buildAdvancedFilterFeatureSchema(beans);
    } else {
        return buildColumnFilterFeatureSchema(beans, params);
    }
};

const buildColumnFilterFeatureSchema = (beans: BeanCollection, params?: StructuredSchemaParams) => {
    const { gos, colFilter, colModel } = beans;

    if (!colFilter) {
        return;
    }

    const columns = colModel.getCols();
    const filterableColumns = columns.filter((col) => col.isFilterAllowed());

    if (filterableColumns.length === 0) {
        return;
    }

    const filterSchemas: Record<string, SchemaBuilder> = {};
    const enableFilterHandlers = gos.get('enableFilterHandlers');

    for (const column of filterableColumns) {
        const colId = column.colId;
        const columnParams = params?.columns?.[colId];

        const includeSetValues = columnParams?.includeSetValues ?? false;
        // The column's model is its chosen filter's, the one its handler is built from.
        const filter = buildColumnFilterSchema(
            beans,
            column,
            _resolveFilter(beans, column),
            (isMulti: boolean = false, multiIndex: number = 0) => {
                if (!includeSetValues) {
                    return [];
                }

                let handler: SetFilterHandler | undefined = undefined;
                if (!isMulti) {
                    handler = _getDisplayHandler(colFilter.getHandler(column, true)) as SetFilterHandler;
                } else if (enableFilterHandlers) {
                    const multiHandler = _getDisplayHandler(colFilter.getHandler(column, true)) as MultiFilterHandler;
                    handler = multiHandler.getChildDisplayHandler(multiIndex) as SetFilterHandler;
                }

                if (!handler) {
                    return [];
                }

                return handler.getFilterKeys();
            }
        );

        if (filter) {
            filterSchemas[colId] = filter.nullable();
        }
    }

    return s
        .object({
            filterModel: s.object(filterSchemas),
        })
        .nullable();
};

function buildColumnFilterSchema(
    beans: BeanCollection,
    column: AgColumn,
    resolved: ResolvedFilter,
    getKeys?: (isMulti?: boolean, index?: number) => (string | null)[]
): SchemaBuilder | null {
    const filterKey = resolved.key;
    if (filterKey && SimpleFilterKeys.includes(filterKey)) {
        const filterParams = beans.colFilter!.resolveFilterParams(column, resolved.def);
        const maxConditions = filterParams?.maxNumConditions;
        // The filter's own definition of a usable entry, so the schema cannot offer a `type` it drops.
        // Read-only, so an entry it drops is not warned about again here.
        const userFilterOptions = filterParams?.filterOptions;
        const filterOptions = userFilterOptions
            ? [..._classifyFilterOptions(userFilterOptions, () => {}, _ADVANCED_FILTER_ONLY_OPTIONS).offered.keys()]
            : undefined;
        const useIsoSeparator = filterParams?.useIsoSeparator || false;

        return buildSimpleFilterSchema(filterKey, { maxConditions, filterOptions, useIsoSeparator });
    } else if (filterKey === SetFilterKey) {
        return buildSetFilterSchema(getKeys);
    } else if (filterKey === MultiFilterKey) {
        return buildMultiFilterSchema(beans, column, resolveMultiFilterChildren(beans, column, resolved)!, getKeys);
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
        return buildScalarFilterSchema('number', 'Number', (description) => s.number(description), params);
    } else if (filterKey === BigIntFilterKey) {
        // The model holds a bigint as its decimal text.
        const value = (description: string) => s.string({ pattern: '^-?\\d+$', description });
        return buildScalarFilterSchema('bigint', 'BigInt', value, params);
    } else {
        return buildTextFilterSchema(params);
    }
};

const buildJoinSchema = (schema: SchemaBuilder, filterType: string, maxConditions: number = 2) => {
    if (maxConditions === 1) {
        return schema;
    }

    return s.object({
        filterType: s.literal(filterType, `Filter type identifier for ${filterType} filters with multiple conditions`),
        operator: s.enum(
            ['AND', 'OR'],
            'Logical operator to combine multiple filter conditions. Must be included even with a single filter to adhere to the API.'
        ),
        conditions: s.array(schema, 'Array of filter conditions to be combined').minItems(2).maxItems(maxConditions),
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
        filterType: s.literal('text', 'Filter type identifier for text filters'),
        type: s.enum(options, 'Text filter operation type'),
        filter: s.string('Primary filter value').nullable(),
        filterTo: s.string('Secondary filter value for range operations').nullable(),
    });

    return buildJoinSchema(schema, 'text', params.maxConditions);
};

const buildScalarFilterSchema = (
    filterType: 'number' | 'bigint',
    title: string,
    value: (description: string) => SchemaBuilder,
    params: SimpleFilterSchemaParams
) => {
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
        filterType: s.literal(filterType, `Filter type identifier for ${filterType} filters`),
        type: s.enum(options, `${title} filter operation type`),
        filter: value('Primary filter value').nullable(),
        filterTo: value('Secondary filter value for range operations').nullable(),
    });

    return buildJoinSchema(schema, filterType, params.maxConditions);
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
        filterType: s.literal('date', 'Filter type identifier for date filters'),
        type: s.enum(options, 'Date filter operation type'),
        dateFrom: s
            .string({ pattern, description: 'Primary date filter value in YYYY-MM-DD HH:mm:ss format' })
            .nullable(),
        dateTo: s
            .string({
                pattern,
                description: 'Secondary date filter value for range operations in YYYY-MM-DD HH:mm:ss format',
            })
            .nullable(),
    });

    return buildJoinSchema(schema, 'date', params.maxConditions);
};

const buildSetFilterSchema = (getKeys?: () => (string | null)[]) => {
    const values = getKeys ? (getKeys().filter(Boolean) as string[]) : [];

    return s.object({
        filterType: s.literal('set', 'Filter type identifier for set filters'),
        values: s.array(
            values.length > 0 ? s.enum(values, 'Available values to filter by') : s.string('Filter values'),
            'Array of values to include in the filter'
        ),
    });
};

const buildMultiFilterSchema = (
    beans: BeanCollection,
    column: AgColumn,
    children: ResolvedFilter[],
    getKeys: (isMulti: boolean, index?: number) => (string | null)[] = () => []
): SchemaBuilder | null => {
    const childSchemas = children
        .map((child, index) => buildColumnFilterSchema(beans, column, child, () => getKeys(true, index)))
        .filter((schema: SchemaBuilder | null): schema is SchemaBuilder => schema !== null);

    if (childSchemas.length === 0) {
        return null;
    }

    return s.object({
        filterType: s.literal('multi', 'Filter type identifier for multi-condition filters'),
        filterModels: s.array(
            s.union(childSchemas, 'Union of different filter types that can be combined').nullable(),
            'Array of filter conditions to be combined with AND/OR logic'
        ),
    });
};
