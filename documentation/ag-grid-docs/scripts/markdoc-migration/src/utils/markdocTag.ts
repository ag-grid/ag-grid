import { brk, paragraph, text } from 'mdast-builder';

import { IS_MARKDOC_FIELD, MARKDOC_TAG_NAME } from '../constants';
import type { Attribute} from './getAttributeValue';
import { getAttributeValue } from './getAttributeValue';
import { childrenWithoutVerticalBar } from './removeStartingVerticalBar';

type AttributeConfigObject = {
    type: 'boolean' | 'string' | 'object' | 'array';
    name: string;
    transform?: (value: string) => string;
};

export type AttributeConfig = string | AttributeConfigObject;
export type MarkdocAttributeConfig = Record<string, AttributeConfig>;

/**
 * Separate nodes with 2 `brk`'s, so the output is separated with 2 newlines
 */
const separateNodes = (nodes) =>
    nodes.flatMap((node, index) => {
        return index < nodes.length - 1 ? [node, brk, brk] : [node];
    });

const createMarkdocTag = ({
    tagName,
    attributes,
    children,
    config,
    primaryAttribute,
    excludeOutputBreaks,
}: {
    tagName: string;
    attributes?: Attribute[];
    children: any;
    config?: MarkdocAttributeConfig;
    primaryAttribute?: string;
    excludeOutputBreaks?: boolean;
}) => {
    let tagAttributesText;
    if (primaryAttribute) {
        tagAttributesText = `"${primaryAttribute}"`;
    } else if (config) {
        const tagAttrEntries = Object.entries(config)
            .map(([attrName, nameConfig]) => {
                const type = (nameConfig as AttributeConfigObject)?.type || 'string';
                const isBoolean = type === 'boolean';
                const isString = type === 'string';
                const isArray = type === 'array';
                const field =
                    typeof nameConfig === 'object'
                        ? (nameConfig as AttributeConfigObject)?.name
                        : (nameConfig as string);

                const attrValue = getAttributeValue({ attributes: attributes!, name: attrName });

                const transform = (nameConfig as AttributeConfigObject)?.transform;
                const processedValue = transform
                    ? transform(attrValue)?.trim()
                    : isString
                      ? attrValue?.trim()
                      : attrValue;

                if (processedValue === undefined) {
                    return;
                } else if (isBoolean) {
                    const boolValue = processedValue === 'true';
                    return [field, boolValue];
                } else if (isString) {
                    return [field, `"${processedValue}"`];
                } else if (isArray) {
                    return [field, JSON.stringify(processedValue)];
                }

                return [field, processedValue];
            })
            .filter(Boolean) as [string, string][];
        const tagAttributes = Object.fromEntries(tagAttrEntries);

        tagAttributesText = Object.entries(tagAttributes)
            .map(([field, value]) => {
                return `${field}=${value}`;
            })
            .join(' ');
    }

    const isInline = children.length === 0;
    const tagAttributes = tagAttributesText ? ` ${tagAttributesText}` : '';

    let markdownAst;
    if (isInline) {
        const tagText = `{% ${tagName}${tagAttributes} /%}`;
        markdownAst = paragraph([text(tagText)]);
    } else {
        const startTag = `{% ${tagName}${tagAttributes} %}`;
        const endTag = `{% /${tagName} %}`;
        const childrenNodes = excludeOutputBreaks
            ? [text(startTag), ...children, text(endTag)]
            : [text(startTag), brk, ...children, brk, text(endTag)];

        markdownAst = paragraph(childrenNodes);
    }

    return markdownAst;
};

export const replaceNodeWithMarkdocTag = ({
    node,
    tagName,
    attributes,
    children,
    config,
    primaryAttribute,
    excludeOutputBreaks,
}: {
    node: any;
    tagName: string;
    attributes?: Attribute[];
    children: any;
    config?: MarkdocAttributeConfig;
    primaryAttribute?: string;
    excludeOutputBreaks?: boolean;
}) => {
    const replacement = createMarkdocTag({
        tagName,
        attributes,
        children,
        primaryAttribute,
        excludeOutputBreaks,
        config,
    });
    node.type = replacement.type;
    node.children = replacement.children;
    node[IS_MARKDOC_FIELD] = true;
    node[MARKDOC_TAG_NAME] = tagName;
};

const createMarkdocIfTag = ({ children, expression }: { children: any; expression?: string }) => {
    const startTag = `{% if ${expression} %}`;
    const endTag = `{% /if %}`;

    const markdownAst = paragraph([text(startTag), brk, ...separateNodes(children), brk, text(endTag)]);

    return markdownAst;
};

export const replaceMarkdocIfTag = ({
    node,
    children,
    expression,
}: {
    node: any;
    children: any;
    expression?: string;
}) => {
    const replacement = createMarkdocIfTag({
        children,
        expression,
    });
    node.type = replacement.type;
    node.children = childrenWithoutVerticalBar(replacement.children);
    node[IS_MARKDOC_FIELD] = true;
    node[MARKDOC_TAG_NAME] = 'if';
};
