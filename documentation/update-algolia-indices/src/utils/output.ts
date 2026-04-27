import { algoliasearch } from 'algoliasearch';
import fs from 'fs';
import { dirname } from 'path';

const outputDir = './output';
// in print mode, the results are stored in /output/*.json files, otherwise logged in algolia.
let printMode = false;
export const enablePrintMode = () => {
    if (fs.existsSync(outputDir)) {
        fs.rmSync(outputDir, { recursive: true });
    }

    printMode = true;
};

export const writeResults = (path: string, records: any) => {
    if (!printMode) {
        return;
    }

    const fileName = `${outputDir}/${path}`;
    const dirName = dirname(fileName);
    if (!fs.existsSync(dirName)) {
        fs.mkdirSync(dirName, { recursive: true });
    }
    fs.writeFileSync(fileName, JSON.stringify(records, null, 2));
};

export const logWarning = (warning: any) => {
    if (!printMode) {
        return;
    }

    const fileName = `${outputDir}/warnings.json`;
    const dirName = dirname(fileName);
    if (!fs.existsSync(dirName)) {
        fs.mkdirSync(dirName, { recursive: true });
    }

    const contents = `${JSON.stringify(warning, null, 2)}\n`;
    if (fs.existsSync(fileName)) {
        fs.appendFileSync(fileName, contents);
    } else {
        fs.writeFileSync(fileName, contents);
    }
};

export const updateAlgolia = async (indexName: string, records: Record<string, any>[]) => {
    if (printMode) {
        return;
    }

    const algoliaClient = algoliasearch(process.env.PUBLIC_ALGOLIA_APP_ID!, process.env.ALGOLIA_ADMIN_KEY!);

    await algoliaClient.setSettings({
        indexName,
        indexSettings: {
            searchableAttributes: ['title', 'heading', 'subHeading', 'codeWords'],
            disableExactOnAttributes: ['text'],
            attributesToSnippet: ['text:40'],
            distinct: 1,
            attributeForDistinct: 'breadcrumb',
            customRanking: ['asc(rank)', 'asc(positionInPage)'],
            camelCaseAttributes: ['heading', 'subHeading'],
            indexLanguages: ['en'],
            queryLanguages: ['en'],
            hitsPerPage: 10,
            snippetEllipsisText: '…',
        },
    });

    try {
        await algoliaClient.clearObjects({ indexName });
        const result = await algoliaClient.saveObjects({ indexName, objects: records });

        console.log(`Response from Algolia:`, result);
    } catch (e) {
        console.error(`Failed to save records.`, e);
    }
};
