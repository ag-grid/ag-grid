/**
 * This script is used to update our Algolia instance. It loads the HTML from the statically-rendered website, processes
 * it into records, and pushes these records to Algolia. It should be run whenever the website is deployed.
 */

require('dotenv').config();

const fs = require('fs-extra');
const {JSDOM} = require('jsdom');
const algoliasearch = require('algoliasearch');
const commander = require("commander");

const mainMenu = require('./doc-pages/licensing/menu.json');
const supportedFrameworks = require('./src/utils/supported-frameworks');
const convertToFrameworkUrl = require('./src/utils/convert-to-framework-url');

const options = commander
    .option('-d, --debug <debug>', 'if debug = true (not provided - it\'ll default to true), the script writes the records it would upload into JSON files for inspection', true)
    .option("-i, --indexNamePrefix <prefix>", 'if indexNamePrefix = "ag-grid-dev" we\'ll update development indices, and for "ag-grid" production', 'ag-grid-dev')
    .parse(process.argv)
    .opts();


const clearIndices = true; // to ensure a clean index, you should clear existing records before inserting new ones
const debug = options.debug === true;
const indexNamePrefix = options.indexNamePrefix;

console.log("Updating Algolia Indices");
console.log(`debug: ${debug}, indexNamePrefix: ${indexNamePrefix}`);
console.log(`Updating Algolia using App ID ${process.env.GATSBY_ALGOLIA_APP_ID} and admin key ${process.env.ALGOLIA_ADMIN_KEY}`);

let algoliaClient;
if (!debug) {
    console.log('Creating Algolia client');
    algoliaClient = algoliasearch(process.env.GATSBY_ALGOLIA_APP_ID, process.env.ALGOLIA_ADMIN_KEY);
}

/**
 * Parse API from JSON config files.
 */
const parseFileForApi = (details) => {
    const records = [];
    const { propertiesFileUrl, breadcrumbSuffix, pagePath } = details;

    const { _config_, ...sections } = require(propertiesFileUrl);
    if (!_config_) return []; // if no config, wrong type of file.
    const { codeSrc } = _config_;
    if (!codeSrc) return []; // if no src, wrong type of file.

    const apiPropertiesSourceFile = require(`./doc-pages/${codeSrc}`);

    // load the defined sections for the API docs
    Object.entries(sections).forEach(([sectionKey, section]) => {
        const { meta, ...properties } = section;
        const sectionDisplayName = meta?.displayName ?? sectionKey; // Formatted section name

        Object.entries(properties).forEach(([propertyKey, property]) => {
            const { description, more } = property; // more can include a link to a page with more info
            
            const data = apiPropertiesSourceFile[propertyKey];

            const breadcrumb = `API > ${breadcrumbSuffix}`;
            const path = `${pagePath}#reference-${sectionKey}-${propertyKey}`;

            const text = description ?? data.meta.comment;
            const normalizedText = text.replace(/\[([^\]]+)\][^\)]+\)/g, '$1');
            records.push({
                objectID: path,
                title: breadcrumbSuffix,
                heading: propertyKey,
                text: normalizedText,
                breadcrumb: breadcrumb,
                path: path,
                rank: 0,
            });
        });
    });
    return records;
};

const allApiRecords = [];

/**
 * The following code iterates through the doc-pages folder to search for JSON files containing
 * a _config_.codeSrc property. This is a dumb way to detect the file is parse-able.
 * The file is then parsed to extract a basic description, title, path and header for algolia.
 */
const docPageSourceDirectory = './doc-pages';
const pageNames = fs.readdirSync(docPageSourceDirectory, { withFileTypes: true });
pageNames.forEach(page => {
    if (page.isDirectory()) {
        const pagePath = `${docPageSourceDirectory}/${page.name}`;
        const files = fs.readdirSync(pagePath);
        const configFiles = files.filter(file => file.endsWith('.json') && !file.endsWith('.AUTO.json'));
        
        configFiles.forEach(file => {
            const pageName = page.name.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
            const config = {
                pagePath: `/${page.name}/`,
                propertiesFileUrl: `${pagePath}/${file}`,
                breadcrumbSuffix: pageName,
            };
            allApiRecords.push(...parseFileForApi(config));
        });
    }
});


/**
 * The following code iterates through the doc-pages folder to search for HTML files and parses them for algolia links.
 */

const disallowedTags = ['style', 'pre'];
const disallowedClasses = ['gatsby-highlight', 'code-tab'];

const cleanContents = contents => {
    // remove all content from disallowed tags
    disallowedTags.forEach(tag => contents = contents.replace(new RegExp(`<${tag}(\\s.*?)?>.*?</${tag}>`, 'gs'), ''));

    return contents
        .replace(/<.*?>/gs, ' ') // remove tags
        .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&.*?;/g, '') // remove HTML characters
        .replace(/\s+/g, ' ') // compress whitespace
        .replace(/\s+([.,?!:)])/g, '$1').replace(/\(\s+/g, '(')  // neaten punctuation
        .trim();
};

const extractTitle = titleTag => {
    let title = titleTag.firstChild.textContent;

    let sibling = titleTag.firstChild.nextSibling;
    while (sibling) {
        title += ` ${sibling.textContent}`;
        sibling = sibling.nextSibling;
    }

    return title
        ? title
            .replace('React Data Grid', '')
            .replace('JavaScript Data Grid', '')
            .replace('Angular Data Grid', '')
            .replace('Vue Data Grid', '')
            .replace('ReactAngularVueJavascript', '')
        : title;
}

const createRecords = async (url, framework, breadcrumb, rank) => {
    const records = [];
    const path = convertToFrameworkUrl(url, framework);

    let dom = null;
    const filePath = `public${path}index.html`;

    if (!fs.existsSync(filePath)) {
        return records;
    }

    dom = await JSDOM.fromFile(filePath);

    let key = undefined;
    let heading = undefined;
    let subHeading = undefined;
    let text = '';

    const titleTag = dom.window.document.querySelector('h1');
    const title = extractTitle(titleTag);

    let positionInPage = 0;

    const createRecord = () => {
        if (['next-up', 'next-steps'].includes(key)) {
            // don't index Next Up/Next Steps sections
            return;
        }

        const cleanText = cleanContents(text);

        if (cleanText === '') {
            return;
        }

        const hashPath = `${path}${key ? `#${key}` : ''}`;

        records.push({
            objectID: hashPath,
            breadcrumb,
            title,
            heading,
            subHeading,
            path: hashPath,
            text: cleanText,
            rank,
            positionInPage,
        });

        subHeading = undefined;
        text = '';
        positionInPage++;
    };

    /**
     * We split the page into sections based on H2 and H3 tags, which keeps the record size manageable and returns
     * more accurate results for users, as they will be taken to specific parts of a page.
     */
    const parseContent = startingElement => {
        for (let currentTag = startingElement; currentTag != null; currentTag = currentTag.nextElementSibling) {
            try {
                if (disallowedTags.includes(currentTag.nodeName.toLowerCase()) ||
                    (typeof currentTag.className === 'string' && currentTag.className.split(' ').some(className => disallowedClasses.includes(className)))) {
                    // ignore this tag
                    continue;
                }

                switch (currentTag.nodeName) {
                    // split records based on H2 and H3 tags
                    case 'H2': {
                        createRecord();

                        key = currentTag.id;
                        heading = currentTag.textContent;
                        break;
                    }

                    case 'H3': {
                        createRecord();

                        key = currentTag.id;
                        subHeading = currentTag.textContent;
                        break;
                    }

                    case 'DIV': {
                        // process content inside div containers
                        parseContent(currentTag.firstChild);
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

    parseContent(dom.window.document.querySelector('#doc-content').firstChild.nextElementSibling);
    createRecord();

    return records;
};

const processIndexForFramework = async framework => {
    let rank = 10000; // using this rank ensures that pages that are earlier in the menu will rank higher in results
    const indexName = `${indexNamePrefix}_${framework}`;

    const prefix = `/${framework}-data-grid`;
    /**
     * Adjust API urls to have framework prefix, doc urls will be added to this as they are scraped
     */
    const records = allApiRecords.map(record => ({
        ...record,
        path: `${prefix}${record.path}`,
    }));

    const exclusions = ["charts-api-themes", "charts-api", "charts-api-explorer"];

    console.log(`Generating records for ${indexName}...`);

    const iterateItems = async (items, prefix, parentTitle) => {
        if (!items) {
            return;
        }

        const breadcrumbPrefix = prefix ? `${prefix} > ` : '';

        for (const item of items) {
            const breadcrumb = breadcrumbPrefix + item.title;
            console.log(`=== Walking ${breadcrumb}...`);

            if (item.url && !exclusions.some(exclusion => exclusion === item.url.replace(/\//g, ''))) {
                const newRecords = await createRecords(item.url, framework, breadcrumb, rank);
                console.log(`Created ${newRecords.length} new records`)
                records.push(...newRecords);

                rank -= 10;
            }

            await iterateItems(item.items, breadcrumb, parentTitle);
        }
    };

    for (const item of mainMenu) {
        await iterateItems(item.items);
    }

    if (debug) {
        const fileName = `algolia-${indexName}.json`;
        fs.writeFileSync(fileName, JSON.stringify(records, null, 2));

        console.log(`Wrote Algolia records for ${indexName} to ${fileName}`);
    } else {
        console.log(`Pushing records for ${indexName} to Algolia ...`);

        const index = algoliaClient.initIndex(indexName);

        index.setSettings({
            searchableAttributes: ['title', 'heading', 'subHeading'], // attributes used for searching
            disableExactOnAttributes: ['text'], // don't allow "exact matches" in the text
            attributesToSnippet: ['text:40'], // configure snippet length shown in results
            distinct: 1, // only allow each page to appear in the results once
            attributeForDistinct: 'breadcrumb', // configure what is used to decide if a page is the same
            customRanking: ['desc(rank)', 'asc(positionInPage)'], // custom tweaks to the ranking
            camelCaseAttributes: ['heading', 'subHeading'], // split camelCased text so it can match regular text
            hitsPerPage: 10, // how many results should be returned per page
            snippetEllipsisText: '…', // the character used when truncating content for snippets
        });

        try {
            if (clearIndices) {
                await index.clearObjects();
            }

            const result = await index.saveObjects(records);

            console.log(`Response from Algolia:`, result);
        } catch (e) {
            console.error(`Failed to save records.`, e);
        }
    }
};

const run = async () => {
    try {
        for (const framework of supportedFrameworks) {
            await processIndexForFramework(framework);
        }
    }
    catch(e) {
        console.error(e);
        process.exit(1);
    }
};

run();