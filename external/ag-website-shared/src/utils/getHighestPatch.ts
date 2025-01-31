import type { Library } from '@ag-grid-types';
import { parseVersion } from '@ag-website-shared/utils/parseVersion';
import { readFileSync } from 'fs';

import { VERSION_DATA_PATH } from '../constants';

interface Params {
    site: Library;
    major: number;
    minor: number;
}

export function getHighestPatch({ site, major, minor }: Params) {
    const versionDataPath = new URL(VERSION_DATA_PATH[site], import.meta.url);
    const versionData = readFileSync(versionDataPath, 'utf8');
    const versions = JSON.parse(versionData);

    const majorMinorVersions = versions
        .map(({ version }) => {
            return parseVersion(version);
        })
        .filter((vData) => {
            return major === vData.major && minor === vData.minor;
        })
        .map((vData) => {
            return vData.patchNum;
        })
        .sort();

    return majorMinorVersions[majorMinorVersions.length - 1];
}
