import { SyntaxGrammarDefinition, SyntaxParselet } from '../../syntaxParser/syntaxGrammar';
import { AdvancedFilterContext, AdvancedFilterNode, ColumnNode } from './advancedFilterGrammar';

export const createColumnParser = (): SyntaxGrammarDefinition<
    AdvancedFilterNode,
    ColumnNode,
    AdvancedFilterContext
> => {
    const parselet: SyntaxParselet<AdvancedFilterNode, ColumnNode, AdvancedFilterContext> = {
        isLeading: true,
        expectsLeft: true,
        shouldParseAt: () => true,
        parse: (context) => {
            const token = context.expectToken('IDENTIFIER', 'ColumnNode');

            if (!token) {
                let invalid = context.consumeToken();
                return context.parseRecovery({
                    errors: [{ message: 'Expected a column definition', range: invalid.range }],
                    tokens: [],
                });
            }

            const colName = token.value.trim().slice(1, -1);

            const colDef = context.context.getColIdFromName(colName);

            if (!colDef) {
                return context.parseRecovery({
                    errors: [{ message: 'Unknown Column Name', range: token.range }],
                    tokens: [],
                });
            }

            return {
                isValid: true,
                tokens: [token],
                model: {
                    type: 'column',
                    ...colDef,
                },
            };
        },
    };

    return {
        key: 'ColumnNode',
        patterns: [
            {
                type: 'regex',
                category: 'IDENTIFIER',
                key: 'ColumnNode',
                regex: /^\[([^\]\n]*)\]?/,
            },
        ],
        parselet,
    };
};
