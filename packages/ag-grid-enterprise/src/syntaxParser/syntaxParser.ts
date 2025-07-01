import { SyntaxGrammar } from './syntaxGrammar';
import { PatternMatch, RawSyntaxToken, SyntaxToken, SyntaxTokenizer } from './syntaxTokenizer';
import { SyntaxCategory, TextRange } from './syntaxTypes';

export type SyntaxParseError = {
    message: string;
    range: TextRange;
};

export interface SyntaxParserContext<TModelNode, TContext> {
    peekToken(n?: number): RawSyntaxToken;
    consumeToken(): RawSyntaxToken;
    matchToken(category: SyntaxCategory, key?: string): SyntaxToken | null;
    expectToken(category: SyntaxCategory, key?: string): SyntaxToken | null;
    endOfTokens(): boolean;
    parseNext(minPrecedence?: number): SyntaxParserOutput<TModelNode>;
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

export class SyntaxParser<TModelNode, TOutputNode extends TModelNode, TContext>
    implements SyntaxParserContext<TModelNode, TContext>
{
    private tokens: RawSyntaxToken[];
    private cursorIndex: number = 0;
    private caretIndex: number | null;

    constructor(
        private grammar: SyntaxGrammar<TModelNode, TOutputNode, TContext>,
        private tokenizer: SyntaxTokenizer,
        public context: TContext
    ) {}

    /**
     * Parses the input into an AST based on the provided grammar
     *
     * @param input
     * @param cursorIndex
     */
    public parse(input: string, caretIndex: number | null): SyntaxParserOutput<TOutputNode> {
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
        return this.tokens[this.cursorIndex++];
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

    public parseNext(minPrecedence = 0): SyntaxParserOutput<TModelNode> {
        let token = this.peekToken();
        const definition = this.grammar.getParselet(token.matches);

        if (!definition || (definition.type !== 'operand' && definition.fixity !== 'prefix')) {
            return this.parseRecovery();
        }

        let output = definition.parse(this);

        while (true) {
            const next = this.peekToken();

            if (this.endOfTokens()) break;

            if (this.grammar.isClosingToken(next.matches)) {
                break;
            }

            const op = this.grammar.getParselet(next.matches);

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

            output = op.parse(this, output);
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
            const op = this.grammar.getParselet(next.matches);
            if (op) {
                const group = op?.parse(this);
                tokens.push(...group.tokens);

                if (!group.isValid) {
                    errors.push(...group.errors);
                }
            }
        }

        if (stopOn && this.matchToken(stopOn.category, stopOn.key)) {
            return { isValid: false, errors, tokens };
        }

        if (!this.endOfTokens()) {
            const { matches, ...token } = this.consumeToken();
            const match: PatternMatch =
                matches.length > 0
                    ? matches[0]
                    : {
                          category: 'UNKNOWN',
                          key: 'UnknownToken',
                      };

            tokens.push({
                ...token,
                ...match,
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
