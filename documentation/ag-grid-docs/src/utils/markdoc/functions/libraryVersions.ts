import { parseVersion } from '@ag-website-shared/utils/parseVersion';
import { agChartsVersion, agGridVersion } from '@constants';
import type { ConfigFunction } from '@markdoc/markdoc';

export const gridVersion: ConfigFunction = {
    transform() {
        const { major, minor } = parseVersion(agGridVersion);
        return `${major}.${minor}`;
    },
};

export const gridVersionPatch: ConfigFunction = {
    transform() {
        const { major, minor, patchNum } = parseVersion(agGridVersion);
        return `${major}.${minor}.${patchNum}`;
    },
};

export const chartsVersion: ConfigFunction = {
    transform() {
        const { major, minor } = parseVersion(agChartsVersion);
        return `${major}.${minor}`;
    },
};

export const chartsVersionPatch: ConfigFunction = {
    transform() {
        const { major, minor, patchNum } = parseVersion(agChartsVersion);
        return `${major}.${minor}.${patchNum}`;
    },
};
