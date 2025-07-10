import type { Framework } from '@ag-grid-types';
import { getContentApiDocsUrl } from '@ag-website-shared/utils/content-api/urlPaths';
import { getFlattenedNavPages } from '@ag-website-shared/utils/getFlattenedNavPages';
import { getPageDescription } from '@ag-website-shared/utils/getPageDescription';
import { type CollectionEntry, getEntry } from 'astro:content';

export async function getDocsEntries({ framework, navData }: { framework: Framework; navData: any }) {
    const docsNavPages = await getFlattenedNavPages({ navData });
    return (
        await Promise.all(
            docsNavPages.map(async ({ path }) => {
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
        )
    ).filter(Boolean);
}
