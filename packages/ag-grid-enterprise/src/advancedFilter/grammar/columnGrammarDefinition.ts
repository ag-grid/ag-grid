import { BaseCellDataType } from 'ag-grid-community';

import { SyntaxGrammarDefinition, SyntaxParselet } from '../../syntaxParser/syntaxGrammar';
import { AdvancedFilterNode, ColumnNode } from './advancedFilterGrammar';

export const createColumnParser = (
    getColumnIdByName: (name: string) => { colId: string; dataType: BaseCellDataType } | undefined
): SyntaxGrammarDefinition<AdvancedFilterNode, ColumnNode> => {
    const parselet: SyntaxParselet<AdvancedFilterNode, ColumnNode> = {
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

            const colDef = getColumnIdByName(colName);

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
