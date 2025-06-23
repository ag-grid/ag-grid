import {
    ComparatorNode,
    ExpressionNode,
    InferNode,
    OperandErrorNode,
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

const validDataTypes = ['string', 'number', 'date'] as const;
export type InSetNode<TDatatype extends (typeof validDataTypes)[number] = (typeof validDataTypes)[number]> =
    ComparatorNode<Valid<OperandNode<TDatatype>>[]>;

export function createInSetOperator<TRow = any>(): ExpressionDef<'Comparator', InSetNode, TRow> {
    return {
        key: 'EqualsComparator',
        tokens: [
            {
                type: 'string',
                token: 'COMPARATOR',
                key: 'InOperator',
                label: 'in',
                aliases: ['within'],
            },
        ],
        parse(cursor, parser) {
            const operand = parser.parseOperand(cursor);
            const op = cursor.expect('OPERATOR', 'InOperator');
            const arrayStart = cursor.expect('ARRAY_START');

            const values = [];
            let invalid = false;
            while (!cursor.match('ARRAY_END')) {
                values.push(parser.parseOperand(cursor));

                if (cursor.match('ARRAY_SEPARATOR')) {
                    cursor.consume();
                } else if (cursor.match('ARRAY_END')) {
                    break;
                } else {
                    invalid = true;
                    cursor.consume();
                }
            }

            const arrayEnd = cursor.expect('ARRAY_END');

            if (invalid || !op || !arrayEnd || !arrayStart) {
                return parser.createNode({
                    type: 'OperatorErrorNode',
                    key: 'SyntaxError',
                    datatype: 'unknown',
                    children: [operand, ...values],
                    errors: [{ message: 'Invalid syntax' }],
                }) as OperatorErrorNode;
            }

            const node = {
                type: 'Comparator',
                key: 'EqualsComparator',
                datatype: 'boolean',
            } as const;

            if (
                isValidDatatype(left.datatype, validDataTypes) &&
                isValidDatatype(right.datatype, validDataTypes) &&
                left.valid &&
                right.valid &&
                left.datatype === right.datatype
            ) {
                return parser.createNode<'Comparator'>({
                    ...node,
                    parameters: [left, right],
                    children: [left, right],
                }) as EqualsNode;
            }

            if (left.valid && !isValidDatatype(left.datatype, ['string', 'date', 'number'])) {
                parser.addError(left, `Data type must be either string, number or date.`);
            }

            if (left.valid && right.valid && right.datatype !== left.datatype) {
                parser.addError(right, `${left.datatype} cannot be equated to ${right.datatype}`);
            }

            return parser.createNode({
                ...node,
                valid: false,
                children: [left, right],
            }) as EqualsNode;
        },
        buildFilter({ parameters }, context) {
            const [left, right] = parameters;

            const getLeft = left.type === 'Identifier' ? context.getAccessor(left) : () => left.value;
            const getRight = right.type === 'Identifier' ? context.getAccessor(right) : () => right.value;

            return (row: TRow) => getLeft(row) === getRight(row);
        },
        suggest() {
            return [];
        },
        render() {
            return '';
        },
    };
}
