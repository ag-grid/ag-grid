import { parseVersion } from '@ag-website-shared/utils/parseVersion';

import agGridVersions from '../content/versions/ag-grid-versions.json';

interface Params {
    major: number;
    minor: number;
}

export function getHighestPatch({ major, minor }: Params) {
    const majorMinorVersions = agGridVersions
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
