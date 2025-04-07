import { type CollectionEntry, getCollection, getEntry } from 'astro:content';

async function getAllDocsPages() {
    const pages = await getCollection('docs');

    return pages.map(({ id }) => {
        return id;
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
        paths.push(menuSection.path);
    }

    return paths.flat();
}

async function getAllMenuPages() {
    const { data: headerData } = (await getEntry('siteHeader', 'header')) as CollectionEntry<'siteHeader'>;
    const { data: apiNavData } = (await getEntry('apiNav', 'nav')) as CollectionEntry<'apiNav'>;
    const { data: docsNavData } = (await getEntry('docsNav', 'nav')) as CollectionEntry<'docsNav'>;

    const menuPages = {
        header: getAllPathsRecursively(headerData.header),
        api: apiNavData.sections.flatMap((menuSection) => {
            return getAllPathsRecursively(menuSection);
        }),
        docs: docsNavData.sections.flatMap((menuSection) => {
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
