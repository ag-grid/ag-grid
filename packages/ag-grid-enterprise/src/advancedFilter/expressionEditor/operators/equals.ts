import { TokenCursor } from '../expressionParser';
import { TokenType } from '../expressionTypes';

type ExpressionDataType = number | string | Date | boolean;

type OperandTypes = {
    string: string;
    number: number;
    date: Date;
    boolean: boolean;
};

type ASTNode = {
    type: string;
    key: string;
    datatype: keyof OperandTypes;
};

type Column = {
    datatype: keyof OperandTypes;
    colId: string;
};

type OperandValue<TDataType extends ExpressionDataType> = Column | TDataType;

export type ParserHelpers = {
    parseOperand: (cursor: TokenCursor) => ASTNode;
};

type ExpressionDef<TNode extends ASTNode> = {
    tokenType: TokenType;
    key: string;
    parse: (cursor: TokenCursor, helpers: ParserHelpers) => TNode;
    suggest: (position: number, helpers: ParserHelpers) => string[];
    render: () => string;
};

type ValidOperandTypes = Pick<OperandTypes, 'string' | 'number' | 'date' | 'boolean'>;
export type EqualsNode = ASTNode &
    {
        [K in keyof ValidOperandTypes]: {
            datatype: K;
            values: [OperandValue<ValidOperandTypes[K]>, OperandValue<ValidOperandTypes[K]>];
        };
    }[keyof ValidOperandTypes];

export const EqualsOperator: ExpressionDef<EqualsNode> = {
    tokenType: 'OPERATOR',
    key: 'EqualsOperator',
    parse(cursor, helpers) {
        const left = helpers.parseOperand(cursor);
        cursor.expect('OPERATOR', 'EqualsOperator');
        const right = helpers.parseOperand(cursor);

        const node: ASTNode = {
            type: this.tokenType,
            key: this.key,
            datatype: 'boolean',
        };

        if (!['string', 'number', 'date', 'boolean'].includes(left.datatype)) {
            // Set errors
        }
        if (left.datatype !== right.datatype) {
            // Set errors
        }
    },
};
