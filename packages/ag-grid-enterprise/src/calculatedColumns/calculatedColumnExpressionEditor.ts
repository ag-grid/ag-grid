import type { GridInputTextArea } from 'ag-grid-community';

import type { FormulaSourceToken } from '../formula/ast/parsers';
import { AgTextAreaMirror } from '../widgets/agTextAreaMirror';

export interface CalculatedColumnExpressionPresentation {
    tokens: FormulaSourceToken[];
    diagnostic?: { message: string; range?: { start: number; end: number } };
}

export class CalculatedColumnExpressionEditor extends AgTextAreaMirror {
    constructor(field: GridInputTextArea) {
        super(field);
        this.addCss('ag-calculated-column-expression-mirror');
        this.eText.classList.add('ag-calculated-column-expression-text');
    }

    public refresh(expression: string, presentation: CalculatedColumnExpressionPresentation): void {
        const doc = this.getGui().ownerDocument;
        const fragment = doc.createDocumentFragment();
        const range = presentation.diagnostic?.range;
        const append = (start: number, end: number, type: FormulaSourceToken['type']) => {
            if (start === end) {
                return;
            }
            const boundaries = [start, end];
            if (range) {
                if (range.start > start && range.start < end) {
                    boundaries.push(range.start);
                }
                if (range.end > start && range.end < end) {
                    boundaries.push(range.end);
                }
                boundaries.sort((a, b) => a - b);
            }
            for (let i = 1; i < boundaries.length; ++i) {
                const from = boundaries[i - 1];
                const to = boundaries[i];
                const error = range && from < range.end && to > range.start;
                const text = expression.slice(from, to);
                if (type === 'text' && !error) {
                    fragment.appendChild(doc.createTextNode(text));
                    continue;
                }
                const span = doc.createElement('span');
                if (type !== 'text') {
                    span.classList.add(`ag-calculated-column-token-${type}`);
                }
                if (error) {
                    span.classList.add('ag-calculated-column-expression-error');
                }
                span.textContent = text;
                fragment.appendChild(span);
            }
        };
        let offset = 0;
        for (const token of presentation.tokens) {
            append(offset, token.start, 'text');
            append(token.start, token.end, token.type);
            offset = token.end;
        }
        append(offset, expression.length, 'text');
        this.setContent(fragment);
    }
}
