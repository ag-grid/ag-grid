import { visit } from 'unist-util-visit';

import { JSX_TYPE } from '../constants';
import { replaceNodeWithMarkdocTag } from '../utils/markdocTag';

export function transformApiDocumentation(ast: any) {
    const matcher = { type: JSX_TYPE, name: 'api-documentation' };

    visit(ast, matcher, function (node) {
        const { attributes, children } = node;
        replaceNodeWithMarkdocTag({
            node,
            tagName: 'apiDocumentation',
            attributes,
            children,
            config: {
                source: 'source',
                section: 'section',
                names: {
                    type: 'array',
                    name: 'names',
                },
                config: {
                    type: 'object',
                    name: 'config',
                },
            },
        });
    });
}
