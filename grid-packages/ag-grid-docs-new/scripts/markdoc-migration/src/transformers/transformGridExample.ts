import { visit } from 'unist-util-visit';

import { JSX_TYPE } from '../constants';
import { replaceNodeWithMarkdocTag } from '../utils/markdocTag';

export function transformGridExample(ast: any) {
    const matcher = { type: JSX_TYPE, name: 'grid-example' };

    visit(ast, matcher, function (node) {
        const { attributes, children } = node;
        replaceNodeWithMarkdocTag({
            node,
            tagName: 'gridExampleRunner',
            attributes,
            children,
            config: {
                title: 'title',
                name: 'name',
                type: 'type',
                options: {
                    type: 'object',
                    name: 'options',
                },
            },
        });
    });
}
