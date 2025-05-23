import type { Library } from '@ag-grid-types';
import { parseVersion } from '@ag-website-shared/utils/parseVersion';
import { versionIsGreaterOrEqual } from '@ag-website-shared/utils/versionIsGreaterOrEqual';
import { LEGACY_CHARTS_SITE_URL, PRODUCTION_CHARTS_SITE_URL } from '@constants';
import { pathJoin } from '@utils/pathJoin';

const FIRST_GRID_VERSION_WITH_HOMEPAGE = '27.3.0';

function getHasDocumentationLink({ version, site }: { version: string; site: Library }) {
    const hasDocumentationLink =
        (site === 'grid' && versionIsGreaterOrEqual(version, FIRST_GRID_VERSION_WITH_HOMEPAGE)) || site === 'charts';

    return hasDocumentationLink;
}

export const getArchiveUrl = ({ version, site }: { version: string; site: Library }) => {
    const archiveBaseUrl = '/archive';
    const { major, minor } = parseVersion(version);

    let baseUrl = 'https://www.ag-grid.com';
    if (site === 'charts') {
        baseUrl = (major === 10 && minor >= 1) || major > 10 ? PRODUCTION_CHARTS_SITE_URL : LEGACY_CHARTS_SITE_URL;
    }

    return pathJoin(baseUrl, archiveBaseUrl, version);
};

export const getDocumentationArchiveUrl = ({
    version,
    site,
    path,
}: {
    version: string;
    site: Library;
    path?: string;
}) => {
    const versionArchiveLink = getArchiveUrl({ version, site });

    const useDocumentationLink = getHasDocumentationLink({ version, site });
    let documentationArchiveLink = versionArchiveLink;
    if (path) {
        documentationArchiveLink = pathJoin(versionArchiveLink, path);
    } else if (useDocumentationLink) {
        documentationArchiveLink = pathJoin(versionArchiveLink, '/documentation');
    }

    return documentationArchiveLink;
};
