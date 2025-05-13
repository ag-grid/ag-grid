import { urlWithBaseUrl } from './urlWithBaseUrl';

function addTrailingSlash(path: string) {
    return path.slice(-1) === '/' ? path : `${path}/`;
}

const getTestPages = async () => {
    const pages = await getCollection('docs');
    const docsTestPages = getDocsPages(pages)
        .map(({ params }) => {
            const { framework, pageName } = params;
            return getExamplePageUrl({ framework, path: pageName });
        })
        .filter(isTestPage);

    return docsTestPages;
};

export async function getSitemapIgnorePaths() {
    const ignorePaths = [
        urlWithBaseUrl('/debug'),
        urlWithBaseUrl('/examples'),
        urlWithBaseUrl('/archive'),
        urlWithBaseUrl('/campaigns'),
        // Redirects
        urlWithBaseUrl(`/${FRAMEWORK_REDIRECT_PATH}`),
    ];
    const testPages = await getTestPages();
    const folderPaths = ignorePaths.concat(testPages).map(addTrailingSlash);

    return folderPaths.concat(urlWithBaseUrl('/404'));
}
