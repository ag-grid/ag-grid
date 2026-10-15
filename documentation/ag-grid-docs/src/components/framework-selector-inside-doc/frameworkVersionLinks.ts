import type { Framework } from '@ag-grid-types';
import { FRAMEWORKS } from '@constants';
import { getFrameworkDisplayText, getNewFrameworkPath } from '@utils/framework';

export interface FrameworkVersionLink {
    framework: Framework;
    label: string;
    href: string;
}

/**
 * Links to the same page in each of the other frameworks.
 *
 * `pageFrameworks` is the page's own `frameworks` frontmatter, which is what decides which routes get built. A page
 * without it exists in every framework.
 */
export function getFrameworkVersionLinks({
    path,
    currentFramework,
    pageFrameworks,
}: {
    path: string;
    currentFramework: Framework;
    pageFrameworks?: Framework[];
}): FrameworkVersionLink[] {
    return FRAMEWORKS.filter(
        (framework) => framework !== currentFramework && (!pageFrameworks || pageFrameworks.includes(framework))
    ).map((framework) => ({
        framework,
        label: `${getFrameworkDisplayText(framework)} Data Grid`,
        href: getNewFrameworkPath({ path, currentFramework, newFramework: framework }),
    }));
}
