import { getFirstParagraphText } from '@utils/markdoc/getFirstParagraphText';
import { type CollectionEntry, getEntry } from 'astro:content';

// TODO: Make this dynamic
const currentFramework = 'react';

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

export async function GET() {
    const docsNavPages = await getDocsNavPages();
    const resp = await Promise.all(
        docsNavPages.map(async ({ path, title }) => {
            const page = (await getEntry('docs', path)) as CollectionEntry<'docs'>;
            return {
                uri: `ag-grid://docs/${path}`,
                name: title,
                description: page.data.description || getFirstParagraphText(page.body!, currentFramework),
                mimeType: 'text/markdown',
            };
        })
    );

    return new Response(JSON.stringify(resp), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
        },
    });
}
