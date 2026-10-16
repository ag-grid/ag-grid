import type { Framework } from '@ag-grid-types';
import { getFrameworkPath } from '@components/docs/utils/urlPaths';
import { FRAMEWORKS } from '@constants';

/**
 * Point a link to a framework docs page at `framework`'s copy of that page. Grid pages
 * (`/react-data-grid/<pageName>/`) and Charts pages (`/charts/react/<pageName>/`) are both
 * recognised, and each stays in its own product. Links that are not to `pageName` under a
 * framework path are returned as they came in, and the base URL, any query and any hash are kept.
 *
 * `pageName` is a docs page slug such as `community-vs-enterprise`.
 */
export function hrefForFramework({
    href,
    pageName,
    framework,
}: {
    href: string;
    pageName: string;
    framework: Framework;
}): string {
    const gridPaths = FRAMEWORKS.map(getFrameworkPath).join('|');
    const chartsPaths = FRAMEWORKS.join('|');
    const gridPage = new RegExp(`/(?:${gridPaths})/${pageName}/`);
    const chartsPage = new RegExp(`/charts/(?:${chartsPaths})/${pageName}/`);

    return href
        .replace(gridPage, `/${getFrameworkPath(framework)}/${pageName}/`)
        .replace(chartsPage, `/charts/${framework}/${pageName}/`);
}
