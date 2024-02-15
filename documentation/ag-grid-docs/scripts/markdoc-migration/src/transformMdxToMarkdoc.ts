import * as acorn from 'acorn';
import { fromMarkdown } from 'mdast-util-from-markdown';
import { frontmatterFromMarkdown, frontmatterToMarkdown } from 'mdast-util-frontmatter';
import { mdxJsxFromMarkdown } from 'mdast-util-mdx-jsx';
import { toMarkdown } from 'mdast-util-to-markdown';
import { frontmatter } from 'micromark-extension-frontmatter';
import { mdxJsx } from 'micromark-extension-mdx-jsx';
import { find } from 'unist-util-find';

import { JSX_TEXT_TYPE, JSX_TYPE } from './constants';
import { removeElements } from './transformers/removeElements';
import { transformApiDocumentation } from './transformers/transformApiDocumentation';
import { transformEnterpriseIcon } from './transformers/transformEnterpriseIcon';
import { transformExternalLink } from './transformers/transformExternalLink';
import { transformFrameworkSpecificSection } from './transformers/transformFrameworkSpecificSection';
import { transformGridExample } from './transformers/transformGridExample';
import { transformHeading } from './transformers/transformHeading';
import { transformHtml } from './transformers/transformHtml';
import { transformInterfaceDocumentation } from './transformers/transformInterfaceDocumentation';
import { transformLink } from './transformers/transformLink';
import { transformResouces } from './transformers/transformResouces';
import { transformSnippet } from './transformers/transformSnippet';
import { transformTabs } from './transformers/transformTabs';
import { transformAlerts } from './transformers/transfromAlerts';
import { transformIconsPanel } from './transformers/transfromIconsPanel';
import { markdocParagraphHandler } from './utils/convertMarkdocTag';
import { createExtractLinesBetween } from './utils/createExtractLinesBetween';

export async function transformMdxToMarkdoc({ contents }: { contents: string }) {
    let ast;
    try {
        ast = fromMarkdown(contents, {
            extensions: [frontmatter(['yaml']), mdxJsx({ acorn, addResult: true })],
            mdastExtensions: [frontmatterFromMarkdown(['yaml']), mdxJsxFromMarkdown()],
        });
    } catch (error) {
        error.message = `${error.message}`;
        error.markdownErrorType = 'fromMarkdown';
        throw error;
    }
    const extractLinesBetween = createExtractLinesBetween(contents);

    // Do transforms
    transformEnterpriseIcon(ast);
    transformResouces(ast);
    transformAlerts(ast);
    transformSnippet(ast, contents);
    transformGridExample(ast);
    transformApiDocumentation(ast);
    transformInterfaceDocumentation(ast);
    transformFrameworkSpecificSection(ast);
    transformHeading(ast);
    transformLink(ast);
    transformExternalLink(ast);
    transformIconsPanel(ast);
    transformTabs(ast);
    transformHtml(ast);

    // Warning transforms
    const { warnings } = removeElements(ast);

    const jsxTag = find(ast, (node) => {
        return node.type === JSX_TYPE || node.type === JSX_TEXT_TYPE;
    });
    if (jsxTag) {
        const startLine = jsxTag.position?.start.line!;
        const endLine = jsxTag.position?.end.line!;
        const lines = extractLinesBetween({
            startLine,
            endLine,
        });
        const error = new Error(`JSX tag not transformed: <${jsxTag.name}> on lines ${startLine}:${endLine}`);
        error.lines = lines;
        error.markdownErrorType = 'jsxTag';

        throw error;
    }

    let output;
    try {
        output = toMarkdown(ast, {
            emphasis: '_',
            incrementListMarker: false,
            extensions: [frontmatterToMarkdown(['yaml'])],
            handlers: {
                // Fix for extra escaped character
                // @see https://github.com/syntax-tree/hast-util-to-mdast/issues/66#issuecomment-941930366
                // @see https://github.com/syntax-tree/mdast-util-to-markdown/blob/fd6a508cc619b862f75b762dcf876c6b8315d330/lib/handle/break.js#L31
                break() {
                    return '\n';
                },
                paragraph: markdocParagraphHandler,
            },
        });
    } catch (error) {
        error.message = `toMarkdown error: ${error.message}`;
        error.ast = ast;
        error.markdownErrorType = 'toMarkdown';
        throw error;
    }

    return {
        ast,
        output,
        warnings,
    };
}
