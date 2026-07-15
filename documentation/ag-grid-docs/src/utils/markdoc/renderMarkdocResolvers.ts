import type { Framework } from '@ag-grid-types';
import type { MarkdownFramework, MarkdownResolvers } from '@ag-website-shared/markdoc/renderMarkdocToMarkdown';
import { isExternalLink } from '@ag-website-shared/utils/isExternalLink';
import { getPagePath } from '@components/docs/utils/filesData';
import { getExampleUrl } from '@components/docs/utils/urlPaths';
import { getGeneratedContents } from '@components/example-generator';
import * as snippetTransformer from '@components/snippet/snippetTransformer';
import { SITE_BASE_URL, agGridVersion } from '@constants';
import { getInternalFramework } from '@utils/framework';
import { pathJoin } from '@utils/pathJoin';
import { urlWithPrefix } from '@utils/urlWithPrefix';
import { readFileSync } from 'node:fs';
import path from 'node:path';

import { renderApiReferenceTable } from './renderApiReferenceTable';

// Shiki-style language per framework, matching Snippet.astro's `frameworkLanguages`.
const FRAMEWORK_LANGUAGES: Record<MarkdownFramework, string> = {
    react: 'jsx',
    javascript: 'js',
    angular: 'ts',
    vue: 'ts',
};

function languageForFile(fileName: string): string {
    if (fileName.endsWith('.tsx')) {
        return 'tsx';
    }
    if (fileName.endsWith('.jsx')) {
        return 'jsx';
    }
    if (fileName.endsWith('.ts')) {
        return 'ts';
    }
    if (fileName.endsWith('.js')) {
        return 'js';
    }
    if (fileName.endsWith('.vue')) {
        return 'html';
    }
    return 'ts';
}

function toAbsoluteUrl(url: string, siteRoot?: string): string {
    if (!url || !siteRoot) {
        return url;
    }
    if (url.startsWith('#') || isExternalLink(url) || /^[a-z]+:/i.test(url)) {
        return url;
    }
    if (url.startsWith('/')) {
        return siteRoot.replace(/\/$/, '') + url;
    }
    return url;
}

/**
 * Build the grid-specific resolver callbacks for the shared Markdoc-to-markdown
 * serializer. These hold all the Astro/filesystem/product coupling (example
 * source, API reference tables, partials, link/image URLs) so the shared
 * serializer stays product-agnostic.
 *
 * `siteRoot` (canonical origin, trailing slash) makes example/link/image URLs
 * absolute so the `.md` is portable when read out of context by an LLM.
 */
export function createGridMarkdownResolvers({ siteRoot }: { siteRoot?: string } = {}): MarkdownResolvers {
    return {
        loadExampleSource: async ({ name, framework, pageName }) => {
            const internalFramework = getInternalFramework({ framework, useTypescript: true });
            try {
                const contents = await getGeneratedContents({
                    type: 'docs',
                    framework: internalFramework,
                    pageName,
                    exampleName: name,
                });
                if (!contents) {
                    return null;
                }
                const fileName = contents.mainFileName ?? contents.entryFileName;
                const code = fileName ? contents.files?.[fileName] : undefined;
                if (!code) {
                    return null;
                }
                // Strip the test-id harness the example generator injects — it is inert
                // (URL-param gated) and just noise for a reader/LLM.
                const cleanCode = code
                    .replace(
                        /[ \t]*\/\*\* ENABLE AG-TEST-ID START \*\*\/[\s\S]*?\/\*\* ENABLE AG-TEST-ID END \*\*\/[ \t]*\n?/g,
                        ''
                    )
                    .trim();
                const liveUrl = toAbsoluteUrl(
                    getExampleUrl({ internalFramework, pageName, exampleName: name }),
                    siteRoot
                );
                return {
                    code: cleanCode,
                    language: fileName ? languageForFile(fileName) : FRAMEWORK_LANGUAGES[framework],
                    liveUrl,
                };
            } catch {
                // Missing example (e.g. QUICK_BUILD_PAGES) — degrade gracefully.
                return null;
            }
        },

        renderApiTable: ({ attributes, framework, kind }) =>
            renderApiReferenceTable({ attributes, framework: framework as Framework, kind }),

        readPartial: ({ file, pageName }) => {
            try {
                const filePath = path.join(getPagePath({ pageName }), file);
                return readFileSync(filePath).toString();
            } catch {
                return null;
            }
        },

        transformFence: ({ code, framework, language }) => {
            try {
                const transformed = snippetTransformer.transform(code, framework as Framework, {});
                return { code: transformed, language: FRAMEWORK_LANGUAGES[framework] };
            } catch {
                // snippetTransformer only handles grid-options-shaped snippets; fall back to raw.
                return { code, language: language || FRAMEWORK_LANGUAGES[framework] };
            }
        },

        resolveLinkHref: ({ href, framework }) => {
            try {
                const withPrefix = urlWithPrefix({ url: href, framework: framework as Framework });
                const resolved = withPrefix.replace('{% $agGridVersion %}', agGridVersion);
                return toAbsoluteUrl(resolved, siteRoot);
            } catch {
                return href;
            }
        },

        resolveImageSrc: ({ imagePath, pageName }) =>
            toAbsoluteUrl(pathJoin('/', SITE_BASE_URL, 'docs', pageName, imagePath), siteRoot),
    };
}
