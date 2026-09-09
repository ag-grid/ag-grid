import type { Library } from '@ag-grid-types';

const gridToChartVersion = (gridVersion: string): string | null => {
    const versionParts = gridVersion.split('.');
    if (versionParts.length !== 3 || versionParts.some((part) => !/^\d+$/.test(part))) {
        // Not a real grid release version (e.g. a placeholder like "Future" or "TBD") - nothing to transform.
        return null;
    }

    // The first charts release was on grid version 22 - we'll keep in lock step release wise going forward so this works
    const chartMajorVersion = parseInt(versionParts[0], 10) - 22;
    return `${chartMajorVersion}.${versionParts[1]}.${versionParts[2]}`;
};

export const transformVersion: Record<Library, (version: string) => string | null> = {
    charts: gridToChartVersion,
};
