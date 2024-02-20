type EnterpriseModuleStub = {
    type: 'axis' | 'axis-option' | 'series' | 'series-option' | 'root' | 'legend';
    packageType?: 'enterprise';
    identifier?: string;
    optionsKey: string;
    chartTypes: ('cartesian' | 'polar' | 'hierarchy')[];
    useCount?: number;
    optionsInnerKey?: string;
};
export declare const EXPECTED_ENTERPRISE_MODULES: EnterpriseModuleStub[];
export declare function isEnterpriseSeriesType(type: string): boolean;
export declare function getEnterpriseSeriesChartTypes(type: string): ("cartesian" | "polar" | "hierarchy")[] | undefined;
export declare function isEnterpriseSeriesTypeLoaded(type: string): boolean;
export declare function isEnterpriseCartesian(seriesType: string): boolean;
export declare function isEnterprisePolar(seriesType: string): boolean;
export declare function isEnterpriseHierarchy(seriesType: string): boolean;
type UnknownPackage = {
    packageType: string;
} | EnterpriseModuleStub;
export declare function verifyIfModuleExpected(module: UnknownPackage): boolean;
export declare function getUnusedExpectedModules(): EnterpriseModuleStub[];
export {};
