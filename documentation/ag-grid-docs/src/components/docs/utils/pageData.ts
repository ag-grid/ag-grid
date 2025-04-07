import type { InternalFramework } from '@ag-grid-types';
import { getGeneratedContents } from '@components/example-generator';
import { FRAMEWORKS, QUICK_BUILD_PAGES, SHOW_DEBUG_LOGS } from '@constants';
import { type DocsPage, getContentRootFileUrl } from '@utils/pages';
import { pathJoin } from '@utils/pathJoin';

import { getIsDev } from '../../../utils/env';
import { type GeneratedExampleParams, getGeneratedContentsFileList } from '../../example-generator';
import { getInternalFrameworkExamples, getPagesList } from './filesData';

interface Example {
    internalFramework: InternalFramework;
    pageName: string;
    exampleName: string;
}

type DocExamplePages = Awaited<ReturnType<typeof getDocsExamplePages>>;
type DocExamplePage = DocExamplePages[number]['params'] & {
    isEnterprise: boolean;
    isIntegratedCharts?: boolean;
    isLocale?: boolean;
    hasExampleConsoleLog?: boolean;
};
type DocFrameworkExamples = Record<InternalFramework, DocExamplePage>;

const isQuickBuild = QUICK_BUILD_PAGES && !getIsDev();

export function getDocsPages(pages: DocsPage[]) {
    const frameworkPages = FRAMEWORKS.flatMap((framework) => {
        return getPagesList(pages).map((page) => {
            return {
                framework,
                pageName: page.id,
                page,
            };
        });
    });

    const filteredPages = isQuickBuild
        ? frameworkPages.filter(({ pageName }) => {
              return QUICK_BUILD_PAGES.includes(pageName);
          })
        : frameworkPages;

    return filteredPages
        .map(({ framework, pageName, page }) => {
            const { frameworks } = page.data;
            if (frameworks && !frameworks.includes(framework)) {
                return;
            }

            return {
                params: {
                    framework,
                    pageName,
                },
                props: {
                    page,
                },
            };
        })
        .filter(Boolean);
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

async function getDocsExampleNameParts({ pages }: { pages: DocsPage[] }): Promise<Example[]> {
    const internalFrameworkExamples = await getInternalFrameworkExamples({ pages });
    const filteredInternalFrameworkExamples = isQuickBuild
        ? internalFrameworkExamples.filter(({ pageName }) => {
              return QUICK_BUILD_PAGES.includes(pageName);
          })
        : internalFrameworkExamples;

    return filteredInternalFrameworkExamples
        .flatMap((example) => {
            const frameworkSupported =
                example.supportedFrameworks === undefined || example.supportedFrameworks.has(example.internalFramework);

            if (!frameworkSupported) {
                return undefined;
            }

            return {
                ...example,
            };
        })
        .filter((e) => e !== undefined) as Example[];
}

export async function getDocsExamplePages({ pages }: { pages: DocsPage[] }) {
    const examples = await getDocsExampleNameParts({ pages });

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

export async function getDocsExampleContents({ pages }: { pages: DocsPage[] }) {
    const examples = await getDocsExamplePages({
        pages,
    });

    const exampleContents: Record<string, DocFrameworkExamples> = {};
    const examplePromises = examples.map(async (example) => {
        const { internalFramework, pageName, exampleName } = example.params;
        const key = `${pageName}-${exampleName}`;
        if (!exampleContents[key]) {
            exampleContents[key] = {} as DocFrameworkExamples;
        }
        const generatedExampleParams: GeneratedExampleParams = {
            type: 'docs',
            framework: internalFramework,
            pageName,
            exampleName,
        };
        const contents = await getGeneratedContents(generatedExampleParams);

        exampleContents[key][internalFramework] = {
            isEnterprise: contents?.isEnterprise,
            isIntegratedCharts: contents?.isIntegratedCharts,
            isLocale: contents?.isLocale,
            hasExampleConsoleLog: contents?.hasExampleConsoleLog,
            ...example.params,
        };
    });
    await Promise.all(examplePromises);

    return exampleContents;
}

export async function getDocExampleFiles({ pages }: { pages: DocsPage[] }) {
    const examples = await getDocsExampleNameParts({ pages });
    const exampleFilesPromises = examples.flatMap(async ({ internalFramework, pageName, exampleName }) => {
        try {
            const filesList = await getGeneratedContentsFileList({
                type: 'docs',
                framework: internalFramework,
                pageName,
                exampleName,
            });
            return filesList.map((fileName) => {
                return {
                    internalFramework,
                    pageName,
                    exampleName,
                    fileName,
                };
            });
        } catch (error) {
            if (SHOW_DEBUG_LOGS) {
                // eslint-disable-next-line no-console
                console.error('File not generated - ', (error as Error).message);
            }
            return [];
        }
    });

    const exampleFiles = (await Promise.all(exampleFilesPromises)).flat(2);

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
