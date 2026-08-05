import { DOCS_FRAMEWORK_PATH_INDEX, DOCS_PAGE_NAME_PATH_INDEX } from '@components/docs/constants';
import { getFrameworkPath } from '@components/docs/utils/urlPaths';
import { FRAMEWORKS, FRAMEWORK_REDIRECT_PATH } from '@constants';

/**
 * Shape of the docs urls on the site, ie the parts that differ between
 * Grid (`/react-data-grid/getting-started/`) and Charts (`/javascript/bar-series/`)
 */
interface DocsUrlShape {
    frameworkPathIndex: number;
    pageNamePathIndex: number;
    frameworkPaths: string[];
    redirectPath: string;
}

const SITE_DOCS_URL_SHAPE: DocsUrlShape = {
    frameworkPathIndex: DOCS_FRAMEWORK_PATH_INDEX,
    pageNamePathIndex: DOCS_PAGE_NAME_PATH_INDEX,
    frameworkPaths: FRAMEWORKS.map(getFrameworkPath),
    redirectPath: FRAMEWORK_REDIRECT_PATH,
};

/**
 * A docs page url as its framework agnostic equivalent, which redirects the visitor
 * on to whichever framework they last used, ie
 * `https://charts-staging.ag-grid.com/javascript/bar-series/#formatter`
 *   -> `https://charts-staging.ag-grid.com/r/bar-series/#formatter`
 *
 * `undefined` if the url is not a framework specific docs page, as only those have
 * a redirect equivalent.
 */
export function getFrameworkRedirectUrl(url: string, urlShape: DocsUrlShape = SITE_DOCS_URL_SHAPE): string | undefined {
    const { frameworkPathIndex, pageNamePathIndex, frameworkPaths, redirectPath } = urlShape;
    let redirectUrl: URL;
    try {
        redirectUrl = new URL(url);
    } catch {
        return undefined;
    }

    const pathSegments = redirectUrl.pathname.split('/');
    const isFrameworkPath = frameworkPaths.includes(pathSegments[frameworkPathIndex]);
    // The redirect pages only cover `/{framework}/{pageName}`, so anything nested
    // deeper (eg, an example url) has no equivalent
    const isDocsPage =
        Boolean(pathSegments[pageNamePathIndex]) && !pathSegments.slice(pageNamePathIndex + 1).some(Boolean);
    if (!isFrameworkPath || !isDocsPage) {
        return undefined;
    }

    pathSegments[frameworkPathIndex] = redirectPath;
    redirectUrl.pathname = pathSegments.join('/');

    return redirectUrl.toString();
}
