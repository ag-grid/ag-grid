import { getFirstParagraphText } from '@utils/markdoc/getFirstParagraphText';
import { type CollectionEntry, getCollection, getEntry } from 'astro:content';

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

async function getDocsResources() {
    const docsNavPages = await getDocsNavPages();
    return Promise.all(
        docsNavPages.map(async ({ path, title }) => {
            const page = (await getEntry('docs', path)) as CollectionEntry<'docs'>;
            const pagePath = `${path}.md`;
            return {
                uri: `ag-grid://docs/${pagePath}`,
                name: pagePath,
                title,
                description: page.data.description || getFirstParagraphText(page.body!, currentFramework),
                mimeType: 'text/markdown',
            };
        })
    );
}

async function getMigrationResources() {
    const pages = await getCollection('docs');
    const upgradePages = pages.filter(({ id }) => {
        return id.startsWith('upgrading-to-ag-grid-');
    });

    return upgradePages.map(({ id, data }) => {
        return {
            uri: `ag-grid://migration/${id}.md`,
            name: id,
            title: data.title,
            description: data.description,
            mimeType: 'text/markdown',
        };
    });
}

export async function GET() {
    const docsResources = await getDocsResources();
    const migrationResources = await getMigrationResources();
    const resp = [...docsResources, ...migrationResources];

    return new Response(JSON.stringify(resp), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
        },
    });
}
