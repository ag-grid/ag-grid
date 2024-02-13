import { IS_MARKDOC_FIELD } from '../constants';

/**
 * Copied from `mdast-util-to-markdown/lib/handle/paragraph`
 *
 * @see https://github.com/syntax-tree/mdast-util-to-markdown/blob/fd6a508cc619b862f75b762dcf876c6b8315d330/lib/handle/paragraph.js
 */
function toMarkdownParagraph(node, _, state, info) {
    const exit = state.enter('paragraph');
    const subexit = state.enter('phrasing');
    const value = state.containerPhrasing(node, info);
    subexit();
    exit();
    return value;
}

/**
 * Handler to convert Markdoc tags wrapped in paragraph nodes
 *
 * Mainly to prevent characters from being escaped
 */
export function markdocParagraphHandler(node, parent, state, info) {
    const isMarkdocTag = node[IS_MARKDOC_FIELD];
    const defaultParagraph = toMarkdownParagraph(node, parent, state, info);

    if (isMarkdocTag) {
        return (
            defaultParagraph
                // Unescape `\_` eg, links
                .replaceAll('\\_', '_')
                // Unescape `\[` eg, attribute arrays
                .replaceAll('\\[', '[')
                // Unescape `\#` eg, headings
                .replaceAll('\\#', '#')
                // Unescape `\-` eg, list items
                .replaceAll('\\-', '-')
                // Unescape `\*` eg, list items
                .replaceAll('\\*', '*')
        );
    }

    return defaultParagraph;
}
