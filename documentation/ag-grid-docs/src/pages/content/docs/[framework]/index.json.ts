import type { Framework } from '@ag-grid-types';
import { getContentApiDocsUrl } from '@ag-website-shared/utils/content-api/urlPaths';
import { getPageDescription } from '@ag-website-shared/utils/getPageDescription';
import { FRAMEWORKS } from '@constants';
import type { APIRoute } from 'astro';
import { type CollectionEntry, getEntry } from 'astro:content';

interface Params {
    framework: Framework;
}

export async function getStaticPaths() {
    return FRAMEWORKS.map((framework) => {
        return {
            params: {
                framework,
            },
        };
    });
}

function getAllPathsRecursively(menuSection: any) {
    const paths = [];
    if (menuSection.items) {
        const itemPaths = menuSection.items.flatMap((item: any) => getAllPathsRecursively(item));

        paths.push(itemPaths);
    } else if (menuSection.children) {
        const itemPaths = menuSection.children.flatMap((item: any) => getAllPathsRecursively(item));

        paths.push(itemPaths);
    } else if (menuSection.path) {
        paths.push(menuSection);
    }

    return paths.flat();
}

async function getDocsNavPages() {
    const { data: docsNavData } = (await getEntry('docsNav', 'nav')) as CollectionEntry<'docsNav'>;

    return docsNavData.sections.flatMap((menuSection) => {
        return getAllPathsRecursively(menuSection);
    });
}

async function getDocs({ framework }: { framework: Framework }) {
    const docsNavPages = await getDocsNavPages();
    return Promise.all(
        docsNavPages
            .map(async ({ path }) => {
                const {
                    id,
                    body,
                    data: { title, description, frameworks, enterprise },
                } = (await getEntry('docs', path)) as CollectionEntry<'docs'>;

                if (frameworks && !frameworks.includes(framework)) {
                    return;
                }

                const url = getContentApiDocsUrl({
                    framework,
                    url: `./${id}`,
                });

                return {
                    id: id,
                    name: title,
                    description: getPageDescription({
                        framework,
                        pageDescription: description!,
                        body: body!,
                    }),
                    url,
                    isEnterprise: enterprise,
                    mimeType: 'text/html',
                };
            })
            .filter(Boolean)
    );
}

export const GET: APIRoute<Params> = async ({ params }) => {
    const { framework } = params;
    const docs = await getDocs({ framework: framework as Framework });

    return new Response(JSON.stringify(docs), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
        },
    });
};
