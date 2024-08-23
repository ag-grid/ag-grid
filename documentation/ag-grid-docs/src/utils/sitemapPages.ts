import { urlWithBaseUrl } from './urlWithBaseUrl';

/**
 * Legacy archive versions that don't have `noindex` on the generated pages
 */
const LEGACY_ARCHIVE_VERSIONS = [
    '14.0.0',
    '14.1.0',
    '15.0.0',
    '16.0.0',
    '17.0.0',
    '17.1.1',
    '18.1.0',
    '19.0.0',
    '19.1.4',
    '20.0.0',
    '20.1.0',
    '20.2.0',
    '21.0.0',
    '21.0.1',
    '21.1.0',
    '21.2.0',
    '21.2.1',
    '21.2.2',
    '22.0.0',
    '22.1.0',
    '22.1.1',
    '23.0.0',
    '23.0.2',
    '23.1.0',
    '23.1.1',
    '23.2.0',
    '24.0.0',
    '24.1.0',
    '25.0.0',
    '25.1.0',
    '25.2.0',
    '25.3.0',
    '26.0.0',
    '26.1.0',
    '26.2.0',
    '27.0.0',
    '27.0.1',
    '27.1.0',
    '27.2.0',
    '27.3.0',
    '28.0.0',
    '28.1.0',
    '28.1.1',
    '28.2.1',
    '29.0.0',
    '29.1.0',
    '29.2.0',
    '29.3.0',
    '29.3.1',
    '29.3.3',
    '29.3.4',
    '29.3.5',
    '30.0.0',
    '30.0.5',
    '30.0.6',
    '30.1.0',
    '30.2.0',
    '31.0.0',
    '31.0.1',
    '31.0.2',
    '31.1.0',
    '31.2.0',
    '31.3.0',
    '31.3.1',
    '31.3.2',
    '32.0.0',
];

function addTrailingSlash(path: string) {
    return path.slice(-1) === '/' ? path : `${path}/`;
}

export async function getSitemapIgnorePaths() {
    const legacyArchiveVersions = LEGACY_ARCHIVE_VERSIONS.map((version) => addTrailingSlash(`/archive/${version}`));
    const folderPaths = [urlWithBaseUrl('/debug'), urlWithBaseUrl('/examples'), ...legacyArchiveVersions];

    return folderPaths.concat(urlWithBaseUrl('/404'));
}
