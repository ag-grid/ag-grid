import { getDocsExamplePages } from '@features/docs/utils/pageData';
import * as docsUrlPaths from '@features/docs/utils/urlPaths';
import { getCollection } from 'astro:content';

import { getDebugPageUrls } from './pages';
import { urlWithBaseUrl } from './urlWithBaseUrl';

const getDocsExamplePaths = async () => {
    const pages = await getCollection('docs');
    const docExamplePathsPromises = await getDocsExamplePages({
        pages,
    });
    const docExamples = docExamplePathsPromises.map(({ params }) => {
        const { internalFramework, pageName, exampleName } = params;
        return {
            internalFramework,
            pageName,
            exampleName,
        };
    });
    const docExamplePaths = docExamples.flatMap(({ internalFramework, pageName, exampleName }) => {
        return [
            docsUrlPaths.getExampleUrl({ internalFramework, pageName, exampleName }),
            docsUrlPaths.getExampleRunnerExampleUrl({ internalFramework, pageName, exampleName }),
            docsUrlPaths.getExampleCodeSandboxUrl({ internalFramework, pageName, exampleName }),
            docsUrlPaths.getExamplePlunkrUrl({ internalFramework, pageName, exampleName }),
        ];
    });

    return docExamplePaths;
};

const getIgnoredPages = () => {
    return [urlWithBaseUrl('/404')];
};

export async function getSitemapIgnorePaths() {
    const paths = await Promise.all([getDocsExamplePaths(), getDebugPageUrls(), getIgnoredPages()]);

    return paths.flat();
}
