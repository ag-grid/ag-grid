import { visit } from 'unist-util-visit';

import { JSX_TYPE } from '../constants';
import { replaceNodeWithMarkdocTag } from '../utils/markdocTag';

export function transformIconsPanel(ast: any) {
    visit(ast, { type: JSX_TYPE, name: 'icons-panel' }, (node) => {
        replaceNodeWithMarkdocTag({
            node,
            tagName: 'iconsPanel',
            attributes: [],
            children: [],
        });
    });
}
