import type { InternalFramework } from '@ag-grid-types';
import { getDocExampleFiles } from '@components/docs/utils/pageData';
import { getGeneratedContents } from '@components/example-generator';
import { getIsDev } from '@utils/env';
import { getModuleSourceFileName, transformExampleModule } from '@utils/exampleModules/transformExampleModule';
import { fileNameToMimeType } from '@utils/mimeType';
import { getContentRootFileUrl } from '@utils/pages';
import { getCollection } from 'astro:content';

interface Params {
    internalFramework: InternalFramework;
    pageName: string;
    exampleName: string;
    fileName: string;
}

/**
 * Dev only: served on demand. `getStaticPaths` has to enumerate the generated file list of every
 * example, which would defeat just-in-time generation by building all of them on the first example
 * file request. Production builds prerender exactly as before.
 */
export const prerender = !import.meta.env.DEV;

export async function getStaticPaths() {
    const pages = await getCollection('docs');
    const exampleFiles = await getDocExampleFiles({
        pages,
    });
    return exampleFiles;
}

export async function GET({ params }: { params: Params }) {
    const { internalFramework, pageName, exampleName, fileName } = params;

    const contentRoot = getContentRootFileUrl();
    const createErrorBody = ({ availableFiles }: any) => {
        const error = getIsDev()
            ? {
                  error: 'File not found',
                  contentPath: contentRoot.pathname,
                  availableFiles: Object.keys(availableFiles),
              }
            : {
                  error: 'File not found',
              };

        return JSON.stringify(error);
    };

    const { files = {} } =
        (await getGeneratedContents({
            type: 'docs',
            framework: internalFramework,
            pageName,
            exampleName,
        })) || {};
    const moduleSourceFileName = getModuleSourceFileName(fileName, Object.keys(files));
    if (moduleSourceFileName) {
        const code = transformExampleModule({
            fileName: moduleSourceFileName,
            source: files[moduleSourceFileName],
            internalFramework,
        });

        return new Response(code, {
            headers: {
                'Content-Type': 'text/javascript',
            },
        });
    }

    const file = files && files[fileName];
    const body = file ? file : createErrorBody({ availableFiles: files });

    const response = new Response(body, {
        headers: {
            'Content-Type': fileNameToMimeType(fileName),
        },
    });
    return response;
}
