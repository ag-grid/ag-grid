import type { Framework } from '@ag-grid-types';
import { getFrameworkPath } from '@components/docs/utils/urlPaths';
import { FRAMEWORKS } from '@constants';

/**
 * Point a link to a framework docs page at `framework`'s copy of that page. Grid pages
 * (`/react-data-grid/<page>/`) and Charts pages (`/charts/react/<page>/`) are both recognised, and
 * each stays in its own product. Links with no framework path are returned as they came in, and
 * the base URL, any query and any hash are kept.
 */
export function hrefForFramework({ href, framework }: { href: string; framework: Framework }): string {
    const gridPaths = FRAMEWORKS.map(getFrameworkPath).join('|');
    const chartsPaths = FRAMEWORKS.join('|');

    return href
        .replace(new RegExp(`/(?:${gridPaths})/`), `/${getFrameworkPath(framework)}/`)
        .replace(new RegExp(`/charts/(?:${chartsPaths})/`), `/charts/${framework}/`);
}
