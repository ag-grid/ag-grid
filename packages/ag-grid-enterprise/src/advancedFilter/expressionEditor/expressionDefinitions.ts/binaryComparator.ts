import { InferCellDataType } from 'packages/ag-grid-community/src/entities/dataType';

import { BaseCellDataType, IRowNode } from 'ag-grid-community';

import {
    ComparatorNode,
    DataTypedNode,
    ExpressionNode,
    OperandNode,
    OperatorErrorNode,
    Valid,
    isValidDatatype,
} from '../ast';
import { OperatorDefinition, ParserPrecedence } from '../definition';

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

export const createEqualsParser = () =>
    createBinaryComparatorParser({
        key: 'EqualsComparator',
        associativity: 'left',
        precedence: ParserPrecedence.EQUALITY,
        token: {
            key: 'EqualsToken',
            label: 'equals',
            aliases: ['=', '=='],
        },
        filters: {
            text: eq,
            boolean: eq,
            number: eq,
            date: (a, b) => eq(parseDate(a), parseDate(b)),
            dateString: (a, b) => eq(parseDate(a), parseDate(b)),
            dateTime: (a, b) => eq(parseDateTime(a), parseDateTime(b)),
            dateTimeString: (a, b) => eq(parseDateTime(a), parseDateTime(b)),
        },
    });

const neq = <T>(a: T | null | undefined, b: T | null | undefined): boolean => {
    return a !== b;
};

export const createNotEqualsParser = () =>
    createBinaryComparatorParser({
        key: 'NotEqualsComparator',
        associativity: 'left',
        precedence: ParserPrecedence.EQUALITY,
        token: {
            key: 'NotEqualsToken',
            label: 'does not equal',
            aliases: ['!=', '!=='],
        },
        filters: {
            text: (a, b) => neq(a, b),
            number: (a, b) => neq(a, b),
            date: (a, b) => neq(parseDate(a), parseDate(b)),
            dateString: (a, b) => neq(parseDate(a), parseDate(b)),
            dateTime: (a, b) => neq(parseDateTime(a), parseDateTime(b)),
            dateTimeString: (a, b) => neq(parseDateTime(a), parseDateTime(b)),
        },
    });

const gt = <T>(a: T | null | undefined, b: T | null | undefined) => {
    return isNonNullish(a) && isNonNullish(b) && a > b;
};

export const createGreaterThanParser = () =>
    createBinaryComparatorParser({
        key: 'GreaterThanComparator',
        associativity: 'left',
        precedence: ParserPrecedence.RELATIONAL,
        token: {
            key: 'GreaterThanToken',
            label: 'greater than',
            aliases: ['>', 'gt'],
        },
        filters: {
            number: (a, b) => gt(a, b),
            date: (a, b) => gt(parseDate(a), parseDate(b)),
            dateString: (a, b) => gt(parseDate(a), parseDate(b)),
            dateTime: (a, b) => gt(parseDateTime(a), parseDateTime(b)),
            dateTimeString: (a, b) => gt(parseDateTime(a), parseDateTime(b)),
        },
    });

const gte = <T>(a: T | null | undefined, b: T | null | undefined) => {
    return eq(a, b) || gt(a, b);
};

export const createGreaterThanOrEqualsParser = () =>
    createBinaryComparatorParser({
        key: 'GreaterThanOrEqualsComparator',
        associativity: 'left',
        precedence: ParserPrecedence.RELATIONAL,
        token: {
            key: 'GreaterThanOrEqualsToken',
            label: 'greater than or equal to',
            aliases: ['>=', 'gte'],
        },
        filters: {
            number: (a, b) => gte(a, b),
            date: (a, b) => gte(parseDate(a), parseDate(b)),
            dateString: (a, b) => gte(parseDate(a), parseDate(b)),
            dateTime: (a, b) => gte(parseDateTime(a), parseDateTime(b)),
            dateTimeString: (a, b) => gte(parseDateTime(a), parseDateTime(b)),
        },
    });

const lt = <T>(a: T | null | undefined, b: T | null | undefined) => {
    return isNonNullish(a) && isNonNullish(b) && a < b;
};

export const createLessThanParser = () =>
    createBinaryComparatorParser({
        key: 'LessThanComparator',
        associativity: 'left',
        precedence: ParserPrecedence.RELATIONAL,
        token: {
            key: 'LessThanToken',
            label: 'less than',
            aliases: ['<', 'lt'],
        },
        filters: {
            number: (a, b) => lt(a, b),
            date: (a, b) => lt(parseDate(a), parseDate(b)),
            dateString: (a, b) => lt(parseDate(a), parseDate(b)),
            dateTime: (a, b) => lt(parseDateTime(a), parseDateTime(b)),
            dateTimeString: (a, b) => lt(parseDateTime(a), parseDateTime(b)),
        },
    });

const lte = <T>(a: T | null | undefined, b: T | null | undefined) => {
    return eq(a, b) || lt(a, b);
};

export const createLessThanOrEqualsParser = () =>
    createBinaryComparatorParser({
        key: 'LessThanOrEqualsComparator',
        associativity: 'left',
        precedence: ParserPrecedence.RELATIONAL,
        token: {
            key: 'LessThanOrEqualsToken',
            label: 'less than or equal to',
            aliases: ['<=', 'lte'],
        },
        filters: {
            number: (a, b) => lte(a, b),
            date: (a, b) => lte(parseDate(a), parseDate(b)),
            dateString: (a, b) => lte(parseDate(a), parseDate(b)),
            dateTime: (a, b) => lte(parseDateTime(a), parseDateTime(b)),
            dateTimeString: (a, b) => lte(parseDateTime(a), parseDateTime(b)),
        },
    });

export const createContainsParser = () =>
    createBinaryComparatorParser({
        key: 'ContainsParser',
        associativity: 'left',
        precedence: ParserPrecedence.RELATIONAL,
        token: {
            key: 'ContainsToken',
            label: 'contains',
            aliases: ['includes'],
        },
        filters: {
            text: (a, b) => isNonNullish(a) && isNonNullish(b) && a.toLowerCase().includes(b.toLowerCase()),
        },
    });

export const createNotContainsParser = () =>
    createBinaryComparatorParser({
        key: 'NotContainsParser',
        precedence: ParserPrecedence.RELATIONAL,
        token: {
            key: 'NotContainsToken',
            label: 'does not contain',
            aliases: ['does not include'],
        },
        filters: {
            text: (a, b) => isNonNullish(a) && isNonNullish(b) && !a.toLowerCase().includes(b.toLowerCase()),
        },
    });

export const createBeginsWithParser = () =>
    createBinaryComparatorParser({
        key: 'BeginsWithParser',
        associativity: 'left',
        precedence: ParserPrecedence.RELATIONAL,
        token: {
            key: 'BeginsWithToken',
            label: 'begins with',
            aliases: ['starts with'],
        },
        filters: {
            text: (a, b) => isNonNullish(a) && isNonNullish(b) && a.toLowerCase().startsWith(b.toLowerCase()),
        },
    });

export const createEndsWithParser = () =>
    createBinaryComparatorParser({
        key: 'EndsWithParser',
        associativity: 'left',
        precedence: ParserPrecedence.RELATIONAL,
        token: {
            key: 'EndsWithToken',
            label: 'ends with',
            aliases: [],
        },
        filters: {
            text: (a, b) => isNonNullish(a) && isNonNullish(b) && a.toLowerCase().endsWith(b.toLowerCase()),
        },
    });

type BinaryParserParams<TDatatype extends BaseCellDataType> = {
    key: string;
    precedence: number;
    associativity?: 'left' | 'right';
    token: {
        key: string;
        label: string;
        aliases: string[];
    };
    filters: {
        [K in TDatatype]: (a: InferCellDataType<K>, b: InferCellDataType<K>) => boolean;
    };
};

type BinaryComparatorNode<TDataType extends BaseCellDataType> = ComparatorNode<
    [Valid<DataTypedNode<TDataType>>, Valid<DataTypedNode<TDataType>>]
>;

const createBinaryComparatorParser =
    <TDatatype extends BaseCellDataType>({
        token,
        filters,
        ...params
    }: BinaryParserParams<TDatatype>): (() => OperatorDefinition<BinaryComparatorNode<TDatatype>>) =>
    () => {
        return {
            type: 'operator',
            fixity: 'infix',
            tokens: [
                {
                    type: 'string',
                    token: 'COMPARATOR',
                    ...token,
                },
            ],
            ...params,
            parse(left, cursor, parser) {
                let op = cursor.expect('OPERATOR', params.key);
                const right = parser.parseExpression(cursor, params.precedence);

                if (!op) {
                    return parser.createNode({
                        type: 'OperatorError',
                        key: 'SyntaxError',
                        datatype: 'unknown',
                        children: [left, right],
                        errors: [{ message: 'Invalid syntax' }],
                    }) as OperatorErrorNode;
                }

                const node = {
                    type: 'Comparator',
                    key: params.key,
                    datatype: 'boolean',
                } as const;

                if (
                    isValidDatatype(left.datatype, Object.keys(filters) as BaseCellDataType[]) &&
                    isValidDatatype(right.datatype, Object.keys(filters) as BaseCellDataType[]) &&
                    left.valid &&
                    right.valid &&
                    left.datatype === right.datatype
                ) {
                    return parser.createNode<'Comparator'>({
                        ...node,
                        parameters: [left, right],
                        children: [left, right],
                    }) as BinaryComparatorNode<TDatatype>;
                }

                if (left.valid && !isValidDatatype(left.datatype, Object.keys(filters) as BaseCellDataType[])) {
                    parser.addError(left, `Data type must be one of: ${Object.keys(filters)}`);
                }

                if (left.valid && right.valid && right.datatype !== left.datatype) {
                    parser.addError(right, `${left.datatype} cannot be equated to ${right.datatype}`);
                }

                return parser.createNode({
                    ...node,
                    valid: false,
                    children: [left, right],
                }) as BinaryComparatorNode<TDatatype>;
            },
            buildFilter(node, context) {
                const [left, right] = node.parameters;

                const leftAccessor = context.getValueAccessor(left);
                const rightAccessor = context.getValueAccessor(right);

                const filterFn = filters[left.datatype];

                if (!filterFn) {
                    throw new Error(`Missing filter function for datatype: ${left.datatype}`);
                }

                return (row: IRowNode) => filterFn(leftAccessor(row), rightAccessor(row));
            },
            suggest() {
                return [];
            },
            render() {
                return '';
            },
        };
    };
