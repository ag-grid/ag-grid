import { AdvancedFilterGrammarDefinition, ColumnNode } from './advancedFilterGrammar';

type ColumnGrammar = AdvancedFilterGrammarDefinition<ColumnNode>;

function escapeRegex(char: string) {
    return char.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

const columnParselet: ColumnGrammar['parselet'] = {
    type: 'operand',
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

export type ColumnGrammarConfig = {
    delimiters: [string, string];
};

export const createColumnGrammar = (
    { delimiters }: ColumnGrammarConfig = { delimiters: ['[', ']'] }
): ColumnGrammar => {
    const start = escapeRegex(delimiters[0]);
    const end = escapeRegex(delimiters[1]);

    const pattern = `^${start}([^${end}\\n]*)${end}?`;

    return {
        key: 'ColumnNode',
        patterns: [
            {
                type: 'regex',
                category: 'IDENTIFIER',
                key: 'ColumnNode',
                regex: new RegExp(pattern),
            },
        ],
        parselet: columnParselet,
    };
};
