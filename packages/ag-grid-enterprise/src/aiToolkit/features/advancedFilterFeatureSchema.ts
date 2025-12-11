import type { BaseCellDataType, BeanCollection } from 'ag-grid-community';

import { s } from '../schemaBuilder';
import type { JSONSchema } from '../schemaTypes';

export const buildAdvancedFilterFeatureSchema = ({ colModel, dataTypeSvc }: BeanCollection) => {
    if (!dataTypeSvc) {
        return;
    }

    const columns = colModel.getCols();

    const dataTypes: Record<BaseCellDataType, string[]> = {
        boolean: [],
        object: [],
        date: [],
        dateString: [],
        dateTime: [],
        dateTimeString: [],
        number: [],
        text: [],
    };

    for (const col of columns) {
        const dataType = dataTypeSvc.getBaseDataType(col);
        if (dataType) {
            dataTypes[dataType].push(col.colId);
        }
    }

    const columnFilterModels: JSONSchema[] = [];

    const defs: Record<string, JSONSchema> = {};

    for (const key of Object.keys(dataTypes) as BaseCellDataType[]) {
        if (dataTypes[key].length > 0) {
            const ref = `${key}AdvancedFilterModel`;
            const builder = DataTypeSchemaBuilders[key];
            defs[ref] = builder(dataTypes[key]);
            columnFilterModels.push({ $ref: `#/$defs/${ref}` });
        }
    }

    defs.joinAdvancedFilterModel = s.object({
        filterType: s.literal('join', 'Filter type identifier for joining multiple advanced filter conditions'),
        type: s.enum(['AND', 'OR'], 'Logical operator to combine multiple advanced filter conditions'),
        conditions: s.array(s.ref('advancedFilterModel'), 'Array of advanced filter conditions to be combined'),
    });

    defs.advancedFilterModel = {
        anyOf: [...columnFilterModels, { $ref: '#/$defs/joinAdvancedFilterModel' }],
    };

    return s
        .object(
            {
                advancedFilterModel: s.ref('advancedFilterModel'),
            },
            'Advanced filter configuration for the grid'
        )
        .nullable();
};

const buildBooleanFilterSchema = (colIds: string[]) => {
    return s.object({
        filterType: s.literal('boolean', 'Filter type identifier for boolean column filters'),
        colId: s.enum(colIds, 'Column identifier for the boolean column to filter'),
        type: s.enum(['true', 'false'], 'Boolean value to filter by'),
    });
};

const buildObjectFilterSchema = (colIds: string[]) => {
    return s.object({
        filterType: s.literal('object', 'Filter type identifier for object column filters'),
        colId: s.enum(colIds, 'Column identifier for the object column to filter'),
        filter: s.string('Filter value to compare against object column values').nullable(),
        type: s.enum(
            ['equals', 'notEqual', 'contains', 'notContains', 'startsWith', 'endsWith', 'blank', 'notBlank'],
            'Object filter operation type'
        ),
    });
};

const buildDateFilterSchema = (colIds: string[]) => {
    return s.object({
        filterType: s.literal('date', 'Filter type identifier for date column filters'),
        colId: s.enum(colIds, 'Column identifier for the date column to filter'),
        filter: s
            .string({ pattern: '^\\d{4}-\\d{2}-\\d{2}$', description: 'Date value in YYYY-MM-DD format' })
            .nullable(),
        type: s.enum(
            [
                'equals',
                'notEqual',
                'lessThan',
                'lessThanOrEqual',
                'greaterThan',
                'greaterThanOrEqual',
                'blank',
                'notBlank',
            ],
            'Date filter operation type'
        ),
    });
};

const buildDateStringFilterSchema = (colIds: string[]) => {
    return s.object({
        filterType: s.literal('date', 'Filter type identifier for date string column filters'),
        colId: s.enum(colIds, 'Column identifier for the date string column to filter'),
        filter: s
            .string({ pattern: '^\\d{4}-\\d{2}-\\d{2}$', description: 'Date value in YYYY-MM-DD format' })
            .nullable(),
        type: s.enum(
            [
                'equals',
                'notEqual',
                'lessThan',
                'lessThanOrEqual',
                'greaterThan',
                'greaterThanOrEqual',
                'blank',
                'notBlank',
            ],
            'Date string filter operation type'
        ),
    });
};

const buildDateTimeFilterSchema = (colIds: string[]) => {
    return s.object({
        filterType: s.literal('dateTime', 'Filter type identifier for datetime column filters'),
        colId: s.enum(colIds, 'Column identifier for the datetime column to filter'),
        filter: s
            .string({
                pattern: '^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}$',
                description: 'DateTime value in YYYY-MM-DDTHH:mm:ss format',
            })
            .nullable(),
        type: s.enum(
            [
                'equals',
                'notEqual',
                'lessThan',
                'lessThanOrEqual',
                'greaterThan',
                'greaterThanOrEqual',
                'blank',
                'notBlank',
            ],
            'DateTime filter operation type'
        ),
    });
};

const buildDateTimeStringFilterSchema = (colIds: string[]) => {
    return s.object({
        filterType: s.literal('dateTimeString', 'Filter type identifier for datetime string column filters'),
        colId: s.enum(colIds, 'Column identifier for the datetime string column to filter'),
        filter: s
            .string({
                pattern: '^\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2}$',
                description: 'DateTime value in YYYY-MM-DD HH:mm:ss format',
            })
            .nullable(),
        type: s.enum(
            [
                'equals',
                'notEqual',
                'lessThan',
                'lessThanOrEqual',
                'greaterThan',
                'greaterThanOrEqual',
                'blank',
                'notBlank',
            ],
            'DateTime string filter operation type'
        ),
    });
};

const buildNumberFilterSchema = (colIds: string[]) => {
    return s.object({
        filterType: s.literal('number', 'Filter type identifier for number column filters'),
        colId: s.enum(colIds, 'Column identifier for the number column to filter'),
        filter: s.number('Numeric value to filter by').nullable(),
        type: s.enum(
            [
                'equals',
                'notEqual',
                'lessThan',
                'lessThanOrEqual',
                'greaterThan',
                'greaterThanOrEqual',
                'blank',
                'notBlank',
            ],
            'Number filter operation type'
        ),
    });
};

const buildTextFilterSchema = (colIds: string[]) => {
    return s.object({
        filterType: s.literal('text', 'Filter type identifier for text column filters'),
        colId: s.enum(colIds, 'Column identifier for the text column to filter'),
        filter: s.string('Text value to filter by').nullable(),
        type: s.enum(
            ['equals', 'notEqual', 'contains', 'notContains', 'startsWith', 'endsWith', 'blank', 'notBlank'],
            'Text filter operation type'
        ),
    });
};

const DataTypeSchemaBuilders: Record<BaseCellDataType, (colIds: string[]) => any> = {
    boolean: buildBooleanFilterSchema,
    object: buildObjectFilterSchema,
    date: buildDateFilterSchema,
    dateString: buildDateStringFilterSchema,
    dateTime: buildDateTimeFilterSchema,
    dateTimeString: buildDateTimeStringFilterSchema,
    number: buildNumberFilterSchema,
    text: buildTextFilterSchema,
};
