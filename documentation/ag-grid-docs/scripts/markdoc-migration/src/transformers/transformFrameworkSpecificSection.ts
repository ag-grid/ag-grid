import { visit } from 'unist-util-visit';

import { JSX_TYPE } from '../constants';
import { getAttributeValue } from '../utils/getAttributeValue';
import { replaceMarkdocIfTag } from '../utils/markdocTag';

export function transformFrameworkSpecificSection(ast: any) {
    const matcher = { type: JSX_TYPE, name: 'framework-specific-section' };

    visit(ast, matcher, function (node) {
        const { attributes, children } = node;
        const frameworksAttr = getAttributeValue({
            attributes,
            name: 'frameworks',
        });
        const frameworks = frameworksAttr.split(',').map((framework: string) => `"${framework.trim()}"`);
        const frameworksString = frameworks.join(', ');
        const expression =
            frameworksAttr === 'frameworks' ? 'isNotJavascriptFramework()' : `isFramework(${frameworksString})`;

        replaceMarkdocIfTag({
            node,
            children,
            expression,
        });
    });
}
