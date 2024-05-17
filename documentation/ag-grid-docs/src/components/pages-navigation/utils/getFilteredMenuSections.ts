import type { Framework, MenuItem, MenuSection } from '@ag-grid-types';

interface Props {
    menuSections: MenuSection[];
    framework: Framework;
}

function getFilteredMenuItems({ menuItems, framework }: { menuItems?: MenuItem[]; framework: Framework }) {
    return menuItems
        ? (menuItems
              .map((menuItem) => {
                  if (menuItem.frameworks && !menuItem.frameworks.includes(framework)) {
                      return undefined;
                  }

                  if (menuItem.items) {
                      const filteredItems = getFilteredMenuItems({ menuItems: menuItem.items, framework })?.filter(
                          Boolean
                      ) as MenuItem[];

                      return {
                          ...menuItem,
                          items: filteredItems,
                      };
                  }
                  return menuItem;
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
