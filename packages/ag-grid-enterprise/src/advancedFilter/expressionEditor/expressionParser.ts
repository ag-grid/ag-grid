import { ASTNode, ErrorNode, LogicalExpression, OperandNode, ValueNode } from './expressionAST';
import { ExpressionToken, TokenType } from './expressionTypes';

interface ParserContext {
    cursor: TokenCursor;
    field: ExpressionToken;
    operator: ExpressionToken;
    parseValue: (cursor: TokenCursor) => ValueNode;
}
type ComparatorParser = (ctx: ParserContext) => ASTNode | ErrorNode;
export class TokenCursor {
    private i = 0;

    constructor(private tokens: ExpressionToken[]) {}

    peek(n = 0) {
        return this.tokens[this.i + n];
    }

    consume() {
        const token = this.tokens[this.i++];
        return token;
    }

    match(type: TokenType, key?: string) {
        const token = this.peek();
        return token && token.type === type && (!key || token.key === key);
    }

    expect(type: TokenType, key?: string): ExpressionToken | null {
        if (this.match(type, key)) return this.consume();
        return null;
    }

    eof() {
        return this.i >= this.tokens.length;
    }
}
export class AdvancedFilterExpressionParser {
    parseExpression(cursor: TokenCursor): ASTNode {
        return this.parseLogical(cursor);
    }

    parseLogical(cursor: TokenCursor): ASTNode {
        let current = this.parseTerm(cursor);
        let operator: 'AND' | 'OR' | undefined;
        const operands: ASTNode[] = [current];

        while (cursor.match('OPERATOR')) {
            const op = cursor.peek().key.toUpperCase();
            if (op !== 'AND' && op !== 'OR') break;
            operator = op;

            cursor.consume(); // skip AND/OR
            const next = this.parseTerm(cursor);

            if (!next) break;
            operands.push(next);
        }

        if (!operator || operands.length === 1) {
            return current;
        }

        return {
            type: 'LogicalExpression',
            operator,
            operands,
        };
    }

    parseTerm(cursor: TokenCursor): ASTNode {
        if (cursor.match('OPERATOR', 'NOT')) {
            cursor.consume();
            return { type: 'NotExpression', operand: this.parseTerm(cursor) };
        }

        if (cursor.match('LPAREN')) {
            cursor.consume();
            const node = this.parseExpression(cursor);
            cursor.expect('RPAREN'); // optional: error if not present
            return { type: 'ExpressionGroup', node };
        }

        return this.parseComparison(cursor);
    }

    parseComparison(cursor: TokenCursor): ASTNode {
        const operand = this.parseOperand(cursor);

        const operator = cursor.expect('COMPARATOR');
        if (!operator) return { type: 'ErrorNode', message: 'Expected comparator' };

        if (operator.key === 'between') {
            const min = this.parseOperand(cursor);
            const and = cursor.expect('OPERATOR', 'AND');
            const max = this.parseOperand(cursor);

            if (!and || !max) {
                return { type: 'ErrorNode', message: 'Expected BETWEEN x AND y' };
            }

            return {
                type: 'BetweenExpression',
                operand,
                min,
                max,
            };
        }

        if (operator.key === 'in' || operator.key === 'notIn') {
            const start = cursor.expect('LPAREN');
            if (!start) return { type: 'ErrorNode', message: 'Expected parens' };

            const options: OperandNode[] = [];

            while (!cursor.expect('RPAREN')) {
                const value = this.parseOperand(cursor);
                options.push(value);

                const delimiter = cursor.expect('COMMA');
                if (!delimiter) {
                    options.push({ type: 'ErrorNode', message: 'Expected comma' });
                }
            }

            return {
                type: 'InExpression',
                operand,
                options,
            };
        }

        const right = this.parseOperand(cursor);
        if (!right) return { type: 'ErrorNode', message: 'Expected value after operator' };

        return {
            type: 'ComparisonExpression',
            left: operand,
            operator: operator.key!,
            right,
        };
    }

    parseOperand(cursor: TokenCursor): OperandNode {
        const token = cursor.consume();

        let operand: OperandNode;

        switch (token?.type) {
            case 'IDENTIFIER':
                operand = { type: 'Column', colName: token.value };
                break;
            case 'STRING':
                operand = { type: 'StringValue', value: token.value.slice(1, -1) };
                break;
            case 'NUMBER':
                operand = { type: 'NumberValue', value: Number(token.value) };
                break;
            case 'BOOLEAN':
                operand = { type: 'BooleanValue', value: token.value.toLowerCase() === 'true' };
                break;
            default:
                operand = { type: 'ErrorNode', message: 'Incorrect Syntax' };
                break;
        }
        return operand;
    }
}
