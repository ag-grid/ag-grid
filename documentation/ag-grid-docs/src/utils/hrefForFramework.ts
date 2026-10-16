import type { Framework } from '@ag-grid-types';
import { getFrameworkPath } from '@components/docs/utils/urlPaths';
import { FRAMEWORKS } from '@constants';

/**
 * Point a link to a framework docs page at `framework`'s copy of that page. Links that are not to
 * `pageName` under one of the framework paths are returned as they came in, and the base URL, any
 * query and any hash are kept.
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
    const frameworkPaths = FRAMEWORKS.map(getFrameworkPath).join('|');
    const pageLink = new RegExp(`/(?:${frameworkPaths})/${pageName}/`);

    return href.replace(pageLink, `/${getFrameworkPath(framework)}/${pageName}/`);
}
