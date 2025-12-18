import type { Library } from '@ag-grid-types';

const gridToChartVersion = (gridVersion: string) => {
    const versionParts = gridVersion.split('.');

    // The first charts release was on grid version 22 - we'll keep in lock step release wise going forward so this works
    const chartMajorVersion = parseInt(versionParts[0]) - 22;
    return `${chartMajorVersion}.${versionParts[1]}.${versionParts[2]}`;
};

export const transformVersion: Record<Library, (version: string) => string> = {
    charts: gridToChartVersion,
};
