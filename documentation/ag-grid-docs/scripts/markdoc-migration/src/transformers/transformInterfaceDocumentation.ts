import { visit } from 'unist-util-visit';

import { JSX_TYPE } from '../constants';
import { replaceNodeWithMarkdocTag } from '../utils/markdocTag';

export function transformInterfaceDocumentation(ast: any) {
    const matcher = { type: JSX_TYPE, name: 'interface-documentation' };

    visit(ast, matcher, function (node) {
        const { attributes, children } = node;
        replaceNodeWithMarkdocTag({
            node,
            tagName: 'interfaceDocumentation',
            attributes,
            children,
            config: {
                interfaceName: 'interfaceName',
                names: 'names',
                config: {
                    type: 'object',
                    name: 'config',
                },
            },
        });
    });
}
