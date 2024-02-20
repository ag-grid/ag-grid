import { ModuleValidationResult } from "ag-grid-community";
export declare function gridChartVersion(gridVersion: string): {
    gridMajorMinor: string;
    chartsMajorMinor: string;
} | undefined;
export declare function validGridChartsVersionErrorMessage({ type, gridVersion, chartsVersion }: {
    type: 'incompatible' | 'invalidCharts' | 'invalidGrid' | 'invalid';
    gridVersion?: string;
    chartsVersion?: string;
}): string;
export declare function validGridChartsVersion({ gridVersion, chartsVersion }: {
    gridVersion: string;
    chartsVersion: string;
}): ModuleValidationResult;
