import type { MenuItem } from '@ag-grid-types';

export function getMenuItemFromPageName({
    menuItems,
    pageName,
}: {
    menuItems: MenuItem[];
    pageName: string;
}): MenuItem | undefined {
    return menuItems.reduce<MenuItem | undefined>((foundItem, section) => {
        if (foundItem) {
            return foundItem;
        } else if (section.path === pageName) {
            return section;
        } else if (section.children) {
            return getMenuItemFromPageName({ menuItems: section.children, pageName });
        }
    }, undefined);
}
