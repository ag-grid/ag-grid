import type { InternalFramework } from '@ag-grid-types';
import {
    getModuleSourceFileName,
    transformExampleModule,
} from '@ag-website-shared/components/example-runner/utils/transformExampleModule';
import { getDocExampleFiles } from '@components/docs/utils/pageData';
import { getGeneratedContents } from '@components/example-generator';
import { getIsDev } from '@utils/env';
import { getCompilerOptionNames } from '@utils/exampleModules/exampleCompilerOptions';
import { fileNameToMimeType } from '@utils/mimeType';
import { getContentRootFileUrl } from '@utils/pages';
import { getCollection } from 'astro:content';

interface Params {
    internalFramework: InternalFramework;
    pageName: string;
    exampleName: string;
    fileName: string;
}

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
            compilerOptionNames: getCompilerOptionNames(internalFramework),
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
