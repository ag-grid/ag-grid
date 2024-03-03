import { visit } from 'unist-util-visit';

import { JSX_TYPE } from '../constants';
import { createMarkdocCodeFence } from '../utils/createMarkdocCodeFence';

export function transformSnippet(ast: any, contents: string) {
    const matcher = { type: JSX_TYPE, name: 'snippet' };

    visit(ast, matcher, function (node) {
        const { attributes, children } = node;
        const codeFence = createMarkdocCodeFence({
            attributes,
            children,
            contents,
        });
        node.type = codeFence.type;
        node.lang = codeFence.lang;
        node.meta = codeFence.meta;
        node.value = codeFence.value;
        delete node.children;
    });
}
