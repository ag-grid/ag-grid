import { SyntaxCategory, TextRange } from './syntaxTypes';

const FALLBACK_REGEXP: RegExp = /([a-zA-Z_]+)|([0-9]+)|([^\w\s]+)/g;

interface BasePattern {
    type: string;
    category: SyntaxCategory;
    key: string;
    priority?: number;
}

interface SyntaxStringPattern extends BasePattern {
    type: 'string';
    label: string;
    aliases?: string[];
}

interface SyntaxRegexPattern extends BasePattern {
    type: 'regex';
    regex: RegExp;
}

export type SyntaxPattern = SyntaxStringPattern | SyntaxRegexPattern;

export type PatternMatch = {
    category: SyntaxCategory;
    key: string;
};

export interface RawSyntaxToken {
    value: string;
    range: TextRange;
    matches: PatternMatch[];
}

export interface SyntaxToken {
    category: SyntaxCategory;
    key: string;
    value: string;
    range: TextRange;
}

type PatternConfig = {
    regex: {
        category: SyntaxCategory;
        key: string;
        expression: RegExp;
    }[];
    strings: {
        category: SyntaxCategory;
        key: string;
        expression: string;
    }[];
    priority: number;
}[];

export class SyntaxTokenizer {
    patterns: PatternConfig;

    constructor(patterns: SyntaxPattern[]) {
        this.setPatterns(patterns);
    }

    private setPatterns(patterns: SyntaxPattern[]) {
        const config: PatternConfig = [];

        for (const pattern of patterns) {
            const priority = pattern.priority ?? 100;

            let existing = config.find((m) => m.priority === priority);
            if (!existing) {
                existing = { regex: [], strings: [], priority };
                config.push(existing);
            }

            if (pattern.type === 'string') {
                const labels = [pattern.label, ...(pattern.aliases ?? [])];
                existing.strings.push(
                    ...labels.map((l) => ({
                        key: pattern.key,
                        expression: l.toLowerCase(),
                        category: pattern.category,
                    }))
                );

                existing.strings.sort((a, b) => b.expression.length - a.expression.length);
            } else if (pattern.type === 'regex') {
                existing.regex.push({
                    key: pattern.key,
                    expression: pattern.regex,
                    category: pattern.category,
                });
            }
        }

        this.patterns = config.sort((a, b) => b.priority - a.priority);
    }

    public tokenize(input: string, caretIndex?: number): RawSyntaxToken[] {
        let pos = 0;
        const tokens: RawSyntaxToken[] = [];

        while (pos < input.length) {
            const chunk = input.slice(pos);

            const whitespace = chunk.match(/^\s+/);
            if (whitespace) {
                const len = whitespace[0].length;
                pos += len;
                continue;
            }

            const token = this.matchChunk(chunk);
            if (token) {
                let len = token.value.length;
                tokens.push({
                    ...token,
                    range: {
                        start: pos,
                        end: pos + len,
                    },
                });
                pos += len;
                continue;
            }

            const matches = chunk.match(FALLBACK_REGEXP);
            if (matches) {
                let value = matches[0];
            }

            tokens.push({
                value: input[pos],
                range: { start: pos, end: pos + 1 },
                matches: [],
            });
            pos += 1;
        }

        return tokens;
    }

    private matchChunk(chunk: string): Omit<RawSyntaxToken, 'range'> {
        for (const pattern of this.patterns) {
            for (const regexPattern of pattern.regex) {
                const match = chunk.match(regexPattern.expression);
                if (match) {
                    return {
                        matches: [
                            {
                                category: regexPattern.category,
                                key: regexPattern.key,
                            },
                        ],
                        value: match[0],
                    };
                }
            }

            let token: Omit<RawSyntaxToken, 'range'> | undefined;
            for (const stringPattern of pattern.strings) {
                let len = stringPattern.expression.length;

                if (token && token.value.length !== len) {
                    return token;
                }

                if (chunk.toLowerCase().startsWith(stringPattern.expression)) {
                    if (!token) {
                        token = {
                            value: chunk.slice(0, len),
                            matches: [],
                        };
                    }

                    token.matches.push({
                        category: stringPattern.category,
                        key: stringPattern.key,
                    });
                }
            }
            if (token) {
                return token;
            }
        }

        const matches = chunk.match(FALLBACK_REGEXP);
        let value;
        if (matches) {
            value = matches[0];
        } else {
            value = chunk[0];
        }
        return {
            value,
            matches: [
                {
                    category: 'UNKNOWN',
                    key: 'UnknownToken',
                },
            ],
        };
    }
}
