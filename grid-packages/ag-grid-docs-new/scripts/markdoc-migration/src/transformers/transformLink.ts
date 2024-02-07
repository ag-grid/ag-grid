import { visit } from 'unist-util-visit';

/**
 * Transform links to be relative
 */
export function transformLink(ast: any) {
    const matcher = { type: 'link' };

    visit(ast, matcher, function (node) {
        const { url } = node;

        if (url.startsWith('/')) {
            node.url = `.${url}`;
        } else if (url.startsWith('../')) {
            node.url = node.url.slice(1);
        }
    });
}
