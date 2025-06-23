import { ExpressionNode, InferNode, NodeParameters, OperandNode } from './ast';
import { TokenCursor } from './cursor';
import { ExpressionDefinition, ParserContext } from './definition';
import { Token, TokenMatch } from './token';

export class Parser implements ParserContext {
    getExpressionDefinition(matches: TokenMatch[]): ExpressionDefinition | undefined {
        return {} as ExpressionDefinition;
    }

    parseExpression(cursor: TokenCursor, minPrecedence = 0): ExpressionNode {
        let token = cursor.peek();
        const definition = this.getExpressionDefinition(token.matches);

        let left: ExpressionNode;
        if (!definition || (definition.type === 'operator' && definition.fixity !== 'prefix')) {
            return this.createNode({
                type: 'OperandError',
                key: 'UnknownOperand',
                datatype: 'unknown',
            });
        } else (definition.type === 'operand' || definition.fixity === 'prefix') {
            left = definition.parse(cursor, this);
        }

        while (true) {
            const opToken = cursor.peek();
            const op = this.getExpressionDefinition(opToken.matches);

            if (!op || op.type === 'operand' || op.fixity !== 'infix') break;

            const shouldContinue =
                op.associativity === 'left' ? op.precedence >= minPrecedence : op.precedence > minPrecedence;

            if (!shouldContinue) break;

            left = op.parse(left, cursor, this); // consumes internally
        }

        

        return left;
    }

    // parseLogical(cursor: TokenCursor): LogicalNode {
    //     let current = this.parseTerm(cursor);
    //     let operator: 'AND' | 'OR' | undefined;
    //     const operands: ExpressionNode[] = [current];

    //     while (cursor.match('OPERATOR')) {
    //         const op = cursor.peek().key.toUpperCase();
    //         if (op !== 'AND' && op !== 'OR') break;
    //         operator = op;

    //         cursor.consume(); // skip AND/OR
    //         const next = this.parseTerm(cursor);

    //         if (!next) break;
    //         operands.push(next);
    //     }

    //     if (!operator || operands.length === 1) {
    //         return current;
    //     }

    //     return {
    //         type: 'LogicalExpression',
    //         operator,
    //         operands,
    //     };
    // }

    // parseTerm(cursor: TokenCursor): ASTNode {
    //     if (cursor.match('OPERATOR', 'NOT')) {
    //         cursor.consume();
    //         return { type: 'NotExpression', operand: this.parseTerm(cursor) };
    //     }

    //     if (cursor.match('LPAREN')) {
    //         cursor.consume();
    //         const node = this.parseExpression(cursor);
    //         cursor.expect('RPAREN'); // optional: error if not present
    //         return { type: 'ExpressionGroup', node };
    //     }

    //     return this.parseComparison(cursor);
    // }

    // parseComparison(cursor: TokenCursor): ASTNode {
    //     const operand = this.parseOperand(cursor);

    //     const operator = cursor.expect('COMPARATOR');
    //     if (!operator) return { type: 'ErrorNode', message: 'Expected comparator' };

    //     if (operator.key === 'between') {
    //         const min = this.parseOperand(cursor);
    //         const and = cursor.expect('OPERATOR', 'AND');
    //         const max = this.parseOperand(cursor);

    //         if (!and || !max) {
    //             return { type: 'ErrorNode', message: 'Expected BETWEEN x AND y' };
    //         }

    //         return {
    //             type: 'BetweenExpression',
    //             operand,
    //             min,
    //             max,
    //         };
    //     }

    //     if (operator.key === 'in' || operator.key === 'notIn') {
    //         const start = cursor.expect('LPAREN');
    //         if (!start) return { type: 'ErrorNode', message: 'Expected parens' };

    //         const options: OperandNode[] = [];

    //         while (!cursor.expect('RPAREN')) {
    //             const value = this.parseOperand(cursor);
    //             options.push(value);

    //             const delimiter = cursor.expect('COMMA');
    //             if (!delimiter) {
    //                 options.push({ type: 'ErrorNode', message: 'Expected comma' });
    //             }
    //         }

    //         return {
    //             type: 'InExpression',
    //             operand,
    //             options,
    //         };
    //     }

    //     const right = this.parseOperand(cursor);
    //     if (!right) return { type: 'ErrorNode', message: 'Expected value after operator' };

    //     return {
    //         type: 'ComparisonExpression',
    //         left: operand,
    //         operator: operator.key!,
    //         right,
    //     };
    // }

    parseOperand(cursor: TokenCursor): OperandNode {
        const token = cursor.consume();

        let operand: OperandNode = {};

        // switch (token?.type) {
        //     case 'IDENTIFIER':
        //         operand = { type: 'Column', colName: token.value };
        //         break;
        //     case 'STRING':
        //         operand = { type: 'StringValue', value: token.value.slice(1, -1) };
        //         break;
        //     case 'NUMBER':
        //         operand = { type: 'NumberValue', value: Number(token.value) };
        //         break;
        //     case 'BOOLEAN':
        //         operand = { type: 'BooleanValue', value: token.value.toLowerCase() === 'true' };
        //         break;
        //     default:
        //         operand = { type: 'ErrorNode', message: 'Incorrect Syntax' };
        //         break;
        // }
        return operand;
    }

    parseUnknown(cursor: TokenCursor): ExpressionNode {
        return {} as ExpressionNode;
    }

    createNode<TType extends ExpressionNode['type']>(params: NodeParameters<TType>): InferNode<TType> {
        let valid = params.valid;
        let errors = params.errors ?? [];

        const withChildren = 'children' in params;

        const range =
            'range' in params && params.range
                ? params.range
                : withChildren
                  ? {
                        start: params.children?.[0]?.range.start ?? 0,
                        end: params.children?.[params.children.length - 1]?.range.end ?? 0,
                    }
                  : { start: 0, end: 0 };

        const resolvedValid = valid ?? (withChildren ? params.children!.every((c) => c.valid) : true);

        const validation = resolvedValid
            ? {
                  valid: true as const,
                  errors: undefined,
              }
            : {
                  valid: false as const,
                  errors,
              };

        return {
            ...params,
            ...validation,
            range,
        } as InferNode<TType>;
    }

    addError(node: ExpressionNode, message: string) {
        if (node.valid) {
            node = {
                ...node,
                valid: false,
                errors: [],
            };
        }

        node.errors.push({ message });
    }

    getColumn(name: string) {
        return undefined;
    }
}
