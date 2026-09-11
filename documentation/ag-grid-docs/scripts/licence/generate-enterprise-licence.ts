/* eslint-disable no-console -- standalone CLI: reports the files it writes */
/**
 * Generates the AG Grid Enterprise licence files shipped in the `ag-grid-enterprise` package from
 * the End User Licence Agreement published at /eula/, so the package and the website cannot drift:
 *
 *   packages/ag-grid-enterprise/LICENSE.md    plain markdown (no site frontmatter)
 *   packages/ag-grid-enterprise/LICENSE.html  standalone HTML
 *
 * Both are rendered from the same sources as the page: `src/content/policies/eula.mdoc` for the
 * clauses and schedules, and `EULA_CONTENT` for the heading, version and introductory notice.
 * Run by `scripts/deployments/prep_and_archive/updateLicenses.sh` at deployment, and by hand with
 * `npx tsx scripts/licence/generate-enterprise-licence.ts` from `documentation/ag-grid-docs`.
 */
import Markdoc from '@markdoc/markdoc';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import type * as HtmlInlineToMarkdownModule from '../../../../external/ag-website-shared/src/markdoc/htmlInlineToMarkdown';
import type * as RenderMarkdocToMarkdownModule from '../../../../external/ag-website-shared/src/markdoc/renderMarkdocToMarkdown';
import { EULA_CONTENT } from '../../src/utils/markdown-pages/eulaContent';

// `external/ag-website-shared` has no `"type": "module"`, so under tsx its sources load as
// CommonJS and an ESM named import sees only `default`. Requiring them gives the real exports.
const require = createRequire(import.meta.url);
const { htmlInlineToMarkdown } =
    require('../../../../external/ag-website-shared/src/markdoc/htmlInlineToMarkdown') as typeof HtmlInlineToMarkdownModule;
const { renderMarkdocToMarkdown } =
    require('../../../../external/ag-website-shared/src/markdoc/renderMarkdocToMarkdown') as typeof RenderMarkdocToMarkdownModule;

const docsDir = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const repoRoot = resolve(docsDir, '../..');
const eulaSourcePath = resolve(docsDir, 'src/content/policies/eula.mdoc');
const outputDir = resolve(repoRoot, 'packages/ag-grid-enterprise');

// The EULA body uses no Markdoc functions or variables, so no site config is needed to render it.
const MARKDOC_CONFIG = {};

const eulaSource = readFileSync(eulaSourcePath, 'utf8');
const { heading, meta, intro } = EULA_CONTENT;

async function buildMarkdown(): Promise<string> {
    const rendered = await renderMarkdocToMarkdown({
        body: eulaSource,
        framework: 'javascript',
        pageName: 'eula',
        markdocConfig: MARKDOC_CONFIG,
    });
    // Drop the frontmatter block the renderer emits; a licence file carries none.
    const body = rendered.replace(/^---\n[\s\S]*?\n---\n+/, '').trim();

    const document = [
        `# ${heading}`,
        ...meta.map((line) => htmlInlineToMarkdown(line)),
        ...intro.map((line) => htmlInlineToMarkdown(line)),
        body,
    ];

    return `${document.join('\n\n').trimEnd()}\n`;
}

function buildHtml(): string {
    const ast = Markdoc.parse(eulaSource);
    const body = Markdoc.renderers.html(Markdoc.transform(ast, MARKDOC_CONFIG));

    return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${heading}</title>
<style>
body { max-width: 52em; margin: 2em auto; padding: 0 1em; font-family: system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.5; color: #222; }
hr { border: 0; border-top: 1px solid #ccc; margin: 1.5em 0; }
</style>
</head>
<body>
<h1>${heading}</h1>
<hr>
${meta.map((line) => `<h4>${line}</h4>`).join('\n')}
${intro.map((line) => `<p>${line}</p>`).join('\n')}
${body}
</body>
</html>
`;
}

async function main() {
    mkdirSync(outputDir, { recursive: true });

    const markdownPath = resolve(outputDir, 'LICENSE.md');
    writeFileSync(markdownPath, await buildMarkdown());
    console.log(`Wrote ${markdownPath}`);

    const htmlPath = resolve(outputDir, 'LICENSE.html');
    writeFileSync(htmlPath, buildHtml());
    console.log(`Wrote ${htmlPath}`);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
