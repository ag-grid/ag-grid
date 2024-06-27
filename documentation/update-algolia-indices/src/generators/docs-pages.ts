import fs from 'fs';
import { JSDOM, VirtualConsole } from 'jsdom';

import { DIST_DIR, MENU_FILE_PATH, SUPPORTED_FRAMEWORKS } from '../utils/constants';
import { logWarning, writeResults } from '../utils/output';

const virtualConsole = new VirtualConsole();
// this ignores console errors, this is because JSDOM does not have comprehensive
// css support, and crashes on some pages
virtualConsole.on('error', () => {});

let pageRank = 0;
export const getAllDocPages = () => {
    const menu = getMenuData();
    pageRank = 0;
    const flattenedMenuItems = getFlattenedMenuItems(menu.sections);
    return flattenedMenuItems;
};

export const parseDocPage = async (item: FlattenedMenuItem) => {
    const filePath = `${DIST_DIR}${item.path}/index.html`;

    if (!fs.existsSync(filePath)) {
        return null;
    }
    const { title, rank, breadcrumb, path } = item;
    const records = [];
    const dom = await JSDOM.fromFile(filePath, { virtualConsole });

    const titleTag = dom.window.document.querySelector('h1');
    const pageTitle = extractTitle(titleTag);
    if (pageTitle !== title) {
        logWarning({ pageTitle, title, filePath, message: 'Title mismatched to navbar.' });
    }

    let container = dom.window.document.querySelector('#doc-content article').firstChild;
    if (!container) {
        logWarning({ title, filePath, message: 'No content found.' });
        return null;
    }

    let heading = undefined;
    let subHeading = undefined;
    let text = '';
    let position = 0;
    let metaTag = undefined;

    const createPreviousRecord = () => {
        // Because content for the header comes after the header
        // we need to create a record for the previous section
        // after we find the next one.
        const snakeCaseHeading = (subHeading ?? heading)?.replace(/\s+/g, '-').toLowerCase();
        const hashPath = heading ? `${path}#${snakeCaseHeading}` : path;

        records.push({
            source: 'docs',

            objectID: hashPath,
            breadcrumb,
            title,
            heading,
            subHeading,
            path: hashPath,
            text: cleanContents(text),
            rank,
            positionInPage: position++,
            metaTag,
        });
    };

    const recursivelyParseContent = (container) => {
        for (let currentTag = container; currentTag != null; currentTag = currentTag.nextElementSibling) {
            try {
                if (['style', 'pre'].includes(currentTag.nodeName.toLowerCase())) {
                    // ignore this tag
                    continue;
                }

                switch (currentTag.nodeName) {
                    // split records based on H2 and H3 tags
                    case 'H2': {
                        createPreviousRecord();
                        heading = currentTag.textContent.trim();
                        subHeading = undefined;
                        text = '';
                        break;
                    }

                    case 'H3':
                    case 'H4': {
                        createPreviousRecord();
                        subHeading = currentTag.textContent.trim();
                        text = '';
                        break;
                    }

                    case 'DIV': {
                        createPreviousRecord();
                        if (currentTag.getAttribute('data-meta')) {
                            metaTag = JSON.parse(currentTag.getAttribute('data-meta').replaceAll('&quot;', '"'));
                        }
                        // process content inside div containers
                        recursivelyParseContent(currentTag.firstChild);
                        break;
                    }

                    default: {
                        const contents = currentTag.innerHTML || currentTag.textContent;

                        if (currentTag.nodeName === 'A' && contents.includes('Example: <!-- -->')) {
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
    recursivelyParseContent(container);
    createPreviousRecord();

    return records;
};

interface MenuItem {
    title: string;
    path?: string;
    items?: MenuItem[];
}

const getMenuData = () => {
    const file = fs.readFileSync(MENU_FILE_PATH, null);
    const { main } = JSON.parse(file);
    return main;
};

interface FlattenedMenuItem {
    title: string;
    path: string;
    rank: number;
    breadcrumb: string;
}

const getFlattenedMenuItems = (menuItems: MenuItem[], result = [], prefix) => {
    menuItems.forEach((item) => {
        if (item.path) {
            result.push({
                title: item.title,
                path: item.path,
                rank: pageRank++,
                breadcrumb: prefix ? `${prefix} > ${item.title}` : item.title,
            });
        }
        if (item.items) {
            getFlattenedMenuItems(item.items, result, prefix ? `${prefix} > ${item.title}` : item.title);
        }
    });
    return result;
};

const disallowedTags = ['style', 'pre'];
const cleanContents = (contents) => {
    // remove all content from disallowed tags
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

const extractTitle = (titleTag) => {
    return titleTag.textContent;
};
