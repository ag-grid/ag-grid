import type { InternalFramework } from '@ag-grid-types';
import { runNxGenerateExample } from '@ag-website-shared/utils/runNxGenerateExample';
import { hasExampleFolder } from '@components/docs/utils/filesData';
import { getDocsExamplePages } from '@components/docs/utils/pageData';
import { getGeneratedContents, hasGeneratedContents } from '@components/example-generator';
import { getIsDev } from '@utils/env';
import type { APIContext } from 'astro';
import { getCollection } from 'astro:content';

export async function getStaticPaths() {
    const pages = await getCollection('docs');
    const examples = await getDocsExamplePages({
        pages,
    });

    return examples;
}

export async function GET(context: APIContext) {
    const { internalFramework, pageName, exampleName } = context.params;

    let generatedContents;
    try {
        const hasGenerated = await hasGeneratedContents({
            type: 'docs',
            framework: internalFramework as InternalFramework,
            pageName: pageName!,
            exampleName: exampleName!,
        });
        const hasContents = await hasExampleFolder({
            pageName: pageName!,
            exampleName: exampleName!,
        });
        if (!hasGenerated) {
            if (hasContents && getIsDev()) {
                await runNxGenerateExample({
                    pageName: pageName!,
                    exampleName: exampleName!,
                });
            } else {
                throw new Error(`Contents file not found`);
            }
        }

        generatedContents = await getGeneratedContents({
            type: 'docs',
            framework: internalFramework as InternalFramework,
            pageName: pageName!,
            exampleName: exampleName!,
        });
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error(`Error generating contents: ${(error as Error).message}`);
        return new Response(
            JSON.stringify({ error: 'Error generating contents.json file', internalFramework, pageName, exampleName }),
            {
                status: 400,
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );
    }

    return new Response(JSON.stringify(generatedContents), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
        },
    });
}
