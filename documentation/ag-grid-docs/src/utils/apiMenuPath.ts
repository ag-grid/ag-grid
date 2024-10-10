function findSectionPaths(sections) {
    // TODO: Understand why this is necessary
    if (!Array.isArray(sections)) return;

    return sections.flatMap((section) => {
        return section.children ? findSectionPaths(section.children) : section.path;
    });
}

export function getApiPaths(menuData: any): string[] {
    return findSectionPaths(menuData.sections);
}

export function isApiMenuPath({ pageName, menuData }: { pageName: string; menuData: any }) {
    if (!pageName) {
        return false;
    }

    const apiPaths = getApiPaths(menuData);

    return apiPaths.includes(pageName);
}
