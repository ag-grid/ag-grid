import { JoinAdvancedFilterModel } from 'ag-grid-community';

import { SyntaxGrammarDefinition, SyntaxParselet } from '../../syntaxParser/syntaxGrammar';
import { AdvancedFilterNode } from './advancedFilterGrammar';

export const createAndParser = (): SyntaxGrammarDefinition<AdvancedFilterNode, JoinAdvancedFilterModel> => {
    const parselet: SyntaxParselet<AdvancedFilterNode, JoinAdvancedFilterModel> = {
        isLeading: false,
        expectsLeft: true,
        shouldParseAt: (p) => p >= 2,
        parse: (context, left) => {
            if (!left) {
                return context.parseRecovery();
            }

            if (!("dataType" in left.model)) {
                return context.parseRecovery({
                    errors: [{ message: 'Expected a logical expression', range: context.getEncompassingRange(left.tokens) }],
                    tokens: left.tokens,
                });
            }

            let op = context.expectToken("OPERATOR", "AndNode");

            if (!op) {
                const { matches, ...token } = context.consumeToken();
                return context.parseRecovery({
                    errors: [{ message: 'Parser Error', range: token.range }],
                    tokens: [{ ...token, ...matches[0] }],
                });
            }

            const value = context.parseNext(2);

            if (!value.isValid) {
                return {
                    isValid: false,
                    errors: value.errors,
                    tokens: [...column.tokens, op, ...value.tokens],
                };
            }

            if (value.model.type !== 'value') {
                return {
                    isValid: false,
                    errors: [{ message: 'Expected Value', range: context.getEncompassingRange(value.tokens) }],
                    tokens: [...column.tokens, op, ...value.tokens],
                };
            }

            const colType = column.model.dataType;

            if (!validDataTypes.includes(colType)) {
                return {
                    isValid: false,
                    errors: [
                        {
                            message: `Column must be a ${colType} to use this operator`,
                            range: context.getEncompassingRange(column.tokens),
                        },
                    ],
                    tokens: [...column.tokens, op, ...value.tokens],
                };
            };

    return {};
};
