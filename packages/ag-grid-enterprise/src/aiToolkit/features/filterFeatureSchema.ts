import type { AgColumn, BaseCellDataType, BeanCollection } from 'ag-grid-community';

import { createArraySchema, createEnumSchema, createObjectSchema } from '../schemaTypes';
import type { AnyOfSchema, JSONSchema, ObjectSchema, ReferencedProperty } from '../schemaTypes';

export const buildFilterFeatureSchema = (beans: BeanCollection): ObjectSchema | undefined => {
    const { colFilter } = beans;
    if (!colFilter) {
        return;
    }

    const columns = beans.colModel.getCols();
    const filterableColumns = columns.filter((col) => col.isFilterAllowed());

    if (filterableColumns.length === 0) {
        return;
    }

    const filterableColumnIds = filterableColumns.map((col) => col.getColId());

    return createObjectSchema({
        description: 'Complete AG Grid FilterState interface for AI structured output',
        $defs: {
            filterableColumnId: createEnumSchema({
                enum: filterableColumnIds,
                description: 'Column ID that supports filtering',
            }),
            // Simple filter types enum
            simpleFilterModelType: createEnumSchema({
                enum: [
                    'empty',
                    'equals',
                    'notEqual',
                    'lessThan',
                    'lessThanOrEqual',
                    'greaterThan',
                    'greaterThanOrEqual',
                    'inRange',
                    'contains',
                    'notContains',
                    'startsWith',
                    'endsWith',
                    'blank',
                    'notBlank',
                ],
                description: 'Valid filter operation types',
            }),

            // Text Filter Model
            textFilterModel: createObjectSchema({
                description: 'AG Grid TextFilterModel - strict validation for AI output',
                properties: {
                    filterType: createEnumSchema({ enum: ['text'] }),
                    type: { $ref: '#/$defs/simpleFilterModelType' } as ReferencedProperty,
                    filter: { type: 'string', description: 'Primary filter value' } as JSONSchema,
                    filterTo: {
                        type: 'string',
                        description: 'Secondary filter value for range operations',
                    } as JSONSchema,
                },
            }),

            // Number Filter Model
            numberFilterModel: createObjectSchema({
                description: 'AG Grid NumberFilterModel - strict validation for AI output',
                properties: {
                    filterType: createEnumSchema({ enum: ['number'] }),
                    type: { $ref: '#/$defs/simpleFilterModelType' } as ReferencedProperty,
                    filter: { type: 'number', description: 'Primary filter value' } as JSONSchema,
                    filterTo: {
                        type: 'number',
                        description: 'Secondary filter value for range operations',
                    } as JSONSchema,
                },
            }),

            // Date Filter Model
            dateFilterModel: createObjectSchema({
                description: 'AG Grid DateFilterModel - strict validation for AI output',
                properties: {
                    filterType: createEnumSchema({ enum: ['date'] }),
                    type: { $ref: '#/$defs/simpleFilterModelType' } as ReferencedProperty,
                    dateFrom: {
                        type: 'string',
                        pattern: '^\\d{4}-\\d{2}-\\d{2}( \\d{2}:\\d{2}:\\d{2})?$',
                        description: 'Start date in YYYY-MM-DD or YYYY-MM-DD HH:mm:ss format',
                    } as JSONSchema,
                    dateTo: {
                        type: 'string',
                        pattern: '^\\d{4}-\\d{2}-\\d{2}( \\d{2}:\\d{2}:\\d{2})?$',
                        description: 'End date for range filters in YYYY-MM-DD or YYYY-MM-DD HH:mm:ss format',
                    } as JSONSchema,
                },
            }),

            // Set Filter Model
            setFilterModel: createObjectSchema({
                description: 'AG Grid SetFilterModel - strict validation for AI output',
                properties: {
                    filterType: createEnumSchema({ enum: ['set'] }),
                    values: createArraySchema({
                        items: {
                            anyOf: [{ type: 'string' } as JSONSchema, { type: 'null' } as JSONSchema],
                        } as AnyOfSchema,
                        description: 'Array of selected values for filtering',
                    }),
                },
            }),

            // Combined Simple Model (AND/OR conditions)
            combinedSimpleModel: createObjectSchema({
                description: 'AG Grid ICombinedSimpleModel - multiple conditions with logical operator',
                properties: {
                    filterType: createEnumSchema({ enum: ['text', 'number', 'date'] }),
                    operator: createEnumSchema({ enum: ['AND', 'OR'] }),
                    conditions: createArraySchema({
                        minItems: 1,
                        items: {
                            anyOf: [
                                { $ref: '#/$defs/textFilterModel' } as ReferencedProperty,
                                { $ref: '#/$defs/numberFilterModel' } as ReferencedProperty,
                                { $ref: '#/$defs/dateFilterModel' } as ReferencedProperty,
                            ],
                        } as AnyOfSchema,
                    }),
                },
            }),

            // Multi Filter Model
            multiFilterModel: createObjectSchema({
                description: 'AG Grid IMultiFilterModel - multiple child filters',
                properties: {
                    filterType: createEnumSchema({ enum: ['multi'] }),
                    filterModels: {
                        anyOf: [
                            createArraySchema({
                                items: {
                                    anyOf: [
                                        { $ref: '#/$defs/textFilterModel' } as ReferencedProperty,
                                        { $ref: '#/$defs/numberFilterModel' } as ReferencedProperty,
                                        { $ref: '#/$defs/dateFilterModel' } as ReferencedProperty,
                                        { $ref: '#/$defs/setFilterModel' } as ReferencedProperty,
                                        { $ref: '#/$defs/combinedSimpleModel' } as ReferencedProperty,
                                        { type: 'null' } as JSONSchema,
                                    ],
                                } as AnyOfSchema,
                            }),
                            { type: 'null' } as JSONSchema,
                        ],
                    } as AnyOfSchema,
                },
            }),

            // Union of all column filter types
            columnFilterModel: {
                anyOf: [
                    { $ref: '#/$defs/textFilterModel' } as ReferencedProperty,
                    { $ref: '#/$defs/numberFilterModel' } as ReferencedProperty,
                    { $ref: '#/$defs/dateFilterModel' } as ReferencedProperty,
                    { $ref: '#/$defs/setFilterModel' } as ReferencedProperty,
                    { $ref: '#/$defs/combinedSimpleModel' } as ReferencedProperty,
                    { $ref: '#/$defs/multiFilterModel' } as ReferencedProperty,
                ],
            } as AnyOfSchema,

            // Advanced Filter Types
            joinAdvancedFilterModel: createObjectSchema({
                description: 'Recursive join filter with AND/OR conditions',
                properties: {
                    filterType: createEnumSchema({ enum: ['join'] }),
                    type: createEnumSchema({ enum: ['AND', 'OR'] }),
                    conditions: createArraySchema({
                        minItems: 1,
                        items: { $ref: '#/$defs/advancedFilterModel' } as ReferencedProperty,
                    }),
                },
            }),

            booleanAdvancedFilterModel: createObjectSchema({
                description: 'Boolean advanced filter model',
                properties: {
                    filterType: createEnumSchema({ enum: ['boolean'] }),
                    colId: { type: 'string' } as JSONSchema,
                    type: createEnumSchema({ enum: ['true', 'false'] }),
                },
            }),

            objectAdvancedFilterModel: createObjectSchema({
                description: 'Object advanced filter model',
                properties: {
                    filterType: createEnumSchema({ enum: ['object'] }),
                    colId: { type: 'string' } as JSONSchema,
                    type: createEnumSchema({
                        enum: [
                            'equals',
                            'notEqual',
                            'contains',
                            'notContains',
                            'startsWith',
                            'endsWith',
                            'blank',
                            'notBlank',
                        ],
                    }),
                    filter: { type: 'string' } as JSONSchema,
                },
            }),

            dateAdvancedFilterModel: createObjectSchema({
                description: 'Date advanced filter model',
                properties: {
                    filterType: createEnumSchema({ enum: ['date'] }),
                    colId: { type: 'string' } as JSONSchema,
                    type: createEnumSchema({
                        enum: [
                            'equals',
                            'notEqual',
                            'lessThan',
                            'lessThanOrEqual',
                            'greaterThan',
                            'greaterThanOrEqual',
                            'blank',
                            'notBlank',
                        ],
                    }),
                    filter: {
                        type: 'string',
                        pattern: '^\\d{4}-\\d{2}-\\d{2}$',
                        description: 'Date in YYYY-MM-DD format',
                    } as JSONSchema,
                },
            }),

            dateStringAdvancedFilterModel: createObjectSchema({
                description: 'Date string advanced filter model',
                properties: {
                    filterType: createEnumSchema({ enum: ['dateString'] }),
                    colId: { type: 'string' } as JSONSchema,
                    type: createEnumSchema({
                        enum: [
                            'equals',
                            'notEqual',
                            'lessThan',
                            'lessThanOrEqual',
                            'greaterThan',
                            'greaterThanOrEqual',
                            'blank',
                            'notBlank',
                        ],
                    }),
                    filter: {
                        type: 'string',
                        pattern: '^\\d{4}-\\d{2}-\\d{2}$',
                        description: 'Date in YYYY-MM-DD format',
                    } as JSONSchema,
                },
            }),

            dateTimeAdvancedFilterModel: createObjectSchema({
                description: 'DateTime advanced filter model',
                properties: {
                    filterType: createEnumSchema({ enum: ['dateTime'] }),
                    colId: { type: 'string' } as JSONSchema,
                    type: createEnumSchema({
                        enum: [
                            'equals',
                            'notEqual',
                            'lessThan',
                            'lessThanOrEqual',
                            'greaterThan',
                            'greaterThanOrEqual',
                            'blank',
                            'notBlank',
                        ],
                    }),
                    filter: {
                        type: 'string',
                        pattern: '^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}$',
                        description: 'DateTime in YYYY-MM-DDTHH:mm:ss format',
                    } as JSONSchema,
                },
            }),

            dateTimeStringAdvancedFilterModel: createObjectSchema({
                description: 'DateTime string advanced filter model',
                properties: {
                    filterType: createEnumSchema({ enum: ['dateTimeString'] }),
                    colId: { type: 'string' } as JSONSchema,
                    type: createEnumSchema({
                        enum: [
                            'equals',
                            'notEqual',
                            'lessThan',
                            'lessThanOrEqual',
                            'greaterThan',
                            'greaterThanOrEqual',
                            'blank',
                            'notBlank',
                        ],
                    }),
                    filter: {
                        type: 'string',
                        pattern: '^\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2}$',
                        description: 'DateTime in YYYY-MM-DD HH:mm:ss format',
                    } as JSONSchema,
                },
            }),

            numberAdvancedFilterModel: createObjectSchema({
                description: 'Number advanced filter model',
                properties: {
                    filterType: createEnumSchema({ enum: ['number'] }),
                    colId: { type: 'string' } as JSONSchema,
                    type: createEnumSchema({
                        enum: [
                            'equals',
                            'notEqual',
                            'lessThan',
                            'lessThanOrEqual',
                            'greaterThan',
                            'greaterThanOrEqual',
                            'blank',
                            'notBlank',
                        ],
                    }),
                    filter: { type: 'number' } as JSONSchema,
                },
            }),

            textAdvancedFilterModel: createObjectSchema({
                description: 'Text advanced filter model',
                properties: {
                    filterType: createEnumSchema({ enum: ['text'] }),
                    colId: { type: 'string' } as JSONSchema,
                    type: createEnumSchema({
                        enum: [
                            'equals',
                            'notEqual',
                            'contains',
                            'notContains',
                            'startsWith',
                            'endsWith',
                            'blank',
                            'notBlank',
                        ],
                    }),
                    filter: { type: 'string' } as JSONSchema,
                },
            }),

            // Union of all advanced filter types (recursive)
            advancedFilterModel: {
                anyOf: [
                    { $ref: '#/$defs/joinAdvancedFilterModel' } as ReferencedProperty,
                    { $ref: '#/$defs/booleanAdvancedFilterModel' } as ReferencedProperty,
                    { $ref: '#/$defs/objectAdvancedFilterModel' } as ReferencedProperty,
                    { $ref: '#/$defs/dateAdvancedFilterModel' } as ReferencedProperty,
                    { $ref: '#/$defs/dateStringAdvancedFilterModel' } as ReferencedProperty,
                    { $ref: '#/$defs/dateTimeAdvancedFilterModel' } as ReferencedProperty,
                    { $ref: '#/$defs/dateTimeStringAdvancedFilterModel' } as ReferencedProperty,
                    { $ref: '#/$defs/numberAdvancedFilterModel' } as ReferencedProperty,
                    { $ref: '#/$defs/textAdvancedFilterModel' } as ReferencedProperty,
                ],
            } as AnyOfSchema,
        },

        properties: {
            filter: createObjectSchema({
                properties: {
                    // filterModel: createObjectSchema({

                    //     description: 'Column filters keyed by column ID - basic filtering',
                    // }),
                    columnFilterState: {
                        type: 'object',
                        description: 'Filter UI state keyed by column ID - for component state management',
                    } as JSONSchema,
                    advancedFilterModel: { $ref: '#/$defs/advancedFilterModel' } as ReferencedProperty,
                },
            }),
        },
    });
};

/**
 * Builds a JSON schema for a specific column's filter options
 */
export function buildColumnFilterSchema(column: AgColumn, beans: BeanCollection): JSONSchema | null {
    const { colFilter, dataTypeSvc } = beans;

    if (!colFilter || !column.isFilterAllowed()) {
        return null;
    }

    const dataType = dataTypeSvc?.getBaseDataType(column);
    const defaultFilter = (colFilter as any).getDefaultFilter?.(column) || 'agTextColumnFilter';
    const colDef = column.getColDef();
    const specifiedFilter = colDef.filter;

    let filterType: string;
    if (typeof specifiedFilter === 'string') {
        filterType = specifiedFilter;
    } else if (specifiedFilter === true || specifiedFilter === undefined) {
        filterType = defaultFilter;
    } else {
        // Custom filter or disabled
        return createObjectSchema({
            description: `Custom or disabled filter for column ${column.getColId()}`,
            properties: {},
        });
    }

    // Return the appropriate schema based on filter type
    switch (filterType) {
        case 'agTextColumnFilter':
            return createTextFilterSchema(dataType);
        case 'agNumberColumnFilter':
            return createNumberFilterSchema(dataType);
        case 'agDateColumnFilter':
            return createDateFilterSchema();
        case 'agSetColumnFilter':
            return createSetFilterSchema();
        case 'agMultiColumnFilter':
            return createMultiFilterSchema();
        default:
            // For custom filters, return a generic schema
            return createObjectSchema({
                description: `Filter schema for column ${column.getColId()}`,
                properties: {
                    filterType: { type: 'string' },
                    filter: { anyOf: [{ type: 'string' }, { type: 'number' }] },
                },
            });
    }
}

/**
 * Creates a text filter schema
 */
function createTextFilterSchema(_dataType?: BaseCellDataType): JSONSchema {
    return createObjectSchema({
        description: 'Text filter configuration',
        properties: {
            filterType: { type: 'string', enum: ['text'] },
            type: createEnumSchema({
                enum: ['equals', 'notEqual', 'contains', 'notContains', 'startsWith', 'endsWith', 'blank', 'notBlank'],
                description: 'Text filter operation type',
            }),
            filter: { type: 'string', description: 'Filter value' },
        },
    });
}

/**
 * Creates a number filter schema
 */
function createNumberFilterSchema(_dataType?: BaseCellDataType): JSONSchema {
    return createObjectSchema({
        description: 'Number filter configuration',
        properties: {
            filterType: { type: 'string', enum: ['number'] },
            type: createEnumSchema({
                enum: [
                    'equals',
                    'notEqual',
                    'lessThan',
                    'lessThanOrEqual',
                    'greaterThan',
                    'greaterThanOrEqual',
                    'inRange',
                    'blank',
                    'notBlank',
                ],
                description: 'Number filter operation type',
            }),
            filter: { type: 'number', description: 'Filter value' },
            filterTo: { type: 'number', description: 'Upper bound for range filters' },
        },
    });
}

/**
 * Creates a date filter schema
 */
function createDateFilterSchema(): JSONSchema {
    return createObjectSchema({
        description: 'Date filter configuration',
        properties: {
            filterType: { type: 'string', enum: ['date'] },
            type: createEnumSchema({
                enum: ['equals', 'notEqual', 'lessThan', 'greaterThan', 'inRange', 'blank', 'notBlank'],
                description: 'Date filter operation type',
            }),
            dateFrom: { type: 'string', description: 'Start date (ISO format)' },
            dateTo: { type: 'string', description: 'End date for range filters (ISO format)' },
        },
    });
}

/**
 * Creates a set filter schema
 */
function createSetFilterSchema(): JSONSchema {
    return createObjectSchema({
        description: 'Set filter configuration',
        properties: {
            filterType: { type: 'string', enum: ['set'] },
            values: {
                type: 'array',
                items: { type: 'string' },
                description: 'Array of selected values',
            },
        },
    });
}

/**
 * Creates a multi-filter schema
 */
function createMultiFilterSchema(): JSONSchema {
    return createObjectSchema({
        description: 'Multi-filter combining multiple conditions',
        properties: {
            filterType: { type: 'string', enum: ['multi'] },
            operator: createEnumSchema({
                enum: ['AND', 'OR'],
                description: 'Logical operator combining conditions',
            }),
            conditions: {
                type: 'array',
                items: {
                    anyOf: [
                        { $ref: '#/$defs/textFilter' },
                        { $ref: '#/$defs/numberFilter' },
                        { $ref: '#/$defs/dateFilter' },
                        { $ref: '#/$defs/setFilter' },
                    ],
                },
                description: 'Array of filter conditions',
            },
        },
    });
}
