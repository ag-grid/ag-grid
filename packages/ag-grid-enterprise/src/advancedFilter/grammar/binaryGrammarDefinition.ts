import { ScalarAdvancedFilterModelType } from 'packages/ag-grid-community/dist/types/src/main';

import {
    BaseCellDataType,
    BooleanAdvancedFilterModel,
    ColumnAdvancedFilterModel,
    DateAdvancedFilterModel,
    NumberAdvancedFilterModel,
    ObjectAdvancedFilterModel,
    TextAdvancedFilterModel,
    TextAdvancedFilterModelType,
} from 'ag-grid-community';

import { SyntaxGrammarDefinition, SyntaxParselet } from '../../syntaxParser/syntaxGrammar';
import { AdvancedFilterNode } from './advancedFilterGrammar';

const isNonNullish = <T>(a: T | null | undefined): a is T => {
    return a !== null && a !== undefined;
};

const parseDateTime = (raw: string | Date | null | undefined): Date | undefined => {
    let date;
    if (isNonNullish(raw)) {
        date = new Date(raw);
    }
    return date;
};

const parseDate = (raw: string | Date | null | undefined): Date | undefined => {
    let date = parseDateTime(raw);

    if (date) {
        date.setHours(0, 0, 0, 0);
    }

    return date;
};

const eq = <T>(a: T | null | undefined, b: T | null | undefined): boolean => {
    return a === b;
};

const SCALAR_TYPES: BaseCellDataType[] = ['number', 'object', 'date', 'dateTime', 'dateString', 'dateTimeString'];
const TEXT_TYPES: BaseCellDataType[] = ['text', 'object'];
const ALL_TYPES: BaseCellDataType[] = [...SCALAR_TYPES, ...TEXT_TYPES];

export const createEqualsParser = () =>
    createBinaryComparatorParser({
        key: 'EqualsComparator',
        precedence: 3,
        type: 'equals',
        validDataTypes: ALL_TYPES,
        token: {
            key: 'EqualsToken',
            label: 'equals',
            aliases: ['=', '=='],
        },
    });

// const neq = <T>(a: T | null | undefined, b: T | null | undefined): boolean => {
//     return a !== b;
// };

export const createNotEqualsParser = () =>
    createBinaryComparatorParser({
        key: 'NotEqualsComparator',
        precedence: 3,
        type: 'notEqual',
        validDataTypes: ALL_TYPES,
        token: {
            key: 'NotEqualsToken',
            label: 'does not equal',
            aliases: ['!=', '!=='],
        },
    });

// const gt = <T>(a: T | null | undefined, b: T | null | undefined) => {
//     return isNonNullish(a) && isNonNullish(b) && a > b;
// };

export const createGreaterThanParser = () =>
    createBinaryComparatorParser({
        key: 'GreaterThanComparator',
        precedence: 3,
        type: 'greaterThan',
        validDataTypes: SCALAR_TYPES,
        token: {
            key: 'GreaterThanToken',
            label: 'greater than',
            aliases: ['>', 'gt'],
        },
    });

// const gte = <T>(a: T | null | undefined, b: T | null | undefined) => {
//     return eq(a, b) || gt(a, b);
// };

export const createGreaterThanOrEqualsParser = () =>
    createBinaryComparatorParser({
        key: 'GreaterThanOrEqualsComparator',
        precedence: 3,
        type: 'greaterThanOrEqual',
        validDataTypes: SCALAR_TYPES,
        token: {
            key: 'GreaterThanOrEqualsToken',
            label: 'greater than or equal to',
            aliases: ['>=', 'gte'],
        },
    });

// const lt = <T>(a: T | null | undefined, b: T | null | undefined) => {
//     return isNonNullish(a) && isNonNullish(b) && a < b;
// };

export const createLessThanParser = () =>
    createBinaryComparatorParser({
        key: 'LessThanComparator',
        precedence: 3,
        type: 'lessThan',
        validDataTypes: SCALAR_TYPES,
        token: {
            key: 'LessThanToken',
            label: 'less than',
            aliases: ['<', 'lt'],
        },
    });

// const lte = <T>(a: T | null | undefined, b: T | null | undefined) => {
//     return eq(a, b) || lt(a, b);
// };

export const createLessThanOrEqualsParser = () =>
    createBinaryComparatorParser({
        key: 'LessThanOrEqualsComparator',
        precedence: 3,
        type: 'lessThanOrEqual',
        validDataTypes: SCALAR_TYPES,
        token: {
            key: 'LessThanOrEqualsToken',
            label: 'less than or equal to',
            aliases: ['<=', 'lte'],
        },
    });

export const createContainsParser = () =>
    createBinaryComparatorParser({
        key: 'ContainsParser',
        precedence: 3,
        type: 'contains',
        validDataTypes: TEXT_TYPES,
        token: {
            key: 'ContainsToken',
            label: 'contains',
            aliases: ['includes'],
        },
    });

export const createNotContainsParser = () =>
    createBinaryComparatorParser({
        key: 'NotContainsParser',
        precedence: 3,
        type: 'notContains',
        validDataTypes: TEXT_TYPES,
        token: {
            key: 'NotContainsToken',
            label: 'does not contain',
            aliases: ['does not include'],
        },
    });

export const createBeginsWithParser = () =>
    createBinaryComparatorParser({
        key: 'BeginsWithParser',
        precedence: 3,
        type: 'startsWith',
        validDataTypes: TEXT_TYPES,
        token: {
            key: 'BeginsWithToken',
            label: 'begins with',
            aliases: ['starts with'],
        },
    });

export const createEndsWithParser = () =>
    createBinaryComparatorParser({
        key: 'EndsWithParser',
        precedence: 3,
        type: 'endsWith',
        validDataTypes: TEXT_TYPES,
        token: {
            key: 'EndsWithToken',
            label: 'ends with',
            aliases: [],
        },
    });

type BinaryParserParams = {
    key: string;
    precedence: number;
    type: ScalarAdvancedFilterModelType | TextAdvancedFilterModelType;
    validDataTypes: BaseCellDataType[];
    token: {
        key: string;
        label: string;
        aliases: string[];
    };
};

const createBinaryComparatorParser = ({
    key,
    token,
    precedence,
    type,
    validDataTypes,
}: BinaryParserParams): SyntaxGrammarDefinition<AdvancedFilterNode, AdvancedFilterNode> => {
    const parselet: SyntaxParselet<AdvancedFilterNode, AdvancedFilterNode> = {
        isLeading: false,
        expectsLeft: true,
        shouldParseAt: (p) => p >= precedence,
        parse: (context, column) => {
            if (!column) {
                return context.parseRecovery();
            }

            if (column.model.type !== 'column') {
                return context.parseRecovery({
                    errors: [{ message: 'Expected a column', range: context.getEncompassingRange(column.tokens) }],
                    tokens: column.tokens,
                });
            }

            let op = context.expectToken('COMPARATOR', token.key);

            if (!op) {
                const { matches, ...token } = context.consumeToken();
                return context.parseRecovery({
                    errors: [{ message: 'Parser Error', range: token.range }],
                    tokens: [{ ...token, ...matches[0] }],
                });
            }

            const value = context.parseNext(precedence);

            if (!value.isValid) {
                return {
                    isValid: false,
                    errors: value.errors,
                    tokens: [...column.tokens, op, ...value.tokens],
                };
            }

            if (value.model.type !== 'value') {
                return {
                    isValid: false,
                    errors: [{ message: 'Expected Value', range: context.getEncompassingRange(value.tokens) }],
                    tokens: [...column.tokens, op, ...value.tokens],
                };
            }

            const colType = column.model.dataType;

            if (!validDataTypes.includes(colType)) {
                return {
                    isValid: false,
                    errors: [
                        {
                            message: `Column must be a ${colType} to use this operator`,
                            range: context.getEncompassingRange(column.tokens),
                        },
                    ],
                    tokens: [...column.tokens, op, ...value.tokens],
                };
            }

            const valueType =
                value.model.dataType === 'text' &&
                ['date', 'dateTime', 'dateString', 'dateTimeString'].includes(colType)
                    ? colType
                    : value.model.dataType;

            if (valueType !== colType) {
                return {
                    isValid: false,
                    errors: [
                        {
                            message: `Value must be a ${colType} to use this operator`,
                            range: context.getEncompassingRange(column.tokens),
                        },
                    ],
                    tokens: [...column.tokens, op, ...value.tokens],
                };
            }

            let model: ColumnAdvancedFilterModel | undefined = undefined;
            switch (colType) {
                case 'date':
                case 'dateString':
                case 'dateTime':
                case 'dateTimeString':
                    model = {
                        filterType: colType,
                        colId: column.model.colId,
                        type: type as ScalarAdvancedFilterModelType,
                        filter: value.model.value,
                    } as DateAdvancedFilterModel;
                    break;
                case 'number':
                    model = {
                        filterType: 'number',
                        colId: column.model.colId,
                        type: type as ScalarAdvancedFilterModelType,
                        filter: value.model.value,
                    } as NumberAdvancedFilterModel;
                    break;
                case 'number':
                    model = {
                        filterType: 'boolean',
                        colId: column.model.colId,
                        type: value.model.value ? 'true' : 'false',
                    };
                    break;
                case 'number':
                    model = {
                        filterType: 'object',
                        colId: column.model.colId,
                        type: type as TextAdvancedFilterModelType,
                        filter: value.model.value,
                    } as ObjectAdvancedFilterModel;
                    break;
                case 'number':
                    model = {
                        filterType: 'text',
                        colId: column.model.colId,
                        type: type as TextAdvancedFilterModelType,
                        filter: value.model.value,
                    } as TextAdvancedFilterModel;
                    break;
            }

            if (!model) {
                const tokens = [...column.tokens, op, ...value.tokens];
                return context.parseRecovery({
                    errors: [{ message: 'Parser Error', range: context.getEncompassingRange(tokens) }],
                    tokens,
                });
            }

            return {
                isValid: true,
                model,
                tokens: [...column.tokens, op, ...value.tokens],
            };
        },
    };

    return {
        key,
        patterns: [
            {
                type: 'string',
                category: 'COMPARATOR',
                ...token,
            },
        ],
        parselet,
    };
};
