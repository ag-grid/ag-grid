import type { Framework } from '@ag-grid-types';
import Markdoc from '@markdoc/markdoc';
import { transformMarkdoc } from '@utils/markdoc/transformMarkdoc';

import type { FAQItem } from './types';

export interface RenderedFAQItem {
    question: string;
    answerHtml: string;
}

/**
 * Render FAQ answers to inline HTML on the server so Markdoc stays out of the client bundle.
 */
export function renderFAQAnswers(items: FAQItem[], framework: Framework): RenderedFAQItem[] {
    return items.map(({ question, answer }) => {
        const { partialRenderTree } = transformMarkdoc({ framework, markdocContent: answer });
        return { question, answerHtml: Markdoc.renderers.html(partialRenderTree) };
    });
}
