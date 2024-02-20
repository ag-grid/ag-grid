import type { ImportType, InternalFramework } from '@ag-grid-types';
import { getIsImplemented } from '@constants';
import { getDocsExamplePages } from '@features/docs/utils/pageData';
import { getGeneratedContents } from '@features/example-generator';
import type { APIContext } from 'astro';
import { getCollection } from 'astro:content';

export async function getStaticPaths() {
    const pages = await getCollection('docs');
    const examples = await getDocsExamplePages({
        pages,
    });

    return examples.filter(({ params }) => {
        return getIsImplemented(params);
    });
}

export async function GET(context: APIContext) {
    const { internalFramework, pageName, importType, exampleName } = context.params;

    const generatedContents = await getGeneratedContents({
        type: 'docs',
        framework: internalFramework as InternalFramework,
        pageName: pageName!,
        importType: importType as ImportType,
        exampleName: exampleName!,
    });

    return new Response(JSON.stringify(generatedContents), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
        },
    });
}
