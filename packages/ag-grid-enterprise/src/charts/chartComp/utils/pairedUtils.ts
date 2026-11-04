import type { AgChartThemeOverrides } from 'ag-charts-types';

import type { ChartType } from 'ag-grid-community';

type XYSeriesType = 'scatter' | 'bubble';

/**
 * Reads the legacy `scatter.paired` / `bubble.paired` theme override, which is not an AG Charts option, and returns a copy
 * of the overrides without it. The supplied overrides are never mutated.
 */
export function extractPaired(
    overrides: AgChartThemeOverrides | undefined,
    chartType: ChartType | undefined
): { paired?: boolean; overrides: AgChartThemeOverrides | undefined } {
    const lookupOrder: XYSeriesType[] = chartType === 'bubble' ? ['bubble', 'scatter'] : ['scatter', 'bubble'];
    const legacyOverrides = overrides as Partial<Record<XYSeriesType, { paired?: unknown }>> | undefined;

    let paired: boolean | undefined;
    let strippedOverrides: Record<string, any> | undefined;
    for (const seriesType of lookupOrder) {
        const seriesOverrides = legacyOverrides?.[seriesType];
        if (typeof seriesOverrides !== 'object' || seriesOverrides === null || !('paired' in seriesOverrides)) {
            continue;
        }

        const { paired: legacyPaired, ...rest } = seriesOverrides;
        if (paired === undefined && typeof legacyPaired === 'boolean') {
            paired = legacyPaired;
        }
        strippedOverrides ??= { ...overrides };
        strippedOverrides[seriesType] = rest;
    }

    return { paired, overrides: strippedOverrides ?? overrides };
}
