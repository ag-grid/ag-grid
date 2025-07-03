import { SyntaxParseError } from './syntaxParser';
import { SyntaxToken } from './syntaxTokenizer';
import { SyntaxCategory } from './syntaxTypes';

export class SyntaxRenderer {
    constructor(private defs: Record<SyntaxCategory, string>) {}

    toString(tokens: SyntaxToken[]): string {
        let result = '';
        let currentPos = tokens[0].range.start;

        for (const token of tokens) {
            const { start, end } = token.range;

            if (start > currentPos) {
                result += ' '.repeat(start - currentPos);
            }

            result += token.value;
            currentPos = end;
        }

        return result;
    }

    toHTML(element: Element, tokens: SyntaxToken[], errors?: SyntaxParseError[]) {
        const tokenStack = [...tokens];
        const displayedErrors = errors ? this.filterLeafErrors(errors) : [];

        return this.buildHTML(element, tokenStack, displayedErrors);
    }

    private buildHTML(element: Element, tokens: SyntaxToken[], errors: SyntaxParseError[], stopAt: number = Infinity) {
        if (tokens.length === 0) return;

        let currentPos = tokens[0].range.start;
        let nextErrorStart = errors.length > 0 ? errors[0].range.start : Infinity;

        while (tokens.length > 0) {
            const { start, end } = tokens[0].range;
            if (end > stopAt) {
                return;
            }

            if (start > currentPos) {
                const whitespace = ' '.repeat(start - currentPos);
                element.appendChild(document.createTextNode(whitespace));
            }

            if (start >= nextErrorStart) {
                const error = errors.shift()!;

                const span = document.createElement('span');
                this.buildHTML(span, tokens, [], error.range.end);
                span.setAttribute('class', 'syntax-error');
                span.setAttribute('title', error?.message);
                element.appendChild(span);

                nextErrorStart = errors.length > 0 ? error.range.start : Infinity;
            }

            const token = tokens.shift()!;

            const span = document.createElement('span');
            span.innerText = token.value;
            span.setAttribute('class', this.defs[token.category]);
            element.appendChild(span);
        }
    }

    private filterLeafErrors(errors: SyntaxParseError[]): SyntaxParseError[] {
        return errors.filter(
            (e1, i, all) =>
                !all.some(
                    (e2, j) =>
                        j !== i &&
                        e2.range.start <= e1.range.start &&
                        e2.range.end >= e1.range.end &&
                        (e2.range.end > e1.range.end || e2.range.start < e1.range.start)
                )
        );
    }
}
