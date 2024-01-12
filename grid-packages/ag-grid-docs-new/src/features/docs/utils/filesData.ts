import fs from 'fs/promises';
import path from 'path';

// NOTE: These imports can't be aliases because it is used by `astro.config.mjs`
// and ts alias paths don't work there
import { INTERNAL_FRAMEWORKS } from '../../../constants';
import { getFolders } from '../../../utils/fs';
import {
    type DocsPage,
    type InternalFrameworkExample,
    getContentRootFileUrl,
    getExampleRootFileUrl,
} from '../../../utils/pages';

function ignoreUnderscoreFiles(page: DocsPage) {
    const pageFolders = page.slug.split('/');
    const pageName = pageFolders[pageFolders.length - 1];
    return pageName && !pageName.startsWith('_');
}

export const getExamplesPath = ({ pageName }: { pageName: string }) => {
    const contentRoot = getContentRootFileUrl();
    const sourceExamplesPath = path.join(contentRoot.pathname, 'docs', pageName, '_examples');

    return sourceExamplesPath;
};

export const getFolderPath = ({ pageName, exampleName }: { pageName: string; exampleName: string }) => {
    const examplesFolderPath = getExamplesPath({
        pageName,
    });
    const exampleFolderPath = path.join(examplesFolderPath, exampleName);

    return new URL(exampleFolderPath, import.meta.url);
};

export const getInternalFrameworkExamples = async ({
    pages,
}: {
    pages: DocsPage[];
}): Promise<InternalFrameworkExample[]> => {
    const internalFrameworkPageNames = INTERNAL_FRAMEWORKS.flatMap((internalFramework) => {
        return pages.map((page) => {
            return { internalFramework, pageName: page.slug };
        });
    });

    const examplePromises = internalFrameworkPageNames.map(async ({ internalFramework, pageName }) => {
        const docsExamplesPath = getExamplesPath({
            pageName,
        });

        const examples = await getFolders(docsExamplesPath);
        return examples.map((exampleName) => {
            return {
                internalFramework,
                pageName,
                exampleName,
            };
        });
    });
    const examples = (await Promise.all(examplePromises)).flat();
    return examples;
};

export const getPagesList = (pages: DocsPage[]) => {
    return pages.filter(ignoreUnderscoreFiles);
};

export const getAllExamplesFileList = async () => {
    const contentRoot = getExampleRootFileUrl();
    const pagesFolder = path.join(contentRoot.pathname, 'docs');
    const pages = await fs.readdir(pagesFolder);

    const examplesPromises = pages.map(async (pageName) => {
        const examplesFolder = path.join(pagesFolder, pageName, '_examples');
        const examples = await getFolders(examplesFolder);

        return examples.map((file) => {
            return path.join(examplesFolder, file);
        });
    });
    const exampleFolders = (await Promise.all(examplesPromises)).flat();

    const exampleFilesPromises = exampleFolders.map(async (exampleFolder) => {
        const exampleFiles = await fs.readdir(exampleFolder);
        return exampleFiles.map((exampleFile) => {
            return path.join(exampleFolder, exampleFile);
        });
    });
    const exampleFiles = (await Promise.all(exampleFilesPromises)).flat();

    return exampleFiles;
};
