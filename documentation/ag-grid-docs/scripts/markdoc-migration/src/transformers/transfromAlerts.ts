import { visit } from 'unist-util-visit';

import { JSX_TEXT_TYPE, JSX_TYPE } from '../constants';
import { replaceNodeWithMarkdocTag } from '../utils/markdocTag';
import { childrenWithoutVerticalBar } from '../utils/removeStartingVerticalBar';

const createReplaceTag = (name: string) => (node: any) => {
    replaceNodeWithMarkdocTag({
        node,
        tagName: name,
        children: node.children,
    });
    node.children = childrenWithoutVerticalBar(node.children);
};

function transformAlertWithName({ ast, name }: { ast: any; name: string }) {
    const replaceTag = createReplaceTag(name);

    visit(ast, { type: JSX_TYPE, name }, replaceTag);
    visit(ast, { type: JSX_TEXT_TYPE, name }, replaceTag);
}

export function transformAlerts(ast: any) {
    ['note', 'warning', 'idea'].forEach((name) => {
        transformAlertWithName({
            ast,
            name,
        });
    });
}
