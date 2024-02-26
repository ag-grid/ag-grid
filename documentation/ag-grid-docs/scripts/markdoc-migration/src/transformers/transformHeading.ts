import { visit } from 'unist-util-visit';

/**
 * Transform heading custom ids
 */
export function transformHeading(ast: any) {
    const matcher = { type: 'heading' };

    visit(ast, matcher, function (node) {
        const { children } = node;

        node.children = children.map((child) => {
            if (child.type === 'text') {
                // Convert {#new-id} to {% #new-id %}
                child.value = child.value.replace(/{#([^}]+)}/g, '{% #$1 %}');
            }

            return child;
        });
    });
}
