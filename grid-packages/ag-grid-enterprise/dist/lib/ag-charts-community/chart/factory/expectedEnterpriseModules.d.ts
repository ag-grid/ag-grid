import type { Module } from '../../module-support';
type EnterpriseModuleStub = Pick<Module<any>, 'type' | 'identifier' | 'optionsKey' | 'chartTypes'> & {
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
export declare function verifyIfModuleExpected(module: Module<any>): boolean;
export declare function getUnusedExpectedModules(): EnterpriseModuleStub[];
export {};
