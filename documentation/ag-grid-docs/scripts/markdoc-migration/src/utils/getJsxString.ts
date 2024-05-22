import { mdxJsxToMarkdown } from 'mdast-util-mdx-jsx';
import { toMarkdown } from 'mdast-util-to-markdown';
import type { Nodes } from 'mdast-util-to-markdown/lib';

export function getJsxString(node: Nodes) {
    return toMarkdown(node, {
        extensions: [mdxJsxToMarkdown()],
    });
}
