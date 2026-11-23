import type { Framework } from '@ag-grid-types';
import Markdoc from '@markdoc/markdoc';
import { transformMarkdoc } from '@utils/markdoc/transformMarkdoc';

import type { FAQItem } from './types';

export interface RenderedFAQItem {
    question: string;
    answerHtml: string;
}

/** Render authored Markdoc to HTML on the server, so Markdoc stays out of the client bundle. */
export function renderMarkdocHtml(markdocContent: string, framework: Framework): string {
    const { partialRenderTree } = transformMarkdoc({ framework, markdocContent });
    return Markdoc.renderers.html(partialRenderTree);
}

/** As `renderMarkdocHtml`, but keeps every paragraph rather than only the first's inline content. */
export function renderMarkdocBlocksHtml(markdocContent: string, framework: Framework): string {
    const { renderTree } = transformMarkdoc({ framework, markdocContent });
    // Markdoc wraps the document in an <article>; the caller supplies its own container.
    return Markdoc.renderers.html(renderTree instanceof Markdoc.Tag ? renderTree.children : renderTree);
}

/**
 * Render FAQ answers to inline HTML on the server so Markdoc stays out of the client bundle.
 */
export function renderFAQAnswers(items: FAQItem[], framework: Framework): RenderedFAQItem[] {
    return items.map(({ question, answer }) => ({ question, answerHtml: renderMarkdocHtml(answer, framework) }));
}
