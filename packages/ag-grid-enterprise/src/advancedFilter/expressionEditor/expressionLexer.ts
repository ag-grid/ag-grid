import { ExpressionToken, LexerTokenMatcher, TokenType } from './expressionTypes';

type MatcherConfig = {
    regex: {
        key: string;
        expression: RegExp;
        type: TokenType;
    }[];
    label: {
        key: string;
        expression: string;
        type: TokenType;
    }[];
    priority: number;
}[];

export class AdvancedFilterExpressionLexer {
    matchers: MatcherConfig;

    setMatchers(matchers: LexerTokenMatcher[]) {
        const grouped: MatcherConfig = [];

        for (const matcher of matchers) {
            const priority = matcher.priority ?? 100;

            let existing = grouped.find((m) => m.priority === priority);
            if (!existing) {
                existing = { regex: [], label: [], priority };
                grouped.push(existing);
            }

            if (matcher._brand === 'label') {
                const labels = [matcher.label, ...(matcher.aliases ?? [])];
                existing.label.push(
                    ...labels.map((l) => ({
                        key: matcher.key,
                        expression: l.toLowerCase(),
                        type: matcher.type,
                    }))
                );

                existing.label.sort((a, b) => b.expression.length - a.expression.length);
            } else if (matcher._brand === 'regex') {
                existing.regex.push({
                    key: matcher.key,
                    expression: matcher.regex,
                    type: matcher.type,
                });
            }
        }

        this.matchers = grouped.sort((a, b) => b.priority - a.priority);
    }

    public tokenize(input: string): ExpressionToken[] {
        let pos = 0;
        const tokens: ExpressionToken[] = [];

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
                            key: regexMatcher.key,
                            type: regexMatcher.type,
                            value: match[0],
                            start: pos,
                            end: pos + len,
                        });
                        pos += len;
                        continue chunker;
                    }
                }

                for (const labelMatcher of matcher.label) {
                    if (chunk.toLowerCase().startsWith(labelMatcher.expression)) {
                        const len = labelMatcher.expression.length;
                        tokens.push({
                            key: labelMatcher.key,
                            type: labelMatcher.type,
                            value: chunk.slice(0, len),
                            start: pos,
                            end: pos + len,
                        });
                        pos += len;
                        continue chunker;
                    }
                }
            }

            tokens.push({
                key: 'unknown',
                type: 'UNKNOWN',
                value: input[pos],
                start: pos,
                end: pos + 1,
            });
            pos += 1;
        }

        return tokens;
    }
}
