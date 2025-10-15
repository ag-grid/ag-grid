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

    columns.forEach((col) => {
        const dataType = dataTypeSvc.getBaseDataType(col);
        if (dataType) {
            dataTypes[dataType].push(col.colId);
        }
    });

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
        filterType: s.literal('join'),
        type: s.enum(['AND', 'OR']),
        conditions: s.array(s.ref('advancedFilterModel')),
    });

    defs.advancedFilterModel = {
        anyOf: [...columnFilterModels, { $ref: '#/$defs/joinAdvancedFilterModel' }],
    };

    return s.object({
        advancedFilterModel: s.ref('advancedFilterModel'),
    });
};

const buildBooleanFilterSchema = (colIds: string[]) => {
    return s.object({
        filterType: s.literal('boolean'),
        colId: s.enum(colIds),
        type: s.enum(['true', 'false']),
    });
};

const buildObjectFilterSchema = (colIds: string[]) => {
    return s.object({
        filterType: s.literal('object'),
        colId: s.enum(colIds),
        filter: s.string(),
        type: s.enum(['equals', 'notEqual', 'contains', 'notContains', 'startsWith', 'endsWith', 'blank', 'notBlank']),
    });
};

const buildDateFilterSchema = (colIds: string[]) => {
    return s.object({
        filterType: s.literal('date'),
        colId: s.enum(colIds),
        filter: s.string({ pattern: '^\\d{4}-\\d{2}-\\d{2}$' }),
        type: s.enum([
            'equals',
            'notEqual',
            'lessThan',
            'lessThanOrEqual',
            'greaterThan',
            'greaterThanOrEqual',
            'blank',
            'notBlank',
        ]),
    });
};

const buildDateStringFilterSchema = (colIds: string[]) => {
    return s.object({
        filterType: s.literal('date'),
        colId: s.enum(colIds),
        filter: s.string({ pattern: '^\\d{4}-\\d{2}-\\d{2}$' }),
        type: s.enum([
            'equals',
            'notEqual',
            'lessThan',
            'lessThanOrEqual',
            'greaterThan',
            'greaterThanOrEqual',
            'blank',
            'notBlank',
        ]),
    });
};

const buildDateTimeFilterSchema = (colIds: string[]) => {
    return s.object({
        filterType: s.literal('date'),
        colId: s.enum(colIds),
        filter: s.string({ pattern: '^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}$' }),
        type: s.enum([
            'equals',
            'notEqual',
            'lessThan',
            'lessThanOrEqual',
            'greaterThan',
            'greaterThanOrEqual',
            'blank',
            'notBlank',
        ]),
    });
};

const buildDateTimeStringFilterSchema = (colIds: string[]) => {
    return s.object({
        filterType: s.literal('date'),
        colId: s.enum(colIds),
        filter: s.string({ pattern: '^\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2}$' }),
        type: s.enum([
            'equals',
            'notEqual',
            'lessThan',
            'lessThanOrEqual',
            'greaterThan',
            'greaterThanOrEqual',
            'blank',
            'notBlank',
        ]),
    });
};

const buildNumberFilterSchema = (colIds: string[]) => {
    return s.object({
        filterType: s.literal('number'),
        colId: s.enum(colIds),
        filter: s.number(),
        type: s.enum([
            'equals',
            'notEqual',
            'lessThan',
            'lessThanOrEqual',
            'greaterThan',
            'greaterThanOrEqual',
            'blank',
            'notBlank',
        ]),
    });
};

const buildTextFilterSchema = (colIds: string[]) => {
    return s.object({
        filterType: s.literal('text'),
        colId: s.enum(colIds),
        filter: s.string(),
        type: s.enum(['equals', 'notEqual', 'contains', 'notContains', 'startsWith', 'endsWith', 'blank', 'notBlank']),
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
