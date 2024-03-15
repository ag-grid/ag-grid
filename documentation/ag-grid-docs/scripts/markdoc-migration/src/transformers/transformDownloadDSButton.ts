import { visit } from 'unist-util-visit';

import { JSX_TYPE } from '../constants';
import { replaceNodeWithMarkdocTag } from '../utils/markdocTag';

export function transformDownloadDSButton(ast: any) {
    visit(ast, { type: JSX_TYPE, name: 'download-ds-button' }, function (node) {
        const { attributes, children } = node;

        replaceNodeWithMarkdocTag({
            node,
            tagName: 'downloadDSButton',
            attributes,
            children,
        });
    });
}
