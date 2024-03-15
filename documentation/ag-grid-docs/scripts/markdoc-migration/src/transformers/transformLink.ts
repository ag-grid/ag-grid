import { link } from 'mdast-builder';
import { visit } from 'unist-util-visit';

import { JSX_TEXT_TYPE } from '../constants';
import { getAttributeValue } from '../utils/getAttributeValue';
import { getRelativeUrl } from '../utils/getRelativeUrl';

/**
 * Transform links to be relative
 */
export function transformLink(ast: any) {
    visit(ast, { type: 'link' }, function (node) {
        node.url = getRelativeUrl(node.url);
    });

    visit(ast, { type: JSX_TEXT_TYPE, name: 'a' }, function (node) {
        const { attributes, children } = node;

        const hrefValue = getAttributeValue({ attributes: attributes!, name: 'href' });
        const url = getRelativeUrl(hrefValue);
        const replacement = link(url, undefined, children);

        node.type = replacement.type;
        node.url = replacement.url;
        node.title = replacement.title;
    });
}
