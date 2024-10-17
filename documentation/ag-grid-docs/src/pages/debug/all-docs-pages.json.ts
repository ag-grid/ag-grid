import type { MenuSection } from '@ag-grid-types';
import { getCollection, getEntry } from 'astro:content';

async function getAllDocsPages() {
    const pages = await getCollection('docs');

    return pages.map(({ slug }) => {
        return slug;
    });
}

function getAllPathsRecursively(menuSection: MenuSection) {
    const paths = [];
    if (menuSection.items) {
        const itemPaths = menuSection.items.flatMap((item) => getAllPathsRecursively(item));

        paths.push(itemPaths);
    } else if (menuSection.path) {
        paths.push(menuSection.path);
    }

    return paths.flat();
}

async function getAllMenuPages() {
    const { data: headerData } = await getEntry('site-header', 'siteHeader');
    const { data: apiNavData } = await getEntry('api-nav', 'apiNav');
    const { data: docsNavData } = await getEntry('docs-nav', 'docsNav');

    const menuPages = {
        header: getAllPathsRecursively(headerData),
        api: apiNavData.sections.flatMap((menuSection) => {
            return getAllPathsRecursively(menuSection);
        }),
        main: docsNavData.sections.flatMap((menuSection) => {
            return getAllPathsRecursively(menuSection);
        }),
    };

    return menuPages;
}

export async function GET() {
    const docsPages = await getAllDocsPages();
    const menuPages = await getAllMenuPages();
    const resp = {
        docsPages,
        menuPages,
    };

    return new Response(JSON.stringify(resp), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
        },
    });
}
