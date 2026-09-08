import { parseVersion } from '@ag-website-shared/utils/parseVersion';
import { GRID_ARCHIVE_BASE_URL } from '@constants';

interface Params {
    errorVersion: string;
    pageVersion: string;
}

function isVersionMatch({ errorVersion, pageVersion }: Params) {
    const parsedErrorVersion = parseVersion(errorVersion);
    const parsedPageVersion = parseVersion(pageVersion);

    // Check major, minor and patch number but ignore beta tags
    return (
        parsedErrorVersion.major === parsedPageVersion.major &&
        parsedErrorVersion.minor === parsedPageVersion.minor &&
        parsedErrorVersion.patchNum === parsedPageVersion.patchNum
    );
}

export function getErrorRedirectBaseUrl({ errorVersion, pageVersion }: Params) {
    if (!errorVersion || isVersionMatch({ errorVersion, pageVersion })) {
        return;
    }

    // The archive is only published per release, so a pre-release tag has to be dropped from the path.
    const { major, minor, patchNum } = parseVersion(errorVersion);

    return `${GRID_ARCHIVE_BASE_URL}/${major}.${minor}.${patchNum}`;
}
