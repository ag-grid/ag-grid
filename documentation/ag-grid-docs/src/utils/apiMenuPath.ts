import { type MenuData } from '@ag-grid-types';

function findSectionPaths(sections) {
    return sections.flatMap((section) => {
        return section.items ? findSectionPaths(section.items) : section.path;
    });
}

export function getApiPaths(menuData: MenuData): string[] {
    return findSectionPaths(menuData.api.sections);
}

export function isApiMenuPath({ pageName, menuData }: { pageName: string; menuData: MenuData }) {
    if (!pageName) {
        return false;
    }

    const apiPaths = getApiPaths(menuData);
    return apiPaths.includes(pageName);
}
