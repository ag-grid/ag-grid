import { AdvancedFilterModel } from 'ag-grid-community';

import { SyntaxGrammarDefinition, SyntaxParselet } from '../../syntaxParser/syntaxGrammar';
import { AdvancedFilterContext, AdvancedFilterNode, ColumnNode } from './advancedFilterGrammar';

export const createGroupParser = (): SyntaxGrammarDefinition<
    AdvancedFilterNode,
    AdvancedFilterModel,
    AdvancedFilterContext
> => {
    const parselet: SyntaxParselet<AdvancedFilterNode, AdvancedFilterModel, AdvancedFilterContext> = {
        isLeading: true,
        expectsLeft: true,
        shouldParseAt: () => true,
        parse: (context) => {
            const tokens = [];
            const errors = [];
            let model;

            const opening = context.expectToken('GROUP_START', 'GroupNode');

            if (!opening) {
                let invalid = context.consumeToken();
                return context.parseRecovery({
                    errors: [{ message: 'Expected an opening bracket', range: invalid.range }],
                    tokens: [],
                });
            }

            tokens.push(opening);

            const group = context.parseNext();

            if (!group.isValid) {
                errors.push(...group.errors);
            } else if (group.model.type === 'value' || group.model.type === 'column') {
                errors.push({ message: 'Expected an expression', range: context.getEncompassingRange(group.tokens) });
            } else {
                model = group.model;
            }
            tokens.push(...group.tokens);

            const closing = context.expectToken('GROUP_END', 'GroupNode');

            if (!closing) {
                if (context.endOfTokens()) {
                    errors.push({ message: 'Group not closed', range: context.peekToken().range });
                } else {
                    let invalid = context.consumeToken();
                    return context.parseRecovery({
                        errors: [{ message: 'Expected a closing bracket', range: invalid.range }],
                        tokens: [],
                    });
                }
            } else {
                tokens.push(closing);
            }

            if (errors.length > 0 || !model) {
                return {
                    isValid: false,
                    errors,
                    tokens,
                };
            }

            return {
                isValid: true,
                tokens,
                model,
            };
        },
    };

    return {
        key: 'GroupNode',
        patterns: [
            {
                type: 'string',
                category: 'GROUP_START',
                key: 'GroupNode',
                label: '(',
            },
            {
                type: 'string',
                category: 'GROUP_END',
                key: 'GroupNode',
                label: ')',
            },
        ],
        parselet,
    };
};
