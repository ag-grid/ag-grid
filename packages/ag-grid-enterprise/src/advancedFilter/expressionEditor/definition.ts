import { TokenCursor } from './cursor';
import { ExpressionDataTypeMap, ModelNode, ParsedExpression } from './model';
import { ParserContext, ParserDefinition } from './parser';

export abstract class ExpressionDefinition<TNode extends ModelNode> implements ParserDefinition<TNode> {
    abstract readonly type: 'operator' | 'value';
    abstract readonly precedence: number;
    abstract readonly fixity?: 'prefix' | 'infix' | 'postfix';
    abstract readonly associativity?: 'left' | 'right';

    constructor() {}

    get canStartExpression(): boolean {
        return this.fixity === 'prefix' || this.fixity === null;
    }

    get requiresLeftOperand(): boolean {
        return this.fixity === 'infix' || this.fixity === 'postfix';
    }

    get requiresRightOperand(): boolean {
        return this.fixity === 'prefix' || this.fixity === 'infix';
    }

    shouldApply(minPrecedence: number): boolean {
        if (this.fixity !== 'infix') return false;
        return this.associativity === 'left' ? this.precedence >= minPrecedence : this.precedence > minPrecedence;
    }

    abstract parseFromCursor(
        cursor: TokenCursor,
        context: ParserContext,
        left: ParsedExpression<ModelNode<keyof ExpressionDataTypeMap>>
    ): ParsedExpression<TNode>;
}

export abstract class ValueExpressionDefinition<TNode extends ModelNode> extends ExpressionDefinition<TNode> {
    type = 'value' as const;
    precedence = 0;
    override get canStartExpression() {
        return true;
    }
}

export abstract class OperatorExpressionDefinition<TNode extends ModelNode> extends ExpressionDefinition<TNode> {
    type = 'operator' as const;
}

export abstract class InfixExpressionDefinition<TNode extends ModelNode> extends OperatorExpressionDefinition<TNode> {
    fixity = 'infix' as const;
    associativity: 'left' | 'right';
}

export abstract class PostfixExpressionDefinition<TNode extends ModelNode> extends OperatorExpressionDefinition<TNode> {
    fixity = 'postfix' as const;
}
