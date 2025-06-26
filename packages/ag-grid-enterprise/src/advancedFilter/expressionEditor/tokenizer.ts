import { TokenRange } from './typeHelpers';

export type TokenType =
    | 'GROUP_START'
    | 'GROUP_END'
    | 'ARRAY_START'
    | 'ARRAY_END'
    | 'ARRAY_SEPARATOR'
    | 'IDENTIFIER'
    | 'STRING'
    | 'NUMBER'
    | 'BOOLEAN'
    | 'OPERATOR'
    | 'COMPARATOR'
    | 'FUNCTION'
    | 'STRUCTURAL'
    | 'UNKNOWN';

export type TokenMatch = {
    type: TokenType;
    key: string;
};

interface BaseTokenMatcher {
    type: string;
    token: TokenType;
    key: string;
    priority?: number;
}

interface StringTokenMatcher extends BaseTokenMatcher {
    type: 'string';
    label: string;
    aliases?: string[];
}

interface RegexTokenMatcher extends BaseTokenMatcher {
    type: 'regex';
    regex: RegExp;
}

export type TokenMatcher = StringTokenMatcher | RegexTokenMatcher;

export interface RawToken {
    value: string;
    range: TokenRange;
    matches: TokenMatch[];
}

export interface MatchedToken {
    type: TokenType;
    key: string;
    value: string;
    range: TokenRange;
}

type MatcherConfig = {
    regex: {
        key: string;
        expression: RegExp;
        token: TokenType;
    }[];
    label: {
        key: string;
        expression: string;
        token: TokenType;
    }[];
    priority: number;
}[];

export class ExpressionTokenizer {
    matchers: MatcherConfig;

    setMatchers(matchers: TokenMatcher[]) {
        const grouped: MatcherConfig = [];

        for (const matcher of matchers) {
            const priority = matcher.priority ?? 100;

            let existing = grouped.find((m) => m.priority === priority);
            if (!existing) {
                existing = { regex: [], label: [], priority };
                grouped.push(existing);
            }

            if (matcher.type === 'string') {
                const labels = [matcher.label, ...(matcher.aliases ?? [])];
                existing.label.push(
                    ...labels.map((l) => ({
                        key: matcher.key,
                        expression: l.toLowerCase(),
                        token: matcher.token,
                    }))
                );

                existing.label.sort((a, b) => b.expression.length - a.expression.length);
            } else if (matcher.type === 'regex') {
                existing.regex.push({
                    key: matcher.key,
                    expression: matcher.regex,
                    token: matcher.token,
                });
            }
        }

        this.matchers = grouped.sort((a, b) => b.priority - a.priority);
    }

    public tokenize(input: string): RawToken[] {
        let pos = 0;
        const tokens: RawToken[] = [];

        chunker: while (pos < input.length) {
            const chunk = input.slice(pos);

            const whitespace = chunk.match(/^\s+/);
            if (whitespace) {
                const len = whitespace[0].length;
                pos += len;
                continue;
            }

            for (const matcher of this.matchers) {
                for (const regexMatcher of matcher.regex) {
                    const match = chunk.match(regexMatcher.expression);
                    if (match) {
                        const len = match[0].length;
                        tokens.push({
                            matches: [
                                {
                                    type: regexMatcher.token,
                                    key: regexMatcher.key,
                                },
                            ],
                            range: {
                                start: pos,
                                end: pos + len,
                            },
                            value: match[0],
                        });
                        pos += len;
                        continue chunker;
                    }
                }

                let token: RawToken | undefined;
                for (const stringMatcher of matcher.label) {
                    let len = stringMatcher.expression.length;

                    if (token && token.value.length !== length) {
                        tokens.push(token);

                        pos += len;
                        continue chunker;
                    }

                    if (chunk.toLowerCase().startsWith(stringMatcher.expression)) {
                        if (!token) {
                            token = {
                                value: chunk.slice(0, len),
                                range: {
                                    start: pos,
                                    end: pos + len,
                                },
                                matches: [],
                            };
                        }

                        token.matches.push({
                            key: stringMatcher.key,
                            type: stringMatcher.token,
                        });
                    }
                }
                if (token) {
                    tokens.push(token);
                    pos += token.value.length;
                    continue chunker;
                }
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
}
