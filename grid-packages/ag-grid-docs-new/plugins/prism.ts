import { type AstroMarkdocConfig, Markdoc } from '@astrojs/markdoc/config';
import { runHighlighterWithAstro } from '@astrojs/prism/dist/highlighter';
// @ts-expect-error Cannot find module 'astro/runtime/server/index.js' or its corresponding type declarations.
import { unescapeHTML } from 'astro/runtime/server/index.js';

/**
 * Extend default markdoc prism highlighter to include AG Charts `code` styles
 *
 * @see https://github.com/withastro/astro/blob/fa3e83984343d3b9c37af7af876ad03ac95bf1c6/packages/integrations/markdoc/src/extensions/prism.ts
 */
export default function prism(): AstroMarkdocConfig {
    return {
        nodes: {
            fence: {
                attributes: Markdoc.nodes.fence.attributes!,
                transform({ attributes: { language, content } }) {
                    const { html, classLanguage } = runHighlighterWithAstro(language, content);

                    // Use `unescapeHTML` to return `HTMLString` for Astro renderer to inline as HTML
                    return unescapeHTML(
                        `<pre class="${classLanguage} code"><code class="${classLanguage}">${html}</code></pre>`
                    );
                },
            },
        },
    };
}
