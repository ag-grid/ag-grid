import { code } from 'mdast-builder';

import { getJsxString } from './getJsxString';

export function replaceNodeWithFixme({ node, parent }) {
    const jsxString = getJsxString(node);
    const modifiedChildren = parent.children.map((child) => {
        if (child === node) {
            return {
                ...code('js', jsxString),
                meta: '{% fixme=true %}',
            };
        }

        return child;
    });
    parent.children = modifiedChildren;
}
