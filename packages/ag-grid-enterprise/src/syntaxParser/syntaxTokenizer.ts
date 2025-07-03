import { KindOf, SyntaxCategory, SyntaxConfig, TextRange } from './syntaxTypes';

const FALLBACK_REGEXP: RegExp = /([a-zA-Z_]+)|([0-9]+)|([^\w\s]+)/g;

interface SyntaxStringPattern {
    type: 'string';
    label: string;
    aliases?: string[];
}

interface SyntaxRegexPattern {
    type: 'regex';
    regex: RegExp;
}

export type SyntaxPattern<TKind extends string> = (SyntaxStringPattern | SyntaxRegexPattern) & {
    category: SyntaxCategory;
    key: string;
    priority?: number;
    handler: TKind;
};

export type PatternMatch<TKind extends string> = {
    category: SyntaxCategory;
    key: string;
    handler: TKind;
};

export interface RawSyntaxToken<TKind extends string> {
    value: string;
    range: TextRange;
    matches: [PatternMatch<TKind>, ...PatternMatch<TKind>[]];
}

export interface SyntaxToken<THandler extends string = string> {
    category: SyntaxCategory;
    key: string;
    value: string;
    range: TextRange;
    handler: THandler;
}

type PatternConfig<TSyntaxConfig extends SyntaxConfig> = {
    regex: {
        category: SyntaxCategory;
        key: string;
        handler: KindOf<TSyntaxConfig>;
        expression: RegExp;
    }[];
    strings: {
        category: SyntaxCategory;
        key: string;
        handler: KindOf<TSyntaxConfig>;
        expression: string;
    }[];
    priority: number;
}[];

export class SyntaxTokenizer<TSyntaxConfig extends SyntaxConfig> {
    patterns: PatternConfig<TSyntaxConfig>;

    constructor(patterns: SyntaxPattern<KindOf<TSyntaxConfig>>[]) {
        this.setPatterns(patterns);
    }

    private setPatterns(patterns: SyntaxPattern<KindOf<TSyntaxConfig>>[]) {
        const config: PatternConfig<TSyntaxConfig> = [];

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
                        handler: pattern.handler,
                    }))
                );

                existing.strings.sort((a, b) => b.expression.length - a.expression.length);
            } else if (pattern.type === 'regex') {
                existing.regex.push({
                    key: pattern.key,
                    expression: pattern.regex,
                    category: pattern.category,
                    handler: pattern.handler,
                });
            }
        }

        this.patterns = config.sort((a, b) => b.priority - a.priority);
    }

    public tokenize(input: string, caretIndex?: number): RawSyntaxToken<KindOf<TSyntaxConfig>>[] {
        let pos = 0;
        const tokens: RawSyntaxToken<KindOf<TSyntaxConfig>>[] = [];

        while (pos < input.length) {
            const chunk = input.slice(pos);

            const whitespace = chunk.match(/^\s+/);
            if (whitespace) {
                const len = whitespace[0].length;
                pos += len;
                continue;
            }

            const token = this.matchChunk(chunk);

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

        return tokens;
    }

    private matchChunk(chunk: string): Omit<RawSyntaxToken<KindOf<TSyntaxConfig>>, 'range'> {
        for (const pattern of this.patterns) {
            for (const regexPattern of pattern.regex) {
                const match = chunk.match(regexPattern.expression);
                if (match) {
                    return {
                        matches: [
                            {
                                category: regexPattern.category,
                                key: regexPattern.key,
                                handler: regexPattern.handler,
                            },
                        ],
                        value: match[0],
                    };
                }
            }

            let token: Omit<RawSyntaxToken<KindOf<TSyntaxConfig>>, 'range'> | undefined;
            for (const stringPattern of pattern.strings) {
                let len = stringPattern.expression.length;

                if (token && token.value.length !== len) {
                    return token;
                }

                if (chunk.toLowerCase().startsWith(stringPattern.expression)) {
                    let match = {
                        category: stringPattern.category,
                        key: stringPattern.key,
                        handler: stringPattern.handler,
                    };

                    if (!token) {
                        token = {
                            value: chunk.slice(0, len),
                            matches: [match],
                        };
                    } else {
                        token.matches.push(match);
                    }
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
                    handler: 'unknown',
                },
            ],
        };
    }
}
