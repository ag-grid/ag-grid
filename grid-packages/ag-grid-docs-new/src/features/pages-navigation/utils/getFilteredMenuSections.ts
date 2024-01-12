import type { Framework, MenuItem, MenuSection } from '@ag-grid-types';

interface Props {
    menuSections: MenuSection[];
    framework: Framework;
}

function getFilteredMenuItems({ menuItems, framework }: { menuItems?: MenuItem[]; framework: Framework }) {
    return menuItems
        ? (menuItems
              .map((menuItem) => {
                  if (menuItem.items) {
                      const filteredItems = getFilteredMenuItems({ menuItems: menuItem.items, framework })?.filter(
                          Boolean
                      ) as MenuItem[];

                      return {
                          ...menuItem,
                          items: filteredItems,
                      };
                  } else {
                      return !menuItem.frameworks || menuItem.frameworks.includes(framework) ? menuItem : undefined;
                  }
              })
              .filter(Boolean) as MenuSection[])
        : undefined;
}

export const getFilteredMenuSections = ({ menuSections, framework }: Props) => {
    return menuSections
        .map((section) => {
            const items = getFilteredMenuItems({
                menuItems: section.items,
                framework,
            });

            return {
                ...section,
                items,
            };
        })
        .filter(Boolean) as MenuSection[];
};
