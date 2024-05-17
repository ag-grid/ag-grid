import { visit } from 'unist-util-visit';

import { JSX_TYPE } from '../constants';
import { replaceNodeWithFixme } from '../utils/replaceNodeWithFixme';

export function removeElements(ast: any) {
    const warnings: string[] = [];
    const addWarning = ({ message, node }: { message: string; node: any }) => {
        warnings.push(`${message} (line ${node.position.start.line}:${node.position.end.line})`);
    };
    const elementsToRemove = [
        'div',
        'figure',
        'style',
        'p',
        'iframe',
        'table',
        'ul',
        // Components that need to be implemented or needs
        // to be updated manually
        'matrix-table',
    ];

    elementsToRemove.forEach((name) => {
        visit(ast, { type: JSX_TYPE, name }, (node, _, parent) => {
            replaceNodeWithFixme({ node, parent });
            addWarning({ message: `${name} removed`, node });
        });
    });

    return {
        warnings,
    };
}
