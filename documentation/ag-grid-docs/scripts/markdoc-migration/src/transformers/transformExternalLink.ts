import { visit } from 'unist-util-visit';

import { JSX_TEXT_TYPE } from '../constants';
import { getAttributeValue } from '../utils/getAttributeValue';
import { replaceNodeWithMarkdocTag } from '../utils/markdocTag';

export function transformExternalLink(ast: any) {
    const matcher = { type: JSX_TEXT_TYPE, name: 'a' };

    visit(ast, matcher, function (node) {
        const { attributes, children } = node;

        const targetValue = getAttributeValue({ attributes: attributes!, name: 'target' });

        if (targetValue === '_blank') {
            replaceNodeWithMarkdocTag({
                node,
                tagName: 'externalLink',
                attributes,
                children,
                excludeOutputBreaks: true,
                config: {
                    href: 'href',
                },
            });
        }
    });
}
