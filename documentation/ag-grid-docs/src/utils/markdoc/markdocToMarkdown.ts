import type { Framework } from '@ag-grid-types';
import { getExamplePageUrl } from '@components/docs/utils/urlPaths';
import { type RenderableTreeNode } from '@markdoc/markdoc';
import { getInternalFramework } from '@utils/framework';
import fs from 'fs';
import path from 'path';

import { transform as transformSnippet } from '../../components/snippet/snippetTransformer';
import { transformMarkdoc } from './transformMarkdoc';

export interface MarkdocToMarkdownOptions {
    framework?: Framework;
    baseUrl?: string;
}

/**
 * Convert markdoc content to standard markdown format for AI consumption
 */
export function markdocToMarkdown(content: string, options: MarkdocToMarkdownOptions = {}): string {
    const { framework = 'react', baseUrl = 'https://ag-grid.com' } = options;
    try {
        const { ast } = transformMarkdoc({ framework, markdocContent: content });
        const result = astToMarkdown(ast, {
            framework,
            baseUrl,
        });
        return result;
    } catch (error) {
        console.error('Error converting markdoc to markdown:', error);
        return content; // Return original content if conversion fails
    }
}

/**
 * Clean up unicode characters that don't render well in markdown
 */
function cleanupUnicodeChars(text: string): string {
    if (typeof text !== 'string') {
        return '';
    }

    return (
        text
            // Fix common unicode arrow characters
            .replace(/â†µ/g, '↵') // Enter key
            .replace(/â‡¥/g, '⇥') // Tab key
            .replace(/â†'/g, '→') // Right arrow
            .replace(/â†"/g, '←') // Left arrow
            .replace(/â†'/g, '↑') // Up arrow
            .replace(/â†"/g, '↓') // Down arrow
            // Fix quotes
            .replace(/â€œ/g, '"') // Left double quote
            .replace(/â€/g, '"') // Right double quote
            .replace(/â€™/g, "'") // Right single quote
            .replace(/â€˜/g, "'") // Left single quote
            // Fix dashes
            .replace(/â€"/g, '–') // En dash
            .replace(/â€"/g, '—') // Em dash
            // Fix other common unicode issues
            .replace(/â€¦/g, '...') // Ellipsis
            // Remove any remaining problematic unicode
            .replace(/[^\x00-\x7F]/g, (char) => {
                // Keep common symbols that are useful
                if (['→', '←', '↑', '↓', '↵', '⇥', '–', '—', '…'].includes(char)) {
                    return char;
                }
                return '';
            })
    );
}

/**
 * Convert AST to markdown string
 */
function astToMarkdown(ast: any, options: MarkdocToMarkdownOptions): string {
    if (!ast || !ast.children) {
        return '';
    }

    return ast.children.map((child: any) => astNodeToMarkdown(child, options, 0)).join('');
}

/**
 * Convert an AST node to markdown string
 */
function astNodeToMarkdown(node: any, options: MarkdocToMarkdownOptions, depth = 0): string {
    if (!node) {
        return '';
    }

    if (typeof node === 'string') {
        return cleanupUnicodeChars(node);
    }

    if (typeof node === 'number') {
        return String(node);
    }

    // Handle markdoc tags
    if (node.type === 'tag') {
        return handleMarkdocAstTag(node, options, depth);
    }

    // Handle standard markdown nodes
    switch (node.type) {
        case 'document':
            return node.children?.map((child: any) => astNodeToMarkdown(child, options, depth)).join('') || '';

        case 'heading':
            const level = node.attributes?.level || 1;
            const headingText =
                node.children?.map((child: any) => astNodeToMarkdown(child, options, depth)).join('') || '';
            return `${'#'.repeat(level)} ${headingText}\n\n`;

        case 'paragraph':
            const paragraphText =
                node.children?.map((child: any) => astNodeToMarkdown(child, options, depth)).join('') || '';
            return `${paragraphText}\n\n`;

        case 'text':
            const textValue = node.value || node.attributes.content || '';
            return cleanupUnicodeChars(textValue);

        case 'code':
            const codeContent = node.value || node.attributes.content || '';
            const language = node.attributes?.language || '';
            const codeFrameworkTransform = node.attributes?.frameworkTransform;
            const codeSuppressFrameworkContext = node.attributes?.suppressFrameworkContext;
            const codeSpaceBetweenProperties = node.attributes?.spaceBetweenProperties;
            const codeInlineReactProperties = node.attributes?.inlineReactProperties;

            // If it's inline code (no language and short content), render as inline
            if (!language && !codeContent.includes('\n')) {
                return `\`${codeContent}\``;
            }

            // Apply framework transformation if enabled
            if (codeFrameworkTransform && codeContent.trim()) {
                try {
                    const transformOptions = {
                        suppressFrameworkContext: codeSuppressFrameworkContext,
                        spaceBetweenProperties: codeSpaceBetweenProperties,
                        inlineReactProperties: codeInlineReactProperties,
                    };
                    const transformedContent = transformSnippet(codeContent, options.framework, transformOptions);
                    return `\`\`\`${language}\n ${transformedContent}\n\`\`\`\n\n`;
                } catch (error) {
                    console.error('Error transforming code snippet:', error);
                    // Fall back to original content if transformation fails
                }
            }

            return `\`\`\`${language}\n${codeContent}\n\`\`\`\n\n`;

        case 'fence':
            const fenceContent = node.attributes.content;
            const fenceLanguage = node.attributes.language ?? '';
            const frameworkTransform = node.attributes?.frameworkTransform;
            const suppressFrameworkContext = node.attributes?.suppressFrameworkContext;
            const spaceBetweenProperties = node.attributes?.spaceBetweenProperties;
            const inlineReactProperties = node.attributes?.inlineReactProperties;

            // Apply framework transformation if enabled
            if (frameworkTransform && fenceContent.trim()) {
                try {
                    const transformOptions = {
                        suppressFrameworkContext,
                        spaceBetweenProperties,
                        inlineReactProperties,
                    };
                    const transformedContent = transformSnippet(fenceContent, options.framework, transformOptions);
                    return `\`\`\`\n ${transformedContent}\n\`\`\`\n\n`;
                } catch (error) {
                    console.error('Error transforming snippet:', error);
                    // Fall back to original content if transformation fails
                }
            }

            return `\`\`\`${fenceLanguage}\n${fenceContent}\n\`\`\`\n\n`;

        case 'link':
            const linkHref = node.attributes?.href || '';
            const linkText =
                node.children?.map((child: any) => astNodeToMarkdown(child, options, depth)).join('') || '';
            return `[${linkText}](${linkHref})`;

        case 'list':
            const listType = node.attributes?.ordered ? 'ordered' : 'unordered';
            const listItems =
                node.children
                    ?.map((child: any, index: number) => {
                        const itemContent = astNodeToMarkdown(child, options, depth + 1);
                        if (listType === 'ordered') {
                            return `${index + 1}. ${itemContent.trim()}`;
                        } else {
                            return `- ${itemContent.trim()}`;
                        }
                    })
                    .join('\n') || '';
            return `${listItems}\n\n`;

        case 'item':
            return node.children?.map((child: any) => astNodeToMarkdown(child, options, depth)).join('') || '';

        case 'blockquote':
            const quoteContent =
                node.children?.map((child: any) => astNodeToMarkdown(child, options, depth)).join('') || '';
            return `> ${quoteContent}\n\n`;

        case 'strong':
            const strongContent =
                node.children?.map((child: any) => astNodeToMarkdown(child, options, depth)).join('') || '';
            return `**${strongContent}**`;

        case 'em':
            const emContent =
                node.children?.map((child: any) => astNodeToMarkdown(child, options, depth)).join('') || '';
            return `*${emContent}*`;

        case 'inline_code':
            return `\`${node.value || ''}\``;

        case 'table':
            const tableContent =
                node.children?.map((child: any) => astNodeToMarkdown(child, options, depth)).join('') || '';

            return `${tableContent}\n\n`;
        case 'thead':
            const theadContent =
                node.children?.map((child: any) => astNodeToMarkdown(child, options, depth)).join('') || '';
            const colCount = node.children[0]?.children?.length ?? 0;
            return `${theadContent}|${'-|'.repeat(colCount)}\n`;

        case 'tr':
            const rowContent =
                node.children?.map((child: any) => astNodeToMarkdown(child, options, depth)).join('') || '';
            return `| ${rowContent} \n`;

        case 'td':
        case 'th':
            const cellContent =
                node.children?.map((child: any) => astNodeToMarkdown(child, options, depth)).join('') || '';
            return `${cellContent} | `;

        default:
            // Handle unknown nodes by processing their children
            if (node.children) {
                return node.children.map((child: any) => astNodeToMarkdown(child, options, depth)).join('');
            }
            return '';
    }
}

/**
 * Handle markdoc AST tags and convert to markdown
 */
function handleMarkdocAstTag(node: any, options: MarkdocToMarkdownOptions, depth: number): string {
    const { framework, baseUrl } = options;
    const tagName = node.tag;
    const attributes = node.attributes || {};
    const children = node.children || [];

    // Convert common tags to markdown
    switch (tagName) {
        // Alert tags - inline content
        case 'note':
            const noteContent = children.map((child: any) => astNodeToMarkdown(child, options, depth)).join('');
            return `> **Note:** ${noteContent}\n\n`;

        case 'warning':
            const warningContent = children.map((child: any) => astNodeToMarkdown(child, options, depth)).join('');
            return `> **Warning:** ${warningContent}\n\n`;

        case 'idea':
            const ideaContent = children.map((child: any) => astNodeToMarkdown(child, options, depth)).join('');
            return `> **Idea:** ${ideaContent}\n\n`;

        // UI elements - inline content
        case 'kbd':
            const kbdContent =
                attributes.primary || children.map((child: any) => astNodeToMarkdown(child, options, depth)).join('');
            return `\`${cleanupUnicodeChars(kbdContent)}\``;

        case 'enterpriseIcon':
            return ' 🏢';

        case 'br':
            return '\n';

        // Media tags - linked content
        case 'image':
            const imagePath = attributes.imagePath;
            const alt = attributes.alt || '';
            const width = attributes.width ? ` width="${attributes.width}"` : '';
            const height = attributes.height ? ` height="${attributes.height}"` : '';
            return `![${alt}](${imagePath})${width || height ? `<!-- ${width}${height} -->` : ''}\n\n`;

        case 'video':
            const videoSrc = attributes.videoSrc;
            const videoTitle = 'Video';
            if (videoSrc) {
                return `[${videoTitle}](${videoSrc})\n\n`;
            }
            return `<!-- Video component -->\n\n`;

        case 'videoSection':
            const videoSectionId = attributes.id;
            const videoSectionTitle = attributes.title || 'Video Section';
            if (videoSectionId) {
                return `## ${videoSectionTitle}\n\n[Watch Video](https://www.youtube.com/watch?v=${videoSectionId})\n\n`;
            }
            return `## ${videoSectionTitle}\n\n`;

        // Layout components - inline content
        case 'tabs':
            const tabsContent = children.map((child: any) => astNodeToMarkdown(child, options, depth)).join('');
            return `${tabsContent}\n\n`;

        case 'tabItem':
            const tabId = attributes.id;
            const tabLabel = attributes.label || tabId;
            const tabContent = children.map((child: any) => astNodeToMarkdown(child, options, depth)).join('');
            return `### ${tabLabel}\n\n${tabContent}\n\n`;

        case 'expandingSection':
            const expandingTitle = attributes.headerText || 'Section';
            const expandingContent = children.map((child: any) => astNodeToMarkdown(child, options, depth)).join('');
            return `<details>\n<summary>${expandingTitle}</summary>\n\n${expandingContent}\n</details>\n\n`;

        case 'numberHeading':
            const number = attributes.number || '';
            const title = attributes.title || '';
            const level = attributes.level || 'h2';
            const headingLevel = parseInt(level.replace('h', '')) || 2;
            return `${'#'.repeat(headingLevel)} ${number}. ${title}\n\n`;

        // Code and documentation - inline or linked based on type
        case 'embedSnippet':
            const snippetSrc = attributes.src;
            const snippetUrl = attributes.url;
            const language = attributes.language || '';

            if (snippetUrl) {
                // For external URLs, we can only link
                return `**Code Snippet:** [${snippetUrl}](${snippetUrl})\n\n`;
            } else if (snippetSrc) {
                // For internal snippets, show a placeholder for the actual content
                return `\`\`\`${language}\n// Code snippet: ${snippetSrc}\n// TODO: Inline actual snippet content here\n\`\`\`\n\n`;
            }
            return `**Code Snippet**\n\n`;

        // AG Grid specific tags - linked content for examples, inline for docs
        case 'gridExampleRunner':
            const exampleTitle = attributes.title || 'Example';
            const exampleName = attributes.name || 'example';

            const jsInternalFramework = getInternalFramework({
                framework: framework ?? 'javascript',
                useTypescript: false,
            });
            const tsInternalFramework = getInternalFramework({
                framework: framework ?? 'javascript',
                useTypescript: true,
            });

            if (jsInternalFramework !== tsInternalFramework) {
                return `${exampleTitle}: [Javascript Example](./examples/${exampleName}/${jsInternalFramework}/contents.json) [Typescript Example](./examples/${exampleName}/${tsInternalFramework}/contents.json)\n\n`;
            }
            return `View [${exampleTitle} Example](./examples/${exampleName}/${jsInternalFramework}/content.json)\n\n`;

        case 'apiDocumentation':
            return inlineApiDocumentation(attributes, options);

        case 'interfaceDocumentation':
            return inlineInterfaceDocumentation(attributes, options);

        case 'matrixTable':
            const tableUrl = `${baseUrl}/${framework}-data-grid/feature-matrix`;
            return `**Feature Matrix**\n\n[View Feature Matrix](${tableUrl})\n\n`;

        // Generic components
        case 'flex':
            const flexContent = children.map((child: any) => astNodeToMarkdown(child, options, depth)).join('');
            return `${flexContent}\n\n`;

        case 'touchimage':
            const touchImagePath = attributes.imagePath;
            const touchImageAlt = attributes.alt || '';
            return `![${touchImageAlt}](${touchImagePath})\n\n`;

        case 'imageCaption':
            const captionContent = children.map((child: any) => astNodeToMarkdown(child, options, depth)).join('');
            return `*${captionContent}*\n\n`;

        case 'majorTable':
            const majorTableContent = children.map((child: any) => astNodeToMarkdown(child, options, depth)).join('');
            return `${majorTableContent}\n\n`;

        // Feature sections and other complex components - inline content
        case 'featuresSection':
        case 'getChangelogSection':
        case 'getDocumentationArchiveSection':
        case 'getting-started':
        case 'oneTrustCookies':
        case 'openInCTA':
        case 'trialLicenceForm':
            const componentContent = children.map((child: any) => astNodeToMarkdown(child, options, depth)).join('');
            return `<!-- ${tagName} component -->\n${componentContent}\n\n`;

        default:
            // For unknown tags, try to render children
            const childContent = children.map((child: any) => astNodeToMarkdown(child, options, depth)).join('');
            if (childContent.trim()) {
                return `<!-- ${tagName} -->\n${childContent}\n\n`;
            }

            // Return a placeholder for empty tags
            return `<!-- ${tagName} component -->\n\n`;
    }
}

/**
 * Convert a render tree node to markdown string
 */
function renderTreeToMarkdown(node: RenderableTreeNode, options: MarkdocToMarkdownOptions, depth = 0): string {
    if (typeof node === 'string') {
        return cleanupUnicodeChars(node);
    }

    if (typeof node === 'number') {
        return String(node);
    }

    if (node === null || node === undefined) {
        return '';
    }

    if (Array.isArray(node)) {
        return node.map((child) => renderTreeToMarkdown(child, options, depth)).join('');
    }

    if (typeof node === 'object' && node.$$mdtype === 'Tag') {
        return handleMarkdocTag(node, options, depth);
    }

    if (typeof node === 'object' && node.$$mdtype === 'Node') {
        return handleMarkdocNode(node, options, depth);
    }

    // Handle React components/functions (these appear as functions in the render tree)
    if (typeof node === 'function') {
        // Try to extract component name or return empty string
        const name = (node as any).name || (node as any).displayName;
        if (name) {
            return `<!-- ${name} component -->\n`;
        }
        return '';
    }

    // Handle other object types
    if (typeof node === 'object' && node.name) {
        return handleMarkdocTag(node, options, depth);
    }

    return '';
}

/**
 * Handle markdoc tags and convert to markdown or links
 */
function handleMarkdocTag(node: any, options: MarkdocToMarkdownOptions, depth: number): string {
    const { framework, baseUrl } = options;
    const tagName = node.name;
    const attributes = node.attributes || {};
    const children = node.children || [];

    // Framework-specific content is always included

    // Convert common tags to markdown
    switch (tagName) {
        case 'note':
            return `> **Note:** ${renderChildren(children, options, depth)}\n\n`;

        case 'warning':
            return `> **Warning:** ${renderChildren(children, options, depth)}\n\n`;

        case 'idea':
            return `> **Idea:** ${renderChildren(children, options, depth)}\n\n`;

        case 'kbd':
            const kbdContent = attributes.key || renderChildren(children, options, depth);
            return `\`${cleanupUnicodeChars(kbdContent)}\``;

        case 'image':
            const imagePath = attributes.imagePath || attributes.src;
            const alt = attributes.alt || '';
            return `![${alt}](${imagePath})\n\n`;

        case 'video':
            const videoId = attributes.id;
            const videoTitle = attributes.title || 'Video';
            return `[${videoTitle}](https://www.youtube.com/watch?v=${videoId})\n\n`;

        case 'videoSection':
            const sectionVideoId = attributes.id;
            const videoSectionTitle = attributes.title || 'Video Section';
            return `## ${videoSectionTitle}\n\n[Watch Video](https://www.youtube.com/watch?v=${sectionVideoId})\n\n`;

        case 'tabs':
            return `${renderChildren(children, options, depth)}\n\n`;

        case 'tabItem':
            const tabTitle = attributes.title || 'Tab';
            return `### ${tabTitle}\n\n${renderChildren(children, options, depth)}\n\n`;

        case 'br':
            return '\n';

        case 'link':
            const href = attributes.href || attributes.url;
            const linkText = renderChildren(children, options, depth);
            return `[${linkText}](${href})`;

        case 'enterpriseIcon':
            return ' 🏢';

        case 'gridExampleRunner':
            const exampleTitle = attributes.title || 'Example';
            const exampleName = attributes.name || 'example';

            const exampleUrl = getExamplePageUrl({ framework, path: exampleName });

            const jsInternalFramework = getInternalFramework({
                framework: framework ?? 'javascript',
                useTypescript: false,
            });
            const tsInternalFramework = getInternalFramework({
                framework: framework ?? 'javascript',
                useTypescript: true,
            });

            if (jsInternalFramework !== tsInternalFramework) {
                return `${exampleTitle}: [Javascript Example](${exampleUrl}/${jsInternalFramework}/contents.json) [Typescript Example](${exampleUrl}/${tsInternalFramework}/contents.json)\n\n`;
            }
            return `View [${exampleTitle} Example](${exampleUrl}/${jsInternalFramework}/content.json)\n\n`;

        case 'apiDocumentation':
            const apiUrl = `${baseUrl}/${framework}-data-grid/api-reference`;
            return `**API Documentation**\n\n[View API Reference](${apiUrl})\n\n`;

        case 'interfaceDocumentation':
            const interfaceName = attributes.interfaceName;
            const interfaceUrl = `${baseUrl}/${framework}-data-grid/api-reference#${interfaceName}`;
            return `**Interface: ${interfaceName}**\n\n[View Interface](${interfaceUrl})\n\n`;

        case 'matrixTable':
            const tableUrl = `${baseUrl}/${framework}-data-grid/feature-matrix`;
            return `**Feature Matrix**\n\n[View Feature Matrix](${tableUrl})\n\n`;

        case 'iframe':
            const iframeSrc = attributes.src;
            return `[View Content](${iframeSrc})\n\n`;

        case 'embedSnippet':
            const snippetUrl = attributes.src;
            return `[View Code Snippet](${snippetUrl})\n\n`;

        case 'gif':
            const gifPath = attributes.imagePath;
            const gifAlt = attributes.alt || 'GIF';
            return `![${gifAlt}](${gifPath})\n\n`;

        case 'flex':
            return `${renderChildren(children, options, depth)}\n\n`;

        case 'expandingSection':
            const sectionTitle = attributes.title || 'Section';
            return `<details>\n<summary>${sectionTitle}</summary>\n\n${renderChildren(children, options, depth)}\n</details>\n\n`;

        case 'numberHeading':
            const headingLevel = attributes.level || 2;
            const headingText = renderChildren(children, options, depth);
            return `${'#'.repeat(headingLevel)} ${headingText}\n\n`;

        case 'learningVideos':
            const learningTitle = attributes.title || 'Learning Videos';
            const learningId = attributes.id;
            const learningUrl = learningId ? `${baseUrl}/videos/${learningId}` : `${baseUrl}/videos`;
            return `**${learningTitle}**\n\n[View Videos](${learningUrl})\n\n`;

        case 'metaTag':
            const tags = attributes.tags || [];
            return `**Tags:** ${tags.join(', ')}\n\n`;

        case 'majorTable':
            const tableTitle = attributes.title || 'Table';
            return `**${tableTitle}**\n\n[View Table](${baseUrl})\n\n`;

        default:
            // For unknown tags, try to render children or create a generic link
            const childContent = renderChildren(children, options, depth);
            if (childContent) {
                return childContent;
            }

            // Create a generic link for unhandled tags
            const genericUrl = `${baseUrl}/${framework}-data-grid/`;
            return `[${tagName}](${genericUrl})\n\n`;
    }
}

/**
 * Handle markdoc nodes and convert to markdown
 */
function handleMarkdocNode(node: any, options: MarkdocToMarkdownOptions, depth: number): string {
    const nodeType = node.type;
    const attributes = node.attributes || {};
    const children = node.children || [];

    switch (nodeType) {
        case 'heading':
            const level = attributes.level || 1;
            const headingText = renderChildren(children, options, depth);
            return `${'#'.repeat(level)} ${headingText}\n\n`;

        case 'paragraph':
            return `${renderChildren(children, options, depth)}\n\n`;

        case 'text':
            return node.attributes.content || '';

        case 'code':
            const codeContent = node.attributes.content || '';
            const language = attributes.language || '';
            const frameworkTransform = attributes.frameworkTransform;
            const suppressFrameworkContext = attributes.suppressFrameworkContext;
            const spaceBetweenProperties = attributes.spaceBetweenProperties;
            const inlineReactProperties = attributes.inlineReactProperties;

            if (frameworkTransform && codeContent.trim()) {
                try {
                    const transformOptions = {
                        suppressFrameworkContext,
                        spaceBetweenProperties,
                        inlineReactProperties,
                    };
                    const transformedContent = transformSnippet(codeContent, options.framework, transformOptions);
                    return `\`\`\`${language}\n${transformedContent}\n\`\`\`\n\n`;
                } catch (error) {
                    console.error('Error transforming render tree code:', error);
                    // Fall back to original content if transformation fails
                }
            }

            return `\`\`\`${language}\n${codeContent}\n\`\`\`\n\n`;

        case 'fence':
            const fenceContent = node.attributes.content || '';
            const fenceLanguage = attributes.language || '';
            return `\`\`\`${fenceLanguage}\n${fenceContent}\n\`\`\`\n\n`;

        case 'link':
            const linkHref = attributes.href || attributes.url;
            const linkText = renderChildren(children, options, depth);
            return `[${linkText}](${linkHref})`;

        case 'list':
            const listType = attributes.ordered ? 'ordered' : 'unordered';
            const listItems = children
                .map((child: any, index: number) => {
                    const itemContent = renderTreeToMarkdown(child, options, depth + 1);
                    if (listType === 'ordered') {
                        return `${index + 1}. ${itemContent.trim()}`;
                    } else {
                        return `- ${itemContent.trim()}`;
                    }
                })
                .join('\n');
            return `${listItems}\n\n`;

        case 'item':
            return renderChildren(children, options, depth);

        case 'blockquote':
            const quoteContent = renderChildren(children, options, depth);
            return `> ${quoteContent}\n\n`;

        case 'table':
            // Simple table handling - for complex tables, link to original
            const tableContent = renderChildren(children, options, depth);
            return `${tableContent}\n\n`;

        case 'thead':
            const colCount = children.length;
            return `${renderChildren(children, options, depth)}|${'-|'.repeat(colCount)}`;
        case 'tr':
            return `| ${renderChildren(children, options, depth)} \n`;

        case 'td':
        case 'th':
            return `${renderChildren(children, options, depth)} | `;

        case 'strong':
            return `**${renderChildren(children, options, depth)}**`;

        case 'em':
            return `*${renderChildren(children, options, depth)}*`;

        case 'inline_code':
            return `\`${node.attributes.content || renderChildren(children, options, depth)}\``;

        default:
            return renderChildren(children, options, depth);
    }
}

/**
 * Render children nodes
 */
function renderChildren(children: any[], options: MarkdocToMarkdownOptions, depth: number): string {
    if (!Array.isArray(children)) {
        return '';
    }

    return children.map((child) => renderTreeToMarkdown(child, options, depth)).join('');
}

/**
 * Inline API documentation with rich context
 */
function inlineApiDocumentation(attributes: any, options: MarkdocToMarkdownOptions): string {
    const apiSection = attributes.section;
    const apiNames = attributes.names;
    const source = attributes.source;
    const sources = attributes.sources;

    if (!apiSection && !apiNames && !source && !sources) {
        return `**API Documentation**\n\n`;
    }

    let result = '';

    try {
        // Load the API data using the same logic as the official component
        const apiData = loadApiDocumentationData({ source, sources, section: apiSection });

        if (apiSection && apiNames && apiData) {
            result += `**API Documentation (${apiSection}):**\n\n`;

            for (const name of apiNames) {
                const propData = apiData[name];
                if (propData) {
                    result += formatApiPropertyMarkdown(name, propData, options);
                } else {
                    result += `### \`${name}\`\n\n*No documentation available*\n\n`;
                }
            }
        } else if (apiNames && apiData) {
            result += `**API Documentation:**\n\n`;

            for (const name of apiNames) {
                const propData = apiData[name];
                if (propData) {
                    result += formatApiPropertyMarkdown(name, propData, options);
                } else {
                    result += `### \`${name}\`\n\n*No documentation available*\n\n`;
                }
            }
        } else if (source) {
            result += `**API Documentation:**\n\nSource: ${source}\n\n`;
        } else {
            result += `**API Documentation**\n\n`;
        }
    } catch (error) {
        // Fallback to simple list if data loading fails
        if (apiNames) {
            result += apiNames.map((name: string) => `### \`${name}\`\n\n*Documentation not available*\n\n`).join('');
        } else {
            result += `**API Documentation**\n\n`;
        }
    }

    return result;
}

/**
 * Inline interface documentation with type information
 */
function inlineInterfaceDocumentation(attributes: any, options: MarkdocToMarkdownOptions): string {
    const interfaceName = attributes.interfaceName;
    const names = attributes.names;
    const exclude = attributes.exclude;
    const config = attributes.config || {};

    if (!interfaceName) {
        return `**Interface Documentation**\n\n`;
    }

    let result = `**Interface: \`${interfaceName}\`**\n\n`;

    try {
        // Load interface data using the same logic as the official component
        const interfaceData = loadInterfaceData(interfaceName);
        const codeData = loadCodeInterfaceData(interfaceName);

        if (interfaceData) {
            // Add interface description if available
            if (interfaceData.meta?.comment) {
                result += `${interfaceData.meta.comment}\n\n`;
            }

            // Show the interface properties
            if (interfaceData.type && typeof interfaceData.type === 'object') {
                result += `**Properties:**\n\n`;

                const properties = Object.entries(interfaceData.type)
                    .filter(([propName]) => {
                        // Apply name filtering
                        if (names && names.length > 0) {
                            return names.includes(propName.replace('?', ''));
                        }
                        if (exclude && exclude.length > 0) {
                            return !exclude.includes(propName.replace('?', ''));
                        }
                        return true;
                    })
                    .sort(([a], [b]) => (config.sortAlphabetically ? a.localeCompare(b) : 0));

                for (const [propName, propType] of properties) {
                    const cleanPropName = propName.replace('?', '');
                    const isOptional = propName.includes('?');
                    const propDoc = interfaceData.docs?.[propName];
                    const codeDoc = codeData?.[cleanPropName];

                    result += formatInterfacePropertyMarkdown(
                        cleanPropName,
                        {
                            type: propType,
                            optional: isOptional,
                            documentation: propDoc,
                            codeDoc,
                        },
                        options
                    );
                }
            }
        }
    } catch (error) {
        // Fallback if data loading fails
        if (names && names.length > 0) {
            result += names.map((name: string) => `### \`${name}\`\n\n*Documentation not available*\n\n`).join('');
        }
    }

    return result;
}

/**
 * Load API documentation data similar to the official component
 */
function loadApiDocumentationData({
    source,
    sources,
    section,
}: {
    source?: string;
    sources?: string[];
    section?: string;
}): any {
    try {
        const sourcesToLoad = source ? [source] : sources || [];
        let mergedData = {};

        for (const src of sourcesToLoad) {
            // Load the content file
            const contentPath = path.join(
                process.cwd(),
                'src/content/api-documentation',
                src.replace('.json', '') + '.json'
            );
            if (fs.existsSync(contentPath)) {
                const contentData = JSON.parse(fs.readFileSync(contentPath, 'utf-8'));

                // Load the code reference file if specified
                if (contentData._config_?.codeSrc) {
                    const codePath = path.join(process.cwd(), 'dist/files/reference', contentData._config_.codeSrc);
                    if (fs.existsSync(codePath)) {
                        const codeData = JSON.parse(fs.readFileSync(codePath, 'utf-8'));

                        // Merge the data, prioritizing code data
                        mergedData = { ...mergedData, ...contentData, ...codeData };
                    }
                }

                // If section is specified, navigate to it
                if (section) {
                    const sectionPath = section.split('.');
                    let sectionData = contentData;
                    for (const key of sectionPath) {
                        sectionData = sectionData[key];
                        if (!sectionData) break;
                    }
                    if (sectionData) {
                        mergedData = { ...mergedData, ...sectionData };
                    }
                }
            }
        }

        return mergedData;
    } catch (error) {
        console.warn('Failed to load API documentation data:', (error as Error).message);
        return null;
    }
}

/**
 * Load interface data from JSON files
 */
function loadInterfaceData(interfaceName: string): any {
    try {
        // Try to load from interfaces file
        const interfacesPath = path.join(process.cwd(), 'dist/files/reference/interfaces.AUTO.json');
        if (fs.existsSync(interfacesPath)) {
            const data = JSON.parse(fs.readFileSync(interfacesPath, 'utf-8'));
            return data[interfaceName];
        }
    } catch (error) {
        console.warn('Failed to load interface data:', (error as Error).message);
    }

    return null;
}

/**
 * Load code interface documentation data
 */
function loadCodeInterfaceData(interfaceName: string): any {
    try {
        const codePath = path.join(process.cwd(), 'dist/files/reference/doc-interfaces.AUTO.json');
        if (fs.existsSync(codePath)) {
            const data = JSON.parse(fs.readFileSync(codePath, 'utf-8'));
            return data[interfaceName];
        }
    } catch (error) {
        console.warn('Failed to load code interface data:', (error as Error).message);
    }

    return null;
}

/**
 * Format an API property with rich markdown information
 */
function formatApiPropertyMarkdown(name: string, propData: any, _options: MarkdocToMarkdownOptions): string {
    let result = `### \`${name}\`\n\n`;

    // Add comment/description from meta or direct property
    const comment = propData.meta?.comment || propData.comment || propData.description;
    if (comment) {
        result += `${comment}\n\n`;
    }

    // Add type information
    if (propData.type?.returnType) {
        result += `**Type:** \`${propData.type.returnType}\`\n\n`;
    } else if (propData.type) {
        result += `**Type:** \`${propData.type}\`\n\n`;
    }

    // Add module information with enterprise status
    const moduleTag = propData.meta?.tags?.find((tag: any) => tag.name === 'agModule');
    if (moduleTag) {
        const moduleComment = moduleTag.comment || moduleTag.modules?.map((m: any) => m.name).join(', ');
        result += `**Module:** ${moduleComment}`;

        // Add enterprise indicator if available
        if (moduleTag.modules?.some((m: any) => m.isEnterprise)) {
            result += ' 🏢';
        }
        result += '\n\n';
    }

    // Add default value if available
    if (propData.default !== undefined) {
        result += `**Default:** \`${propData.default}\`\n\n`;
    }

    // Add additional metadata
    if (propData.more?.name && propData.more?.url) {
        result += `**See also:** [${propData.more.name}](${propData.more.url})\n\n`;
    }

    return result;
}

/**
 * Format an interface property with comprehensive type information
 */
function formatInterfacePropertyMarkdown(name: string, propData: any, _options: MarkdocToMarkdownOptions): string {
    let result = `### \`${name}\`\n\n`;

    // Add documentation/description
    const documentation = propData.documentation || propData.codeDoc?.meta?.comment || propData.description;
    if (documentation) {
        // Clean up JSDoc formatting
        const cleanDoc = documentation
            .replace(/\*\//g, '')
            .replace(/\/\*\*/g, '')
            .trim();
        result += `${cleanDoc}\n\n`;
    }

    // Add type information
    if (propData.type) {
        const typeStr = typeof propData.type === 'string' ? propData.type : JSON.stringify(propData.type);
        result += `**Type:** \`${typeStr}\``;

        // Add optional indicator
        if (propData.optional) {
            result += ' *(optional)*';
        }
        result += '\n\n';
    }

    // Add module information if available from code documentation
    if (propData.codeDoc?.meta?.tags) {
        const moduleTag = propData.codeDoc.meta.tags.find((tag: any) => tag.name === 'agModule');
        if (moduleTag) {
            result += `**Module:** ${moduleTag.comment}\n\n`;
        }
    }

    // Add default value if available
    if (propData.default !== undefined) {
        result += `**Default:** \`${propData.default}\`\n\n`;
    }

    return result;
}
