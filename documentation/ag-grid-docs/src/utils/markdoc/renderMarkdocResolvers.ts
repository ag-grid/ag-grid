import type { Framework } from '@ag-grid-types';
import type { MarkdownFramework, MarkdownResolvers } from '@ag-website-shared/markdoc/renderMarkdocToMarkdown';
import { toAbsoluteUrl } from '@ag-website-shared/markdoc/toAbsoluteUrl';
import { getPageImages, getPagePath } from '@components/docs/utils/filesData';
import { getExampleLinkUrl } from '@components/docs/utils/urlPaths';
import { getGeneratedContents } from '@components/example-generator';
import { stripOutExampleGeneratorCode } from '@components/example-runner/components/stripOutExampleGeneratorCode';
import * as snippetTransformer from '@components/snippet/snippetTransformer';
import { getInternalFramework } from '@utils/framework';
import { readFileSync } from 'node:fs';
import path from 'node:path';

import { renderApiReferenceTable } from './renderApiReferenceTable';
import { renderMarkdocTag } from './renderMarkdocTag';
import { resolveMarkdownLinkHref } from './resolveMarkdownLinkHref';

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
                if (!fileName || !contents.files?.[fileName]) {
                    return null;
                }
                // Strip the harness the example generator injects (test-id setup,
                // console logging, teardown, theme switcher, redacted AI tokens) so the
                // reader/LLM sees the same clean source as the on-page code viewer.
                const files = { ...contents.files };
                stripOutExampleGeneratorCode(files);
                const cleanCode = files[fileName].trim();
                const liveUrl = toAbsoluteUrl(
                    getExampleLinkUrl({ internalFramework, pageName, exampleName: name }),
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
            renderApiReferenceTable({ attributes, framework: framework as Framework, kind, siteRoot }),

        renderTag: ({ tag, attributes, framework, pageName }) =>
            renderMarkdocTag({ tag, attributes, framework, pageName, siteRoot }),

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

        resolveLinkHref: ({ href, framework, pageName }) =>
            resolveMarkdownLinkHref({ href, framework: framework as Framework, pageName, siteRoot }),

        resolveImageSrc: async ({ imagePath, pageName }) => {
            try {
                // Resolve through Astro's asset pipeline (same as the on-page Image component)
                // so the URL actually resolves; a naive /docs/<page>/<path> URL 404s.
                const { imageSrc } = await getPageImages({ pageName, imagePath });
                return imageSrc ? toAbsoluteUrl(imageSrc, siteRoot) : imagePath;
            } catch {
                return imagePath;
            }
        },
    };
}
