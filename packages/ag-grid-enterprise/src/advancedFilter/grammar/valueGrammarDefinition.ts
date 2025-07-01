import { SyntaxGrammarDefinition, SyntaxParselet } from '../../syntaxParser/syntaxGrammar';
import {
    AdvancedFilterContext,
    AdvancedFilterNode,
    BooleanValueNode,
    NumberValueNode,
    TextValueNode,
} from './advancedFilterGrammar';

export const createStringValueParser = (): SyntaxGrammarDefinition<
    AdvancedFilterNode,
    TextValueNode,
    AdvancedFilterContext
> => {
    const parselet: SyntaxParselet<AdvancedFilterNode, TextValueNode> = {
        type: 'operand',
        parse: (context) => {
            const token = context.expectToken('STRING', 'StringValue');

            if (!token) {
                let invalid = context.consumeToken();
                return context.parseRecovery({
                    errors: [{ message: 'Expected a string value', range: invalid.range }],
                    tokens: [],
                });
            }

            const value = token.value.trim().slice(1, -1);

            return {
                isValid: true,
                tokens: [token],
                model: {
                    type: 'value',
                    dataType: 'text',
                    value,
                },
            };
        },
    };

    return {
        key: 'StringValue',
        patterns: [
            {
                type: 'regex',
                category: 'STRING',
                key: 'StringValue',
                regex: /^"([^"\n]*)"?/,
            },
        ],
        parselet,
    };
};

export const createNumberValueParser = (): SyntaxGrammarDefinition<
    AdvancedFilterNode,
    NumberValueNode,
    AdvancedFilterContext
> => {
    const parselet: SyntaxParselet<AdvancedFilterNode, NumberValueNode> = {
        type: 'operand',
        parse: (context) => {
            const token = context.expectToken('NUMBER', 'NumberValue');

            if (!token) {
                let invalid = context.consumeToken();
                return context.parseRecovery({
                    errors: [{ message: 'Expected a numeric value', range: invalid.range }],
                    tokens: [],
                });
            }

            const value = Number(token.value);

            if (Number.isNaN(value)) {
                return context.parseRecovery({
                    errors: [{ message: 'Incorrect numeric syntax', range: token.range }],
                    tokens: [token],
                });
            }

            return {
                isValid: true,
                tokens: [token],
                model: {
                    type: 'value',
                    dataType: 'number',
                    value,
                },
            };
        },
    };

    return {
        key: 'NumberValue',
        patterns: [
            {
                type: 'regex',
                category: 'NUMBER',
                key: 'NumberValue',
                regex: /^-?\d+(?:\.\d+)?/,
            },
        ],
        parselet,
    };
};

export const createBooleanValueParser = (): SyntaxGrammarDefinition<
    AdvancedFilterNode,
    BooleanValueNode,
    AdvancedFilterContext
> => {
    const parselet: SyntaxParselet<AdvancedFilterNode, BooleanValueNode> = {
        type: 'operand',
        parse: (context) => {
            const token = context.expectToken('BOOLEAN');

            if (!token) {
                let invalid = context.consumeToken();
                return context.parseRecovery({
                    errors: [{ message: 'Expected a boolean value', range: invalid.range }],
                    tokens: [],
                });
            }

            const value = token.value.toLowerCase() === 'true';

            return {
                isValid: true,
                tokens: [token],
                model: {
                    type: 'value',
                    dataType: 'boolean',
                    value,
                },
            };
        },
    };

    return {
        key: 'BooleanValueNode',
        patterns: [
            {
                type: 'string',
                category: 'BOOLEAN',
                key: 'BooleanValueNode',
                label: 'true',
                aliases: ['T'],
            },
            {
                type: 'string',
                category: 'BOOLEAN',
                key: 'BooleanValueNode',
                label: 'false',
                aliases: ['F'],
            },
        ],
        parselet,
    };
};
