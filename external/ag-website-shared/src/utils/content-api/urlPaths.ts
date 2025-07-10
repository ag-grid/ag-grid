import type { Framework, Library } from '@ag-grid-types';
import { getArchiveUrl } from '@ag-website-shared/utils/getArchiveUrl';
import { LIBRARY, SITE_URL } from '@constants';
import { pathJoin } from '@utils/pathJoin';
import { urlWithBaseUrl } from '@utils/urlWithBaseUrl';
import { urlWithPrefix } from '@utils/urlWithPrefix';

function getContentApiPrefix(url: string) {
    return pathJoin(SITE_URL, urlWithBaseUrl(`/content`), url);
}

export function getContentApiArchiveUrl({ version, site = LIBRARY }: { version: string; site?: Library }) {
    return getArchiveUrl({ version, site }) + '/';
}

export function getContentApiFrameworkUrl({ framework }: { framework: Framework }) {
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
