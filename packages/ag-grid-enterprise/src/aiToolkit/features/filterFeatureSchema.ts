import type {
    AgColumn,
    BeanCollection,
    FilterConfigService,
    ResolvedFilterConfig,
    SimpleFilterType,
    StructuredSchemaParams,
} from 'ag-grid-community';
import { ResolvedSimpleFilterConfig } from 'ag-grid-community';

import type { MultiFilterHandler } from '../../multiFilter/multiFilterHandler';
import type { SetFilterHandler } from '../../setFilter/setFilterHandler';
import type { SchemaBuilder } from '../schemaBuilder';
import { s } from '../schemaBuilder';
import { buildAdvancedFilterFeatureSchema } from './advancedFilterFeatureSchema';

const SetFilterKey = 'agSetColumnFilter';

const MultiFilterKey = 'agMultiColumnFilter';

export const buildFilterFeatureSchema = (beans: BeanCollection, params?: StructuredSchemaParams) => {
    const { advancedFilter } = beans;

    if (advancedFilter?.isEnabled()) {
        return buildAdvancedFilterFeatureSchema(beans);
    } else {
        return buildColumnFilterFeatureSchema(beans, params);
    }
};

const buildColumnFilterFeatureSchema = (beans: BeanCollection, params?: StructuredSchemaParams) => {
    const { gos, colFilter, colModel, filterConfigSvc } = beans;

    // Both live in `ColumnFilterModule`, so either both are here or neither is.
    if (!colFilter || !filterConfigSvc) {
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
        const columnParams = params?.columns ? params.columns[column.colId] : undefined;

        const colDef = column.colDef;
        const defaultFilter = colFilter!.getDefaultFilter(column);
        const includeSetValues = columnParams?.includeSetValues ?? false;

        const filter = buildColumnFilterSchema(
            filterConfigSvc,
            column,
            colDef.filter,
            colDef.filterParams,
            defaultFilter,
            undefined,
            (isMulti: boolean = false, multiIndex: number = 0) => {
                if (!includeSetValues) {
                    return [];
                }

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

    return s
        .object({
            filterModel: s.object(filterSchemas),
        })
        .nullable();
};

const buildColumnFilterSchema = (
    filterConfigSvc: FilterConfigService,
    column: AgColumn,
    filter: any,
    filterParams: any | undefined,
    defaultFilter: string,
    /** The child's own resolution where this is a Multi Filter child; the column's own otherwise. */
    filterConfig: ResolvedFilterConfig | null | undefined,
    getKeys?: (isMulti?: boolean, index?: number) => (string | null)[]
): SchemaBuilder | null => {
    let filterKey: string | undefined = undefined;

    if (typeof filter === 'string') {
        filterKey = filter as string;
    } else if (typeof filter === 'object' && typeof filter.component === 'string') {
        filterKey = filter.component as string;
    } else if (filter === true || (typeof filter === 'object' && filter.component === true)) {
        filterKey = defaultFilter;
    }

    if (!filterKey) {
        return null;
    }

    // The column's own resolution decides whether this is a simple filter and which one, so the schema
    // cannot offer an option the dropdown rejected, nor disagree with it about the filter's type.
    const config = filterConfig ?? filterConfigSvc.get(column, filterParams ?? {});
    if (config instanceof ResolvedSimpleFilterConfig) {
        return buildSimpleFilterSchema(config.filterType, {
            maxConditions: config.conditionCounts.maxNumConditions,
            filterOptions: config.filterOptions.map((o) => (typeof o === 'string' ? o : o.displayKey)),
            useIsoSeparator: filterParams?.useIsoSeparator || false,
        });
    } else if (filterKey === SetFilterKey) {
        return buildSetFilterSchema(getKeys);
    } else if (filterKey === MultiFilterKey) {
        return buildMultiFilterSchema(filterConfigSvc, column, filterParams, defaultFilter, getKeys);
    }

    return null;
};

type SimpleFilterSchemaParams = {
    /** What the column resolved to, which is exactly what its dropdown offers. */
    filterOptions: string[];
    maxConditions: number;
    useIsoSeparator: boolean;
};

const buildSimpleFilterSchema = (filterType: SimpleFilterType, params: SimpleFilterSchemaParams) =>
    // Only a date's model names its values differently; the rest vary by type literal and value shape alone.
    filterType === 'date' ? buildDateFilterSchema(params) : buildValueFilterSchema(filterType, params);

const FILTER_TYPE_LABELS = { text: 'text', number: 'number', bigint: 'big int' } as const;

/**
 * Every model whose values sit on `filter`/`filterTo`. A Big Int carries its as strings, so a schema
 * describing them as numbers would lose the precision the filter exists to keep.
 */
const buildValueFilterSchema = (filterType: 'text' | 'number' | 'bigint', params: SimpleFilterSchemaParams) => {
    const label = FILTER_TYPE_LABELS[filterType];
    const value = (description: string) => {
        if (filterType === 'number') {
            return s.number(description);
        }
        if (filterType === 'bigint') {
            return s.string({ pattern: '^-?\\d+$', description });
        }
        return s.string(description);
    };
    const schema = s.object({
        filterType: s.literal(filterType, `Filter type identifier for ${label} filters`),
        type: s.enum(params.filterOptions, `${label} filter operation type`),
        filter: value('Primary filter value').nullable(),
        filterTo: value('Secondary filter value for range operations').nullable(),
    });

    return buildJoinSchema(schema, filterType, params.maxConditions);
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

const buildDateFilterSchema = (params: SimpleFilterSchemaParams) => {
    const pattern = params.useIsoSeparator
        ? '^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}$'
        : '^\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2}$';

    const schema = s.object({
        filterType: s.literal('date', 'Filter type identifier for date filters'),
        type: s.enum(params.filterOptions, 'Date filter operation type'),
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
    filterConfigSvc: FilterConfigService,
    column: AgColumn,
    filterParams: any,
    defaultFilter: string,
    getKeys: (isMulti: boolean, index?: number) => (string | null)[] = () => []
): SchemaBuilder | null => {
    const children = filterConfigSvc.getChildren(column, filterParams);
    const childSchemas = children
        .map(({ def: filter }, index: number) =>
            buildColumnFilterSchema(
                filterConfigSvc,
                column,
                filter.filter,
                filter.filterParams,
                defaultFilter,
                children[index]?.config,
                () => getKeys(true, index)
            )
        )
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
