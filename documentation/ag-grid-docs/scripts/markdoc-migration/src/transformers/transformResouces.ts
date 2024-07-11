import * as acorn from 'acorn';
import { brk } from 'mdast-builder';
import { fromMarkdown } from 'mdast-util-from-markdown';
import { mdxJsxFromMarkdown } from 'mdast-util-mdx-jsx';
import { mdxJsx } from 'micromark-extension-mdx-jsx';
import path from 'path';
import { visit } from 'unist-util-visit';

import { JSX_TEXT_TYPE, JSX_TYPE } from '../constants';
import { getAttributeValue } from '../utils/getAttributeValue';
import { replaceNodeWithMarkdocTag } from '../utils/markdocTag';

const RESOURCES_FOLDER = 'resources';

/**
 * Put files in resouces folder
 */
function resourcesFolderTransform(value: string) {
    const fileName = value.split('/').at(-1)!;
    return path.join(RESOURCES_FOLDER, fileName);
}

function transformImage(ast: any) {
    const matcher = { type: 'image' };

    visit(ast, matcher, function (node) {
        const isExternalUrl = node.url.startsWith('http');

        if (!isExternalUrl) {
            // Needs to be relative path
            node.url = './' + resourcesFolderTransform(node.url);
        }
    });
}

function transformGif(ast: any) {
    const matcher = { type: JSX_TYPE, name: 'gif' };

    visit(ast, matcher, function (node) {
        const { attributes, children } = node;
        replaceNodeWithMarkdocTag({
            node,
            tagName: 'gif',
            attributes,
            children,
            config: {
                src: {
                    type: 'string',
                    name: 'imagePath',
                    transform: resourcesFolderTransform,
                },
                alt: 'alt',
                autoplay: 'autoPlay',
                wrapped: 'wrapped',
            },
        });
    });
}

function transformImageCaption(ast: any) {
    const matcher = (node: any) =>
        (node.type === JSX_TYPE || node.type === JSX_TEXT_TYPE) && node.name === 'image-caption';

    visit(ast, matcher, function (node) {
        const { attributes, children } = node;
        replaceNodeWithMarkdocTag({
            node,
            tagName: 'imageCaption',
            attributes,
            children,
            config: {
                src: {
                    type: 'string',
                    name: 'imagePath',
                    transform: resourcesFolderTransform,
                },
                alt: 'alt',
                centered: {
                    type: 'boolean',
                    name: 'centered',
                },
                constrained: {
                    type: 'boolean',
                    name: 'constrained',
                },
                descriptiontop: {
                    type: 'boolean',
                    name: 'descriptionTop',
                },
                width: 'width',
                height: 'height',
                minwidth: 'minWidth',
                maxwidth: 'maxWidth',
            },
        });
    });
}

/**
 * Div images that look like
 *
 * <div style="display: flex; justify-content: center;">
 *   <image-caption ...>...</image-caption>
 *   <image-caption ...>...</image-caption>
 * </div>
 */
function transformDivImageCaption(ast: any) {
    const matcher = { type: JSX_TYPE, name: 'div' };

    visit(ast, matcher, function (node) {
        const { attributes, children } = node;

        const styleValue = getAttributeValue({ attributes: attributes!, name: 'style' });
        const styleEntries =
            styleValue
                ?.split(';')
                ?.map((property: string) => {
                    const [, name, value] = property.match(/([^:]*):(.*)/) || [];

                    return name && value ? [name.trim(), value.trim()] : undefined;
                })
                .filter(Boolean) || [];
        const styleObj = Object.fromEntries(styleEntries);

        if (styleObj.display && styleObj['justify-content']) {
            // Unwrap `code` node
            const contentArray = children[0].value.split('\n');
            const imageCaptionChildren = contentArray.flatMap((contents: string, index: number) => {
                const ast = fromMarkdown(contents, {
                    extensions: [mdxJsx({ acorn, addResult: true })],
                    mdastExtensions: [mdxJsxFromMarkdown()],
                });
                transformImageCaption(ast);

                const astChildren = ast.children[0].children;
                return index < contentArray.length - 1 ? [...astChildren, brk] : astChildren;
            });

            const flexAttributes = [
                {
                    name: 'justifyContent',
                    value: styleObj['justify-content'],
                },
            ];
            replaceNodeWithMarkdocTag({
                node,
                tagName: 'flex',
                attributes: flexAttributes,
                children: imageCaptionChildren,
                config: {
                    justifyContent: 'justifyContent',
                },
            });
        }
    });
}

function transformVideoSection(ast: any) {
    const matcher = { type: JSX_TYPE, name: 'video-section' };

    visit(ast, matcher, function (node) {
        const { attributes, children } = node;
        replaceNodeWithMarkdocTag({
            node,
            tagName: 'videoSection',
            attributes,
            children,
            config: {
                id: 'id',
                title: 'title',
                header: {
                    type: 'boolean',
                    name: 'showHeader',
                },
            },
        });
    });
}

function transformLearningVideos(ast: any) {
    const matcher = { type: JSX_TYPE, name: 'learning-videos' };

    visit(ast, matcher, function (node) {
        const { attributes, children } = node;
        replaceNodeWithMarkdocTag({
            node,
            tagName: 'learningVideos',
            attributes,
            children,
        });
    });
}

export function transformResouces(ast: any) {
    transformImage(ast);
    transformImageCaption(ast);
    transformDivImageCaption(ast);
    transformGif(ast);
    transformVideoSection(ast);
    transformLearningVideos(ast);
}
