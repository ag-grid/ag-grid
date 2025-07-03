import { SyntaxGrammar } from './syntaxGrammar';
import { PatternMatch, RawSyntaxToken, SyntaxToken, SyntaxTokenizer } from './syntaxTokenizer';
import { KindOf, SyntaxCategory, SyntaxConfig, TextRange } from './syntaxTypes';

export type SyntaxParseError = {
    message: string;
    range: TextRange;
};

export interface SyntaxParserContext<TSyntaxConfig extends SyntaxConfig, TContext> {
    peekToken(n?: number): RawSyntaxToken<KindOf<TSyntaxConfig>>;
    consumeToken(): SyntaxToken<KindOf<TSyntaxConfig>>;
    matchToken(category: SyntaxCategory, key?: string): SyntaxToken | null;
    expectToken(category: SyntaxCategory, key?: string): SyntaxToken | null;
    endOfTokens(): boolean;
    parseNext(minPrecedence?: number): SyntaxParserOutput<TSyntaxConfig['model']>;
    parseRecovery(params?: ParserRecoveryParams): InvalidSyntaxParserOutput;
    getEncompassingRange(tokens: SyntaxToken[]): TextRange;
    containsCaret(token: SyntaxToken): boolean;
    endsWithCaret(token: SyntaxToken): boolean;
    context: TContext;
}

export type SyntaxParserSuggestion = {
    label: string;
    category: SyntaxCategory;
    needsTrailing?: 'string';
    description?: string;
    caretInset?: number;
};

export type ValidSyntaxParserOutput<TOutputNode> = {
    isValid: true;
    model: TOutputNode;
    tokens: SyntaxToken[];
    suggestions?: SyntaxParserSuggestion[];
};

export type InvalidSyntaxParserOutput = {
    isValid: false;
    errors: SyntaxParseError[];
    tokens: SyntaxToken[];
    suggestions?: SyntaxParserSuggestion[];
};

export type SyntaxParserOutput<TOutputNode> = ValidSyntaxParserOutput<TOutputNode> | InvalidSyntaxParserOutput;

type ParserRecoveryParams = {
    errors?: SyntaxParseError[];
    tokens?: SyntaxToken[];
    stopOn?: {
        category: SyntaxCategory;
        key?: string;
    };
};

export class SyntaxParser<TSyntaxConfig extends SyntaxConfig, TContext>
    implements SyntaxParserContext<SyntaxConfig, TContext>
{
    private tokenizer: SyntaxTokenizer<TSyntaxConfig>;

    public context: TContext;

    private tokens: RawSyntaxToken<KindOf<TSyntaxConfig>>[];
    private cursorIndex: number = 0;
    private caretIndex: number | null;

    constructor(
        private grammar: SyntaxGrammar<TSyntaxConfig, TContext>,
        context: TContext
    ) {
        this.tokenizer = new SyntaxTokenizer(grammar.patterns);
        this.context = context;
    }

    /**
     * Parses the input into an AST based on the provided grammar
     *
     * @param input
     * @param cursorIndex
     */
    public parse(input: string, caretIndex: number | null) {
        this.caretIndex = caretIndex;
        this.tokens = this.tokenizer.tokenize(input);

        let output = this.parseNext();
        while (!this.endOfTokens()) {
            output = this.parseRecovery(output);
        }

        // A valid tree may not necessarily have a valid root
        return output.isValid ? this.grammar.validateOutput(output) : output;
    }

    /**
     * Cursor Management
     */

    public peekToken(n = 0) {
        return this.tokens[this.cursorIndex + n];
    }

    public consumeToken() {
        const { matches, ...token } = this.tokens[this.cursorIndex++];
        return {
            ...token,
            ...matches[0],
        };
    }

    public matchToken(category: SyntaxCategory, key?: string): SyntaxToken | null {
        if (this.endOfTokens()) return null;
        const { matches, ...token } = this.peekToken();

        const match = matches.find((t) => t.category === category && (!key || t.key === key));
        return match ? { ...token, ...match } : null;
    }

    public expectToken(category: SyntaxCategory, key?: string): SyntaxToken | null {
        const token = this.matchToken(category, key);
        if (token) {
            this.consumeToken();
            return token;
        }
        return null;
    }

    public endOfTokens() {
        return this.cursorIndex >= this.tokens.length;
    }

    public getEncompassingRange(tokens: SyntaxToken[]): TextRange {
        return tokens.length > 0
            ? {
                  start: tokens[0].range.start,
                  end: tokens[tokens.length - 1].range.end,
              }
            : {
                  start: 0,
                  end: 0,
              };
    }

    /**
     * Parsing logic
     */

    public parseNext(minPrecedence = 0): SyntaxParserOutput<TSyntaxConfig['model']> {
        let token = this.consumeToken();
        const definition = this.grammar.parselet(token.handler);

        if (definition.type !== 'operand' && definition.fixity !== 'prefix') {
            return this.parseRecovery();
        }

        let output = definition.parse(this, token);

        while (true) {
            if (this.endOfTokens()) break;

            const next = this.peekToken();

            if (this.grammar.isClosingToken(this.peekToken().matches)) {
                break;
            }

            const op = this.grammar.parselet(next.matches[0].handler);

            if (!op || op.type === 'operand' || op.fixity === 'prefix') {
                return this.parseRecovery();
            }

            const shouldParse =
                op.fixity === 'infix'
                    ? op.associativity === 'right'
                        ? op.precedence > minPrecedence
                        : op.precedence >= minPrecedence
                    : op.precedence >= minPrecedence;

            if (!shouldParse) {
                break;
            }

            if (!output.isValid) {
                return this.parseRecovery();
            }

            const opToken = this.consumeToken();

            output = op.parse(this, opToken, output);
        }

        return output;
    }

    public parseRecovery(params?: ParserRecoveryParams): InvalidSyntaxParserOutput {
        const errors: SyntaxParseError[] = params?.errors ?? [];
        const tokens: SyntaxToken[] = params?.tokens ?? [];
        const stopOn = params?.stopOn;

        if (this.endOfTokens()) {
            errors.push({
                message: 'Unexpected end of expression',
                range: this.getEncompassingRange([tokens[tokens.length - 1]]),
            });
            return { isValid: false, errors, tokens };
        }

        const next = this.peekToken();

        if (this.grammar.isOpeningToken(next.matches)) {
            const token = this.consumeToken();
            const op = this.grammar.parselet(next.matches[0].handler);

            const group = op.parse(this, token);
            tokens.push(...group.tokens);

            if (!group.isValid) {
                errors.push(...group.errors);
            }
        }

        if (stopOn && this.matchToken(stopOn.category, stopOn.key)) {
            return { isValid: false, errors, tokens };
        }

        if (!this.endOfTokens()) {
            const token = this.consumeToken();

            tokens.push({
                ...token,
            });
            errors.push({
                message: `Unrecognized token: "${token.value}"`,
                range: token.range,
            });
        }

        return { isValid: false, errors, tokens };
    }

    containsCaret(token: SyntaxToken): boolean {
        return this.caretIndex !== null && token.range.start < this.caretIndex && token.range.end > this.caretIndex;
    }

    endsWithCaret(token: SyntaxToken): boolean {
        return this.caretIndex !== null && token.range.end === this.caretIndex;
    }
}
