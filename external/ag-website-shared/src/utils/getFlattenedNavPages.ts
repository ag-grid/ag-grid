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

export async function getFlattenedNavPages({ navData }) {
    return navData.sections.flatMap((menuSection) => {
        return getAllPathsRecursively(menuSection);
    });
}
