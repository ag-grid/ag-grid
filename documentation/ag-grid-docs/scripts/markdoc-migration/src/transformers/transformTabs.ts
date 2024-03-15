import { brk } from 'mdast-builder';
import { visit } from 'unist-util-visit';

import { JSX_TYPE } from '../constants';
import { getAttributeValue } from '../utils/getAttributeValue';
import { replaceNodeWithMarkdocTag } from '../utils/markdocTag';

export function transformTabs(ast: any) {
    visit(ast, { type: JSX_TYPE, name: 'tabs' }, function (node) {
        const { children } = node;
        const tabLinksDiv = children.find((child) => {
            const isDiv = child.type === JSX_TYPE && child.name === 'div';
            const tabsLinks = getAttributeValue({
                attributes: child.attributes,
                name: 'tabs-links',
            });

            return isDiv && tabsLinks;
        });
        if (tabLinksDiv) {
            const headerLinks = tabLinksDiv.children
                .map((child) => {
                    if (child.name === 'open-in-cta') {
                        const type = getAttributeValue({
                            attributes: child.attributes,
                            name: 'type',
                        });
                        const href = getAttributeValue({
                            attributes: child.attributes,
                            name: 'href',
                        });
                        return {
                            type,
                            href,
                        };
                    }
                })
                .filter(Boolean);

            node.attributes = [
                {
                    name: 'headerLinks',
                    value: headerLinks,
                },
            ];
        }

        replaceNodeWithMarkdocTag({
            node,
            tagName: 'tabs',
            attributes: node.attributes,
            children,
            config: {
                headerLinks: {
                    type: 'array',
                    name: 'headerLinks',
                },
            },
        });

        node.children.forEach((child) => {
            if (child.type === JSX_TYPE && child.name === 'div') {
                const tabLabel = getAttributeValue({
                    attributes: child.attributes,
                    name: 'tab-label',
                });

                if (tabLabel) {
                    replaceNodeWithMarkdocTag({
                        node: child,
                        tagName: 'tabItem',
                        attributes: child.attributes,
                        children: child.children,
                        config: {
                            'tab-id': {
                                type: 'string',
                                name: 'id',
                                transform(value) {
                                    return value || tabLabel;
                                },
                            },
                            'tab-label': 'label',
                        },
                    });

                    return child;
                }
            }
        });

        node.children = node.children
            .filter((child) => {
                return child !== tabLinksDiv;
            })
            .flatMap((child, index) => {
                return index < node.children.length - 1 ? [child, brk] : [child];
            });
    });
}
