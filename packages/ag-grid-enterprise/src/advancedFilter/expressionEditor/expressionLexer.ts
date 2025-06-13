type Token =
    | { type: 'LBRACKET'; value: '[' }
    | { type: 'RBRACKET'; value: ']' }
    | { type: 'LPAREN'; value: '(' }
    | { type: 'RPAREN'; value: ')' }
    | { type: 'COMMA'; value: ',' }
    | { type: 'OPERATOR'; value: string }
    | { type: 'LOGICAL'; value: string }
    | { type: 'IDENTIFIER'; value: string }
    | { type: 'STRING'; value: string }
    | { type: 'NUMBER'; value: string }
    | { type: 'WHITESPACE'; value: string; ignore: true }
    | { type: 'UNKNOWN'; value: string };

export class AdvancedFilterExpressionLexer {
    constructor() {}

    public tokenize(input: string): Token[] {
        let pos = 0;
        const tokens: Token[] = [];

        while (pos < input.length) {
            const chunk = input.slice(pos);

            if (chunk.startsWith('[')) {
                tokens.push({ type: 'LBRACKET', value: '[' });
                pos += 1;
            } else if (chunk.startsWith(']')) {
                tokens.push({ type: 'RBRACKET', value: ']' });
                pos += 1;
            } else if (chunk.startsWith(']')) {
                tokens.push({ type: 'RBRACKET', value: ']' });
                pos += 1;
            
            } else if (chunk.startsWith(']')) {
                tokens.push({ type: 'RBRACKET', value: ']' });
                pos += 1;
            } else if (chunk.startsWith(']')) {
                tokens.push({ type: 'RBRACKET', value: ']' });
                pos += 1;
            } else if 
        }

        return tokens;
    }
}
