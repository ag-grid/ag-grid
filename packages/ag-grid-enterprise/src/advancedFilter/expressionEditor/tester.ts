import { AdvancedFilterExpressionLexer } from './expressionLexer';
import { AdvancedFilterExpressionParser, TokenCursor } from './expressionParser';

const simpleTest = () => {
    const input = '[Athlete] = "Phelps" AND ([Test] not in (1,2,3))';

    const lexer = new AdvancedFilterExpressionLexer();
    lexer.setMatchers([
        {
            _brand: 'regex',
            type: 'IDENTIFIER',
            key: 'column',
            regex: /^\[([^\]\n]*)\]?/,
        },
        {
            _brand: 'label',
            type: 'COMPARATOR',
            key: 'equals',
            label: 'equals',
            aliases: ['='],
        },
        {
            _brand: 'regex',
            type: 'STRING',
            key: 'string',
            regex: /^"([^"\n]*)"?/,
        },
        {
            _brand: 'label',
            type: 'LPAREN',
            key: 'openParens',
            label: '(',
        },
        {
            _brand: 'label',
            type: 'RPAREN',
            key: 'closeParens',
            label: ')',
        },
        {
            _brand: 'label',
            type: 'COMMA',
            key: 'comma',
            label: ',',
        },
        {
            _brand: 'label',
            type: 'COMPARATOR',
            key: 'notIn',
            label: 'not in',
        },
        {
            _brand: 'regex',
            type: 'NUMBER',
            key: 'number',
            regex: /^-?\d+(?:\.\d+)?/,
        },
        {
            _brand: 'label',
            type: 'OPERATOR',
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
