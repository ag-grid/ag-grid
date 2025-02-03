import type { VersionData } from '@ag-grid-types';
import { parseVersion } from '@ag-website-shared/utils/parseVersion';

interface Params {
    versionsData: VersionData[];
    major: number;
    minor: number;
}

export function getHighestPatch({ versionsData, major, minor }: Params) {
    const majorMinorVersions = versionsData
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
