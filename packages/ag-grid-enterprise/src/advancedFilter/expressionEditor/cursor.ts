import { MatchedToken, RawToken, TokenMatch, TokenType } from './tokenizer';

export class TokenCursor {
    private i = 0;

    constructor(private tokens: RawToken[]) {}

    peek(n = 0) {
        return this.tokens[this.i + n];
    }

    consume() {
        const token = this.tokens[this.i++];
        return token;
    }

    match(type: TokenType, key?: string): TokenMatch | null {
        const token = this.peek();

        const match = token.matches.find((t) => t.type === type && (!key || t.key === key));
        return match ?? null;
    }

    expect(type: TokenType, key?: string): MatchedToken | null {
        const match = this.match(type, key);
        if (match) {
            const { matches, ...token } = this.consume();
            return {
                ...match,
                ...token,
            };
        }
        return null;
    }

    eof() {
        return this.i >= this.tokens.length;
    }
}
