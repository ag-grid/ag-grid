import { FRAMEWORKS } from '@constants';
import { type DocsPage, getContentRootFileUrl } from '@utils/pages';
import { pathJoin } from '@utils/pathJoin';

import { getGeneratedContentsFileList } from '../../example-generator';
import { getInternalFrameworkExamples, getPagesList } from './filesData';

export function getDocsPages(pages: DocsPage[]) {
    const frameworkPages = FRAMEWORKS.flatMap((framework) => {
        return getPagesList(pages).map((page) => {
            return {
                framework,
                pageName: page.slug,
                page,
            };
        });
    });

    return frameworkPages.map(({ framework, pageName, page }) => {
        return {
            params: {
                framework,
                pageName,
            },
            props: {
                page,
            },
        };
    });
}

export function getDocsFrameworkPages() {
    return FRAMEWORKS.map((framework) => {
        return {
            params: {
                framework,
            },
        };
    });
}

export async function getDocsExamplePages({ pages }: { pages: DocsPage[] }) {
    const examples = await getInternalFrameworkExamples({ pages });

    return examples.map(({ internalFramework, pageName, exampleName }) => {
        return {
            params: {
                internalFramework,
                pageName,
                exampleName,
            },
        };
    });
}

export async function getDocExampleFiles({ pages }: { pages: DocsPage[] }) {
    const examples = await getInternalFrameworkExamples({ pages });
    const exampleFilesPromises = examples.map(async ({ internalFramework, pageName, exampleName }) => {
        const exampleFileList = await getGeneratedContentsFileList({
            type: 'docs',
            framework: internalFramework,
            pageName,
            exampleName,
        });

        return exampleFileList.map((fileName) => {
            return {
                internalFramework,
                pageName,
                exampleName,
                fileName,
            };
        });
    });
    const exampleFiles = (await Promise.all(exampleFilesPromises)).flat();

    return exampleFiles.map(({ internalFramework, pageName, exampleName, fileName }) => {
        return {
            params: {
                internalFramework,
                pageName,
                exampleName,
                fileName,
            },
        };
    });
}

export const getGifStillImageFiles = ({ allDocsGifs }: { allDocsGifs: string[] }) => {
    const contentRoot = getContentRootFileUrl();
    const docsPath = 'docs';

    return allDocsGifs.map((docsImagePath) => {
        const pathParts = docsImagePath.split('/');
        const pageName = pathParts[0];
        const imagePath = pathParts.slice(1).join('/');
        const imagePathExclExt = imagePath.replace('.gif', '');
        const stillImagePath = imagePath.replace('.gif', '-still.png');
        const fullFilePath = pathJoin(contentRoot.pathname, docsPath, pageName, imagePath);

        return {
            params: {
                pageName,
                imagePathExclExt,
            },
            props: {
                stillImagePath,
                fullFilePath,
            },
        };
    });
};
