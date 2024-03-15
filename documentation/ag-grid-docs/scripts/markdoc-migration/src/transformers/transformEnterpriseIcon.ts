import { visit } from 'unist-util-visit';

import { JSX_TEXT_TYPE, JSX_TYPE } from '../constants';
import { replaceNodeWithMarkdocTag } from '../utils/markdocTag';

export function transformEnterpriseIcon(ast: any) {
    visit(
        ast,
        (node) => (node.type === JSX_TYPE || node.type === JSX_TEXT_TYPE) && node.name === 'enterprise-icon',
        (node) => {
            replaceNodeWithMarkdocTag({
                node,
                tagName: 'enterpriseIcon',
                attributes: [],
                children: [],
            });
        }
    );
}
