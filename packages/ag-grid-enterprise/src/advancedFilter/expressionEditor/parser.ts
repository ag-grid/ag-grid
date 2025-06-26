import { IRowNode } from 'ag-grid-community';

import { TokenCursor } from './cursor';
import {
    ExpressionDataType,
    ExpressionDefinition,
    InferReturnType,
    ModelNode,
    ParsedExpression,
    RenderedToken,
} from './model';
import { TokenMatch } from './tokenizer';

export interface ParserDefinition<TNode extends ModelNode> {
    readonly canStartExpression: boolean;
    readonly requiresLeftOperand: boolean;
    readonly requiresRightOperand: boolean;
    shouldApply(minPrecedence: number): boolean;
    parseFromCursor(cursor: TokenCursor, context: ParserContext, left: ParsedExpression): ParsedExpression<TNode>;
}

export interface ParserContext {
    parseFromCursor(cursor: TokenCursor, precedence?: number): ParsedExpression;
    parseFromModel: (node: unknown) => ModelNode;

    getEvaluator<TDataType extends ExpressionDataType>(
        node: ModelNode<TDataType>
    ): (row: IRowNode) => InferReturnType<TDataType>;
    toDisplayTokens: (node: ModelNode) => RenderedToken[];
}
export class ParserService implements ParserContext {
    private definitions: Map<string, ExpressionDefinition> = new Map();

    constructor() {}

    addExpressionDefinition(def: ExpressionDefinition) {
        this.definitions.set(def.key, def);
    }

    addExpressionDefinitions(defs: ExpressionDefinition[]) {
        defs.forEach(this.addExpressionDefinition);
    }

    private getExpressionDefinition(matches: TokenMatch[]): ExpressionDefinition | undefined {
        for (let match of matches) {
            const def = this.definitions.get(match.key);
            if (def) {
                return def;
            }
        }
    }

    parseFromCursor(cursor: TokenCursor, minPrecedence = 0): ParsedExpression {
        let token = cursor.peek();
        const definition = this.getExpressionDefinition(token.matches);

        let left: ParsedExpression;
        if (!definition || (definition.type === 'operator' && definition.fixity !== 'prefix')) {
            return {
                errors: [
                    {
                        message: 'Unknown Operator',
                        range: token.range,
                    },
                ],
                tokens: [],
            };
        } else {
            left = definition.parseFromCursor(cursor, this);
        }

        while (true) {
            const opToken = cursor.peek();
            const op = this.getExpressionDefinition(opToken.matches);

            if (!op || op.type === 'value' || op.fixity !== 'infix') break;

            const shouldContinue =
                op.associativity === 'left' ? op.precedence >= minPrecedence : op.precedence > minPrecedence;

            if (!shouldContinue) break;

            left = op.parseFromCursor(left, cursor, this); // consumes internally
        }

        return left;
    }
}
