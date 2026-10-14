import type { Framework, MenuItem } from '@ag-grid-types';
import { getPageNameFromPath } from '@components/docs/utils/urlPaths';
import { FRAMEWORKS } from '@constants';
import { getFrameworkDisplayText, getNewFrameworkPath } from '@utils/framework';
import { getMenuItemFromPageName } from '@utils/getMenuItemFromPageName';

export interface FrameworkVersionLink {
    framework: Framework;
    label: string;
    href: string;
}

/**
 * A page with no `frameworks` restriction exists in every framework.
 */
export const isPageInFramework = (menuItem: MenuItem | undefined, framework: Framework): boolean =>
    !menuItem?.frameworks || menuItem.frameworks.includes(framework);

/**
 * Links to the same page in each of the other frameworks, skipping any framework the page does not exist in.
 *
 * Without `menuItems` there is nothing to check against, so every other framework is linked.
 */
export function getFrameworkVersionLinks({
    path,
    currentFramework,
    menuItems,
}: {
    path: string;
    currentFramework: Framework;
    menuItems?: MenuItem[];
}): FrameworkVersionLink[] {
    const menuItem = menuItems && getMenuItemFromPageName({ menuItems, pageName: getPageNameFromPath(path) });

    return FRAMEWORKS.filter(
        (framework) => framework !== currentFramework && isPageInFramework(menuItem, framework)
    ).map((framework) => ({
        framework,
        label: `${getFrameworkDisplayText(framework)} Data Grid`,
        href: getNewFrameworkPath({ path, currentFramework, newFramework: framework }),
    }));
}
