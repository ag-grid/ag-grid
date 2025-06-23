import {
    ComparatorNode,
    ExpressionNode,
    InferNode,
    OperandNode,
    OperatorErrorNode,
    Valid,
    isValidDatatype,
} from '../ast';
import { TokenCursor } from '../cursor';
import { Parser } from '../parser';
import { LexerTokenMatcher } from '../token';

type ExpressionDef<TType extends ExpressionNode['type'], TNode extends InferNode<TType>, TRow = any> = {
    tokens: LexerTokenMatcher[];
    key: string;
    parse: (cursor: TokenCursor, parser: Parser) => TNode | OperatorErrorNode;
    buildFilter: (node: Extract<TNode, { valid: true }>, context: any) => (row: TRow) => boolean;
    suggest: (position: number, parser: Parser) => string[];
    render: () => string;
};

const validDataTypes = ['number', 'date'] as const;
export type BetweenNode<TDatatype extends (typeof validDataTypes)[number] = (typeof validDataTypes)[number]> =
    ComparatorNode<[Valid<OperandNode<TDatatype>>, Valid<OperandNode<TDatatype>>, Valid<OperandNode<TDatatype>>]>;

export function createEqualsOperator<TRow = any>(): ExpressionDef<'Comparator', BetweenNode, TRow> {
    return {
        key: 'BetweenComparator',
        tokens: [
            {
                type: 'string',
                token: 'COMPARATOR',
                key: 'BetweenToken',
                label: 'between',
                aliases: ['inbetween'],
            },
            {
                type: 'string',
                token: 'STRUCTURAL',
                key: 'BetweenAndToken',
                label: 'and',
                aliases: [],
            },
        ],
        parse(cursor, parser) {
            const operand = parser.parseOperand(cursor);
            const op = cursor.expect('OPERATOR', 'BetweenToken');
            const min = parser.parseOperand(cursor);
            const and = cursor.expect('STRUCTURAL', 'BetweenAndToken');
            const max = parser.parseOperand(cursor);

            if (!op || !and) {
                return parser.createNode({
                    type: 'OperatorErrorNode',
                    key: 'SyntaxError',
                    datatype: 'unknown',
                    children: [operand, min, max],
                    errors: [{ message: 'Invalid syntax' }],
                }) as OperatorErrorNode;
            }

            const node = {
                type: 'Comparator',
                key: 'EqualsComparator',
                datatype: 'boolean',
            } as const;

            if (
                isValidDatatype(operand.datatype, validDataTypes) &&
                isValidDatatype(min.datatype, validDataTypes) &&
                isValidDatatype(max.datatype, validDataTypes) &&
                operand.valid &&
                min.valid &&
                max.valid &&
                operand.datatype === min.datatype &&
                operand.datatype === max.datatype
            ) {
                return parser.createNode<'Comparator'>({
                    ...node,
                    parameters: [operand, min, max],
                    children: [operand, min, max],
                }) as BetweenNode;
            }

            if (operand.valid) {
                if (!isValidDatatype(operand.datatype, ['string', 'date', 'number'])) {
                    parser.addError(operand, `Data type must be either number or date.`);
                } else if (min.datatype !== operand.datatype) {
                    parser.addError(min, `Must match operand`);
                } else if (max.datatype !== operand.datatype) {
                    parser.addError(min, `Must match operand`);
                }
            }

            return parser.createNode({
                ...node,
                valid: false,
                children: [operand, min, max],
            }) as BetweenNode;
        },
        buildFilter({ parameters }, context) {
            const [operand, min, max] = parameters;

            const getOperand = operand.type === 'Identifier' ? context.getAccessor(operand) : () => operand.value;
            const getMin = min.type === 'Identifier' ? context.getAccessor(min) : () => min.value;
            const getMax = max.type === 'Identifier' ? context.getAccessor(max) : () => max.value;

            return (row: TRow) => getOperand(row) >= getMin(row) && getOperand(row) <= getMax(row);
        },
        suggest() {
            return [];
        },
        render() {
            return '';
        },
    };
}
