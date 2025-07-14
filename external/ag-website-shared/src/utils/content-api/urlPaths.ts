import type { Framework, FrameworkType, Library } from '@ag-grid-types';
import { getArchiveUrl } from '@ag-website-shared/utils/getArchiveUrl';
import { LIBRARY, SITE_URL } from '@constants';
import { getExtraFileUrl } from '@utils/extraFileUrl';
import { pathJoin } from '@utils/pathJoin';
import { urlWithBaseUrl } from '@utils/urlWithBaseUrl';
import { urlWithPrefix } from '@utils/urlWithPrefix';

export function getContentApiPrefix(url: string) {
    return pathJoin(SITE_URL, urlWithBaseUrl(`/content`), url);
}

export function getContentApiArchiveUrl({ version, site = LIBRARY }: { version: string; site?: Library }) {
    return getArchiveUrl({ version, site }) + '/';
}

export function getContentApiDocsIndexUrl({ framework }: { framework: Framework }) {
    return getContentApiPrefix(`/docs/${framework}/index.json`);
}

export function getContentApiDocsUrl({ framework, url }: { framework: Framework; url: string }) {
    return pathJoin(
        SITE_URL,
        urlWithPrefix({
            url,
            framework,
        })
    );
}

export function getContentApiExamplesUrl({
    framework,
    frameworkType,
}: {
    framework: Framework;
    frameworkType: FrameworkType;
}) {
    const contentApiExamplesUrl = pathJoin('examples', framework, frameworkType, 'index.json');
    return getContentApiPrefix(contentApiExamplesUrl);
}

export function getContentApiMigrationsUrl({ framework }: { framework: Framework }) {
    const contentApiExamplesUrl = pathJoin('migrations', framework, 'index.json');
    return getContentApiPrefix(contentApiExamplesUrl);
}

export function getContentApiApiDocsUrl({ framework }: { framework: Framework }) {
    const contentApiExamplesUrl = pathJoin('api', framework, 'index.json');
    return getContentApiPrefix(contentApiExamplesUrl);
}

export function getContentApiExtraFileUrl({ filePath }: { filePath: string }) {
    const contentApiExtraFileUrl = getExtraFileUrl({ filePath });
    return pathJoin(SITE_URL, contentApiExtraFileUrl);
}
