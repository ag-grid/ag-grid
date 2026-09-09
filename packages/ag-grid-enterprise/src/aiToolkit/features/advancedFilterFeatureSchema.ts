import { _getOwn } from 'ag-stack';

import type { AgColumn, BaseCellDataType, BeanCollection } from 'ag-grid-community';

import type { AdvancedFilterExpressionService } from '../../advancedFilter/advancedFilterExpressionService';
import type { OperandsKind } from '../../advancedFilter/filterExpressionOperators';
import { OPERAND_COUNT } from '../../advancedFilter/filterExpressionOperators';
import type { SchemaBuilder } from '../schemaBuilder';
import { s } from '../schemaBuilder';
import type { JSONSchema } from '../schemaTypes';

/** Columns sharing an operand kind and the same operators of that kind, under one model shape. */
interface OperatorGroup {
    /** The shape the model takes: `set` for a list option, so those columns group across data types. */
    readonly schemaName: BaseCellDataType | 'set';
    readonly colIds: string[];
    readonly operatorKeys: string[];
    readonly operands: OperandsKind;
}

/**
 * Read from the expression service, so a caller is offered the keys and operands an expression would accept.
 * Keyed on the kind and not the count, which would put a list in with the options taking no value at all.
 */
function getColumnOperatorKeysByOperands(
    advFilterExpSvc: AdvancedFilterExpressionService,
    column: AgColumn,
    dataType: BaseCellDataType
): Map<OperandsKind, string[]> {
    const columnOperators = advFilterExpSvc.getColumnOperators(dataType, column);
    const entries = columnOperators?.operators.getEntries(columnOperators.activeOperators) ?? [];
    const byOperands = new Map<OperandsKind, string[]>();
    for (let i = 0, len = entries.length; i < len; ++i) {
        const key = entries[i].key;
        const operands = _getOwn(columnOperators!.operators.operators, key)?.operands ?? 'none';
        const keys = byOperands.get(operands);
        if (keys) {
            keys.push(key);
        } else {
            byOperands.set(operands, [key]);
        }
    }
    return byOperands;
}

export const buildAdvancedFilterFeatureSchema = ({ colModel, dataTypeSvc, advFilterExpSvc }: BeanCollection) => {
    if (!dataTypeSvc || !advFilterExpSvc) {
        return;
    }
    const expSvc = advFilterExpSvc as AdvancedFilterExpressionService;

    const columns = colModel.getCols();

    // Keyed on the operators as well as the data type, so one column's options never reach a sibling's schema.
    const groups = new Map<string, OperatorGroup>();
    for (const col of columns) {
        const dataType = dataTypeSvc.getBaseDataType(col);
        if (!dataType) {
            continue;
        }
        const byOperands = getColumnOperatorKeysByOperands(expSvc, col, dataType);
        byOperands.forEach((operatorKeys, operands) => {
            // A list option writes a `set` model whatever the column's data type, so it groups as one.
            const schemaName = operands === 'list' ? 'set' : dataType;
            // JSON rather than a join: a `displayKey` is author-written and may hold the separator itself.
            const groupKey = `${schemaName} ${operands} ${JSON.stringify(operatorKeys)}`;
            const existing = groups.get(groupKey);
            if (existing) {
                existing.colIds.push(col.colId);
            } else {
                groups.set(groupKey, { schemaName, operatorKeys, operands, colIds: [col.colId] });
            }
        });
    }

    const columnFilterModels: JSONSchema[] = [];

    const defs: Record<string, JSONSchema> = {};

    const refCounts: Partial<Record<BaseCellDataType | 'set', number>> = {};
    for (const group of groups.values()) {
        const name = group.schemaName;
        // The first group of a name keeps the unsuffixed name, the only one most grids have.
        const count = (refCounts[name] ?? 0) + 1;
        refCounts[name] = count;
        const ref = `${name}AdvancedFilterModel${count > 1 ? count : ''}`;
        defs[ref] = buildFilterSchema(group).toJSON();
        columnFilterModels.push({ $ref: `#/$defs/${ref}` });
    }

    defs.joinAdvancedFilterModel = s.object({
        filterType: s.literal('join', 'Filter type identifier for joining multiple advanced filter conditions'),
        type: s.enum(['AND', 'OR'], 'Logical operator to combine multiple advanced filter conditions'),
        conditions: s.array(s.ref('advancedFilterModel'), 'Array of advanced filter conditions to be combined'),
    });

    defs.advancedFilterModel = {
        anyOf: [...columnFilterModels, { $ref: '#/$defs/joinAdvancedFilterModel' }],
    };

    const schema = s
        .object(
            {
                advancedFilterModel: s.ref('advancedFilterModel'),
            },
            'Advanced filter configuration for the grid'
        )
        .nullable();

    for (const key of Object.keys(defs)) {
        schema.define(key, defs[key]);
    }

    return schema;
};

/** What a data type contributes: the literal its model writes, the nouns its text reads in, and its value. */
interface DataTypeSchema {
    readonly filterType: string;
    readonly noun: string;
    readonly titleNoun: string;
    readonly value: () => SchemaBuilder;
}

const dateValue = () => s.string({ pattern: '^\\d{4}-\\d{2}-\\d{2}$', description: 'Date value in YYYY-MM-DD format' });

const DataTypeSchemas: Record<BaseCellDataType, DataTypeSchema> = {
    boolean: {
        filterType: 'boolean',
        noun: 'boolean',
        titleNoun: 'Boolean',
        value: () => s.string('Filter value to compare against boolean column values'),
    },
    object: {
        filterType: 'object',
        noun: 'object',
        titleNoun: 'Object',
        value: () => s.string('Filter value to compare against object column values'),
    },
    date: { filterType: 'date', noun: 'date', titleNoun: 'Date', value: dateValue },
    dateString: { filterType: 'dateString', noun: 'date string', titleNoun: 'Date string', value: dateValue },
    dateTime: {
        filterType: 'dateTime',
        noun: 'datetime',
        titleNoun: 'DateTime',
        value: () =>
            s.string({
                pattern: '^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}$',
                description: 'DateTime value in YYYY-MM-DDTHH:mm:ss format',
            }),
    },
    dateTimeString: {
        filterType: 'dateTimeString',
        noun: 'datetime string',
        titleNoun: 'DateTime string',
        value: () =>
            s.string({
                pattern: '^\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2}$',
                description: 'DateTime value in YYYY-MM-DD HH:mm:ss format',
            }),
    },
    number: {
        filterType: 'number',
        noun: 'number',
        titleNoun: 'Number',
        value: () => s.number('Numeric value to filter by'),
    },
    bigint: {
        filterType: 'bigint',
        noun: 'bigint',
        titleNoun: 'BigInt',
        value: () => s.string({ pattern: '^-?\\d+$', description: 'BigInt value to filter by' }),
    },
    text: { filterType: 'text', noun: 'text', titleNoun: 'Text', value: () => s.string('Text value to filter by') },
};

/** One operand kind per schema, so the value slots it declares are exactly the ones its operators require. */
function buildFilterSchema(group: OperatorGroup): SchemaBuilder {
    const schemaName = group.schemaName;
    // A list option takes the values themselves, not the one-or-two operands every data type writes.
    if (schemaName === 'set') {
        return s.object({
            filterType: s.literal('set', 'Filter type identifier for set column filters'),
            colId: s.enum(group.colIds, 'Column identifier for the Set Filter column to filter'),
            type: s.enum(group.operatorKeys, 'Set filter operation type'),
            // An empty list is a fault the parser rejects, discarding the whole model.
            values: s.array(s.string().nullable(), 'The values to filter on; null matches blank cells').minItems(1),
        });
    }
    const { filterType, noun, titleNoun, value } = DataTypeSchemas[schemaName];
    const props: Record<string, SchemaBuilder> = {
        filterType: s.literal(filterType, `Filter type identifier for ${noun} column filters`),
        colId: s.enum(group.colIds, `Column identifier for the ${noun} column to filter`),
        type: s.enum(group.operatorKeys, `${titleNoun} filter operation type`),
    };
    // Required: the parser rejects a condition short of its operands, and that discards the whole model.
    const numOperands = OPERAND_COUNT[group.operands];
    if (numOperands > 0) {
        props.filter = value().nullable();
    }
    if (numOperands > 1) {
        props.filterTo = value().nullable();
    }
    return s.object(props);
}
