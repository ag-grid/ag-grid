import { code } from 'mdast-builder';

import { JSX_ATTRIBUTE_TYPE } from '../constants';
import { createExtractLinesBetween } from './createExtractLinesBetween';
import { type Attribute, getAttributeValue } from './getAttributeValue';
import { removeStartingVerticalBar } from './removeStartingVerticalBar';

const LANGUAGE_ATTRIBUTE = 'language';
const DEFAULT_CODE_LANGUAGE = 'js';

function getTransformMetaAttributes(attributes: Attribute[]) {
    const metaAttributes = attributes.filter((attr) => {
        return attr.name !== LANGUAGE_ATTRIBUTE;
    });
    const metaValues = metaAttributes.map(({ name, value }) => {
        let attrValue = value;
        if (value?.type === JSX_ATTRIBUTE_TYPE) {
            attrValue = value.data.estree.body[0].expression.value;
        } else if (typeof value === 'string') {
            attrValue = value === 'true';
        }

        return `${name}=${attrValue}`;
    });
    const metaValuesString = metaValues.length
        ? `{% frameworkTransform=true ${metaValues.join(' ')} %}`
        : '{% frameworkTransform=true %}';

    return metaValuesString;
}

export const createMarkdocCodeFence = ({
    attributes,
    children,
    contents,
}: {
    attributes?: Attribute[];
    children: any;
    // Require contents to get spaces, because the AST strips it out
    contents: string;
}) => {
    const extractLinesBetween = createExtractLinesBetween(contents, (line) => {
        const strippedOutBar = removeStartingVerticalBar(line);

        return strippedOutBar.replaceAll('&lt;', '<');
    });
    const lang = getAttributeValue({ attributes, name: 'language' }) || DEFAULT_CODE_LANGUAGE;

    // Ignore attributes if transform is 'false'
    // Unnecessary to use snippet in this situation
    const transformValue = getAttributeValue({ attributes, name: 'transform' });

    // Only don't transform if 'false'
    const isTransform = transformValue === undefined || transformValue !== 'false';
    const meta = isTransform ? getTransformMetaAttributes(attributes) : '';

    const content = children
        .map((paragraph) => {
            const { position } = paragraph;
            const lines = extractLinesBetween({
                startLine: position.start.line,
                endLine: position.end.line,
            });

            return lines;
        })
        // Join paragraphs with 2 newlines to have a space between them
        .join('\n\n');

    const markdownAst = { ...code(lang, content), meta };

    return markdownAst;
};
