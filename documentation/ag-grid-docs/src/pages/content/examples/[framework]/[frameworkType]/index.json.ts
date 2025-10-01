import type { Framework, FrameworkType } from '@ag-grid-types';
import { getInternalFrameworkExamples } from '@components/docs/utils/filesData';
import { getExampleContentsUrl, getExampleUrl } from '@components/docs/utils/urlPaths';
import { FRAMEWORKS, FRAMEWORK_TYPES, SITE_URL } from '@constants';
import { getInternalFrameworkFromFrameworkType } from '@utils/framework';
import { pathJoin } from '@utils/pathJoin';
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

interface Params {
    framework: Framework;
    frameworkType: FrameworkType;
}

export async function getStaticPaths() {
    return FRAMEWORKS.map((framework) => {
        const frameworkType = FRAMEWORK_TYPES[framework];
        return Object.keys(frameworkType).map((frameworkType) => {
            return {
                params: {
                    framework,
                    frameworkType,
                },
            };
        });
    }).flat();
}

export const GET: APIRoute<Params> = async ({ params }) => {
    const { framework, frameworkType } = params;
    const internalFramework = getInternalFrameworkFromFrameworkType({
        framework: framework as Framework,
        frameworkType: frameworkType as FrameworkType,
    });

    if (!internalFramework) {
        throw new Error(`Invalid framework or frameworkType: ${framework}, ${frameworkType}`);
    }

    const pages = await getCollection('docs');
    const examples = (await getInternalFrameworkExamples({ pages, internalFramework })).map(
        ({ internalFramework, pageName, exampleName }) => {
            return {
                exampleName,
                pageName,
                url: pathJoin(
                    SITE_URL,
                    getExampleContentsUrl({
                        internalFramework,
                        pageName,
                        exampleName,
                    })
                ),
                preview: pathJoin(
                    SITE_URL,
                    getExampleUrl({
                        internalFramework,
                        pageName,
                        exampleName,
                    })
                ),
            };
        }
    );

    return new Response(JSON.stringify(examples), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
        },
    });
};
