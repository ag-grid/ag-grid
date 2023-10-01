export const toElementId = str => `menu-${str.toLowerCase().replace(/[&/\s]+/g, '-')}`;

export const getActiveParentItems = (menuData, path) => {
    const sectionHasPath = (sec, urlPath) => urlPath === sec.url || (sec.items || [])
        .some(item => sectionHasPath(item, urlPath));

    const pathSegment = `/${path.split('/').reverse()[1]}/`;

    const getFullPath = (section, urlPath) => section.items?.flatMap(item =>
        sectionHasPath(item, urlPath) ? [item, ...getFullPath(item, urlPath)] : []
    ) || [];

    return menuData.flatMap(section =>
        sectionHasPath(section, pathSegment) ? [section, ...getFullPath(section, pathSegment)] : []
    ).filter(Boolean);
};

export const getFilteredMenuData = (menuData, currentFramework) => {
    return menuData.map(section => {
        const filteredItems = section.items.filter(item =>
            !item.menuHide && (!item.frameworks || item.frameworks.includes(currentFramework))
        );
        return filteredItems.length ? { ...section, items: filteredItems } : null;
    }).filter(Boolean);
};