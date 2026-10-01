import type { PolicyContent } from '@ag-website-shared/components/policies/policyContent';
import Markdoc from '@markdoc/markdoc';

import { EULA_CONTENT } from './eulaPresentations';

// The EULA body uses no Markdoc tags, functions or variables, so no site config is needed to render it.
const MARKDOC_CONFIG = {};

// Block-level elements in the rendered agreement. Whitespace between them is insignificant in HTML,
// so each can start on its own line without changing how the document renders. A line breaks where a
// block opens, and where one closes and another tag follows; a closing tag stays on its block's line.
const BLOCK_TAG = 'article|ol|ul|li|p|h[1-6]|hr|table|thead|tbody|tr|th|td|blockquote';
const BLOCK_BOUNDARY = new RegExp(`(?<=<\\/(?:${BLOCK_TAG})>|<hr>)(?=<)|(?<=>)(?=<(?:${BLOCK_TAG})[\\s>])`, 'g');

/**
 * Breaks the single line Markdoc renders into one line per block-level element, so that a change to
 * one clause shows up as a change to one line when the generated licence is diffed.
 */
function oneBlockPerLine(html: string): string {
    return html.replace(BLOCK_BOUNDARY, '\n');
}

/**
 * The Commercial End User Licence Agreement as a standalone HTML document, without the website
 * layout: the same heading, version and introductory notice as the `/eula/commercial/` page,
 * followed by the clauses and schedules rendered from the `.mdoc` source.
 *
 * Served at `/eula/license-en.html`, which the ecommerce site embeds in an iframe (with the
 * click-to-accept notice, `EULA_PRESENTATIONS.checkout`, and `embedded` so the iframe controls how the
 * text flows and supplies the heading), and written into the `ag-grid-enterprise` package as `LICENSE.html` by
 * `scripts/licence/generate-enterprise-licence.ts`.
 */
export function renderEulaHtml(
    eulaSource: string,
    { content = EULA_CONTENT, embedded = false }: { content?: PolicyContent; embedded?: boolean } = {}
): string {
    const { heading, meta, intro } = content;
    // A document read on its own keeps a readable measure and opens with its heading and version lines;
    // an embedded one takes the iframe's width and starts straight at the notice, since the checkout
    // supplies the heading and presents the current agreement only.
    const bodyLayout = embedded ? 'margin: 0; padding: 0 1em;' : 'max-width: 52em; margin: 2em auto; padding: 0 1em;';
    const headingBlock = embedded ? [] : [`<h1>${heading}</h1>`, '<hr>', ...meta.map((line) => `<h4>${line}</h4>`)];
    const body = oneBlockPerLine(Markdoc.renderers.html(Markdoc.transform(Markdoc.parse(eulaSource), MARKDOC_CONFIG)));

    return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${heading}</title>
<style>
body { ${bodyLayout} font-family: system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.5; color: #222; }
hr { border: 0; border-top: 1px solid #ccc; margin: 1.5em 0; }
</style>
</head>
<body>
${[...headingBlock, ...intro.map((line) => `<p>${line}</p>`), body].join('\n')}
</body>
</html>
`;
}
