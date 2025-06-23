import { AdvancedFilterExpressionLexer } from './lexer';
import { AdvancedFilterExpressionParser, TokenCursor } from './parser';

const simpleTest = () => {
    const input = '[Athlete] = "Phelps" AND ([Test] not in (1,2,3))';

    const lexer = new AdvancedFilterExpressionLexer();
    lexer.setMatchers([
        {
            type: 'regex',
            token: 'IDENTIFIER',
            key: 'column',
            regex: /^\[([^\]\n]*)\]?/,
        },
        {
            type: 'string',
            token: 'COMPARATOR',
            key: 'equals',
            label: 'equals',
            aliases: ['='],
        },
        {
            type: 'regex',
            token: 'STRING',
            key: 'string',
            regex: /^"([^"\n]*)"?/,
        },
        {
            type: 'string',
            token: 'GROUP_START',
            key: 'openParens',
            label: '(',
        },
        {
            type: 'string',
            token: 'GROUP_END',
            key: 'closeParens',
            label: ')',
        },
        {
            type: 'string',
            token: 'ARRAY_SEPARATOR',
            key: 'comma',
            label: ',',
        },
        {
            type: 'string',
            token: 'COMPARATOR',
            key: 'notIn',
            label: 'not in',
        },
        {
            type: 'regex',
            token: 'NUMBER',
            key: 'number',
            regex: /^-?\d+(?:\.\d+)?/,
        },
        {
            type: 'string',
            token: 'OPERATOR',
            key: 'and',
            label: 'AND',
        },
    ]);

    const tokens = lexer.tokenize(input);
    console.log(JSON.stringify(tokens, null, 2));

    const parser = new AdvancedFilterExpressionParser();
    const cursor = new TokenCursor(tokens);
    const ast = parser.parseExpression(cursor);
    console.log(JSON.stringify(ast, null, 2));
};

simpleTest();
