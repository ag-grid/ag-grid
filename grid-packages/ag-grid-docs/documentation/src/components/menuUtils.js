import {useMemo} from "react";

export const toElementId = str => 'menu-' + str.toLowerCase().replace(/[&/\s]+/g, '-');

const sectionHasPath = (sec, urlPath) => urlPath === sec.url || (sec.items || []).some(item => sectionHasPath(item, urlPath));

export const useActiveParentItems = (menuData, path) => {
    const pathSegment = `/${path.split('/').reverse()[1]}/`;

    const getFullPath = (section, urlPath) => {
        return (section.items || []).flatMap(item =>
            sectionHasPath(item, urlPath) ? [item, ...getFullPath(item, urlPath)] : []
        );
    };

    const filterSections = (menuData, pathSegment) => {
        return menuData.flatMap(section => {
            return sectionHasPath(section, pathSegment) ? [section, ...getFullPath(section, pathSegment)] : [];
        });
    };

    return useMemo(() => {
        return filterSections(menuData, pathSegment).filter(Boolean);
    }, [path, menuData]);
};

export const useFilteredMenuData = (menuData, currentFramework) => {
    return menuData
        .map((section) => {
            const filteredItems = section.items.filter(item =>
                !item.menuHide &&
                (!item.frameworks || item.frameworks.includes(currentFramework))
            );

            return filteredItems.length > 0 ? { ...section, items: filteredItems } : null;
        })
        .filter(Boolean);
};
