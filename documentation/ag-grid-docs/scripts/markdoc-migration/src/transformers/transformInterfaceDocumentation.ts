import path from 'path';
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
                overrideSrc: {
                    type: 'string',
                    name: 'overrideSrc',
                    transform(value) {
                        if (!value) {
                            return value;
                        }

                        // Remove resources folder
                        const paths = value.split(path.sep).filter((path) => path !== 'resources');

                        return paths.join(path.sep);
                    },
                },
                names: {
                    type: 'array',
                    name: 'names',
                },
                exclude: {
                    type: 'array',
                    name: 'exclude',
                },
                config: {
                    type: 'object',
                    name: 'config',
                },
                wrapNamesAt: 'wrapNamesAt',
            },
        });
    });
}
