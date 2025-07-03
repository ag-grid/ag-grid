import { SyntaxGrammarDefinition } from '../../syntaxParser/syntaxGrammar';
import { AdvancedFilterContext, AdvancedFilterNode } from './advancedFilterGrammar';

type GroupGrammar = SyntaxGrammarDefinition<AdvancedFilterNode, AdvancedFilterNode, AdvancedFilterContext>;

const parselet: GroupGrammar['parselet'] = {
    type: 'operand',
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

export const createGroupParser = (): GroupGrammar => {
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
