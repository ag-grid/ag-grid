import { ASTNode, ErrorNode, ValueNode } from './expressionAST';
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
        return this.tokens[this.i++];
    }

    match(type: TokenType, key?: string) {
        const token = this.peek();
        return token && token.type === type && (!key || token.key === key);
    }

    expect(type: TokenType, key?: string): ExpressionToken | null {
        const token = this.peek();
        if (this.match(type, key)) return this.consume();
        return null;
    }

    eof() {
        return this.i >= this.tokens.length;
    }
}
export class AdvancedFilterExpressionParser {
    parseExpression(cursor: TokenCursor): ASTNode {
        let left = this.parseTerm(cursor);

        while (cursor.match('OPERATOR')) {
            const op = cursor.consume();
            const right = this.parseTerm(cursor);
            left = {
                type: 'LogicalExpression',
                operator: op.key as 'AND' | 'OR',
                left,
                right,
            };
        }

        return left;
    }

    parseTerm(cursor: TokenCursor): ASTNode {
        if (cursor.match('OPERATOR', 'NOT')) {
            cursor.consume();
            return { type: 'NotExpression', operand: this.parseTerm(cursor) };
        }

        if (cursor.match('LPAREN')) {
            cursor.consume();
            const expr = this.parseExpression(cursor);
            cursor.expect('RPAREN'); // optional: error if not present
            return { type: 'Group', expression: expr };
        }

        return this.parseComparison(cursor);
    }

    parseComparison(cursor: TokenCursor): ASTNode {
        const fieldToken = cursor.expect('IDENTIFIER');
        if (!fieldToken) return { type: 'Error', message: 'Expected column' };

        const operatorToken = cursor.expect('COMPARATOR');
        if (!operatorToken) return { type: 'Error', message: 'Expected comparator' };

        if (operatorToken.key === 'between') {
            const min = this.parseValue(cursor);
            const and = cursor.expect('OPERATOR', 'AND');
            const max = this.parseValue(cursor);

            if (!and || !max) {
                return { type: 'Error', message: 'Expected BETWEEN x AND y' };
            }

            return {
                type: 'Between',
                field: fieldToken.value,
                min,
                max,
            };
        }

        const value = this.parseValue(cursor);
        if (!value) return { type: 'Error', message: 'Expected value after operator' };

        return {
            type: 'Comparison',
            field: fieldToken.value,
            operator: operatorToken.key!,
            value,
        };
    }

    parseValue(cursor: TokenCursor): ValueNode {
        const token = cursor.peek();
        if (token && ['STRING', 'NUMBER', 'BOOLEAN'].includes(token.type)) {
            cursor.consume();
            return { type: 'Value', value: token.value };
        }

        return { type: 'Value', value: '?' }; // or return `null` to trigger an error
    }
}

const betweenParser: ComparatorParser = ({ cursor, field, operator, parseValue }) => {
    const min = parseValue(cursor);
    const and = cursor.expect('OPERATOR', 'AND');
    const max = parseValue(cursor);

    if (!min || !and || !max) {
        return {
            type: 'Error',
            message: 'Expected BETWEEN x AND y',
            token: operator,
        };
    }

    return {
        type: 'Between',
        field: field.value,
        min,
        max,
    };
};
