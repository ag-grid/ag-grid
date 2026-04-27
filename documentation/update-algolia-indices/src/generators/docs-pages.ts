import fs from 'fs';
import { JSDOM, VirtualConsole } from 'jsdom';

import { MIGRATION_DOCS_RANK_OFFSET } from '../config';
import type { AlgoliaRecord } from '../types/algolia';
import {
    API_FILE_PATH,
    DIST_DIR,
    DOC_SOURCE_DIR,
    MENU_FILE_PATH,
    MIGRATION_DOC_BREADCRUMB_PREFIX,
    MIGRATION_DOC_PREFIX,
} from '../utils/constants';
import { logWarning } from '../utils/output';

const virtualConsole = new VirtualConsole();
// this ignores console errors, this is because JSDOM does not have comprehensive
// css support, and crashes on some pages
virtualConsole.on('error', () => {});

const truncateAtWordBoundary = (text: string, targetLength: number, maxLength: number): string => {
    if (text.length <= targetLength) {
        return text;
    }
    text = text.slice(0, maxLength);
    // Truncate at the first space after targetLength
    return text.slice(0, text.indexOf(' ', targetLength)) + '...';
};

/**
 * Extract searchable code words from documentation HTML source text
 */
export const extractCodeWords = (text: string): string[] => {
    const allWords: string[] = [];

    // Extract code words from <code>word</code> and `word`, here we match code
    // samples so that e.g. "new agGrid.Grid()" appears as a code word, matching
    // the behaviour of the old manually-maintained metaTags for migration pages
    allWords.push(...(text.match(/(?<=<code>|`)([.\w()-]|, |new )*(?=<\/code>|`)/g) ?? []));

    // Strip the inner content of <style> tags which are automatically inserted
    // and shouldn't be searchable
    text = text.replace(/<style.*?>.*?<\/style>/gs, '');

    // Remove <wbr> tags without replacing with space, so that camelCase words
    // split for display (e.g. process<wbr/>Cell<wbr/>Callback) are rejoined
    text = text.replace(/<wbr\s*\/?>/gi, '');

    // strip all HTML tags so that names and content of attributes aren't searchable
    text = text.replace(/<.*?>/gs, ' ');

    allWords.push(...(text.match(/\b[a-zA-Z]*[a-z][A-Z][a-zA-Z]*\b/g) ?? []));

    return [...new Set(allWords)];
};

let pageRank = 0;

export const getAllDocPages = (): FlattenedMenuItem[] => {
    const docsMenu = getDocsMenuData();
    const apiMenu = getApiMenuData();
    pageRank = 0;

    return [
        ...getFlattenedMenuItems(docsMenu.sections),
        ...getFlattenedMenuItems(apiMenu.sections).map((item) => ({
            ...item,
            isApiPage: true,
        })),
        ...getFlattenedDocMigrationItems(),
    ];
};

function getHeadingContent(heading: Element) {
    const cleanHeading = heading.cloneNode(true);
    for (const child of cleanHeading.children) {
        if (
            // Exclude `Copy` link in headings
            child.textContent.trim() === 'Copy Link'
        ) {
            cleanHeading.removeChild(child);
        }
    }

    return cleanHeading.textContent?.trim() || '';
}

export const parseDocPage = async (item: FlattenedMenuItem) => {
    const filePath = `${DIST_DIR}${item.path}/index.html`;

    if (!fs.existsSync(filePath)) {
        return null;
    }
    const { title, rank, breadcrumb, path } = item;
    const records: AlgoliaRecord[] = [];
    const dom = await JSDOM.fromFile(filePath, { virtualConsole });

    const titleTag = dom.window.document.querySelector('h1');
    const pageTitle = extractTitle({ dom, titleTag });
    if (pageTitle !== title) {
        logWarning({ pageTitle, title, filePath, message: 'Title mismatched to navbar.' });
    }

    const container = dom.window.document.querySelector('#doc-content article')?.firstChild;
    if (!container) {
        logWarning({ title, filePath, message: 'No content found.' });
        return null;
    }

    let heading: string | undefined = undefined;
    let subHeading: string | undefined = undefined;
    let text = '';
    let position = 0;

    const createPreviousRecord = () => {
        // Because content for the header comes after the header
        // we need to create a record for the previous section
        // after we find the next one.
        const kebabCaseHeading = (subHeading ?? heading)?.replace(/\s+/g, '-').toLowerCase();
        const hashPath = heading ? `${path}#${kebabCaseHeading}` : path;

        // Extract codeWords from raw text (before cleaning) to capture code examples
        const codeWords = extractCodeWords(text);
        const positionInPage = position++;

        records.push({
            source: 'docs',
            objectID: `${hashPath}:${positionInPage}`,
            breadcrumb,
            title: pageTitle || title,
            heading,
            subHeading,
            path: hashPath,
            text: truncateAtWordBoundary(cleanContents(text), 120, 250),
            codeWords: codeWords.length > 0 ? codeWords : undefined,
            rank,
            positionInPage,
        });
    };

    const recursivelyParseContent = (container: Element | null) => {
        for (let currentTag = container; currentTag != null; currentTag = currentTag.nextElementSibling) {
            try {
                if (currentTag.nodeName.toLowerCase() === 'style') {
                    continue;
                }

                if (currentTag.nodeName.toLowerCase() === 'pre') {
                    // Wrap in <pre> tags so cleanContents can strip it for display text
                    // while preserving it for codeWords extraction
                    text += `\n<pre>${currentTag.innerHTML}</pre>`;
                    continue;
                }

                // Process API reference tables by extracting each property as a
                // separate record with the property name as a subHeading
                if (currentTag.hasAttribute?.('data-api-reference-table')) {
                    if (item.isApiPage) {
                        continue;
                    }
                    for (const prop of currentTag.querySelectorAll('[data-api-property]')) {
                        const nameEl = prop.querySelector('[data-api-property-name]');
                        if (!nameEl) continue;
                        const propertyName = getHeadingContent(nameEl);
                        const anchor = nameEl.id;
                        const descEl = prop.querySelector('[data-api-property-description]');
                        const descHtml = descEl?.innerHTML ?? '';
                        const descCodeWords = extractCodeWords(descHtml);
                        const positionInPage = position++;
                        const propertyPath = anchor ? `${path}#${anchor}` : path;
                        records.push({
                            source: 'docs',
                            objectID: `${propertyPath}:${positionInPage}`,
                            breadcrumb,
                            title: pageTitle || title,
                            heading: [subHeading || heading, propertyName].filter(Boolean).join(' > ') || undefined,
                            subHeading: propertyName,
                            path: propertyPath,
                            text: truncateAtWordBoundary(cleanContents(descHtml), 120, 250),
                            codeWords: descCodeWords.length > 0 ? descCodeWords : undefined,
                            rank,
                            positionInPage,
                        });
                    }
                    continue;
                }

                switch (currentTag.nodeName) {
                    // split records based on H2 and H3 tags
                    case 'H2': {
                        createPreviousRecord();
                        heading = getHeadingContent(currentTag);
                        subHeading = undefined;
                        text = '';
                        break;
                    }

                    case 'H3':
                    case 'H4': {
                        createPreviousRecord();
                        subHeading = getHeadingContent(currentTag);
                        text = '';
                        break;
                    }

                    case 'DIV':
                    case 'ASTRO-ISLAND': {
                        createPreviousRecord();
                        // process content inside div/astro-island containers
                        recursivelyParseContent(currentTag.firstChild as Element | null);
                        break;
                    }

                    default: {
                        const contents = currentTag.innerHTML || currentTag.textContent;

                        if (currentTag.nodeName === 'A' && contents?.includes('Example: <!-- -->')) {
                            // exclude example runner titles
                            continue;
                        }

                        // append all HTML content
                        text += `\n${currentTag.innerHTML || currentTag.textContent}`;
                    }
                }
            } catch (e) {
                console.error(`Unable to parse content, got stuck at element: `, currentTag, e);
            }
        }
    };
    recursivelyParseContent(container as Element);
    createPreviousRecord();

    return records;
};

interface MenuItem {
    title: string;
    path?: string;
    children?: MenuItem[];
}

const getDocsMenuData = () => {
    const file = fs.readFileSync(MENU_FILE_PATH, 'utf-8');
    const docsMenuData = JSON.parse(file);

    return docsMenuData;
};

function extractMigrationTitle(fileContents: string) {
    const regex = /^title:\s+"(.*)"$/m;
    const match = fileContents.match(regex);
    return match ? match[1] : null;
}

const getFlattenedDocMigrationItems = (): FlattenedMenuItem[] => {
    const entries = fs.readdirSync(DOC_SOURCE_DIR, { withFileTypes: true });

    return entries
        .filter((entry) => entry.isDirectory() && entry.name.startsWith(MIGRATION_DOC_PREFIX))
        .map((entry) => {
            const filePath = `${DOC_SOURCE_DIR}/${entry.name}/index.mdoc`;
            const fileContents = fs.readFileSync(filePath, 'utf-8');
            const title = extractMigrationTitle(fileContents) || entry.name;

            return {
                title,
                path: entry.name,
                rank: pageRank++ + MIGRATION_DOCS_RANK_OFFSET,
                breadcrumb: `${MIGRATION_DOC_BREADCRUMB_PREFIX} > ${title}`,
            };
        });
};

const getApiMenuData = () => {
    const file = fs.readFileSync(API_FILE_PATH, 'utf-8');
    const apiMenuData = JSON.parse(file);

    return apiMenuData;
};

export interface FlattenedMenuItem {
    title: string;
    path: string;
    rank: number;
    breadcrumb: string;
    isApiPage?: boolean;
}

const getFlattenedMenuItems = (
    menuItems: MenuItem[],
    result: FlattenedMenuItem[] = [],
    prefix?: string
): FlattenedMenuItem[] => {
    menuItems.forEach((item) => {
        if (item.path) {
            result.push({
                title: item.title,
                path: item.path,
                rank: pageRank++,
                breadcrumb: prefix ? `${prefix} > ${item.title}` : item.title,
            });
        }
        if (item.children) {
            getFlattenedMenuItems(item.children, result, prefix ? `${prefix} > ${item.title}` : item.title);
        }
    });
    return result;
};

const disallowedTags = ['style', 'pre'];
const cleanContents = (contents: string): string => {
    disallowedTags.forEach(
        (tag) => (contents = contents.replace(new RegExp(`<${tag}(\\s.*?)?>.*?</${tag}>`, 'gs'), ''))
    );

    return contents
        .replace(/<.*?>/gs, ' ') // remove tags
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&.*?;/g, '') // remove HTML characters
        .replace(/\s+/g, ' ') // compress whitespace
        .replace(/\s+([.,?!:)])/g, '$1')
        .replace(/\(\s+/g, '(') // neaten punctuation
        .trim();
};

const extractTitle = ({ dom, titleTag }: { dom: JSDOM; titleTag: HTMLElement | null }) => {
    let extractedText = '';

    // Only extract text node
    titleTag?.childNodes.forEach((node) => {
        if (node.nodeType === dom.window.Node.TEXT_NODE) {
            extractedText += node?.textContent?.trim();
        }
    });
    return extractedText;
};
