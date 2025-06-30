import { JoinAdvancedFilterModel } from 'ag-grid-community';

import { SyntaxGrammarDefinition, SyntaxParselet } from '../../syntaxParser/syntaxGrammar';
import { AdvancedFilterContext, AdvancedFilterNode } from './advancedFilterGrammar';

export const createAndParser = (): SyntaxGrammarDefinition<
    AdvancedFilterNode,
    JoinAdvancedFilterModel,
    AdvancedFilterContext
> => {
    const parselet: SyntaxParselet<AdvancedFilterNode, JoinAdvancedFilterModel> = {
        isLeading: false,
        expectsLeft: true,
        shouldParseAt: (p) => p < 2,
        parse: (context, left) => {
            const tokens = [];
            const errors = [];
            const conditions: JoinAdvancedFilterModel['conditions'] = [];

            if (!left) {
                return context.parseRecovery();
            }

            if (left.model.type === 'value' || left.model.type === 'column') {
                errors.push({
                    message: 'Expected a logical expression',
                    range: context.getEncompassingRange(left.tokens),
                });
            } else {
                conditions.push(left.model);
            }

            tokens.push(...left.tokens);

            let op = context.expectToken('OPERATOR', 'LogicalAndNode');

            if (!op) {
                const { matches, ...token } = context.consumeToken();
                return context.parseRecovery({
                    errors: [{ message: 'Parser Error', range: token.range }],
                    tokens: [{ ...token, ...matches[0] }],
                });
            }

            tokens.push(op);

            while (!context.endOfTokens()) {
                const operand = context.parseNext(2);

                if (!operand.isValid) {
                    errors.push(...operand.errors);
                } else if (operand.model.type === 'value' || operand.model.type === 'column') {
                    errors.push({
                        message: 'Must be a valid logical expression',
                        range: context.getEncompassingRange(operand.tokens),
                    });
                } else {
                    conditions.push(operand.model);
                }
                tokens.push(...operand.tokens);

                const operator = context.expectToken('OPERATOR', 'LogicalAndNode');
                if (!operator) break;
            }

            if (errors.length > 0) {
                return {
                    isValid: false,
                    errors,
                    tokens,
                };
            }

            return {
                isValid: true,
                model: {
                    filterType: 'join',
                    type: 'AND',
                    conditions,
                },
                tokens,
            };
        },
    };

    return {
        key: 'LogicalAndNode',
        patterns: [
            {
                key: 'LogicalAndNode',
                category: 'OPERATOR',
                type: 'string',
                label: 'AND',
                aliases: ['&&'],
            },
        ],
        parselet,
    };
};

export const createOrParser = (): SyntaxGrammarDefinition<
    AdvancedFilterNode,
    JoinAdvancedFilterModel,
    AdvancedFilterContext
> => {
    const parselet: SyntaxParselet<AdvancedFilterNode, JoinAdvancedFilterModel> = {
        isLeading: false,
        expectsLeft: true,
        shouldParseAt: (p) => p < 3,
        parse: (context, left) => {
            const tokens = [];
            const errors = [];
            const conditions: JoinAdvancedFilterModel['conditions'] = [];

            if (!left) {
                return context.parseRecovery();
            }

            if (left.model.type === 'value' || left.model.type === 'column') {
                errors.push({
                    message: 'Expected a logical expression',
                    range: context.getEncompassingRange(left.tokens),
                });
            } else {
                conditions.push(left.model);
            }

            tokens.push(...left.tokens);

            let op = context.expectToken('OPERATOR', 'LogicalOrNode');

            if (!op) {
                const { matches, ...token } = context.consumeToken();
                return context.parseRecovery({
                    errors: [{ message: 'Parser Error', range: token.range }],
                    tokens: [{ ...token, ...matches[0] }],
                });
            }

            tokens.push(op);

            while (!context.endOfTokens()) {
                const operand = context.parseNext(3);

                if (!operand.isValid) {
                    errors.push(...operand.errors);
                } else if (operand.model.type === 'value' || operand.model.type === 'column') {
                    errors.push({
                        message: 'Must be a valid logical expression',
                        range: context.getEncompassingRange(operand.tokens),
                    });
                } else {
                    conditions.push(operand.model);
                }
                tokens.push(...operand.tokens);

                const operator = context.expectToken('OPERATOR', 'LogicalOrNode');
                if (!operator) break;
            }

            if (errors.length > 0) {
                return {
                    isValid: false,
                    errors,
                    tokens,
                };
            }

            return {
                isValid: true,
                model: {
                    filterType: 'join',
                    type: 'OR',
                    conditions,
                },
                tokens,
            };
        },
    };

    return {
        key: 'LogicalOrNode',
        patterns: [
            {
                key: 'LogicalOrNode',
                category: 'OPERATOR',
                type: 'string',
                label: 'OR',
                aliases: ['||'],
            },
        ],
        parselet,
    };
};
